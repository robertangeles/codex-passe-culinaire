import Image from 'next/image'
import { Fragment, type ReactNode } from 'react'
import type { Page, Feature, Hero } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import { RichText } from './RichText'
import { ResponsiveMedia, isRenderableMedia } from './ResponsiveMedia'
import { KitchenFilm } from './KitchenFilm'
import styles from './CulinaireKitchenEditorial.module.css'

type PageBlock = NonNullable<Page['layout']>[number]
type StandardBlock = (block: PageBlock, index: number) => ReactNode

type Props = {
  blocks: PageBlock[]
  externalEmbedsEnabled: boolean
  renderStandardBlock: StandardBlock
}

const operationNames = ['Kitchen operation 1', 'Kitchen operation 2', 'Kitchen operation 3', 'Kitchen operation 4'] as const
const anchors: { id: string; label: string; names: readonly string[] }[] = [
  { id: 'operation', label: 'The daily operation', names: ['Kitchen operation introduction', ...operationNames] },
  { id: 'labs', label: 'The three labs', names: ['Kitchen labs'] },
  { id: 'example', label: 'A practical example', names: ['Kitchen example'] },
  { id: 'film', label: 'A kitchen day on film', names: ['Kitchen film'] },
] as const

function named(block: PageBlock): string {
  return block.blockName?.trim() ?? ''
}

function asHero(block: PageBlock): Hero | undefined {
  return block.blockType === 'hero' && named(block) === 'Kitchen introduction' ? block : undefined
}

function isProductFeature(block: PageBlock): block is Feature {
  return block.blockType === 'feature' && (
    operationNames.some((name) => name === named(block))
    || anchors.some(({ names }) => names.includes(named(block)))
    || ['Kitchen founders', 'Kitchen continuation'].includes(named(block))
  )
}

function hasEditorialImage(image: Feature['image'] | Hero['image']): boolean {
  return isRenderableMedia(image) && image.placeholder !== true
}

function HeroImage({ block }: { block: Hero }) {
  if (hasEditorialImage(block.image)) {
    return <ResponsiveMedia className={styles.heroMedia} media={block.image} priority sizes="(min-width: 1200px) 560px, (min-width: 801px) 45vw, calc(100vw - 48px)" />
  }
  return (
    <figure className={styles.heroMedia}>
      <Image src="/images/culinaire-kitchen/preparation.webp" alt="Illustrative pastry chef at work, preparing components at the bench." width={1600} height={900} sizes="(min-width: 1200px) 560px, (min-width: 801px) 45vw, calc(100vw - 48px)" preload />
    </figure>
  )
}

function FeatureImage({ block, fallback, alt, className }: { block: Feature; fallback: string; alt: string; className: string }) {
  if (hasEditorialImage(block.image)) {
    return <ResponsiveMedia className={className} media={block.image} sizes="(min-width: 1200px) 560px, (min-width: 801px) 42vw, calc(100vw - 48px)" />
  }
  return <Image className={className} src={fallback} alt={alt} width={1600} height={900} sizes="(min-width: 1200px) 560px, (min-width: 801px) 42vw, calc(100vw - 48px)" loading="lazy" />
}

function Navigation({ blocks }: { blocks: PageBlock[] }) {
  const links = anchors.filter(({ names }) => blocks.some((block) => isProductFeature(block) && names.includes(named(block))))
  if (links.length === 0) return null
  return <nav className={styles.ledger} aria-label="On this page">{links.map((link, index) => <a href={`#${link.id}`} key={link.id}><span>{String(index + 1).padStart(2, '0')}</span>{link.label}</a>)}</nav>
}

function ProductHero({ block, blocks, headingLevel }: { block: Hero; blocks: PageBlock[]; headingLevel: 1 | 2 }) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const productUrl = safePublicHref('https://www.culinaire.kitchen')
  const hasFilm = blocks.some((item) => isProductFeature(item) && named(item) === 'Kitchen film')
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        {block.eyebrow && <p className={styles.kicker}>{block.eyebrow}</p>}
        <Heading className={styles.heroHeading}>{block.heading.trim() || 'CulinAIre Kitchen'}</Heading>
        {block.summary?.trim() && <p className={styles.heroSummary}>{block.summary}</p>}
        {(productUrl || hasFilm) && <div className={styles.actions}>{productUrl && <a className={styles.primaryAction} href={productUrl}>Visit CulinAIre Kitchen <span aria-hidden="true">↗</span></a>}{hasFilm && <a className={styles.textLink} href="#film">Watch the kitchen film</a>}</div>}
        <Navigation blocks={blocks} />
      </div>
      <HeroImage block={block} />
    </section>
  )
}

function Text({ block, externalEmbedsEnabled, headingLevel = 2 }: { block: Feature; externalEmbedsEnabled: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return <>
    {block.heading?.trim() && <Heading className={styles.sectionHeading}>{block.heading.trim()}</Heading>}
    {block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
  </>
}

function anchorId(block: PageBlock, blocks: PageBlock[]): string | undefined {
  const blockName = named(block)
  if (blockName === 'Kitchen operation introduction') return 'operation'
  if (operationNames.some((name) => name === blockName)
    && !blocks.some((item) => item.blockType === 'feature' && named(item) === 'Kitchen operation introduction')
    && blockName === operationNames.find((name) => blocks.some((item) => item.blockType === 'feature' && named(item) === name))) return 'operation'
  if (blockName === 'Kitchen labs') return 'labs'
  if (blockName === 'Kitchen example') return 'example'
  if (blockName === 'Kitchen film') return 'film'
  return undefined
}

function EditorialFeature({ block, blocks, externalEmbedsEnabled }: { block: Feature; blocks: PageBlock[]; externalEmbedsEnabled: boolean }) {
  const blockName = named(block)
  const id = anchorId(block, blocks)
  if (blockName === 'Kitchen operation introduction') {
    return <section className={styles.operationIntro} id={id}><div className={styles.operationIntroCopy}><Text block={block} externalEmbedsEnabled={externalEmbedsEnabled} /></div></section>
  }
  if (operationNames.some((name) => name === blockName)) {
    return <article className={styles.operationRow} id={id}><div className={styles.operationTitle}><span>{String(operationNames.findIndex((name) => name === blockName) + 1).padStart(2, '0')}</span>{block.heading?.trim() && <h3>{block.heading.trim()}</h3>}</div>{block.body && <div className={styles.operationBody}><RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} /></div>}</article>
  }
  if (blockName === 'Kitchen labs') {
    return <section className={styles.labs} id={id}>
      <FeatureImage block={block} fallback="/images/culinaire-kitchen/cocktail-lab.webp" alt="Illustrative cocktail development at the bar." className={styles.labImage} />
      <div className={styles.labCopy}><Text block={block} externalEmbedsEnabled={externalEmbedsEnabled} /></div>
    </section>
  }
  if (blockName === 'Kitchen example') {
    return <section className={styles.example} id={id}>
      <FeatureImage block={block} fallback="/images/culinaire-kitchen/tart.webp" alt="Illustrative finished tart at the kitchen pass." className={styles.exampleImage} />
      <div className={styles.exampleCopy}><p className={styles.kicker}>One practical example</p><Text block={block} externalEmbedsEnabled={externalEmbedsEnabled} /></div>
    </section>
  }
  if (blockName === 'Kitchen film') {
    const intro = <div className={styles.filmCopy}><p className={styles.kicker}>The kitchen on film</p><Text block={block} externalEmbedsEnabled={externalEmbedsEnabled} /></div>
    return <KitchenFilm id="film" className={styles.film} playerClassName={styles.filmPlayer} autoStart={false} showIntro={false} intro={intro} />
  }
  if (blockName === 'Kitchen founders') {
    const aboutHref = safePublicHref('/about')
    return <section className={styles.founders}><div className={styles.foundersIntro}><p className={styles.kicker}>From Passe Culinaire</p>{block.heading?.trim() && <h2 className={styles.sectionHeading}>{block.heading.trim()}</h2>}</div><div className={styles.foundersDetails}>{block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}{aboutHref && <a className={styles.textLink} href={aboutHref}>Meet the founders <span aria-hidden="true">↗</span></a>}</div></section>
  }
  if (blockName === 'Kitchen continuation') {
    return <section className={styles.continuation}><div><Text block={block} externalEmbedsEnabled={externalEmbedsEnabled} /></div></section>
  }
  return null
}

export function CulinaireKitchenEditorial({ blocks, externalEmbedsEnabled, renderStandardBlock }: Props) {
  return <div className={styles.page}>{blocks.map((block, index) => {
    const hero = index === 0 ? asHero(block) : undefined
    if (hero) return <ProductHero block={hero} blocks={blocks} headingLevel={index === 0 ? 1 : 2} key={block.id ?? `kitchen-hero-${index}`} />
    const feature = isProductFeature(block) && !blocks.slice(0, index).some((previous) => previous.blockType === 'feature' && named(previous) === named(block)) ? block : undefined
    if (feature) {
      return <EditorialFeature block={feature} blocks={blocks} externalEmbedsEnabled={externalEmbedsEnabled} key={block.id ?? `kitchen-feature-${index}`} />
    }
    return <Fragment key={block.id ?? `${block.blockType}-${index}`}>{renderStandardBlock(block, index)}</Fragment>
  })}</div>
}
