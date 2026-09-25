import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '../../components/BlockRenderer'
import { getPageViewModel } from '../../lib/page-view-model'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const model = await getPageViewModel('home')
  if (!model) return {}

  const { page, preview } = model
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || undefined,
    robots: preview
      ? { index: false, follow: false }
      : { index: page.seo?.noIndex !== true, follow: page.seo?.noFollow !== true },
  }
}

export default async function HomePage() {
  const model = await getPageViewModel('home')
  if (!model) notFound()

  const { page, content, preview, externalEmbedsEnabled } = model

  return (
    <main id="main-content" tabIndex={-1}>
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
