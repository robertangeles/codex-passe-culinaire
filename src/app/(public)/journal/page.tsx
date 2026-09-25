import { buildPageMetadata } from '../../../lib/seo/metadata'
import { siteOrigin } from '../../../lib/seo/core'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JournalListing } from '../../../components/JournalListing'
import { getJournalListing } from '../../../lib/journal-listing'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const model = await getJournalListing('journal', '', 1)
  if (!model) return {}

  return buildPageMetadata({ title: model.title, description: model.description,
    path: model.basePath,
    seo: { noIndex: model.noIndex }, settings: model.settings }, siteOrigin())
}

export default async function JournalIndexPage() {
  const model = await getJournalListing('journal', '', 1)
  if (!model) notFound()

  return (
    <main id="main-content" tabIndex={-1}>
      <JournalListing model={model} />
    </main>
  )
}
