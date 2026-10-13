import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cacheMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('next/cache', () => cacheMocks)
vi.mock('../src/lib/public-content', () => ({ PUBLIC_CONTENT_TAG: 'public-content' }))

import { POST } from '../src/app/(public)/api/revalidate/route'

const secret = 'test-revalidation-secret'
const validContent = {
  collection: 'posts',
  scope: 'content',
  documentId: '14',
  previousSlug: 'old-menu-notes',
  savedSlug: 'menu-notes',
  currentSlug: null,
  published: false,
  revision: null,
  broadInvalidation: false,
}

const request = (body: BodyInit, options: { authorization?: string; headers?: HeadersInit } = {}) => {
  const init: RequestInit & { duplex?: 'half' } = {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(options.authorization ? { Authorization: options.authorization } : {}),
      ...options.headers,
    },
  }
  if (body instanceof ReadableStream) init.duplex = 'half'
  return new Request('http://localhost/api/revalidate', init)
}

const authorized = (body: BodyInit, headers?: HeadersInit) =>
  request(body, { authorization: `Bearer ${secret}`, headers })

const expectPrivate = (response: Response) => {
  expect(response.headers.get('cache-control')).toBe('private, no-store')
}

describe('POST /api/revalidate', () => {
  let originalSecret: string | undefined

  beforeEach(() => {
    originalSecret = process.env.REVALIDATE_SECRET
    process.env.REVALIDATE_SECRET = secret
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.REVALIDATE_SECRET
    else process.env.REVALIDATE_SECRET = originalSecret
  })

  it('rejects an invalid bearer token without invalidating caches', async () => {
    const response = await POST(request(JSON.stringify(validContent), { authorization: 'Bearer wrong' }))

    expect(response.status).toBe(401)
    expectPrivate(response)
    expect(cacheMocks.revalidateTag).not.toHaveBeenCalled()
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled()
  })

  it('bounds streamed bodies even when Content-Length is absent', async () => {
    const oversized = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(4096))
        controller.enqueue(new Uint8Array(4096))
        controller.enqueue(new Uint8Array(1))
        controller.close()
      },
    })
    const response = await POST(authorized(oversized))

    expect(response.status).toBe(413)
    expectPrivate(response)
    expect(cacheMocks.revalidateTag).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON and mismatched collection scopes', async () => {
    const malformed = await POST(authorized('{not json'))
    const mismatched = await POST(authorized(JSON.stringify({ ...validContent, collection: 'media' })))

    expect(malformed.status).toBe(400)
    expectPrivate(malformed)
    expect(mismatched.status).toBe(400)
    expectPrivate(mismatched)
    expect(cacheMocks.revalidateTag).not.toHaveBeenCalled()
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled()
  })

  it('invalidates the public tag and dependent paths for content and global changes', async () => {
    const contentResponse = await POST(authorized(JSON.stringify(validContent)))
    const globalResponse = await POST(authorized(JSON.stringify({
      collection: 'site-settings',
      scope: 'global',
      documentId: 'site-settings',
      broadInvalidation: true,
    })))

    expect(contentResponse.status).toBe(200)
    expectPrivate(contentResponse)
    await expect(contentResponse.json()).resolves.toEqual({ revalidated: true })
    expect(globalResponse.status).toBe(200)
    expectPrivate(globalResponse)
    await expect(globalResponse.json()).resolves.toEqual({ revalidated: true })
    expect(cacheMocks.revalidateTag).toHaveBeenCalledTimes(2)
    expect(cacheMocks.revalidateTag).toHaveBeenNthCalledWith(1, 'public-content', { expire: 0 })
    expect(cacheMocks.revalidateTag).toHaveBeenNthCalledWith(2, 'public-content', { expire: 0 })
    expect(cacheMocks.revalidatePath).toHaveBeenNthCalledWith(1, '/', 'layout')
    expect(cacheMocks.revalidatePath).toHaveBeenNthCalledWith(2, '/', 'layout')
  })

  it('returns a retryable service error when cache invalidation fails', async () => {
    cacheMocks.revalidateTag.mockImplementationOnce(() => { throw new Error('internal cache detail') })

    const response = await POST(authorized(JSON.stringify(validContent)))

    expect(response.status).toBe(503)
    expectPrivate(response)
    await expect(response.json()).resolves.toEqual({ error: 'Revalidation could not be completed.' })
    expect(cacheMocks.revalidatePath).not.toHaveBeenCalled()
  })

  it('fails closed when the secret is not configured', async () => {
    delete process.env.REVALIDATE_SECRET

    const response = await POST(request(JSON.stringify(validContent)))

    expect(response.status).toBe(503)
    expectPrivate(response)
    expect(cacheMocks.revalidateTag).not.toHaveBeenCalled()
  })
})
