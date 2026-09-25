import { JsonLd } from '../../components/JsonLd'
import { buildPageGraph } from '../../lib/seo/page'
import type { Metadata } from 'next'
import { buildPageMetadata } from '../../lib/seo/metadata'
import { siteOrigin } from '../../lib/seo/core'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '../../components/BlockRenderer'
import { getPageViewModel } from '../../lib/page-view-model'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const model = await getPageViewModel('home')
  if (!model) return {}

  const { page, preview, settings } = model
  const hero = page.layout?.find(block => block.blockType === 'hero')
  return buildPageMetadata({ path: `/`, title: page.title,
    description: hero?.summary, seo: page.seo, heroImage: hero?.image, preview, settings }, siteOrigin())
}

export default async function HomePage() {
  const model = await getPageViewModel('home')
  if (!model) notFound()

  const { page, content, preview, externalEmbedsEnabled } = model

  return (
    <main id="main-content" tabIndex={-1}>
      {!preview && <JsonLd nodes={buildPageGraph(page, siteOrigin())} />}
      {preview && (
        <aside aria-label="Draft preview">
          <p>Draft preview</p>
          <Link href="/api/preview?exit=1" prefetch={false}>Exit preview</Link>
        </aside>
      )}
      <BlockRenderer
        blocks={page.layout}
        title={page.title}
        content={content}
        home
        externalEmbedsEnabled={externalEmbedsEnabled}
      />
    </main>
  )
}
