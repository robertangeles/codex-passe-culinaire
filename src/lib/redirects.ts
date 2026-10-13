import type { Payload } from 'payload'
import { isSafeInternalPath } from './urls'

/** Server-only capability shared across Next's separately compiled server bundles. HTTP input cannot construct a symbol. */
export const redirectLookupCapability = Symbol.for('passe-culinaire.redirect-lookup')
const protectedPrefixes = ['/admin', '/api', '/_next', '/media', '/assets', '/.well-known']
const protectedFiles = new Set(['/robots.txt', '/sitemap.xml', '/feed.xml', '/feed.json', '/llms.txt', '/llms-full.txt', '/indexnow.txt', '/favicon.ico'])

export function isRedirectPath(value: unknown, source = false): value is string {
  if (!isSafeInternalPath(value, source)) return false
  let pathname = new URL(value, 'https://passeculinaire.invalid').pathname
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const decoded = decodeURIComponent(pathname)
    if (decoded === pathname) break
    pathname = decoded
  }
  return !protectedFiles.has(pathname) && !pathname.startsWith('/sitemaps/') && !pathname.startsWith('/markdown/')
    && !/^\/sitemap-[a-z]+\.xml$/.test(pathname) && !/^\/journal\/[^/]+\.md$/.test(pathname)
    && !protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export type ManagedRedirect = { to: string; status: 301 | 302 | 307 | 308 }

/** Exact indexed reads preserve admin-only API access and observe committed edits immediately. */
export async function findManagedRedirect(payload: Payload, pathname: string): Promise<ManagedRedirect | null> {
  if (!isRedirectPath(pathname, true)) return null
  const seen = new Set<string>()
  let path = pathname
  let redirect: ManagedRedirect | null = null
  let firstStatus: ManagedRedirect['status'] | undefined
  for (let hop = 0; hop < 8; hop += 1) {
    if (seen.has(path)) return null
    seen.add(path)
    const result = await payload.find({
      collection: 'redirects', overrideAccess: false, depth: 0, limit: 1,
      where: { from: { equals: path } }, select: { to: true, statusCode: true },
      context: { redirectLookup: redirectLookupCapability },
    })
    const record = result.docs[0]
    if (!record) return redirect
    const status = Number(record.statusCode)
    if (!isRedirectPath(record.to) || ![301, 302, 307, 308].includes(status)) return null
    firstStatus ??= status as ManagedRedirect['status']
    redirect = { to: record.to, status: firstStatus }
    path = new URL(record.to, 'https://passeculinaire.invalid').pathname
  }
  // Cycles or excessively long chains must not trap a visitor in redirects.
  return null
}
