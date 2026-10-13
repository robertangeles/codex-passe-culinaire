import { timingSafeEqual } from 'node:crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { PUBLIC_CONTENT_TAG } from '../../../../lib/public-content'

const publicCollections = new Set(['pages', 'posts', 'services', 'events'])
const dependentCollections = new Set(['users', 'media', 'categories', 'tags', 'testimonials'])
const dependentGlobals = new Set(['site-settings', 'header', 'footer'])
const maximumBodyBytes = 8 * 1024
const maximumIdentifierLength = 128
const maximumSlugLength = 200

type InvalidationPayload = {
  collection: string
  scope: 'content' | 'dependent' | 'global'
  documentId: string | number
  previousSlug?: string
  savedSlug?: string
  currentSlug?: string | null
  published?: boolean
  revision?: string | null
  broadInvalidation?: boolean
}

const json = (body: Record<string, unknown>, status: number): Response =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })

const readBoundedBody = async (request: Request): Promise<string | null> => {
  const reader = request.body?.getReader()
  if (!reader) return ''

  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maximumBodyBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(body)
}

const hasValidOptionalFields = (body: Record<string, unknown>): boolean => {
  const validOptionalString = (key: string, maxLength: number, nullable = false): boolean => {
    const value = body[key]
    return value === undefined || (nullable && value === null) ||
      (typeof value === 'string' && value.length <= maxLength)
  }

  return validOptionalString('previousSlug', maximumSlugLength) &&
    validOptionalString('savedSlug', maximumSlugLength) &&
    validOptionalString('currentSlug', maximumSlugLength, true) &&
    validOptionalString('revision', 64, true) &&
    (body.published === undefined || typeof body.published === 'boolean') &&
    (body.broadInvalidation === undefined || typeof body.broadInvalidation === 'boolean')
}

const isValidPayload = (value: unknown): value is InvalidationPayload => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const body = value as Record<string, unknown>
  if (typeof body.collection !== 'string' || typeof body.scope !== 'string') return false
  if (typeof body.documentId === 'string') {
    if (!body.documentId.trim() || body.documentId.length > maximumIdentifierLength) return false
  } else if (typeof body.documentId === 'number') {
    if (!Number.isSafeInteger(body.documentId) || body.documentId < 0) return false
  } else {
    return false
  }

  const validScope = body.scope === 'content'
    ? publicCollections.has(body.collection)
    : body.scope === 'dependent'
      ? dependentCollections.has(body.collection)
      : body.scope === 'global'
        ? dependentGlobals.has(body.collection)
        : false

  return validScope && hasValidOptionalFields(body)
}

const isAuthorised = (request: Request, secret: string): boolean => {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return false
  const supplied = authorization.slice('Bearer '.length)
  if (!supplied || supplied.includes(' ')) return false
  const expectedBytes = Buffer.from(secret)
  const suppliedBytes = Buffer.from(supplied)
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes)
}

export const POST = async (request: Request): Promise<Response> => {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) return json({ error: 'Revalidation is not configured.' }, 503)
  if (!isAuthorised(request, secret)) return json({ error: 'Unauthorised.' }, 401)

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null && /^\d+$/.test(contentLength) && Number(contentLength) > maximumBodyBytes) {
    return json({ error: 'Request is too large.' }, 413)
  }

  let rawBody: string | null
  try {
    rawBody = await readBoundedBody(request)
  } catch {
    return json({ error: 'Request body is invalid.' }, 400)
  }
  if (rawBody === null) return json({ error: 'Request is too large or unreadable.' }, 413)

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400)
  }
  if (!isValidPayload(payload)) return json({ error: 'Invalid revalidation request.' }, 400)

  try {
    revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
  } catch {
    return json({ error: 'Revalidation could not be completed.' }, 503)
  }

  return json({ revalidated: true }, 200)
}
