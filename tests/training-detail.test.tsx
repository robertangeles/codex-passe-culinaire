import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  event: vi.fn(),
  shell: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../src/lib/public-content', () => ({
  getPublicDocument: mocks.event,
  getPublicShell: mocks.shell,
}))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import TrainingDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../src/app/(public)/training/[slug]/page'

const publishedEvent = {
  id: 21,
  title: 'Knife skills for a busy service',
  slug: 'knife-skills',
  descriptionSummary: 'Practise safe, even cuts for a busy kitchen.',
  description: {
    root: {
      type: 'root',
      children: [{
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', version: 1, text: 'Bring your own chef knife.' }],
      }],
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  },
  startDate: '2030-08-12T23:00:00.000Z',
  endDate: '2030-08-13T01:00:00.000Z',
  timezone: 'Australia/Melbourne',
  eventStatus: 'upcoming',
  instructors: [{ id: 9, name: 'Alex Chef', slug: 'alex-chef' }],
  bookingUrl: 'https://tickets.example.test/knife-skills',
  seo: { metaTitle: 'Knife skills workshop', metaDescription: 'Workshop details' },
  _status: 'published',
}

describe('training detail route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.event.mockResolvedValue(publishedEvent)
    mocks.shell.mockResolvedValue({ siteSettings: { externalEmbedsEnabled: false } })
  })

  it('renders published content, localised event times, and the booking link in server HTML', async () => {
    const element = await TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('Knife skills for a busy service')
    expect(html).toContain('Practise safe, even cuts for a busy kitchen.')
    expect(html).toContain('Bring your own chef knife.')
    expect(html).toContain('<time dateTime="2030-08-12T23:00:00.000Z">')
    expect(html).toContain('Starts')
    expect(html).toContain('Ends')
    expect(html).toContain('AEST')
    expect(html).toContain('href="/journal/author/alex-chef">Alex Chef</a>')
    expect(html).toContain('Book a place')
    expect(html).toContain('https://tickets.example.test/knife-skills')
  })

  it.each([
    ['past', { eventStatus: 'past', startDate: '2020-08-12T23:00:00.000Z' }, 'Past'],
    ['cancelled', { eventStatus: 'cancelled' }, 'Cancelled'],
  ])('keeps a published %s event available without a booking link', async (_case, override, label) => {
    mocks.event.mockResolvedValue({ ...publishedEvent, ...override })

    const element = await TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain(label)
    expect(html).not.toContain('Book a place')
  })

  it.each([
    ['sold-out', { eventStatus: 'sold-out' }, 'Sold out'],
    ['past-dated upcoming', { startDate: '2020-08-12T23:00:00.000Z' }, 'Upcoming'],
  ])('keeps %s events visible without offering booking', async (_case, override, label) => {
    mocks.event.mockResolvedValue({ ...publishedEvent, ...override })

    const html = renderToStaticMarkup(await TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) }))
    expect(html).toContain(label)
    expect(html).not.toContain('Book a place')
  })

  it('omits the status row when an event has no recognised status', async () => {
    mocks.event.mockResolvedValue({ ...publishedEvent, eventStatus: 'unrecognised' })

    const html = renderToStaticMarkup(await TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) }))
    expect(html).not.toContain('<dt>Status</dt>')
    expect(html).not.toContain('Upcoming')
    expect(html).not.toContain('Book a place')
  })

  it('does not expose drafts or invalid slugs', async () => {
    mocks.event.mockResolvedValue({ ...publishedEvent, _status: 'draft' })
    await expect(TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    await expect(TrainingDetailPage({ params: Promise.resolve({ slug: 'bad/slug' }) }))
      .rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.event).toHaveBeenCalledTimes(1)
  })

  it('omits unsafe booking destinations and applies SEO fields', async () => {
    mocks.event.mockResolvedValue({ ...publishedEvent, bookingUrl: 'javascript:alert(1)' })

    const html = renderToStaticMarkup(await TrainingDetailPage({ params: Promise.resolve({ slug: 'knife-skills' }) }))
    expect(html).not.toContain('Book a place')
    await expect(generateMetadata({ params: Promise.resolve({ slug: 'knife-skills' }) })).resolves.toMatchObject({
      title: 'Knife skills workshop',
      description: 'Workshop details',
      robots: { index: true, follow: true },
    })
  })

  it('returns no static slugs for on-demand generation', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})
