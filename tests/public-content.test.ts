import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getPayload: vi.fn(),
  cacheRegistrations: [] as Array<{ keyParts: string[]; options: { revalidate?: number; tags?: string[] } }>,
  cacheArguments: [] as unknown[][],
}))

vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({
  unstable_cache: (
    callback: (...args: unknown[]) => Promise<unknown>,
    keyParts: string[] = [],
    options: { revalidate?: number; tags?: string[] } = {},
  ) => {
    mocks.cacheRegistrations.push({ keyParts, options })
    return (...args: unknown[]) => {
      mocks.cacheArguments.push(args)
      return callback(...args)
    }
  },
}))

import {
  getPublicAuthor,
  getPublicDocument,
  getPublicShell,
  getPublicTaxonomy,
  listPublicContent,
  PUBLIC_CONTENT_TAG,
} from '../src/lib/public-content'

type PublicApi = {
  find: ReturnType<typeof vi.fn>
  findGlobal: ReturnType<typeof vi.fn>
}

const setupPayload = (overrides: Partial<PublicApi> = {}) => {
  const payload: PublicApi = {
    find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0, limit: 12, totalPages: 0, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }),
    findGlobal: vi.fn().mockResolvedValue({}),
    ...overrides,
  }
  mocks.getPayload.mockResolvedValue(payload)
  return payload
}

describe('public content access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.cacheRegistrations.length = 0
    mocks.cacheArguments.length = 0
  })

  it('forces published documents and configures anonymous shared caching', async () => {
    const document = { id: 9, title: 'Menu notes', slug: 'menu-notes', _status: 'published' }
    const payload = setupPayload({ find: vi.fn().mockResolvedValue({ docs: [document] }) })

    await expect(getPublicDocument('posts', 'menu-notes')).resolves.toEqual(document)

    const query = payload.find.mock.calls[0]?.[0] as {
      where: { and: Array<Record<string, unknown>> }
      overrideAccess: boolean
      draft: boolean
      user?: unknown
    }
    expect(query.where.and).toEqual([
      { slug: { equals: 'menu-notes' } },
      { _status: { equals: 'published' } },
    ])
    expect(query).toMatchObject({ overrideAccess: false, draft: false })
    expect(query.user).toBeUndefined()
    expect(mocks.cacheRegistrations[0]).toEqual({
      keyParts: [PUBLIC_CONTENT_TAG, 'document', 'posts'],
      options: { revalidate: 600, tags: [PUBLIC_CONTENT_TAG] },
    })
    expect(mocks.cacheArguments).toEqual([['menu-notes']])
  })

  it('keeps the published filter outside caller filters and normalises bounded pagination', async () => {
    const payload = setupPayload()
    const callerFilter = { _status: { equals: 'draft' }, title: { contains: 'sourdough' } }

    await listPublicContent('posts', { page: 0, limit: 100, sort: '-publishedAt', where: callerFilter })

    const query = payload.find.mock.calls[0]?.[0] as {
      where: { and: Array<Record<string, unknown>> }
      page: number
      limit: number
      sort: string
      overrideAccess: boolean
      draft: boolean
      user?: unknown
    }
    expect(query.where.and).toEqual([
      { _status: { equals: 'published' } },
      callerFilter,
    ])
    expect(query).toMatchObject({ page: 1, limit: 24, sort: '-publishedAt', overrideAccess: false, draft: false })
    expect(query.user).toBeUndefined()
    expect(mocks.cacheArguments).toEqual([[1, 24, '-publishedAt', callerFilter]])
  })

  it('returns only the explicit public author projection', async () => {
    const privateUser = {
      id: 2,
      name: 'Alex',
      slug: 'alex',
      publicProfile: true,
      publicTitle: 'Pastry chef',
      publicBio: { root: { children: [] } },
      portrait: null,
      noIndex: false,
      excludeFromSitemap: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      email: 'private@example.test',
      role: 'admin',
      hash: 'private-hash',
    }
    const payload = setupPayload({ find: vi.fn().mockResolvedValue({ docs: [privateUser] }) })

    await expect(getPublicAuthor('alex')).resolves.toEqual({
      id: 2,
      name: 'Alex',
      slug: 'alex',
      publicTitle: 'Pastry chef',
      publicBio: privateUser.publicBio,
      portrait: null,
      noIndex: false,
      excludeFromSitemap: false,
      createdAt: privateUser.createdAt,
      updatedAt: privateUser.updatedAt,
    })

    const query = payload.find.mock.calls[0]?.[0] as {
      where: { and: Array<Record<string, unknown>> }
      select: Record<string, boolean>
      overrideAccess: boolean
      user?: unknown
    }
    expect(query.where).toEqual({ slug: { equals: 'alex' } })
    expect(query).toMatchObject({ overrideAccess: false })
    expect(query.user).toBeUndefined()
    expect(Object.keys(query.select).sort()).toEqual([
      'createdAt',
      'excludeFromSitemap',
      'id',
      'name',
      'noIndex',
      'portrait',
      'publicBio',
      'publicTitle',
      'slug',
      'updatedAt',
    ])
  })

  it('uses shared cache arguments for list filters, shell, and taxonomy and propagates database failures', async () => {
    const payload = setupPayload()
    await listPublicContent('events', { page: 2, limit: 7, sort: 'startDate', where: { eventStatus: { equals: 'upcoming' } } })
    await getPublicShell()
    await getPublicTaxonomy('categories', 'baking')

    expect(mocks.cacheArguments).toEqual([
      [2, 7, 'startDate', { eventStatus: { equals: 'upcoming' } }],
      [],
      ['baking'],
    ])
    expect(payload.findGlobal).toHaveBeenCalledTimes(3)
    for (const [options] of payload.findGlobal.mock.calls) {
      expect(options).toMatchObject({ overrideAccess: false, draft: false })
    }
    const failedPayload = setupPayload({ find: vi.fn().mockRejectedValue(new Error('database unavailable')) })
    await expect(getPublicDocument('pages', 'home')).rejects.toThrow('database unavailable')
    expect(failedPayload.find).toHaveBeenCalledOnce()
  })
})
