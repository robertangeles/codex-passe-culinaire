import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EditorialSection } from '../../../components/EditorialSection'
import { HeroBlock } from '../../../components/blocks/HeroBlock'
import styles from './page.module.css'
import { MAX_SEARCH_PAGE, SEARCH_PAGE_SIZE, normaliseSearch, searchPublishedContent } from '../../../lib/search'
import { safePublicHref } from '../../../lib/urls'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: false },
}

type SearchParams = { q?: string | string[]; page?: string | string[] }
type SearchPageProps = { searchParams: Promise<SearchParams> }
type RouteInput = { query: string | null; page: number; message: string | null }

function parsePage(value: string | string[] | undefined): number | null {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/u.test(value)) return null
  const page = Number(value)
  return Number.isSafeInteger(page) && page <= MAX_SEARCH_PAGE ? page : null
}

function parseInput(params: SearchParams): RouteInput {
  const page = parsePage(params.page)
  if (page === null) notFound()

  if (params.q === undefined || params.q === '') return { query: null, page, message: null }
  if (typeof params.q !== 'string') {
    return { query: null, page, message: 'Enter a search term using at least two characters.' }
  }

  const query = normaliseSearch(params.q)
  if (!query) {
    if (!params.q.trim()) return { query: null, page, message: null }
    return { query: null, page, message: 'Enter a search term using at least two characters.' }
  }

  return { query, page, message: null }
}

function resultHref(kind: 'page' | 'post', slug: string): string | undefined {
  if (kind === 'page' && slug === 'home') return '/'
  const path = kind === 'post' ? `/journal/${encodeURIComponent(slug)}` : `/${encodeURIComponent(slug)}`
  return safePublicHref(path)
}

function paginationHref(query: string, page: number): string {
  const params = new URLSearchParams({ q: query, page: String(page) })
  return `/search?${params.toString()}`
}

function SearchForm({ query, message }: { query?: string; message?: string | null }) {
  return (
    <form action="/search" method="get" className={styles.searchForm} aria-describedby={message ? 'search-message' : undefined}>
      <label htmlFor="search-query">Search the site</label>
      <div className={styles.searchControls}>
        <input id="search-query" name="q" type="search" maxLength={120} defaultValue={query ?? ''} />
        <button type="submit">Search</button>
      </div>
      {message
        ? <p id="search-message" className={styles.searchMessage} role="status">{message}</p>
        : <p className={styles.searchMessage}>Enter a word or phrase to search.</p>}
    </form>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const input = parseInput(await searchParams)
  const result = input.query ? await searchPublishedContent(input.query, input.page) : null
  if (input.query && input.page > 1 && result?.hits.length === 0) notFound()

  const totalPages = Math.min(result?.totalPages ?? 0, MAX_SEARCH_PAGE)
  const hero = { blockType: 'hero', heading: 'Search', style: 'quiet' } as const

  return (
    <main id="main-content" tabIndex={-1}>
      <HeroBlock block={hero} headingLevel={1} />
      <EditorialSection>
        <SearchForm query={input.query ?? undefined} message={input.message} />
        {input.query && result && (
          <div className={styles.searchResults} aria-live="polite">
            {result.hits.length === 0
              ? <p className={styles.emptyState}>No results found.</p>
              : <>
                  <p className={styles.resultCount}>{result.total} {result.total === 1 ? 'result' : 'results'}</p>
                  {result.totalPages > MAX_SEARCH_PAGE && <p>Showing the first {(MAX_SEARCH_PAGE * SEARCH_PAGE_SIZE).toLocaleString('en-AU')} results. Add more detail to your search to narrow the results.</p>}
                  <ol className={styles.resultList}>
                    {result.hits.map((hit) => {
                      const href = resultHref(hit.kind, hit.slug)
                      return (
                        <li key={`${hit.kind}-${hit.id}`}>
                          {href ? <h2><a href={href}>{hit.title}</a></h2> : <h2>{hit.title}</h2>}
                          {hit.excerpt && <p>{hit.excerpt}</p>}
                        </li>
                      )
                    })}
                  </ol>
                  {result.totalPages > 1 && (
                    <nav className={styles.searchPagination} aria-label="Search result pages">
                      {input.page > 1 && <a href={paginationHref(input.query, input.page - 1)}>Previous</a>}
                      <span>Page {input.page} of {totalPages}</span>
                      {input.page < result.totalPages && input.page < MAX_SEARCH_PAGE && (
                        <a href={paginationHref(input.query, input.page + 1)}>Next</a>
                      )}
                    </nav>
                  )}
                </>}
          </div>
        )}
      </EditorialSection>
    </main>
  )
}
