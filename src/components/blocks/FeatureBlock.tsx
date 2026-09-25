import type { Feature, Media } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import { ResponsiveMedia } from '../ResponsiveMedia'
import { RichText } from '../RichText'
import styles from './FeatureBlock.module.css'

type FeatureBlockProps = {
  block: Feature
  externalEmbedsEnabled?: boolean
}

function hasRenderableImage(image: Feature['image']): image is Media {
  return Boolean(
    image
    && typeof image === 'object'
    && typeof image.filename === 'string'
    && image.filename.length > 0
    && image.filename !== '.'
    && image.filename !== '..'
    && new TextEncoder().encode(image.filename).length <= 255
    && !/[/\\\x00-\x1f\x7f-\x9f]/u.test(image.filename)
    && typeof image.width === 'number'
    && Number.isFinite(image.width)
    && image.width > 0
    && typeof image.height === 'number'
    && Number.isFinite(image.height)
    && image.height > 0
    && typeof image.alt === 'string',
  )
}

export function FeatureBlock({ block, externalEmbedsEnabled = false }: FeatureBlockProps) {
  const image = hasRenderableImage(block.image) ? block.image : undefined
  const imageOnRight = block.imageSide === 'right'
  const layoutClassName = [
    styles.layout,
    image ? '' : styles.withoutImage,
    image && imageOnRight ? styles.imageRight : '',
  ].filter(Boolean).join(' ')

  return (
    <EditorialSection wide>
      <article className={layoutClassName}>
        <div className={styles.content}>
          {block.heading?.trim() && <h2 className={styles.heading}>{block.heading.trim()}</h2>}
          {block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
        </div>
        {image && (
          <div className={styles.image}>
            <ResponsiveMedia
              media={image}
              sizes="(min-width: 1600px) 640px, (min-width: 960px) 41.67vw, 100vw"
            />
          </div>
        )}
      </article>
    </EditorialSection>
  )
}
