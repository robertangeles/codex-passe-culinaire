import type { Page } from '../payload-types'
import type { BlockContent } from '../lib/page-view-model'
import { CTABlock } from './blocks/CTABlock'
import { FAQBlock } from './blocks/FAQBlock'
import { FeatureBlock } from './blocks/FeatureBlock'
import { FounderCardBlock } from './blocks/FounderCardBlock'
import { GalleryBlock } from './blocks/GalleryBlock'
import { HeroBlock } from './blocks/HeroBlock'
import { JournalFeedBlock } from './blocks/JournalFeedBlock'
import { PlainStatementBlock } from './blocks/PlainStatementBlock'
import { ProductSpotlightBlock } from './blocks/ProductSpotlightBlock'
import { ProseBlock } from './blocks/ProseBlock'
import { PullQuoteBlock } from './blocks/PullQuoteBlock'
import { ServiceListBlock } from './blocks/ServiceListBlock'
import { SpacerBlock } from './blocks/SpacerBlock'
import { TestimonialBlock } from './blocks/TestimonialBlock'
import { UpcomingEventsBlock } from './blocks/UpcomingEventsBlock'

type PageBlock = NonNullable<Page['layout']>[number]

type BlockRendererProps = {
  blocks: Page['layout']
  content: BlockContent
  externalEmbedsEnabled?: boolean
  home?: boolean
  title: string
}

function assertNever(block: never): never {
  throw new Error(`Unsupported page block: ${JSON.stringify(block)}`)
}

function renderBlock(
  block: PageBlock,
  index: number,
  props: Pick<BlockRendererProps, 'content' | 'externalEmbedsEnabled' | 'home'>,
) {
  const key = block.id ?? `${block.blockType}-${index}`
  const lead = index === 0

  switch (block.blockType) {
    case 'hero':
      return <HeroBlock key={key} block={block} headingLevel={lead ? 1 : 2} home={props.home === true && lead} />
    case 'prose':
      return <ProseBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'feature':
      return <FeatureBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'gallery':
      return <GalleryBlock key={key} block={block} />
    case 'pullQuote':
      return <PullQuoteBlock key={key} block={block} />
    case 'founderCard':
      return <FounderCardBlock key={key} block={block} priority={index < 3} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'productSpotlight':
      return <ProductSpotlightBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'journalFeed':
      return <JournalFeedBlock key={key} block={block} posts={props.content.posts} />
    case 'faq':
      return <FAQBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'serviceList':
      return <ServiceListBlock key={key} block={block} services={props.content.services} />
    case 'upcomingEvents':
      return <UpcomingEventsBlock key={key} block={block} events={props.content.events} />
    case 'testimonial':
      return <TestimonialBlock key={key} block={block} />
    case 'plainStatement':
      return <PlainStatementBlock key={key} block={block} />
    case 'cta':
      return <CTABlock key={key} block={block} />
    case 'spacer':
      return <SpacerBlock key={key} block={block} />
    default:
      return assertNever(block)
  }
}

export function BlockRenderer({
  blocks,
  content,
  externalEmbedsEnabled = false,
  home = false,
  title,
}: BlockRendererProps) {
  const pageBlocks = blocks ?? []
  const startsWithHero = pageBlocks[0]?.blockType === 'hero'

  return (
    <>
      {!startsWithHero && (
        <HeroBlock block={{ blockType: 'hero', heading: title, style: 'quiet' }} headingLevel={1} home={home} />
      )}
      {pageBlocks.map((block, index) => renderBlock(block, index, { content, externalEmbedsEnabled, home }))}
    </>
  )
}
