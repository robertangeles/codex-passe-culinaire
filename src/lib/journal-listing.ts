import { cache } from 'react'
import type { Where } from 'payload'
import { getPublicAuthor, getPublicShell, getPublicTaxonomy, listPublicContent, type PublicAuthor } from './public-content'

export type JournalScope = 'journal' | 'category' | 'tag' | 'author'
export const JOURNAL_PAGE_SIZE = 12
export const MAX_LISTING_PAGE = 1000

export function parseListingPage(value: string): number | null {
  if (!/^[1-9][0-9]{0,3}$/.test(value)) return null
  const page = Number(value)
  return page <= MAX_LISTING_PAGE ? page : null
}

/** Path pagination preserves independent, publicly cached HTML for every page. */
export const getJournalListing = cache(async (scope: JournalScope, slug = '', page = 1) => {
  if (!Number.isSafeInteger(page) || page < 1 || page > MAX_LISTING_PAGE) return null
  if (scope !== 'journal' && (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200)) return null
  let title = 'Journal'
  let description = 'Notes from our work in kitchens.'
  let basePath = '/journal'
  let noIndex = false
  let author: PublicAuthor | null = null
  let where: Where | undefined
  if (scope === 'author') {
    author = await getPublicAuthor(slug)
    if (!author) return null
    title = author.name
    description = author.publicTitle || `Journal entries by ${author.name}.`
    basePath = `/journal/author/${encodeURIComponent(slug)}`
    noIndex = author.noIndex === true
    where = { authors: { in: [author.id] } }
  } else if (scope === 'category' || scope === 'tag') {
    const collection = scope === 'category' ? 'categories' : 'tags'
    const taxonomy = await getPublicTaxonomy(collection, slug)
    if (!taxonomy) return null
    title = taxonomy.name
    description = taxonomy.description || ''
    basePath = `/journal/${scope}/${encodeURIComponent(slug)}`
    noIndex = taxonomy.noIndex === true
    where = { [collection]: { in: [taxonomy.id] } }
  }
  const [listing, shell] = await Promise.all([
    listPublicContent('posts', { page, limit: JOURNAL_PAGE_SIZE, sort: ['-publishedAt', '-id'], where }),
    getPublicShell(),
  ])
  if (page > 1 && (!listing.docs.length || page > listing.totalPages)) return null
  return { title, description, basePath, noIndex, author, listing, externalEmbedsEnabled: shell.siteSettings.externalEmbedsEnabled === true }
})
