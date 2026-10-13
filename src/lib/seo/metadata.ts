import type { Metadata } from 'next'
import type { Media, Page, SiteSetting } from '../../payload-types'
import { absolutePublicUrl, confirmedText, isoDate, publicMediaUrl } from './core'

type MetadataInput = {
  path: string
  title: string
  description?: string | null
  seo?: Page['seo']
  heroImage?: number | Media | null
  generatedOgPath?: string
  settings?: SiteSetting
  preview?: boolean
  article?: { publishedAt?: string | null; updatedAt?: string | null }
}

export function buildPageMetadata(input: MetadataInput, origin: string): Metadata {
  const title = confirmedText(input.seo?.metaTitle) || confirmedText(input.title) || 'Passe Culinaire'
  const description = confirmedText(input.seo?.metaDescription) || confirmedText(input.description)
    || confirmedText(input.settings?.description)
  const override = input.seo?.canonicalUrl?.startsWith('https://')
    ? absolutePublicUrl(input.seo.canonicalUrl, origin) : undefined
  const canonical = override || new URL(input.path, origin).href
  const image = publicMediaUrl(input.seo?.ogImage, origin) || publicMediaUrl(input.heroImage, origin)
    || absolutePublicUrl(input.generatedOgPath, origin) || publicMediaUrl(input.settings?.defaultOgImage, origin)
  return {
    title, description, alternates: { canonical },
    robots: input.preview ? { index: false, follow: false }
      : { index: input.seo?.noIndex !== true, follow: input.seo?.noFollow !== true },
    openGraph: {
      title, description, url: canonical, locale: 'en_AU', siteName: confirmedText(input.settings?.name) || 'Passe Culinaire',
      ...(image ? { images: [{ url: image }] } : {}),
      ...(input.article ? { type: 'article', publishedTime: isoDate(input.article.publishedAt), modifiedTime: isoDate(input.article.updatedAt) } : { type: 'website' }),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
  }
}
