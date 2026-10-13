import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  payload: vi.fn(), auth: vi.fn(), find: vi.fn(), mode: vi.fn(), enable: vi.fn(), disable: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: mocks.payload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ draftMode: mocks.mode }))

import { GET } from '../src/app/(public)/api/preview/route'

const request = (query: string, headers = new Headers()): Request => new Request(`https://example.test/api/preview${query}`, { headers })

describe('preview route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.payload.mockResolvedValue({ auth: mocks.auth, find: mocks.find })
    mocks.auth.mockResolvedValue({ user: { id: 7, role: 'editor' } })
    mocks.find.mockResolvedValue({ docs: [{ id: 9 }] })
    mocks.mode.mockResolvedValue({ enable: mocks.enable, disable: mocks.disable })
  })

  it('requires current staff auth before reading or enabling a draft', async () => {
    mocks.auth.mockResolvedValue({ user: null })
    const response = await GET(request('?collection=pages&slug=about'))
    expect(response.status).toBe(401)
    expect(mocks.find).not.toHaveBeenCalled()
    expect(mocks.enable).not.toHaveBeenCalled()
    expect(response.headers.get('cache-control')).toBe('private, no-store')
  })

  it('rejects invalid and repeated query fields without enabling preview', async () => {
    for (const query of [
      '?collection=users&slug=about',
      '?collection=pages&slug=Uppercase',
      '?collection=pages&slug=about&slug=contact',
      '?collection=pages&slug=about&next=https://evil.test',
      `?collection=pages&slug=${'a'.repeat(201)}`,
    ]) {
      expect((await GET(request(query))).status).toBe(400)
    }
    expect(mocks.payload).not.toHaveBeenCalled()
    expect(mocks.enable).not.toHaveBeenCalled()
  })

  it('returns not found for absent drafts and does not enable preview', async () => {
    mocks.find.mockResolvedValue({ docs: [] })
    const response = await GET(request('?collection=posts&slug=missing'))
    expect(response.status).toBe(404)
    expect(mocks.enable).not.toHaveBeenCalled()
    expect(mocks.find).toHaveBeenCalledWith({
      collection: 'posts', where: { slug: { equals: 'missing' } }, limit: 1,
      depth: 0, draft: true, overrideAccess: false, user: { id: 7, role: 'editor' },
    })
  })

  it.each([
    ['pages', 'home', '/'],
    ['pages', 'about', '/about'],
    ['posts', 'kitchen-notes', '/journal/kitchen-notes'],
  ])('enables authenticated %s draft %s and redirects to its fixed path', async (collection, slug, location) => {
    const response = await GET(request(`?collection=${collection}&slug=${slug}`))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(location)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(mocks.enable).toHaveBeenCalledOnce()
  })

  it('accepts kebab slugs through 200 characters', async () => {
    const slug = 'a'.repeat(200)
    expect(slug.length).toBe(200)
    const response = await GET(request(`?collection=pages&slug=${slug}`))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe(`/${slug}`)
    expect(mocks.enable).toHaveBeenCalledOnce()
  })

  it('lets an expired staff session leave preview without database auth', async () => {
    const response = await GET(request('?exit=1'))
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/')
    expect(mocks.disable).toHaveBeenCalledOnce()
    expect(mocks.payload).not.toHaveBeenCalled()
  })

  it('returns a calm private error when Payload fails', async () => {
    mocks.payload.mockRejectedValue(new Error('private details'))
    const response = await GET(request('?collection=pages&slug=about'))
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ error: 'Preview is temporarily unavailable.' })
  })
})
