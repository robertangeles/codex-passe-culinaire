import { isSafeInternalPath } from './urls'

export function indexNowKey(): string | undefined {
  const key = process.env.INDEXNOW_KEY?.trim()
  if (!key) return undefined
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error('IndexNow key has an invalid format.')
  return key
}

export async function notifyIndexNow(paths: string[], origin: string): Promise<'disabled' | 'skipped' | 'submitted' | 'pending'> {
  const key = indexNowKey()
  if (!key) return 'disabled'
  if (paths.some(path => !isSafeInternalPath(path, true))) throw new Error('Invalid IndexNow path.')
  const base = new URL(origin)
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password) throw new Error('Invalid public origin.')
  const urls = [...new Set(paths)].map(path => new URL(path, base.origin).href)
  if (!urls.length) return 'skipped'
  const response = await fetch('https://www.bing.com/indexnow', {
    method: 'POST', signal: AbortSignal.timeout(5000), headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: base.host, key, keyLocation: `${base.origin}/indexnow.txt`, urlList: urls }),
  })
  if (response.status === 200) return 'submitted'
  if (response.status === 202) return 'pending'
  throw new Error(`IndexNow submission failed with HTTP ${response.status}.`)
}

export function contentPath(collection: string, slug: unknown): string | undefined {
  if (typeof slug !== 'string' || slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined
  if (collection === 'pages') return slug === 'home' ? '/' : `/${slug}`
  const base = collection === 'posts' ? '/journal' : collection === 'services' ? '/services' : collection === 'events' ? '/training' : undefined
  return base ? `${base}/${slug}` : undefined
}
