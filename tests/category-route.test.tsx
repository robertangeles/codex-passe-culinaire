import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listing: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  permanentRedirect: vi.fn((destination: string) => { throw new Error(`NEXT_REDIRECT:${destination}`) }),
}))

vi.mock('../src/lib/journal-listing', () => ({ getJournalListing: mocks.listing, parseListingPage: (value: string) => {
  if (!/^[1-9][0-9]{0,3}$/.test(value)) return null
  const page = Number(value)
  return page <= 1000 ? page : null
} }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, permanentRedirect: mocks.permanentRedirect }))

import JournalCategoryPage, { generateMetadata, revalidate } from '../src/app/(public)/journal/category/[slug]/[[...page]]/page'
import type { getJournalListing } from '../src/lib/journal-listing'
import type { Post } from '../src/payload-types'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>

function createModel(page = 1, totalPages = 1, posts: Post[] = []): JournalModel {
  return {
    title: 'Pastry',
    description: 'Notes from the pastry bench.',
    basePath: '/journal/category/pastry',
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

describe('journal category route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listing.mockResolvedValue(createModel())
  })

  it('renders the category relationship and listing body in server HTML', async () => {
    mocks.listing.mockResolvedValue(createModel(1, 1, [publishedPost]))

    const html = renderToStaticMarkup(await JournalCategoryPage({ params: Promise.resolve({ slug: 'pastry' }) }))

    expect(revalidate).toBe(600)
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('Pastry')
    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('href="/journal/morning-pastry-bench"')
    expect(mocks.listing).toHaveBeenCalledWith('category', 'pastry', 1)
  })

  it('returns not found when the category listing is missing', async () => {
    mocks.listing.mockResolvedValue(null)
    await expect(JournalCategoryPage({ params: Promise.resolve({ slug: 'missing-category' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it.each([
    { slug: 'pastry', page: ['other', '2'] },
    { slug: 'pastry', page: ['page', '01'] },
    { slug: 'pastry', page: ['page', '1001'] },
    { slug: 'Invalid' },
  ])('returns not found for invalid category pagination or slug %#', async ({ slug, page }) => {
    await expect(JournalCategoryPage({ params: Promise.resolve({ slug, page }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('permanently redirects an explicit first page to the canonical category path', async () => {
    await expect(JournalCategoryPage({ params: Promise.resolve({ slug: 'pastry', page: ['page', '1'] }) }))
      .rejects.toThrow('NEXT_REDIRECT:/journal/category/pastry')
    expect(mocks.permanentRedirect).toHaveBeenCalledWith('/journal/category/pastry')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('loads page two and renders canonical previous and next links', async () => {
    mocks.listing.mockResolvedValue(createModel(2, 3, [publishedPost]))

    const html = renderToStaticMarkup(await JournalCategoryPage({ params: Promise.resolve({ slug: 'pastry', page: ['page', '2'] }) }))

    expect(mocks.listing).toHaveBeenCalledWith('category', 'pastry', 2)
    expect(html).toContain('href="/journal/category/pastry"')
    expect(html).toContain('href="/journal/category/pastry/page/3"')
  })

  it('adds the page number to metadata and applies noIndex from the category model', async () => {
    mocks.listing.mockResolvedValue({ ...createModel(2), noIndex: true })

    await expect(generateMetadata({ params: Promise.resolve({ slug: 'pastry', page: ['page', '2'] }) })).resolves.toMatchObject({
      title: 'Pastry · Page 2',
      description: 'Notes from the pastry bench.',
      robots: { index: false },
    })
  })
})
