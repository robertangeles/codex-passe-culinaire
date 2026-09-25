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

import JournalAuthorPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '../src/app/(public)/journal/author/[slug]/[[...page]]/page'
import type { getJournalListing } from '../src/lib/journal-listing'
import type { Post } from '../src/payload-types'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>

function createModel(page = 1, totalPages = 1, posts: Post[] = []): JournalModel {
  return {
    title: 'Mara Chen',
    description: 'Notes from the pastry bench.',
    basePath: '/journal/author/mara-chen',
    noIndex: false,
    author: {
      id: 4,
      name: 'Mara Chen',
      slug: 'mara-chen',
      publicTitle: 'Pastry chef',
      publicBio: {
        root: {
          type: 'root',
          direction: null,
          format: '',
          indent: 0,
          version: 1,
          children: [{
            type: 'paragraph',
            direction: null,
            format: '',
            indent: 0,
            version: 1,
            children: [{
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'I work with pastry teams in busy kitchens.',
              version: 1,
            }],
          }],
        },
      },
      portrait: null,
      noIndex: false,
      excludeFromSitemap: false,
      createdAt: '2026-07-12T00:00:00.000Z',
      updatedAt: '2026-07-12T00:00:00.000Z',
      email: 'private-author@example.test',
      username: 'private-login-name',
      passwordHash: 'private-password-hash',
      resetPasswordToken: 'private-reset-token',
      roles: ['admin'],
    } as JournalModel['author'],
    externalEmbedsEnabled: false,
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

const params = (slug: string, page?: string[]) => Promise.resolve({ slug, page })

describe('journal author route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listing.mockResolvedValue(createModel())
  })

  it('renders public biography and entries in server HTML without private author fields', async () => {
    mocks.listing.mockResolvedValue(createModel(1, 1, [publishedPost]))

    const html = renderToStaticMarkup(await JournalAuthorPage({ params: params('mara-chen') }))

    expect(revalidate).toBe(600)
    expect(await generateStaticParams()).toEqual([])
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('I work with pastry teams in busy kitchens.')
    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('href="/journal/morning-pastry-bench"')
    for (const secret of ['private-author@example.test', 'private-login-name', 'private-password-hash', 'private-reset-token', 'admin']) {
      expect(html).not.toContain(secret)
    }
    expect(mocks.listing).toHaveBeenCalledWith('author', 'mara-chen', 1)
  })

  it('returns not found when the author is missing or has no public profile', async () => {
    mocks.listing.mockResolvedValue(null)
    await expect(JournalAuthorPage({ params: params('private-author') })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it.each([
    ['extra pagination segment', 'mara-chen', ['page', '2', 'extra']],
    ['wrong pagination prefix', 'mara-chen', ['2']],
    ['zero page', 'mara-chen', ['page', '0']],
    ['leading zero', 'mara-chen', ['page', '01']],
    ['page above the bound', 'mara-chen', ['page', '1001']],
    ['invalid slug', 'Mara-Chen', undefined],
    ['overlong slug', 'a'.repeat(201), undefined],
  ])('returns not found for %s', async (_description, slug, page) => {
    await expect(JournalAuthorPage({ params: params(slug, page) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('permanently redirects explicit page one to the canonical author path', async () => {
    await expect(JournalAuthorPage({ params: params('mara-chen', ['page', '1']) }))
      .rejects.toThrow('NEXT_REDIRECT:/journal/author/mara-chen')
    expect(mocks.permanentRedirect).toHaveBeenCalledWith('/journal/author/mara-chen')
    expect(mocks.listing).not.toHaveBeenCalled()
  })

  it('adds the page number to metadata and applies noIndex from the author model', async () => {
    mocks.listing.mockResolvedValue({ ...createModel(2, 3), noIndex: true })

    await expect(generateMetadata({ params: params('mara-chen', ['page', '2']) })).resolves.toMatchObject({
      title: 'Mara Chen · Page 2',
      description: 'Notes from the pastry bench.',
      robots: { index: false },
    })
  })
})
