import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createLocalReq: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
  findByID: vi.fn(),
  getPayload: vi.fn(),
  queue: vi.fn(),
  resolveScheduleTime: vi.fn(),
}))

vi.mock('payload', () => ({ createLocalReq: mocks.createLocalReq, getPayload: mocks.getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('../src/lib/schedule-time', () => ({ resolveScheduleTime: mocks.resolveScheduleTime }))

import { GET, POST } from '../src/app/(public)/api/editorial/schedule/route'

const staff = { id: 42, role: 'admin', email: 'private@example.test' }
const localRequest = { payloadRequest: true }
const document = { id: 7, title: 'Private editorial title', _status: 'draft' }

function getRequest(query = 'collection=posts&documentId=7'): Request {
  return new Request(`https://example.test/api/editorial/schedule?${query}`, { method: 'GET' })
}

function postRequest(body: unknown, origin = 'https://example.test', sizeHeader?: string): Request {
  const headers = new Headers({
    Origin: origin,
    'Content-Type': 'application/json',
  })
  if (sizeHeader) headers.set('Content-Length', sizeHeader)
  return new Request('https://example.test/api/editorial/schedule', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

function scheduleBody(extra: Record<string, unknown> = {}) {
  return {
    action: 'schedule',
    collection: 'posts',
    documentId: 7,
    type: 'publish',
    timezone: 'Australia/Melbourne',
    localTime: '2026-10-26T10:00',
    ...extra,
  }
}

function cancelBody(extra: Record<string, unknown> = {}) {
  return { action: 'cancel', collection: 'posts', documentId: 7, jobId: 19, ...extra }
}

function pendingJob(input: Record<string, unknown> = {}) {
  return {
    id: 19,
    taskSlug: 'schedulePublish',
    input: {
      type: 'publish',
      doc: { relationTo: 'posts', value: 7 },
      user: { relationTo: 'users', value: 42 },
      timezone: 'Australia/Melbourne',
      localTime: '2026-10-26T10:00',
      secret: 'must-not-leak',
      ...input,
    },
    waitUntil: '2026-10-25T23:00:00.000Z',
    hasError: false,
    totalTried: 0,
    completedAt: null,
    processing: false,
  }
}

describe('editorial schedule API', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.test')
    mocks.auth.mockResolvedValue({ user: staff })
    mocks.createLocalReq.mockResolvedValue(localRequest)
    mocks.findByID.mockResolvedValue(document)
    mocks.find.mockResolvedValue({ docs: [] })
    mocks.queue.mockResolvedValue({ id: 19 })
    mocks.delete.mockResolvedValue({ docs: [pendingJob()] })
    mocks.getPayload.mockResolvedValue({
      auth: mocks.auth,
      find: mocks.find,
      findByID: mocks.findByID,
      jobs: { queue: mocks.queue },
      delete: mocks.delete,
    })
    mocks.resolveScheduleTime.mockReturnValue('2026-10-25T23:00:00.000Z')
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('validates GET selectors and authenticates staff before any document or job read', async () => {
    const malformed = await GET(getRequest('collection=redirects&documentId=7'))
    expect(malformed.status).toBe(400)
    expect(mocks.getPayload).not.toHaveBeenCalled()

    mocks.auth.mockResolvedValueOnce({ user: { id: 80, role: 'customer' } })
    const unauthorized = await GET(getRequest())
    expect(unauthorized.status).toBe(401)
    expect(mocks.findByID).not.toHaveBeenCalled()
    expect(mocks.find).not.toHaveBeenCalled()
  })

  it('lists only matching pending schedules with a private safe projection', async () => {
    mocks.find.mockResolvedValue({ docs: [pendingJob(), pendingJob({ doc: { relationTo: 'posts', value: 8 } })] })
    const response = await GET(getRequest())

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(response.headers.get('Vary')).toBe('Cookie, Authorization')
    const body = await response.json()
    expect(body).toEqual({ jobs: [{
      id: 19,
      type: 'publish',
      waitUntil: '2026-10-25T23:00:00.000Z',
      timezone: 'Australia/Melbourne',
      localTime: '2026-10-26T10:00',
      hasError: false,
      totalTried: 0,
    }] })
    expect(JSON.stringify(body)).not.toContain('private@example.test')
    expect(JSON.stringify(body)).not.toContain('must-not-leak')
    expect(mocks.findByID).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'posts', id: 7, draft: true, overrideAccess: false, user: staff,
    }))
    expect(mocks.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'payload-jobs', limit: 50, sort: 'waitUntil', overrideAccess: true,
      select: { input: true, taskSlug: true, waitUntil: true, hasError: true, totalTried: true },
    }))
  })

  it('rejects cross-origin and oversized writes before reading Payload or scheduling', async () => {
    const wrongOrigin = await POST(postRequest(scheduleBody(), 'https://attacker.test'))
    expect(wrongOrigin.status).toBe(403)
    expect(mocks.getPayload).not.toHaveBeenCalled()

    const oversized = await POST(postRequest(scheduleBody(), 'https://example.test', String(4 * 1024 + 1)))
    expect(oversized.status).toBe(413)
    expect(mocks.getPayload).not.toHaveBeenCalled()
  })

  it('uses the configured public origin behind a reverse proxy, without trusting forwarded hosts', async () => {
    const proxied = new Request('http://127.0.0.1:3000/api/editorial/schedule', {
      method: 'POST', headers: { Origin: 'https://example.test', 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleBody()),
    })
    expect((await POST(proxied)).status).toBe(200)
    const forged = new Request('http://127.0.0.1:3000/api/editorial/schedule', {
      method: 'POST', headers: { Origin: 'https://attacker.test', 'X-Forwarded-Host': 'attacker.test', 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleBody()),
    })
    expect((await POST(forged)).status).toBe(403)
  })

  it('keeps scheduling and cancellation admin-only before document or job access', async () => {
    mocks.auth.mockResolvedValue({ user: { ...staff, role: 'editor' } })
    for (const body of [scheduleBody(), cancelBody()]) {
      const response = await POST(postRequest(body))
      expect(response.status).toBe(403)
    }
    expect(mocks.findByID).not.toHaveBeenCalled()
    expect(mocks.queue).not.toHaveBeenCalled()
    expect(mocks.delete).not.toHaveBeenCalled()
  })

  it('schedules with resolved time and authenticated user, ignoring a forged client identity', async () => {
    const response = await POST(postRequest(scheduleBody({ user: { relationTo: 'users', value: 999 } })))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ scheduled: true })
    expect(mocks.resolveScheduleTime).toHaveBeenCalledWith('2026-10-26T10:00', 'Australia/Melbourne')
    expect(mocks.queue).toHaveBeenCalledWith(expect.objectContaining({
      task: 'schedulePublish',
      waitUntil: new Date('2026-10-25T23:00:00.000Z'),
      overrideAccess: true,
      req: localRequest,
      input: {
        type: 'publish',
        doc: { relationTo: 'posts', value: 7 },
        user: { relationTo: 'users', value: 42 },
        timezone: 'Australia/Melbourne',
        localTime: '2026-10-26T10:00',
      },
    }))
    expect(JSON.stringify(mocks.queue.mock.calls)).not.toContain('999')
  })

  it('returns the resolver error without queueing invalid, ambiguous, or past times', async () => {
    mocks.resolveScheduleTime.mockImplementationOnce(() => { throw new Error('That Melbourne time occurs twice because daylight saving ends.') })
    const response = await POST(postRequest(scheduleBody()))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'That Melbourne time occurs twice because daylight saving ends.' })
    expect(mocks.queue).not.toHaveBeenCalled()
  })

  it('denies cancellation when the job targets another document or is already running', async () => {
    mocks.findByID
      .mockResolvedValueOnce(document)
      .mockResolvedValueOnce(pendingJob({ doc: { relationTo: 'posts', value: 8 } }))
    let response = await POST(postRequest(cancelBody()))
    expect(response.status).toBe(404)
    expect(mocks.delete).not.toHaveBeenCalled()

    mocks.findByID
      .mockResolvedValueOnce(document)
      .mockResolvedValueOnce({ ...pendingJob(), processing: true })
    response = await POST(postRequest(cancelBody()))
    expect(response.status).toBe(409)
    expect(mocks.delete).not.toHaveBeenCalled()
  })

  it('deletes only the exact matching unfinished non-running schedule', async () => {
    mocks.findByID.mockResolvedValueOnce(document).mockResolvedValueOnce(pendingJob())
    const response = await POST(postRequest(cancelBody()))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ cancelled: true })
    expect(mocks.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'payload-jobs',
      overrideAccess: true,
      where: { and: expect.arrayContaining([
        { id: { equals: 19 } },
        { taskSlug: { equals: 'schedulePublish' } },
        { completedAt: { exists: false } },
        { processing: { equals: false } },
        { 'input.doc.relationTo': { equals: 'posts' } },
        { 'input.doc.value': { equals: 7 } },
      ]) },
    }))
  })
})
