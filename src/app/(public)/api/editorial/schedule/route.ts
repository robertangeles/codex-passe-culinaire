import { createLocalReq, getPayload, type TypedJobs, type TypedUser } from 'payload'
import config from '@payload-config'
import { isAdmin, isStaff } from '../../../../../payload/access'
import { resolveScheduleTime } from '../../../../../lib/schedule-time'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const editorialCollections = ['pages', 'posts', 'services', 'events'] as const
const maximumBodyBytes = 4 * 1024
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' }

type EditorialCollection = typeof editorialCollections[number]
type ScheduleInput = TypedJobs['tasks']['schedulePublish']['input']
type ScheduleBody = {
  action: 'schedule'
  collection: EditorialCollection
  documentId: number
  type: 'publish' | 'unpublish'
  timezone: string
  localTime: string
}
type CancelBody = {
  action: 'cancel'
  collection: EditorialCollection
  documentId: number
  jobId: number
}
type EditorialAction = ScheduleBody | CancelBody

type StaffContext = {
  payload: Awaited<ReturnType<typeof getPayload>>
  req: Awaited<ReturnType<typeof createLocalReq>>
  user: TypedUser
}

const json = (body: Record<string, unknown>, status: number): Response => Response.json(body, {
  status,
  headers: privateHeaders,
})

function isCollection(value: unknown): value is EditorialCollection {
  return typeof value === 'string' && editorialCollections.includes(value as EditorialCollection)
}

function positiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key))
}

function parseAction(value: unknown): EditorialAction | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  const body = value as Record<string, unknown>
  if (!isCollection(body.collection) || !positiveId(body.documentId)) return null

  if (body.action === 'schedule') {
    if (!hasOnlyKeys(body, ['action', 'collection', 'documentId', 'type', 'timezone', 'localTime', 'user'])
      || (body.type !== 'publish' && body.type !== 'unpublish')
      || typeof body.timezone !== 'string' || body.timezone.length > 64
      || typeof body.localTime !== 'string' || body.localTime.length > 32) return null
    return {
      action: 'schedule', collection: body.collection, documentId: body.documentId,
      type: body.type, timezone: body.timezone, localTime: body.localTime,
    }
  }

  if (body.action === 'cancel') {
    if (!hasOnlyKeys(body, ['action', 'collection', 'documentId', 'jobId', 'user']) || !positiveId(body.jobId)) return null
    return { action: 'cancel', collection: body.collection, documentId: body.documentId, jobId: body.jobId }
  }

  return null
}

async function readBody(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; status: number }> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (contentType !== 'application/json') return { ok: false, status: 400 }

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null && /^\d+$/u.test(contentLength) && Number(contentLength) > maximumBodyBytes)
    return { ok: false, status: 413 }

  const reader = request.body?.getReader()
  if (!reader) return { ok: false, status: 400 }
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maximumBodyBytes) {
        await reader.cancel()
        return { ok: false, status: 413 }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, status: 400 }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    return { ok: true, value }
  } catch {
    return { ok: false, status: 400 }
  }
}

async function staffContext(request: Request): Promise<StaffContext | null> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!isStaff(user) || !user) return null
  const req = await createLocalReq({ req: { headers: request.headers, url: request.url }, user }, payload)
  return { payload, req, user }
}

async function findEditorialDocument(context: StaffContext, collection: EditorialCollection, documentId: number): Promise<boolean> {
  const document = await context.payload.findByID({
    collection,
    id: documentId,
    depth: 0,
    draft: true,
    disableErrors: true,
    overrideAccess: false,
    user: context.user,
    req: context.req,
  })
  return Boolean(document)
}

function relationValue(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'id' in value) return value.id
  return value
}

function matchesDocument(input: unknown, collection: EditorialCollection, documentId: number): boolean {
  if (typeof input !== 'object' || input === null || !('doc' in input)) return false
  const doc = input.doc
  if (typeof doc !== 'object' || doc === null || !('relationTo' in doc) || !('value' in doc)) return false
  return doc.relationTo === collection && relationValue(doc.value) === documentId
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const collections = url.searchParams.getAll('collection')
  const documentIds = url.searchParams.getAll('documentId')
  if (collections.length !== 1 || documentIds.length !== 1 || [...url.searchParams.keys()].some(key => key !== 'collection' && key !== 'documentId'))
    return json({ error: 'Schedule request is invalid.' }, 400)
  const collectionValue = collections[0]
  const documentId = Number(documentIds[0])
  if (!isCollection(collectionValue) || !Number.isSafeInteger(documentId) || documentId <= 0 || String(documentId) !== documentIds[0])
    return json({ error: 'Schedule request is invalid.' }, 400)

  try {
    const context = await staffContext(request)
    if (!context) return json({ error: 'Sign in as a staff member to manage schedules.' }, 401)
    if (!await findEditorialDocument(context, collectionValue, documentId)) return json({ error: 'Editorial document not found.' }, 404)

    const result = await context.payload.find({
      collection: 'payload-jobs',
      where: {
        and: [
          { taskSlug: { equals: 'schedulePublish' } },
          { completedAt: { exists: false } },
          { 'input.doc.relationTo': { equals: collectionValue } },
          { 'input.doc.value': { equals: documentId } },
        ],
      },
      limit: 50,
      sort: 'waitUntil',
      depth: 0,
      overrideAccess: true,
      req: context.req,
      select: { input: true, taskSlug: true, waitUntil: true, hasError: true, totalTried: true },
    })

    const jobs = result.docs.flatMap(job => {
      const input = job.input as ScheduleInput | null | undefined
      if (job.taskSlug !== 'schedulePublish' || !input || !matchesDocument(input, collectionValue, documentId)) return []
      if (input.type !== 'publish' && input.type !== 'unpublish') return []
      return [{
        id: job.id,
        type: input.type,
        waitUntil: job.waitUntil ?? null,
        timezone: input.timezone ?? null,
        localTime: input.localTime ?? null,
        hasError: Boolean(job.hasError),
        totalTried: job.totalTried,
      }]
    })
    return json({ jobs }, 200)
  } catch {
    return json({ error: 'Schedules are temporarily unavailable.' }, 503)
  }
}

export async function POST(request: Request): Promise<Response> {
  let publicOrigin: string
  try {
    const configured = new URL(process.env.NEXT_PUBLIC_SERVER_URL || '')
    if (!['http:', 'https:'].includes(configured.protocol)) throw new Error('Invalid public origin')
    publicOrigin = configured.origin
  } catch {
    return json({ error: 'Scheduling origin is not configured.' }, 503)
  }
  if (request.headers.get('origin') !== publicOrigin) return json({ error: 'Same-origin request required.' }, 403)

  const parsedBody = await readBody(request)
  if (!parsedBody.ok) return json({ error: parsedBody.status === 413 ? 'Request is too large.' : 'Schedule request is invalid.' }, parsedBody.status)
  const action = parseAction(parsedBody.value)
  if (!action) return json({ error: 'Schedule request is invalid.' }, 400)

  try {
    const context = await staffContext(request)
    if (!context) return json({ error: 'Sign in as a staff member to manage schedules.' }, 401)
    if (!isAdmin(context.user)) return json({ error: 'An administrator must schedule or cancel publication.' }, 403)
    if (!await findEditorialDocument(context, action.collection, action.documentId)) return json({ error: 'Editorial document not found.' }, 404)

    if (action.action === 'schedule') {
      let waitUntil: string
      try {
        waitUntil = resolveScheduleTime(action.localTime, action.timezone)
      } catch (error) {
        const message = error instanceof Error && error.message.length <= 200 ? error.message : 'Choose a valid future time.'
        return json({ error: message }, 400)
      }

      const input: ScheduleInput = {
        type: action.type,
        doc: { relationTo: action.collection, value: action.documentId } as ScheduleInput['doc'],
        user: { relationTo: 'users', value: context.user.id },
        timezone: action.timezone,
        localTime: action.localTime,
      }
      await context.payload.jobs.queue({
        task: 'schedulePublish',
        input,
        waitUntil: new Date(waitUntil),
        overrideAccess: true,
        req: context.req,
      })
      return json({ scheduled: true }, 200)
    }

    const job = await context.payload.findByID({
      collection: 'payload-jobs',
      id: action.jobId,
      depth: 0,
      disableErrors: true,
      overrideAccess: true,
      req: context.req,
      select: { taskSlug: true, input: true, completedAt: true, processing: true },
    })
    if (!job || job.taskSlug !== 'schedulePublish' || job.completedAt || !matchesDocument(job.input, action.collection, action.documentId))
      return json({ error: 'Schedule not found.' }, 404)
    if (job.processing) return json({ error: 'A running schedule cannot be cancelled.' }, 409)

    const deleted = await context.payload.delete({
      collection: 'payload-jobs',
      where: {
        and: [
          { id: { equals: action.jobId } },
          { taskSlug: { equals: 'schedulePublish' } },
          { completedAt: { exists: false } },
          { processing: { equals: false } },
          { 'input.doc.relationTo': { equals: action.collection } },
          { 'input.doc.value': { equals: action.documentId } },
        ],
      },
      depth: 0,
      overrideAccess: true,
      req: context.req,
    })
    if (deleted.docs.length !== 1) return json({ error: 'Schedule not found.' }, 404)
    return json({ cancelled: true }, 200)
  } catch {
    return json({ error: 'Schedules are temporarily unavailable.' }, 503)
  }
}
