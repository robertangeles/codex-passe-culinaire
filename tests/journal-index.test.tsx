import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listing: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../src/lib/journal-listing', () => ({ getJournalListing: mocks.listing }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import JournalIndexPage, { generateMetadata, revalidate } from '../src/app/(public)/journal/page'
import type { getJournalListing } from '../src/lib/journal-listing'
import type { Post } from '../src/payload-types'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>

function createModel(posts: Post[] = []): JournalModel {
  return {
    title: 'Journal',
    description: 'Notes from our work in kitchens.',
    basePath: '/journal',
    noIndex: false,
    author: null,
    externalEmbedsEnabled: false,
    listing: {
      docs: posts,
      totalDocs: posts.length,
      limit: 12,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
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

describe('journal index route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listing.mockResolvedValue(createModel())
  })

  it('renders a truthful empty state in server HTML and uses the shared public model', async () => {
    const element = await JournalIndexPage()
    const html = renderToStaticMarkup(element)

    expect(revalidate).toBe(600)
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('There are no journal entries to read yet.')
    expect(mocks.listing).toHaveBeenCalledWith('journal', '', 1)
  })

  it('renders published entries from the same journal listing model', async () => {
    mocks.listing.mockResolvedValue(createModel([publishedPost]))

    const html = renderToStaticMarkup(await JournalIndexPage())

    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('The first dough is mixed before service.')
    expect(html).toContain('href="/journal/morning-pastry-bench"')
  })

  it('uses the listing model for metadata and respects its noIndex flag', async () => {
    mocks.listing.mockResolvedValue({ ...createModel(), noIndex: true })

    await expect(generateMetadata()).resolves.toMatchObject({
      title: 'Journal',
      description: 'Notes from our work in kitchens.',
      robots: { index: false },
    })
    expect(mocks.listing).toHaveBeenCalledWith('journal', '', 1)
  })

  it('propagates listing failures and treats an unavailable listing as not found', async () => {
    mocks.listing.mockRejectedValue(new Error('Database unavailable'))
    await expect(JournalIndexPage()).rejects.toThrow('Database unavailable')

    mocks.listing.mockResolvedValue(null)
    await expect(JournalIndexPage()).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
