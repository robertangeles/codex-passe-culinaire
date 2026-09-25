import { afterEach, describe, expect, it, vi } from 'vitest'
import { contentPath, indexNowKey, notifyIndexNow } from '../src/lib/indexnow'
import { GET } from '../src/app/(public)/indexnow.txt/route'

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
describe('IndexNow publication notification', () => {
  it('does nothing without a configured key and returns no verification file', async () => {
    vi.stubEnv('INDEXNOW_KEY', '')
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
    expect(await notifyIndexNow(['/about'], 'https://example.test')).toBe('disabled')
    expect(fetcher).not.toHaveBeenCalled()
    expect(GET().status).toBe(404)
  })
  it('sends only validated same-origin URLs after deduplication and uses the root verification location', async () => {
    vi.stubEnv('INDEXNOW_KEY', 'test-key-12345')
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 200 })); vi.stubGlobal('fetch', fetcher)
    expect(await notifyIndexNow(['/about', '/about'], 'https://example.test')).toBe('submitted')
    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://www.bing.com/indexnow')
    expect(JSON.parse(String(init.body))).toEqual({ host: 'example.test', key: 'test-key-12345', keyLocation: 'https://example.test/indexnow.txt', urlList: ['https://example.test/about'] })
    expect(await GET().text()).toBe('test-key-12345')
    await expect(notifyIndexNow(['//private.test/path'], 'https://example.test')).rejects.toThrow()
  })
  it('distinguishes pending verification from submission and propagates provider failures for retry', async () => {
    vi.stubEnv('INDEXNOW_KEY', 'test-key-12345')
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('', { status: 202 })).mockResolvedValueOnce(new Response('', { status: 429 }))
    vi.stubGlobal('fetch', fetcher)
    expect(await notifyIndexNow(['/'], 'https://example.test')).toBe('pending')
    await expect(notifyIndexNow(['/'], 'https://example.test')).rejects.toThrow('HTTP 429')
  })
  it('validates keys and maps only editorial routes', () => {
    vi.stubEnv('INDEXNOW_KEY', 'bad key')
    expect(indexNowKey).toThrow()
    expect(contentPath('pages', 'home')).toBe('/')
    expect(contentPath('posts', 'kitchen-notes')).toBe('/journal/kitchen-notes')
    expect(contentPath('users', 'private-person')).toBeUndefined()
    expect(contentPath('constructor', 'private-person')).toBeUndefined()
    expect(contentPath('pages', '../api')).toBeUndefined()
  })
})
