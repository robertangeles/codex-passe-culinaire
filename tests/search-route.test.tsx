vi.mock('../src/lib/public-content', () => ({ getPublicShell: vi.fn().mockResolvedValue({ siteSettings: { id: 1, name: 'Passe Culinaire' } }) }))
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../src/lib/search', () => ({
  MAX_SEARCH_PAGE: 100,
  SEARCH_PAGE_SIZE: 12,
  normaliseSearch(value: unknown) {
    if (typeof value !== 'string' || value.length > 120 || /[\u0000-\u001f\u007f]/u.test(value)) return null
    const query = value.trim().replace(/\s+/g, ' ')
    return query.length >= 2 ? query : null
  },
  searchPublishedContent: mocks.search,
}))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import SearchPage, { generateMetadata } from '../src/app/(public)/search/page'
import type { SearchResult } from '../src/lib/search'

const noHits: SearchResult = { hits: [], total: 0, page: 1, totalPages: 0 }

function result(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    hits: [
      { kind: 'page', id: 1, slug: 'home', title: 'Kitchen <script>alert(1)</script>', excerpt: 'A kitchen note & its details.' },
      { kind: 'post', id: 2, slug: 'service-notes', title: 'Service notes', excerpt: 'Prepared before service.' },
    ],
    total: 14,
    page: 1,
    totalPages: 2,
    ...overrides,
  }
}

describe('search route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.search.mockResolvedValue(noHits)
  })

  it('renders a server search form, prompt, h1, and noindex metadata before a query', async () => {
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({}) }))

    expect(html).toContain('<main id="main-content" tabindex="-1">')
    expect(html).toContain('<h1')
    expect(html).toContain('Search</h1>')
    expect(html).toContain('action="/search" method="get"')
    expect(html).toContain('type="search"')
    expect(html).toContain('name="q"')
    expect(html).toContain('maxLength="120"')
    expect(html).toContain('Enter a word or phrase to search.')
    expect(mocks.search).not.toHaveBeenCalled()
    expect(await generateMetadata()).toMatchObject({ title: 'Search', robots: { index: false, follow: false } })
  })

  it('normalises a valid term and renders escaped result text with safe destinations', async () => {
    mocks.search.mockResolvedValue(result())
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: '  pastry   prep  ' }) }))

    expect(mocks.search).toHaveBeenCalledWith('pastry prep', 1)
    expect(html).toContain('Kitchen &lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('A kitchen note &amp; its details.')
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/journal/service-notes"')
    expect(html).toContain('Page 1 of 2')
    expect(html).toContain('href="/search?q=pastry+prep&amp;page=2"')
    expect(html).toContain('<ol')
  })

  it('does not search repeated, one-character, or control-character queries', async () => {
    for (const q of [['pastry', 'service'], 'x', 'a\u0000b']) {
      const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q }) }))
      expect(html).toContain('Enter a search term using at least two characters.')
      expect(html).toContain('value=""')
    }
    expect(mocks.search).not.toHaveBeenCalled()
  })

  it('renders the empty result state and omits unsafe result destinations', async () => {
    mocks.search.mockResolvedValue({
      hits: [{ kind: 'page', id: 3, slug: '//example.test', title: 'Unsafe destination', excerpt: '' }],
      total: 1,
      page: 1,
      totalPages: 1,
    })
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: 'service' }) }))

    expect(html).toContain('Unsafe destination</h2>')
    expect(html).not.toContain('href="//example.test"')
    expect(html).not.toContain('No results found.')

    mocks.search.mockResolvedValue(noHits)
    expect(renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: 'service' }) }))).toContain('No results found.')
  })

  it('explains the result bound without linking to an inaccessible page', async () => {
    mocks.search.mockResolvedValue(result({ total: 3000, totalPages: 250, page: 100 }))
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: 'kitchen', page: '100' }) }))
    expect(html).toContain('Page 100 of 100')
    expect(html).toContain('Showing the first 1,200 results.')
    expect(html).not.toContain('>Next</a>')
  })

  it('rejects invalid and out-of-range pages without searching, and 404s beyond available results', async () => {
    for (const page of ['0', '01', '101', '1.5', ['2', '3']]) {
      await expect(SearchPage({ searchParams: Promise.resolve({ q: 'service', page }) })).rejects.toThrow('NEXT_NOT_FOUND')
    }
    expect(mocks.search).not.toHaveBeenCalled()

    mocks.search.mockResolvedValue(noHits)
    await expect(SearchPage({ searchParams: Promise.resolve({ q: 'service', page: '2' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.search).toHaveBeenCalledWith('service', 2)
  })
})
