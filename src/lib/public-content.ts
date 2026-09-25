import { unstable_cache } from 'next/cache'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Config, User } from '../payload-types'

export const PUBLIC_CONTENT_TAG = 'public-content'
const PUBLIC_CONTENT_REVALIDATE_SECONDS = 600
const PUBLIC_CONTENT_DEPTH = 3

export type PublicContentCollection = 'pages' | 'posts' | 'services' | 'events'
export type PublicTaxonomyCollection = 'categories' | 'tags'
export type PublicDocument<TCollection extends PublicContentCollection> = Config['collections'][TCollection]
export type PublicAuthor = Pick<
  User,
  'id' | 'name' | 'slug' | 'publicTitle' | 'publicBio' | 'portrait' | 'noIndex' | 'excludeFromSitemap' | 'createdAt' | 'updatedAt'
>
export type PublicTaxonomy<TCollection extends PublicTaxonomyCollection> = Config['collections'][TCollection]
export type PublicListOptions = {
  page?: number
  limit?: number
  sort?: string | string[]
  where?: Where
}
export type PublicListResult<TCollection extends PublicContentCollection> = {
  docs: PublicDocument<TCollection>[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number | null
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

const cached = <Arguments extends unknown[], Result>(
  key: string[],
  callback: (...args: Arguments) => Promise<Result>,
): ((...args: Arguments) => Promise<Result>) =>
  unstable_cache(callback, key, {
    revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    tags: [PUBLIC_CONTENT_TAG],
  })

const normalizePositiveInteger = (value: number | undefined, fallback: number): number => {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.max(1, Math.floor(value))
}

const payloadClient = () => getPayload({ config })

const getDocument = async <TCollection extends PublicContentCollection>(
  collection: TCollection,
  slug: string,
): Promise<PublicDocument<TCollection> | null> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    depth: PUBLIC_CONTENT_DEPTH,
    limit: 1,
    overrideAccess: false,
    draft: false,
  })
  return (result.docs[0] as PublicDocument<TCollection> | undefined) ?? null
}

const getCachedDocument = <TCollection extends PublicContentCollection>(collection: TCollection) =>
  cached<[string], PublicDocument<TCollection> | null>(
    [PUBLIC_CONTENT_TAG, 'document', collection],
    (slug) => getDocument(collection, slug),
  )

export const getPublicDocument = <TCollection extends PublicContentCollection>(
  collection: TCollection,
  slug: string,
): Promise<PublicDocument<TCollection> | null> => getCachedDocument(collection)(slug)

const listDocuments = async <TCollection extends PublicContentCollection>(
  collection: TCollection,
  options: Required<Pick<PublicListOptions, 'page' | 'limit'>> &
    Omit<PublicListOptions, 'page' | 'limit'>,
): Promise<PublicListResult<TCollection>> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection,
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(options.where ? [options.where] : []),
      ],
    },
    page: options.page,
    limit: options.limit,
    sort: options.sort,
    depth: PUBLIC_CONTENT_DEPTH,
    overrideAccess: false,
    draft: false,
  })
  return result as PublicListResult<TCollection>
}

const getCachedList = <TCollection extends PublicContentCollection>(collection: TCollection) =>
  cached<
    [number, number, string | string[] | undefined, Where | undefined],
    PublicListResult<TCollection>
  >(
    [PUBLIC_CONTENT_TAG, 'list', collection],
    (page, limit, sort, where) => listDocuments(collection, { page, limit, sort, where }),
  )

export const listPublicContent = <TCollection extends PublicContentCollection>(
  collection: TCollection,
  options: PublicListOptions = {},
): Promise<PublicListResult<TCollection>> => {
  const page = normalizePositiveInteger(options.page, 1)
  const limit = Math.min(24, normalizePositiveInteger(options.limit, 12))
  return getCachedList(collection)(page, limit, options.sort, options.where)
}

const getAuthor = async (slug: string): Promise<PublicAuthor | null> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'users',
    // Users.read adds the publicProfile predicate. It is a private field and cannot be queried anonymously.
    where: { slug: { equals: slug } },
    select: {
      id: true,
      name: true,
      slug: true,
      publicTitle: true,
      publicBio: true,
      portrait: true,
      noIndex: true,
      excludeFromSitemap: true,
      createdAt: true,
      updatedAt: true,
    },
    depth: PUBLIC_CONTENT_DEPTH,
    limit: 1,
    overrideAccess: false,
  })
  const user = result.docs[0] as User | undefined
  if (!user) return null
  const { id, name, slug: authorSlug, publicTitle, publicBio, portrait, noIndex, excludeFromSitemap, createdAt, updatedAt } = user
  return { id, name, slug: authorSlug, publicTitle, publicBio, portrait, noIndex, excludeFromSitemap, createdAt, updatedAt }
}

const getCachedAuthor = cached<[string], PublicAuthor | null>(
  [PUBLIC_CONTENT_TAG, 'author'],
  getAuthor,
)

export const getPublicAuthor = (slug: string): Promise<PublicAuthor | null> => getCachedAuthor(slug)

const getShell = async () => {
  const payload = await payloadClient()
  const [siteSettings, header, footer] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false, draft: false, depth: PUBLIC_CONTENT_DEPTH }),
    payload.findGlobal({ slug: 'header', overrideAccess: false, draft: false, depth: PUBLIC_CONTENT_DEPTH }),
    payload.findGlobal({ slug: 'footer', overrideAccess: false, draft: false, depth: PUBLIC_CONTENT_DEPTH }),
  ])
  return { siteSettings, header, footer }
}

const getCachedShell = cached<[], Awaited<ReturnType<typeof getShell>>>(
  [PUBLIC_CONTENT_TAG, 'shell'],
  getShell,
)

export const getPublicShell = (): ReturnType<typeof getCachedShell> => getCachedShell()

const getTaxonomy = async <TCollection extends PublicTaxonomyCollection>(
  collection: TCollection,
  slug: string,
): Promise<PublicTaxonomy<TCollection> | null> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    depth: PUBLIC_CONTENT_DEPTH,
    limit: 1,
    overrideAccess: false,
  })
  return (result.docs[0] as PublicTaxonomy<TCollection> | undefined) ?? null
}

const getCachedTaxonomy = <TCollection extends PublicTaxonomyCollection>(collection: TCollection) =>
  cached<[string], PublicTaxonomy<TCollection> | null>(
    [PUBLIC_CONTENT_TAG, 'taxonomy', collection],
    (slug) => getTaxonomy(collection, slug),
  )

export const getPublicTaxonomy = <TCollection extends PublicTaxonomyCollection>(
  collection: TCollection,
  slug: string,
): Promise<PublicTaxonomy<TCollection> | null> => getCachedTaxonomy(collection)(slug)
