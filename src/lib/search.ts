import { unstable_cache } from 'next/cache'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { PUBLIC_CONTENT_TAG } from './public-content'

export const SEARCH_PAGE_SIZE = 12
export const MAX_SEARCH_PAGE = 100
export type SearchHit = { kind: 'page' | 'post'; id: number; slug: string; title: string; excerpt: string }
export type SearchResult = { hits: SearchHit[]; total: number; page: number; totalPages: number }

export function normaliseSearch(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 120 || /[\u0000-\u001f\u007f]/u.test(value)) return null
  const query = value.trim().replace(/\s+/g, ' ')
  return query.length >= 2 ? query : null
}

/** Parameterised SQL reads only the published base records, never draft-version tables. */
export async function queryPublishedSearch(payload: Payload, query: string, page = 1): Promise<SearchResult> {
  const normalised = normaliseSearch(query)
  if (!normalised || !Number.isSafeInteger(page) || page < 1 || page > MAX_SEARCH_PAGE)
    return { hits: [], total: 0, page: 1, totalPages: 0 }
  const result = await payload.db.pool.query<SearchHit & { total_count: string }>(`
    WITH input AS (SELECT websearch_to_tsquery('english', $1) AS query),
    matches AS (
      SELECT 'page' AS kind, id, slug, title, left(coalesce(search_text, ''), 240) AS excerpt,
        ts_rank(to_tsvector('english', coalesce(search_text, '')), input.query) AS rank
      FROM pages CROSS JOIN input
      WHERE _status = 'published' AND to_tsvector('english', coalesce(search_text, '')) @@ input.query
      UNION ALL
      SELECT 'post' AS kind, id, slug, title, coalesce(excerpt, left(coalesce(search_text, ''), 240)) AS excerpt,
        ts_rank(to_tsvector('english', coalesce(search_text, '')), input.query) AS rank
      FROM posts CROSS JOIN input
      WHERE _status = 'published' AND to_tsvector('english', coalesce(search_text, '')) @@ input.query
    )
    SELECT kind, id, slug, title, excerpt, count(*) OVER () AS total_count FROM matches
    ORDER BY rank DESC, title ASC, kind ASC, id ASC LIMIT $2 OFFSET $3
  `, [normalised, SEARCH_PAGE_SIZE, (page - 1) * SEARCH_PAGE_SIZE])
  const total = Number(result.rows[0]?.total_count ?? 0)
  const hits = result.rows.map(({ kind, id, slug, title, excerpt }) => ({ kind, id, slug, title, excerpt }))
  return { hits, total, page, totalPages: Math.ceil(total / SEARCH_PAGE_SIZE) }
}

export const searchPublishedContent = unstable_cache(async (query: string, page = 1) => {
  const payload = await getPayload({ config })
  return queryPublishedSearch(payload, query, page)
}, [PUBLIC_CONTENT_TAG, 'search'], { revalidate: 600, tags: [PUBLIC_CONTENT_TAG] })
