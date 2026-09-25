import { buildPageMetadata } from '../../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../../lib/seo/core'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { JournalListing } from '../../../../../components/JournalListing'
import { getJournalListing, parseListingPage } from '../../../../../lib/journal-listing'

export const revalidate = 600

type PageProps = { params: Promise<{ page: string }> }

type ListingRoute = { page: number; model: NonNullable<Awaited<ReturnType<typeof getJournalListing>>> }

async function getRouteListing(params: PageProps['params']): Promise<ListingRoute> {
  const { page: rawPage } = await params
  const page = parseListingPage(rawPage)
  if (page === null) notFound()
  if (page === 1) permanentRedirect('/journal')

  const model = await getJournalListing('journal', '', page)
  if (!model) notFound()
  return { page, model }
}

export async function generateStaticParams(): Promise<never[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page, model } = await getRouteListing(params)
  return buildPageMetadata({ title: page > 1 ? `${model.title} · Page ${page}` : model.title, description: model.description,
    path: page > 1 ? `${model.basePath}/page/${page}` : model.basePath,
    seo: { noIndex: model.noIndex }, settings: model.settings }, siteOrigin())
}

export default async function JournalPageNumber({ params }: PageProps) {
  const { model } = await getRouteListing(params)
  return (
    <main id="main-content" tabIndex={-1}>
      <JournalListing model={model} />
    </main>
  )
}
