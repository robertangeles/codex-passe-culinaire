import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JournalListing } from '../../../components/JournalListing'
import { getJournalListing } from '../../../lib/journal-listing'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  const model = await getJournalListing('journal', '', 1)
  if (!model) return {}

  return {
    title: model.title,
    description: model.description,
    robots: { index: !model.noIndex },
  }
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
