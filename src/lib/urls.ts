const internalOrigin = 'https://passeculinaire.invalid'

function decodePath(value: string): string | undefined {
  let decoded = value
  for (let attempt = 0; attempt < 5; attempt += 1) {
    // Encoded delimiters can change the path a router sees after another decode.
    if (/%(?:2f|5c|3f|23|3a)/i.test(decoded) || /%(?![0-9a-f]{2})/i.test(decoded)) return undefined
    let next: string
    try { next = decodeURIComponent(decoded) } catch { return undefined }
    if (next === decoded) return decoded
    decoded = next
  }
  return /%[0-9a-f]{2}/i.test(decoded) ? undefined : decoded
}

/** Redirect destinations stay on this site, including after repeated URL decoding. */
export function isSafeInternalPath(value: unknown, pathnameOnly = false): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048 || !value.startsWith('/')) return false
  const path = decodePath(value.split(/[?#]/, 1)[0])
  if (!path || !path.startsWith('/') || path.includes('//') || path.includes(':')
    || /[\\\s\u0000-\u001f\u007f]/u.test(path)
    || path.split('/').some((segment) => segment === '.' || segment === '..')) return false

  let decoded = value
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (/%(?![0-9a-f]{2})/i.test(decoded)) return false
    let next: string
    try { next = decodeURIComponent(decoded) } catch { return false }
    if (next === decoded) break
    decoded = next
  }
  if (/%[0-9a-f]{2}/i.test(decoded)) return false
  if (/[\\\s\u0000-\u001f\u007f]/u.test(decoded) || decoded.includes('//')) return false
  if (!decoded.startsWith('/') || pathnameOnly && /[?#]/.test(decoded)) return false
  try {
    const parsed = new URL(value, internalOrigin)
    const decodedParsed = new URL(decoded, internalOrigin)
    return parsed.origin === internalOrigin && decodedParsed.origin === internalOrigin
      && (!pathnameOnly || (!parsed.search && !parsed.hash))
  } catch { return false }
}


/** Accepts same-site paths, local fragments, and credential-free HTTPS URLs. */
export function safePublicHref(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048
    || /[\\\s\u0000-\u001f\u007f]/u.test(value)) return undefined

  if (value.startsWith('/')) return isSafeInternalPath(value) ? value : undefined

  if (value.startsWith('#')) {
    if (value === '#' || value.includes('?')) return undefined
    try {
      const decoded = decodeURIComponent(value.slice(1))
      if (!decoded || /[\\\s\u0000-\u001f\u007f]/u.test(decoded) || decoded.includes('#')) return undefined
      return value
    } catch {
      return undefined
    }
  }

  if (!/^https:\/\//i.test(value) || value.startsWith('//')) return undefined
  try {
    const parsed = new URL(value)
    const authority = value.slice(value.indexOf('//') + 2).split(/[/?#]/, 1)[0]
    if (parsed.protocol !== 'https:' || !parsed.hostname || authority.includes('@') || parsed.username || parsed.password) return undefined
    return value
  } catch {
    return undefined
  }
}
