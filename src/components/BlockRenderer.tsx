import type { ReactNode } from 'react'
import { HomeFounders, HomeProduct, HomeScope } from './HomeEditorial'
import { AboutFeature, AboutFounders, AboutHero, AboutProse } from './AboutEditorial'
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
  about?: boolean
  title: string
}

function assertNever(block: never): never {
  throw new Error(`Unsupported page block: ${JSON.stringify(block)}`)
}

function renderBlock(
  block: PageBlock,
  index: number,
  props: Pick<BlockRendererProps, 'content' | 'externalEmbedsEnabled' | 'home' | 'about'>,
) {
  const key = block.id ?? `${block.blockType}-${index}`
  const lead = index === 0

  switch (block.blockType) {
    case 'hero':
      if (props.about && lead) return <AboutHero key={key} block={block} headingLevel={1} />
      return <HeroBlock key={key} block={block} headingLevel={lead ? 1 : 2} home={props.home === true && lead} />
    case 'prose':
      if (props.about && block.blockName === 'About founders') return <AboutProse key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
      return <ProseBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'feature':
      if (props.about && block.blockName === 'About continuation') return <AboutFeature key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
      return <FeatureBlock key={key} block={block} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'gallery':
      return <GalleryBlock key={key} block={block} />
    case 'pullQuote':
      return <PullQuoteBlock key={key} block={block} />
    case 'founderCard':
      return <FounderCardBlock key={key} block={block} priority={index < 3} externalEmbedsEnabled={props.externalEmbedsEnabled} />
    case 'productSpotlight':
      if (props.home) return <HomeProduct key={key} />
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
      if (props.home) return <HomeScope key={key} block={block} />
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
  about = false,
  title,
}: BlockRendererProps) {
  const pageBlocks = blocks ?? []
  const startsWithHero = pageBlocks[0]?.blockType === 'hero'
  const rendered: ReactNode[] = []
  for (let index = 0; index < pageBlocks.length; index += 1) {
    const block = pageBlocks[index]
    if ((home || about) && block.blockType === 'founderCard') {
      const founders = [block]
      while (pageBlocks[index + 1]?.blockType === 'founderCard') {
        const next = pageBlocks[++index]
        if (next.blockType === 'founderCard') founders.push(next)
      }
      rendered.push(home
        ? <HomeFounders key={block.id ?? `founders-${index}`} blocks={founders} externalEmbedsEnabled={externalEmbedsEnabled} />
        : <AboutFounders key={block.id ?? `founders-${index}`} blocks={founders} externalEmbedsEnabled={externalEmbedsEnabled} />)
    } else {
      rendered.push(renderBlock(block, index, { content, externalEmbedsEnabled, home, about }))
    }
  }

  return (
    <>
      {!startsWithHero && (
        <HeroBlock block={{ blockType: 'hero', heading: title, style: 'quiet' }} headingLevel={1} home={home} />
      )}
      {rendered}
    </>
  )
}
