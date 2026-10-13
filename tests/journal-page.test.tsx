import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listing: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  permanentRedirect: vi.fn((destination: string) => { throw new Error(`NEXT_REDIRECT:${destination}`) }),
}))

vi.mock('../src/lib/journal-listing', () => ({
  getJournalListing: mocks.listing,
  parseListingPage: (value: string) => {
    if (!/^[1-9][0-9]{0,3}$/.test(value)) return null
    const page = Number(value)
    return page <= 1000 ? page : null
  },
}))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, permanentRedirect: mocks.permanentRedirect }))

import JournalPageNumber, { generateMetadata, generateStaticParams, revalidate } from '../src/app/(public)/journal/page/[page]/page'
import type { getJournalListing } from '../src/lib/journal-listing'
import type { Post } from '../src/payload-types'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>

function createModel(page: number, totalPages: number, posts: Post[] = []): JournalModel {
  return {
    title: 'Journal',
    description: 'Notes from our work in kitchens.',
    basePath: '/journal',
    noIndex: false,
    author: null,
    externalEmbedsEnabled: false,
    settings: { id: 1, name: 'Passe Culinaire' },
    listing: {
      docs: posts,
      totalDocs: totalPages * 12,
      limit: 12,
      totalPages,
      page,
      pagingCounter: (page - 1) * 12 + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    },
  }
}

const publishedPost = {
  id: 17,
  title: 'A morning at the pastry bench',
  slug: 'morning-pastry-bench',
  excerpt: 'The first dough is mixed before service.',
  publishedAt: '2026-07-12T00:00:00.000Z',
  updatedAt: '2026-07-12T00:00:00.000Z',
  createdAt: '2026-07-12T00:00:00.000Z',
  _status: 'published',
} as Post

describe('journal page-number route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listing.mockResolvedValue(createModel(2, 3, [publishedPost]))
  })

  it('renders page two from the shared listing model with canonical previous and next links', async () => {
    const html = renderToStaticMarkup(await JournalPageNumber({ params: Promise.resolve({ page: '2' }) }))

    expect(revalidate).toBe(600)
    await expect(generateStaticParams()).resolves.toEqual([])
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('href="/journal"')
    expect(html).toContain('href="/journal/page/3"')
    expect(mocks.listing).toHaveBeenCalledWith('journal', '', 2)
  })

  it('uses the same model for page metadata and applies its noIndex flag', async () => {
    mocks.listing.mockResolvedValue({ ...createModel(2, 3), noIndex: true })

    await expect(generateMetadata({ params: Promise.resolve({ page: '2' }) })).resolves.toMatchObject({
      title: 'Journal · Page 2',
      description: 'Notes from our work in kitchens.',
      robots: { index: false },
    })
  })

  it('returns not found when the requested listing page is missing', async () => {
    mocks.listing.mockResolvedValue(null)
    await expect(JournalPageNumber({ params: Promise.resolve({ page: '2' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it.each(['0', '01', '1001', '1.5', '-2', 'page'])('returns not found for invalid page %s', async (page) => {
    await expect(JournalPageNumber({ params: Promise.resolve({ page }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('permanently redirects the first page to the canonical journal path', async () => {
    await expect(JournalPageNumber({ params: Promise.resolve({ page: '1' }) })).rejects.toThrow('NEXT_REDIRECT:/journal')
    expect(mocks.permanentRedirect).toHaveBeenCalledWith('/journal')
    expect(mocks.listing).not.toHaveBeenCalled()
  })
})
