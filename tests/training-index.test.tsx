import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  permanentRedirect: vi.fn((path: string) => { throw new Error(`NEXT_REDIRECT:${path}`) }),
}))

vi.mock('../src/lib/public-content', () => ({ getPublicShell: vi.fn().mockResolvedValue({ siteSettings: { id: 1, name: 'Passe Culinaire' } }), listPublicContent: mocks.list }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, permanentRedirect: mocks.permanentRedirect }))

import TrainingIndexPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '../src/app/(public)/training/[[...page]]/page'

function result(docs: unknown[] = [], totalPages = 1) {
  return { docs, totalDocs: docs.length, limit: 12, totalPages, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
}

const event = {
  id: 8,
  title: 'Preparing for a busy service',
  slug: 'busy-service',
  descriptionSummary: 'A session for kitchen teams.',
  startDate: '2030-08-12T23:00:00.000Z',
  endDate: '2030-08-13T01:00:00.000Z',
  timezone: 'Australia/Melbourne',
  eventStatus: 'upcoming',
  _status: 'published',
} as const

describe('training index route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.list.mockResolvedValue(result([], 1))
  })

  it('uses two bounded published-event queries with the requested date and status rules', async () => {
    await TrainingIndexPage({ params: Promise.resolve({}) })
    expect(revalidate).toBe(600)
    expect(mocks.list).toHaveBeenCalledTimes(2)
    const calls = mocks.list.mock.calls
    expect(calls[0]?.[0]).toBe('events')
    expect(calls[0]?.[1]).toMatchObject({ page: 1, limit: 12, sort: ['startDate', 'id'] })
    expect(calls[0]?.[1].where).toMatchObject({ and: [
      { or: [{ eventStatus: { not_in: ['past', 'cancelled'] } }, { eventStatus: { exists: false } }] },
      { or: [
        { endDate: { greater_than_equal: expect.any(String) } },
        { and: [{ endDate: { exists: false } }, { or: [{ startDate: { greater_than_equal: expect.any(String) } }, { startDate: { exists: false } }] }] },
      ] },
    ] })
    expect(calls[1]?.[1]).toMatchObject({ page: 1, limit: 12, sort: ['-startDate', '-id'] })
    expect(calls[1]?.[1].where).toMatchObject({ or: [
      { eventStatus: { in: ['past', 'cancelled'] } },
      { endDate: { less_than: expect.any(String) } },
      { and: [{ endDate: { exists: false } }, { startDate: { less_than: expect.any(String) } }] },
    ] })
    const upcomingBound = JSON.stringify(calls[0]?.[1].where).match(/"greater_than_equal":"([^"]+)"/u)?.[1]
    const archiveBound = JSON.stringify(calls[1]?.[1].where).match(/"less_than":"([^"]+)"/u)?.[1]
    expect(upcomingBound).toBeTruthy()
    expect(archiveBound).toBe(upcomingBound)
  })

  it('renders its empty state, archive below it, and does not invent dates', async () => {
    const past = { ...event, id: 9, title: 'A completed session', eventStatus: 'past', startDate: '2020-08-12T23:00:00.000Z' }
    const cancelled = { ...event, id: 10, title: 'A cancelled session', eventStatus: 'cancelled', startDate: null, endDate: null }
    mocks.list.mockImplementation((_collection: string, options: { where: { and?: unknown[] } }) =>
      Promise.resolve(result(options.where.and ? [] : [past, cancelled])))
    const html = renderToStaticMarkup(await TrainingIndexPage({ params: Promise.resolve({}) }))
    expect(html.indexOf('Upcoming training')).toBeLessThan(html.indexOf('Past and cancelled training'))
    expect(html).toContain('There are no upcoming training dates.')
    expect(html).toContain('href="/contact"')
    expect(html).toContain('A completed session')
    expect(html).toContain('Past')
    expect(html).toContain('A cancelled session')
    expect(html).toContain('Cancelled')

    mocks.list.mockImplementation((_collection: string, options: { where: { and?: unknown[] } }) =>
      Promise.resolve(result(options.where.and ? [{ ...event, startDate: null, endDate: null }] : [])))
    const missingDateHtml = renderToStaticMarkup(await TrainingIndexPage({ params: Promise.resolve({}) }))
    expect(missingDateHtml).toContain('Date to confirm.')
    expect(missingDateHtml).not.toContain('<time')
  })

  it('validates optional catch-all pagination and permanently redirects page one', async () => {
    await expect(TrainingIndexPage({ params: Promise.resolve({}) })).resolves.toBeTruthy()
    mocks.list.mockResolvedValue(result([], 12))
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '12'] }) })).resolves.toBeTruthy()
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['12'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '0'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '1001'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '2', 'extra'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '1'] }) })).rejects.toThrow('NEXT_REDIRECT:/training')
    await expect(generateStaticParams()).resolves.toEqual([])
  })

  it('uses route pagination for its title and rejects pages after the shared maximum', async () => {
    mocks.list.mockResolvedValue(result([], 3))
    await expect(generateMetadata({ params: Promise.resolve({ page: ['page', '2'] }) })).resolves.toMatchObject({
      title: 'Training · Page 2', description: 'Upcoming training dates and past sessions from Passe Culinaire.',
    })
    mocks.list.mockResolvedValue(result([], 1))
    await expect(TrainingIndexPage({ params: Promise.resolve({ page: ['page', '2'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
