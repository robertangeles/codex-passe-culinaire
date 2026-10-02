import { LivePreviewRefresh } from '../../../components/LivePreviewRefresh'
import { JsonLd } from '../../../components/JsonLd'
import { buildPageGraph } from '../../../lib/seo/page'
import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../lib/seo/metadata'
import { siteOrigin } from '../../../lib/seo/core'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '../../../components/BlockRenderer'
import { getPageViewModel } from '../../../lib/page-view-model'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }> }

function isPublicPageSlug(slug: string): boolean {
  return slug !== 'home' && slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isPublicPageSlug(slug)) notFound()

  const model = await getPageViewModel(slug)
  if (!model) return {}

  const { page, preview, settings } = model
  const hero = page.layout?.find(block => block.blockType === 'hero')
  return buildPageMetadata({ path: `/${page.slug}`, title: page.title,
    description: hero?.summary, seo: page.seo, heroImage: hero?.image, preview, settings }, siteOrigin())
}

export default async function CMSPage({ params }: PageProps) {
  const { slug } = await params
  if (!isPublicPageSlug(slug)) notFound()

  const model = await getPageViewModel(slug)
  if (!model) notFound()

  const { page, content, preview, externalEmbedsEnabled } = model

  return (
    <main id="main-content" tabIndex={-1}>
      {!preview && <JsonLd nodes={buildPageGraph(page, siteOrigin())} />}
      {preview && (
        <aside aria-label="Draft preview">
          <LivePreviewRefresh />
          <p>Draft preview</p>
          <Link href="/api/preview?exit=1" prefetch={false}>Exit preview</Link>
        </aside>
      )}
      <BlockRenderer
        blocks={page.layout}
        title={page.title}
        content={content}
        home={false}
        about={page.slug === 'about'}
        externalEmbedsEnabled={externalEmbedsEnabled}
      />
    </main>
  )
}
