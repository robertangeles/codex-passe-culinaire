import type { JournalFeed } from '../payload-types'
import type { getJournalListing } from '../lib/journal-listing'
import { EditorialSection } from './EditorialSection'
import { HeroBlock } from './blocks/HeroBlock'
import { JournalFeedBlock } from './blocks/JournalFeedBlock'
import { Pagination } from './Pagination'
import { ResponsiveMedia } from './ResponsiveMedia'
import { RichText } from './RichText'

type JournalListingProps = {
  model: NonNullable<Awaited<ReturnType<typeof getJournalListing>>>
}

export function JournalListing({ model }: JournalListingProps) {
  const hero = {
    blockType: 'hero',
    heading: model.title,
    summary: model.description,
    style: 'quiet',
  } as const
  const feed = {
    blockType: 'journalFeed',
    heading: 'Journal entries',
    limit: 12,
  } satisfies JournalFeed
  const page = model.listing.page ?? 1
  const portrait = model.author?.portrait && typeof model.author.portrait === 'object'
    ? model.author.portrait
    : null
  const publicBio = model.author?.publicBio

  return (
    <>
      <HeroBlock block={hero} headingLevel={1} />
      {model.author && (portrait || publicBio) && (
        <EditorialSection>
          {portrait && (
            <ResponsiveMedia
              media={portrait}
              sizes="(min-width: 900px) 62ch, calc(100vw - 32px)"
            />
          )}
          {publicBio && <RichText data={publicBio} externalEmbedsEnabled={model.externalEmbedsEnabled} />}
        </EditorialSection>
      )}
      <JournalFeedBlock block={feed} posts={model.listing.docs} />
      {model.listing.totalPages > 1 && (
        <EditorialSection>
          <Pagination basePath={model.basePath} page={page} totalPages={model.listing.totalPages} />
        </EditorialSection>
      )}
    </>
  )
}
