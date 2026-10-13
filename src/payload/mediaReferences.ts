import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook, type GlobalBeforeChangeHook, type PayloadRequest } from 'payload'

const referencingCollections = ['pages', 'posts', 'services', 'events', 'testimonials', 'users'] as const
const versionedCollections = ['pages', 'posts', 'services', 'events'] as const
const referencingGlobals = ['site-settings', 'header', 'footer'] as const
const mediaKeys = new Set(['image', 'heroImage', 'portrait', 'ogImage', 'defaultOgImage'])

async function lockMediaReferences(req: PayloadRequest): Promise<void> {
  const id = await req.transactionID
  const adapter = req.payload.db as unknown as PostgresAdapter
  const transaction = id === undefined || id === null ? undefined : adapter.sessions[String(id)]?.db
  if (!transaction) throw new Error('Media reference changes require an active database transaction.')
  await transaction.execute(sql`select pg_advisory_xact_lock(84920260925)`)
}

function relationId(value: unknown): string | null {
  if (typeof value === 'number' || typeof value === 'string') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    if (typeof id === 'number' || typeof id === 'string') return String(id)
  }
  return null
}

export function mediaIds(value: unknown): Set<string> {
  const found = new Set<string>()
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) { for (const child of node) visit(child); return }
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (record.relationTo === 'media') {
      const id = relationId(record.value)
      if (id !== null) found.add(id)
    }
    for (const [key, child] of Object.entries(record)) {
      if (mediaKeys.has(key)) {
        if (Array.isArray(child)) {
          for (const item of child) { const id = relationId(item); if (id !== null) found.add(id) }
        } else {
          const id = relationId(child)
          if (id !== null) found.add(id)
        }
      }
      visit(child)
    }
  }
  visit(value)
  return found
}

async function assertMediaExists(req: PayloadRequest, value: unknown): Promise<void> {
  for (const id of mediaIds(value)) {
    const media = await req.payload.findByID({ collection: 'media', id, req, overrideAccess: true, depth: 0, disableErrors: true })
    if (!media) throw new APIError(`Media ${id} no longer exists.`, 400)
  }
}

export const guardMediaWrite: CollectionBeforeChangeHook = async ({ data, req }) => {
  await lockMediaReferences(req)
  await assertMediaExists(req, data)
  return data
}

export const guardGlobalMediaWrite: GlobalBeforeChangeHook = async ({ data, req }) => {
  await lockMediaReferences(req)
  await assertMediaExists(req, data)
  return data
}

async function collectionReferences(req: PayloadRequest, collection: typeof referencingCollections[number], id: number | string): Promise<boolean> {
  let page = 1
  while (true) {
    const result = await req.payload.find({ collection, req, overrideAccess: true, depth: 0, limit: 100, page })
    if (result.docs.some((doc) => mediaIds(doc).has(String(id)))) return true
    if (!result.hasNextPage) return false
    page += 1
  }
}

async function versionReferences(req: PayloadRequest, collection: typeof versionedCollections[number], id: number | string): Promise<boolean> {
  let page = 1
  while (true) {
    const result = await req.payload.findVersions({ collection, req, overrideAccess: true, depth: 0, limit: 100, page })
    if (result.docs.some((doc) => mediaIds(doc.version).has(String(id)))) return true
    if (!result.hasNextPage) return false
    page += 1
  }
}

export const guardMediaDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await lockMediaReferences(req)
  for (const collection of referencingCollections) {
    if (await collectionReferences(req, collection, id)) throw new APIError('This image is still used in content.', 409)
  }
  for (const collection of versionedCollections) {
    if (await versionReferences(req, collection, id)) throw new APIError('This image is still used in a saved draft or version.', 409)
  }
  for (const slug of referencingGlobals) {
    const global = await req.payload.findGlobal({ slug, req, overrideAccess: true, depth: 0 })
    if (mediaIds(global).has(String(id))) throw new APIError('This image is still used in site settings.', 409)
  }
}
