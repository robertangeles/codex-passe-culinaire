import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { JournalListing } from '../../../../../../components/JournalListing'
import { getJournalListing, parseListingPage } from '../../../../../../lib/journal-listing'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string; page?: string[] }> }

type RouteParams = { slug: string; page: number }

function validSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

function resolveRoute({ slug, page: segments }: { slug: string; page?: string[] }): RouteParams {
  if (!validSlug(slug)) notFound()
  if (!segments || segments.length === 0) return { slug, page: 1 }
  if (segments.length !== 2 || segments[0] !== 'page') notFound()

  const page = parseListingPage(segments[1] ?? '')
  if (page === null) notFound()
  if (page === 1) permanentRedirect(`/journal/tag/${encodeURIComponent(slug)}`)
  return { slug, page }
}

const getTagViewModel = cache(async (slug: string, page: number) => getJournalListing('tag', slug, page))

export async function generateStaticParams(): Promise<never[]> {
  return []
}

async function getRouteModel(params: PageProps['params']) {
  const route = resolveRoute(await params)
  const model = await getTagViewModel(route.slug, route.page)
  if (!model) notFound()
  return { model, page: route.page }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { model, page } = await getRouteModel(params)
  return {
    title: page > 1 ? `${model.title} · Page ${page}` : model.title,
    description: model.description,
    robots: { index: !model.noIndex },
  }
}

export default async function JournalTagPage({ params }: PageProps) {
  const { model } = await getRouteModel(params)
  return (
    <main id="main-content" tabIndex={-1}>
      <JournalListing model={model} />
    </main>
  )
}
