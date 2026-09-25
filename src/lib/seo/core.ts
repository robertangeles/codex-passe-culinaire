import { safePublicHref } from '../urls'
import type { Media } from '../../payload-types'

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue | undefined }
export type SchemaNode = { '@type': string | string[]; '@id'?: string; [key: string]: JsonValue | undefined }

export function siteOrigin(): string {
  const value = process.env.NEXT_PUBLIC_SERVER_URL
  if (!value) throw new Error('The public origin is not configured.')
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('The public origin is invalid.')
  return url.origin
}

export function confirmedText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim()
  return text && !/\[TO CONFIRM\]/i.test(text) ? text : undefined
}

export function absolutePublicUrl(value: unknown, origin: string): string | undefined {
  const href = safePublicHref(value)
  if (!href || href.startsWith('#')) return undefined
  return new URL(href, origin).href
}

export function isoDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined
}

export function publicMediaUrl(value: number | Media | null | undefined, origin: string): string | undefined {
  if (!value || typeof value !== 'object' || value.placeholder || !value.filename) return undefined
  return new URL(`/media/${encodeURIComponent(value.filename)}`, origin).href
}

export function entityIds(origin: string) {
  return {
    organisation: `${origin}/#organisation`, website: `${origin}/#website`,
    brand: `${origin}/culinaire-kitchen#brand`, software: `${origin}/culinaire-kitchen#software`,
    person: (slug: string) => `${origin}/journal/author/${encodeURIComponent(slug)}#person`,
  }
}

export function serializeJsonLd(nodes: SchemaNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
    .replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
}
