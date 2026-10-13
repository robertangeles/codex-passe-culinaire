import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ mode: vi.fn(), headers: vi.fn(), payload: vi.fn(), auth: vi.fn(), find: vi.fn(), publicRead: vi.fn() }))
vi.mock('next/headers', () => ({ draftMode: mocks.mode, headers: mocks.headers }))
vi.mock('payload', () => ({ getPayload: mocks.payload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('../src/lib/public-content', () => ({ getPublicDocument: mocks.publicRead }))
import { getRequestDocument } from '../src/lib/request-content'

describe('request content preview isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.mode.mockResolvedValue({ isEnabled: false })
    mocks.headers.mockResolvedValue(new Headers())
    mocks.payload.mockResolvedValue({ auth: mocks.auth, find: mocks.find })
    mocks.publicRead.mockResolvedValue({ id: 1, title: 'Published version' })
    mocks.find.mockResolvedValue({ docs: [{ id: 1, title: 'Private draft' }] })
  })

  it('does not read request headers or authenticate ordinary public requests', async () => {
    expect(await getRequestDocument('pages', 'home')).toEqual({ document: { id: 1, title: 'Published version' }, preview: false })
    expect(mocks.payload).not.toHaveBeenCalled()
    expect(mocks.headers).not.toHaveBeenCalled()
  })

  it('a forged or expired draft cookie never grants draft access', async () => {
    mocks.mode.mockResolvedValue({ isEnabled: true })
    for (const user of [null, { role: 'visitor' }]) {
      mocks.auth.mockResolvedValue({ user })
      expect((await getRequestDocument('pages', 'home')).preview).toBe(false)
    }
    expect(mocks.find).not.toHaveBeenCalled()
    expect(mocks.publicRead).toHaveBeenCalledTimes(2)
  })

  it('reads authenticated staff drafts outside shared public cache with access checks', async () => {
    mocks.mode.mockResolvedValue({ isEnabled: true })
    for (const role of ['admin', 'editor']) {
      const user = { id: 42, role }
      mocks.auth.mockResolvedValue({ user })
      expect(await getRequestDocument('posts', 'draft-notes')).toEqual({ document: { id: 1, title: 'Private draft' }, preview: true })
      expect(mocks.find).toHaveBeenLastCalledWith({
        collection: 'posts', where: { slug: { equals: 'draft-notes' } },
        limit: 1, depth: 3, draft: true, overrideAccess: false, user,
      })
    }
    expect(mocks.publicRead).not.toHaveBeenCalled()
  })
})
