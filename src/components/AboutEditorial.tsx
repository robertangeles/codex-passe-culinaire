import type { Feature, FounderCard, Hero, Prose } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import { RichText } from './RichText'
import { BrandMonogram } from './BrandMonogram'
import { ResponsiveMedia, isRenderableMedia } from './ResponsiveMedia'
import { HeroBlock } from './blocks/HeroBlock'
import { FeatureBlock } from './blocks/FeatureBlock'
import styles from './AboutEditorial.module.css'

type AboutHeroProps = { block: Hero; headingLevel: 1 | 2 }
type AboutBlocksProps = { blocks: FounderCard[]; externalEmbedsEnabled?: boolean }

export function AboutHero({ block, headingLevel }: AboutHeroProps) {
  if (block.style === 'image') return <HeroBlock block={block} headingLevel={headingLevel} />
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section className={styles.hero} aria-label={block.eyebrow || undefined}>
      <div className={styles.heroCopy}>
        {block.eyebrow && <p className={styles.eyebrow}>{block.eyebrow}</p>}
        <Heading className={styles.heroHeading}>{block.heading}</Heading>
        {block.summary && <p className={styles.intro}>{block.summary}</p>}
      </div>
      {headingLevel === 1 && <BrandMonogram className={styles.monogram} display />}
    </section>
  )
}

export function AboutProse({ block, externalEmbedsEnabled = false }: { block: Prose; externalEmbedsEnabled?: boolean }) {
  if (!block.body || block.body.root.children.length === 0) return null
  return (
    <section className={styles.prose}>
      <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />
    </section>
  )
}

function FounderPortrait({ founder }: { founder: FounderCard }) {
  const media = founder.portrait
  const realPortrait = isRenderableMedia(media) && media.placeholder !== true

  if (realPortrait) {
    return <ResponsiveMedia media={media} sizes="(min-width: 960px) 29vw, 100vw" className={styles.portrait} />
  }

  return (
    <figure className={`${styles.portrait} ${styles.placeholder}`} aria-label={`Portrait photograph space for ${founder.name}`}>
      <div className={styles.placeholderFrame}>
        <span className={styles.portraitKind}>Portrait photograph</span>
        <span className={styles.portraitName}>{founder.name}</span>
        <span className={styles.portraitNote}>Photo placement</span>
      </div>
      <figcaption>Photograph to be supplied</figcaption>
    </figure>
  )
}

export function AboutFounders({ blocks, externalEmbedsEnabled = false }: AboutBlocksProps) {
  return (
    <section className={styles.founders} aria-label="Founder biographies">
      <div className={styles.foundersInner}>
        {blocks.map((founder, index) => (
          <article className={styles.founder} key={founder.id ?? `${founder.name}-${index}`}>
            <FounderPortrait founder={founder} />
            <div className={styles.founderCopy}>
              <h3 className={styles.name}>{founder.name}</h3>
              {founder.title?.trim() && <p className={styles.role}>{founder.title.trim()}</p>}
              {founder.bio && <div className={styles.bio}><RichText data={founder.bio} externalEmbedsEnabled={externalEmbedsEnabled} /></div>}
              {founder.links && founder.links.length > 0 && (
                <ul className={styles.links}>
                  {founder.links.map((link, linkIndex) => {
                    const href = safePublicHref(link?.url)
                    return href && link?.label?.trim() ? (
                      <li key={link.id ?? `${href}-${linkIndex}`}><a href={href}>{link.label}</a></li>
                    ) : null
                  })}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function AboutFeature({ block, externalEmbedsEnabled = false }: { block: Feature; externalEmbedsEnabled?: boolean }) {
  if (isRenderableMedia(block.image)) return <FeatureBlock block={block} externalEmbedsEnabled={externalEmbedsEnabled} />
  return (
    <section className={styles.closing}>
      <div className={styles.closingInner}>
        {block.heading?.trim() && <h2 className={styles.closingHeading}>{block.heading.trim()}</h2>}
        <div className={styles.closingContent}>
          {block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
        </div>
      </div>
    </section>
  )
}
