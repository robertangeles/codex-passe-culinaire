import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, TaskConfig } from 'payload'

const publicCollections = new Set(['pages', 'posts', 'services', 'events'])
const dependentCollections = new Set(['users', 'media', 'categories', 'tags', 'testimonials'])
const dependentGlobals = new Set(['site-settings', 'header', 'footer'])
type PublicationInput = {
  collection: string
  scope: 'content' | 'dependent' | 'global'
  documentId: number | string
  previousSlug?: string
  savedSlug?: string
}

export const publicationTask: TaskConfig<{ input: PublicationInput; output: { invalidated: boolean } }> = {
  slug: 'propagate-publication',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
    { name: 'scope', type: 'select', required: true, options: ['content', 'dependent', 'global'] },
    { name: 'documentId', type: 'text', required: true },
    { name: 'previousSlug', type: 'text' },
    { name: 'savedSlug', type: 'text' },
  ],
  retries: { attempts: 5, backoff: { delay: 10000, type: 'fixed' } },
  handler: async ({ input, req }) => {
    if (!(publicCollections.has(input.collection) || dependentCollections.has(input.collection) || dependentGlobals.has(input.collection))) throw new Error('Invalid publication collection.')
    const secret = process.env.REVALIDATE_SECRET
    const origin = process.env.NEXT_PUBLIC_SERVER_URL
    if (!secret || !origin) throw new Error('Publication invalidation is not configured.')
    const current = publicCollections.has(input.collection) ? await req.payload.findByID({
      collection: input.collection as 'pages' | 'posts' | 'services' | 'events',
      id: input.documentId,
      req, overrideAccess: true, depth: 0, disableErrors: true,
    }) : null
    const response = await fetch(new URL('/api/revalidate', origin), {
      method: 'POST', signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({
        collection: input.collection, scope: input.scope, documentId: input.documentId,
        broadInvalidation: input.scope !== 'content',
        previousSlug: input.previousSlug, savedSlug: input.savedSlug,
        currentSlug: current?.slug ?? null,
        published: current?._status === 'published',
        revision: current?.updatedAt ?? null,
      }),
    })
    if (!response.ok) throw new Error(`Publication invalidation failed with HTTP ${response.status}.`)
    return { output: { invalidated: true } }
  },
}

export const queuePublicationChange: CollectionAfterChangeHook = async ({ collection, doc, previousDoc, req }) => {
  if (!publicCollections.has(collection.slug) && !dependentCollections.has(collection.slug)) return doc
  await req.payload.jobs.queue({ task: 'propagate-publication', req, input: {
    collection: collection.slug, scope: publicCollections.has(collection.slug) ? 'content' : 'dependent', documentId: String(doc.id),
    previousSlug: typeof previousDoc?.slug === 'string' ? previousDoc.slug : undefined,
    savedSlug: typeof doc.slug === 'string' ? doc.slug : undefined,
  } })
  return doc
}

export const queuePublicationDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  if (!publicCollections.has(collection.slug) && !dependentCollections.has(collection.slug)) return doc
  await req.payload.jobs.queue({ task: 'propagate-publication', req, input: {
    collection: collection.slug, scope: publicCollections.has(collection.slug) ? 'content' : 'dependent', documentId: String(doc.id),
    previousSlug: typeof doc.slug === 'string' ? doc.slug : undefined,
  } })
  return doc
}

export const queueGlobalChange: GlobalAfterChangeHook = async ({ global, doc, req }) => {
  if (!dependentGlobals.has(global.slug)) return doc
  await req.payload.jobs.queue({ task: 'propagate-publication', req, input: {
    collection: global.slug, scope: 'global', documentId: global.slug,
  } })
  return doc
}
