import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  listing: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  permanentRedirect: vi.fn((location: string) => { throw new Error(`NEXT_REDIRECT:${location}`) }),
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

import JournalTagPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '../src/app/(public)/journal/tag/[slug]/[[...page]]/page'
import type { getJournalListing } from '../src/lib/journal-listing'
import type { Post } from '../src/payload-types'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>

function createModel(posts: Post[] = []): JournalModel {
  return {
    title: 'Pastry',
    description: 'Notes from the pastry bench.',
    basePath: '/journal/tag/pastry',
    noIndex: false,
    author: null,
    externalEmbedsEnabled: false,
    settings: { id: 1, name: 'Passe Culinaire' },
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

const params = (slug: string, page?: string[]) => Promise.resolve({ slug, page })

describe('journal tag route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listing.mockResolvedValue(createModel())
  })

  it('renders published tag entries in server HTML', async () => {
    mocks.listing.mockResolvedValue(createModel([publishedPost]))

    const html = renderToStaticMarkup(await JournalTagPage({ params: params('pastry') }))

    expect(revalidate).toBe(600)
    expect(await generateStaticParams()).toEqual([])
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('The first dough is mixed before service.')
    expect(html).toContain('href="/journal/morning-pastry-bench"')
    expect(mocks.listing).toHaveBeenCalledWith('tag', 'pastry', 1)
  })

  it('returns tag metadata and adds the page number after the title', async () => {
    const result = await generateMetadata({ params: params('pastry', ['page', '2']) })

    expect(result).toMatchObject({
      title: 'Pastry · Page 2',
      description: 'Notes from the pastry bench.',
      robots: { index: true },
    })
    expect(mocks.listing).toHaveBeenCalledWith('tag', 'pastry', 2)
  })

  it('redirects page one to the unpaginated canonical tag path', async () => {
    await expect(JournalTagPage({ params: params('pastry', ['page', '1']) }))
      .rejects.toThrow('NEXT_REDIRECT:/journal/tag/pastry')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it.each([
    ['extra segment', ['page', '2', 'extra']],
    ['wrong segment', ['2']],
    ['invalid page', ['page', '0']],
    ['leading zero', ['page', '02']],
    ['page above the bound', ['page', '1001']],
  ])('returns not found for %s', async (_description, page) => {
    await expect(JournalTagPage({ params: params('pastry', page) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('returns not found when the tag listing does not exist', async () => {
    mocks.listing.mockResolvedValue(null)
    await expect(JournalTagPage({ params: params('unknown-tag') })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
