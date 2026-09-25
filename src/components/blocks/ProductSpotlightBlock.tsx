import type { Media, ProductSpotlight } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import { ResponsiveMedia } from '../ResponsiveMedia'
import { RichText } from '../RichText'
import styles from './ProductSpotlightBlock.module.css'

type ProductSpotlightBlockProps = {
  block: ProductSpotlight
  externalEmbedsEnabled?: boolean
}

function populatedImage(value: ProductSpotlight['image']): Media | undefined {
  if (!value || typeof value !== 'object') return undefined
  const filename = value.filename
  const width = value.width
  const height = value.height
  if (
    typeof filename !== 'string'
    || filename.length === 0
    || filename === '.'
    || filename === '..'
    || new TextEncoder().encode(filename).length > 255
    || /[/\\\x00-\x1f\x7f-\x9f]/u.test(filename)
    || typeof width !== 'number'
    || !Number.isFinite(width)
    || width <= 0
    || typeof height !== 'number'
    || !Number.isFinite(height)
    || height <= 0
    || typeof value.alt !== 'string'
  ) return undefined
  return value
}

export function ProductSpotlightBlock({ block, externalEmbedsEnabled = false }: ProductSpotlightBlockProps) {
  const image = populatedImage(block.image)
  const heading = block.heading?.trim()
  const webUrl = safePublicHref(block.webUrl)
  const appStoreUrl = safePublicHref(block.appStoreUrl)

  return (
    <EditorialSection wide>
      <div className={`${styles.spotlight}${image ? ` ${styles.withImage}` : ''}`}>
        <div className={styles.copy}>
          {heading && <h2 className={styles.heading}>{heading}</h2>}
          {block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
          {(webUrl || appStoreUrl) && (
            <nav className={styles.links} aria-label="CulinAIre Kitchen links">
              {webUrl && <a className={styles.link} href={webUrl}>Visit CulinAIre Kitchen</a>}
              {appStoreUrl && <a className={styles.link} href={appStoreUrl}>View on the App Store</a>}
            </nav>
          )}
        </div>
        {image && (
          <div className={styles.media}>
            <ResponsiveMedia media={image} sizes="(min-width: 960px) 33vw, 100vw" />
          </div>
        )}
      </div>
    </EditorialSection>
  )
}
