import { RouteSchema } from '../../../../components/RouteSchema'
import { buildArticleGraph } from '../../../../lib/seo/article'
import { applySchemaOverride } from '../../../../lib/seo/page'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EditorialSection } from '../../../../components/EditorialSection'
import { HeroBlock } from '../../../../components/blocks/HeroBlock'
import { ResponsiveMedia } from '../../../../components/ResponsiveMedia'
import { RichText } from '../../../../components/RichText'
import type { Post, SiteSetting } from '../../../../payload-types'
import { getPublicShell } from '../../../../lib/public-content'
import { getRequestDocument } from '../../../../lib/request-content'
import { safePublicHref } from '../../../../lib/urls'
import styles from './page.module.css'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }> }

type JournalModel = {
  post: Post
  settings: SiteSetting
  preview: boolean
  externalEmbedsEnabled: boolean
}

function isJournalSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

const getJournalViewModel = cache(async (slug: string): Promise<JournalModel | null> => {
  const [{ document, preview }, shell] = await Promise.all([
    getRequestDocument('posts', slug),
    getPublicShell(),
  ])
  if (!document) return null
  return {
    post: document,
    settings: shell.siteSettings,
    preview,
    externalEmbedsEnabled: shell.siteSettings.externalEmbedsEnabled === true,
  }
})

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

function formatMelbourneDate(value: string | null | undefined): { dateTime: string; label: string } | null {
  if (typeof value !== 'string') return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return {
    dateTime: date.toISOString(),
    label: new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date),
  }
}

function populatedRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function taxonomyLinks(values: unknown, basePath: '/journal/category/' | '/journal/tag/') {
  if (!Array.isArray(values)) return null
  const links = values.flatMap((value, index) => {
    const record = populatedRecord(value)
    if (!record || typeof record.name !== 'string' || typeof record.slug !== 'string') return []
    const href = safePublicHref(`${basePath}${record.slug}`)
    return href ? [{ key: `${record.slug}-${index}`, href, label: record.name }] : []
  })
  if (links.length === 0) return null
  return (
    <ul className={styles.taxonomies}>
      {links.map((link) => <li key={link.key}><Link href={link.href} prefetch={false}>{link.label}</Link></li>)}
    </ul>
  )
}

function authorLinks(values: unknown) {
  if (!Array.isArray(values)) return null
  const links = values.flatMap((value, index) => {
    const record = populatedRecord(value)
    if (!record || typeof record.name !== 'string' || typeof record.slug !== 'string') return []
    const href = safePublicHref(`/journal/author/${record.slug}`)
    return href ? [{ key: `${record.slug}-${index}`, href, label: record.name }] : []
  })
  if (links.length === 0) return null
  return (
    <ul className={styles.authors} aria-label="Authors">
      {links.map((author) => <li key={author.key}><Link href={author.href} prefetch={false}>{author.label}</Link></li>)}
    </ul>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isJournalSlug(slug)) notFound()

  const model = await getJournalViewModel(slug)
  if (!model) return {}
  const { post, preview, settings } = model
  return buildPageMetadata({ path: `/journal/${post.slug}`, title: post.title, description: post.excerpt,
    seo: post.seo, heroImage: post.heroImage, generatedOgPath: `/journal/${post.slug}/og`,
    article: post, settings, preview }, siteOrigin())
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (!isJournalSlug(slug)) notFound()

  const model = await getJournalViewModel(slug)
  if (!model) notFound()

  const { post, preview, externalEmbedsEnabled } = model
  const publishedDate = formatMelbourneDate(post.publishedAt)
  const updatedDate = formatMelbourneDate(post.updatedAt)
  const readingTime = typeof post.readingTime === 'number'
    && Number.isFinite(post.readingTime)
    && post.readingTime > 0
    ? Math.ceil(post.readingTime)
    : null
  const heroImage = typeof post.heroImage === 'object' && post.heroImage !== null

  return (
    <main id="main-content" tabIndex={-1}>
      {!preview && <RouteSchema path={`/journal/${post.slug}`} title={post.title} parents={[{ name: 'Journal', path: '/journal' }]}
        nodes={buildArticleGraph(post, siteOrigin()).map((node, index) => index === 0 ? applySchemaOverride(node, post.seo?.structuredDataOverride) : node)} />}
      {preview && (
        <aside className={styles.preview} aria-label="Draft preview">
          <p>Draft preview</p>
          <Link href="/api/preview?exit=1" prefetch={false}>Exit preview</Link>
        </aside>
      )}
      <article>
        <HeroBlock
          block={{ blockType: 'hero', style: 'quiet', heading: post.title, summary: post.excerpt }}
          headingLevel={1}
        />
        {heroImage && (
          <EditorialSection wide>
            <ResponsiveMedia
              media={post.heroImage}
              priority
              sizes="(min-width: 1648px) 1600px, calc(100vw - 48px)"
            />
          </EditorialSection>
        )}
        <EditorialSection>
          <div className={styles.byline}>
            {publishedDate && (
              <p><time dateTime={publishedDate.dateTime}>{publishedDate.label}</time></p>
            )}
            {updatedDate && post.updatedAt !== post.publishedAt && (
              <p>Updated <time dateTime={updatedDate.dateTime}>{updatedDate.label}</time></p>
            )}
            {readingTime !== null && <p>{readingTime} min read</p>}
            {authorLinks(post.authors)}
          </div>
          {taxonomyLinks(post.categories, '/journal/category/')}
          {taxonomyLinks(post.tags, '/journal/tag/')}
          {post.body && <RichText data={post.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
        </EditorialSection>
      </article>
    </main>
  )
}
