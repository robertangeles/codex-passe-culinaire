import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { findManagedRedirect, isRedirectPath, redirectLookupCapability } from '../src/lib/redirects'

function client(records: Record<string, { to: string; statusCode: string }>) {
  const find = vi.fn(async ({ where }: { where: { from: { equals: string } } }) => ({ docs: records[where.from.equals] ? [records[where.from.equals]] : [] }))
  return { payload: { find } as unknown as Payload, find }
}

describe('managed redirects', () => {
  it('protects infrastructure paths and rejects off-site destinations', () => {
    for (const path of ['/api/users', '/admin', '/_next/static/file', '/media/photo.avif', '/robots.txt', '/sitemaps/posts.xml', '/%61dmin', '/%2561dmin', '//evil.test', 'https://evil.test']) expect(isRedirectPath(path)).toBe(false)
    expect(isRedirectPath('/old/article.html', true)).toBe(true)
    expect(isRedirectPath('/journal/new?source=old#prep')).toBe(true)
  })
  it('reads only an exact path through the trusted server capability without bypassing access', async () => {
    const { payload, find } = client({ '/old': { to: '/new?source=old', statusCode: '301' } })
    expect(await findManagedRedirect(payload, '/old')).toEqual({ to: '/new?source=old', status: 301 })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ overrideAccess: false, limit: 1, depth: 0, where: { from: { equals: '/old' } }, context: { redirectLookup: redirectLookupCapability } }))
  })
  it('collapses chains while preserving the first redirect status and avoids cycles', async () => {
    const { payload } = client({ '/a': { to: '/b', statusCode: '302' }, '/b': { to: '/c', statusCode: '308' } })
    expect(await findManagedRedirect(payload, '/a')).toEqual({ to: '/c', status: 302 })
    const cyclic = client({ '/a': { to: '/b', statusCode: '301' }, '/b': { to: '/a', statusCode: '301' } })
    expect(await findManagedRedirect(cyclic.payload, '/a')).toBeNull()
    expect(await findManagedRedirect(client({ '/a': { to: '/a#top', statusCode: '301' } }).payload, '/a')).toBeNull()
  })
  it('does not mask database failures as missing redirects', async () => {
    const { payload, find } = client({})
    find.mockRejectedValue(new Error('Unavailable'))
    await expect(findManagedRedirect(payload, '/old')).rejects.toThrow('Unavailable')
  })
})
