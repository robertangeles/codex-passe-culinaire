import { buildPageMetadata } from '../../../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../../../lib/seo/core'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { JournalListing } from '../../../../../../components/JournalListing'
import { getJournalListing, parseListingPage } from '../../../../../../lib/journal-listing'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string; page?: string[] }> }

function isCategorySlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

function parsePageSegments(segments: string[] | undefined): number | null {
  if (segments === undefined) return 1
  if (segments.length !== 2 || segments[0] !== 'page') return null
  return parseListingPage(segments[1])
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page: segments } = await params
  if (!isCategorySlug(slug)) notFound()

  const page = parsePageSegments(segments)
  if (page === null) notFound()
  if (page === 1 && segments !== undefined) {
    permanentRedirect(`/journal/category/${encodeURIComponent(slug)}`)
  }

  const model = await getJournalListing('category', slug, page)
  if (!model) return {}

  return buildPageMetadata({ title: page > 1 ? `${model.title} · Page ${page}` : model.title, description: model.description,
    path: page > 1 ? `${model.basePath}/page/${page}` : model.basePath,
    seo: { noIndex: model.noIndex }, settings: model.settings }, siteOrigin())
}

export default async function JournalCategoryPage({ params }: PageProps) {
  const { slug, page: segments } = await params
  if (!isCategorySlug(slug)) notFound()

  const page = parsePageSegments(segments)
  if (page === null) notFound()
  if (page === 1 && segments !== undefined) {
    permanentRedirect(`/journal/category/${encodeURIComponent(slug)}`)
  }

  const model = await getJournalListing('category', slug, page)
  if (!model) notFound()

  return (
    <main id="main-content" tabIndex={-1}>
      <JournalListing model={model} />
    </main>
  )
}
