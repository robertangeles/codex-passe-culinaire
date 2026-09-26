import Link from 'next/link'
import type { Hero, Media } from '../../payload-types'
import { BrandMonogram } from '../BrandMonogram'
import { ResponsiveMedia } from '../ResponsiveMedia'
import styles from './HeroBlock.module.css'

type Season = 'summer' | 'autumn' | 'winter' | 'spring'

type HeroBlockProps = {
  block: Hero
  headingLevel?: 1 | 2
  home?: boolean
}

const melbourneMonthFormatter = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Melbourne',
  month: 'numeric',
})

function isPopulatedMedia(image: Hero['image']): image is Media {
  return image !== null
    && typeof image === 'object'
    && typeof image.id === 'number'
    && typeof image.filename === 'string'
    && image.filename.length > 0
    && typeof image.width === 'number'
    && image.width > 0
    && typeof image.height === 'number'
    && image.height > 0
    && typeof image.alt === 'string'
    && image.placeholder !== true
}

export function seasonInMelbourne(date: Date): Season | null {
  if (!Number.isFinite(date.getTime())) return null

  const month = Number(melbourneMonthFormatter.formatToParts(date).find((part) => part.type === 'month')?.value)
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  if (month === 12 || month <= 2) return 'summer'
  if (month <= 5) return 'autumn'
  if (month <= 8) return 'winter'
  return 'spring'
}

export function heroImageForDate(block: Hero, date: Date): Hero['image'] {
  const season = seasonInMelbourne(date)
  const seasonal = block.seasonalImages?.find((item) => item.season === season)?.image
  return isPopulatedMedia(seasonal) ? seasonal : block.image
}

export function HeroBlock({ block, headingLevel = 2, home = false }: HeroBlockProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  const hasImage = block.style === 'image'
  const image = heroImageForDate(block, new Date())
  const hasPopulatedImage = hasImage && isPopulatedMedia(image)
  const className = [
    styles.hero,
    hasPopulatedImage ? styles.withImage : styles.quiet,
    home ? styles.home : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={className} aria-label={block.eyebrow || undefined}>
      {hasPopulatedImage && (
        <div className={styles.media}>
          <ResponsiveMedia media={image} priority={home || headingLevel === 1} sizes={home ? '(min-width: 741px) 52vw, 100vw' : '(min-width: 960px) 58vw, 100vw'} />
        </div>
      )}
      <div className={styles.content}>
        {home && <BrandMonogram className={styles.homeMonogram} display />}
        {block.eyebrow && <p className={styles.eyebrow}>{block.eyebrow}</p>}
        <Heading className={home ? styles.wordmark : styles.heading}>{block.heading}</Heading>
        {block.summary && <p className={styles.summary}>{block.summary}</p>}
        {home && (
          <Link className={styles.primaryLink} href="/culinaire-kitchen" prefetch={false}>
            Explore CulinAIre Kitchen
          </Link>
        )}
      </div>
    </section>
  )
}
