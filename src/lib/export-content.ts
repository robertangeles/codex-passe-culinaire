import type { Payload, Where } from 'payload'
import type { Config } from '../payload-types'
import { isIndexable, isInSitemap, isPublishedExport } from './discovery-policy'

export type ExportCollection = 'pages' | 'posts' | 'services' | 'events' | 'categories' | 'tags' | 'users'
const editorial = new Set<ExportCollection>(['pages', 'posts', 'services', 'events'])
const publicAuthorSelect = { id: true, name: true, slug: true, publicTitle: true, publicBio: true, portrait: true, noIndex: true, excludeFromSitemap: true, createdAt: true, updatedAt: true } as const

/** Cursor batches avoid offset skips and retain at most 100 hydrated documents at once. */
export async function* iterateExportContent<C extends ExportCollection>(payload: Payload, collection: C, sitemap = false): AsyncGenerator<Config['collections'][C]> {
  const publicationRequired = editorial.has(collection)
  const publication: Where[] = publicationRequired ? [{ _status: { equals: 'published' } }] : []
  const latest = await payload.find({ collection, overrideAccess: false, draft: false, depth: 0, limit: 1,
    sort: '-id', where: { and: publication },
    ...(collection === 'users' ? { select: publicAuthorSelect } : {}) })
  const upper = (latest.docs as Config['collections'][C][])[0]?.id
  if (typeof upper !== 'number') return
  let after = 0
  while (after < upper) {
    const result = await payload.find({ collection, overrideAccess: false, draft: false, depth: 3,
      limit: 100, pagination: false, sort: 'id',
      ...(collection === 'users' ? { select: publicAuthorSelect } : {}),
      where: { and: [...publication, { id: { greater_than: after, less_than_equal: upper } }] },
    })
    if (!result.docs.length) break
    for (const document of result.docs as Config['collections'][C][]) {
      const policy = document as { _status?: 'draft' | 'published' | null; noIndex?: boolean | null; seo?: { noIndex?: boolean | null; excludeFromSitemap?: boolean | null } | null; excludeFromSitemap?: boolean | null }
      if (sitemap ? isInSitemap(policy, publicationRequired) : publicationRequired ? isPublishedExport(policy) : isIndexable(policy)) yield document
    }
    const next = (result.docs as Config['collections'][C][])[result.docs.length - 1]?.id
    if (typeof next !== 'number' || next <= after) throw new Error('Export pagination did not advance.')
    after = next
  }
}
