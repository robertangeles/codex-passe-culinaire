import type { Gallery, Media } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import { ResponsiveMedia } from '../ResponsiveMedia'
import styles from './GalleryBlock.module.css'

type GalleryBlockProps = {
  block: Gallery
}

type GalleryImage = NonNullable<Gallery['images']>[number]

function hasRenderableMedia(image: GalleryImage['image']): image is Media {
  if (!image || typeof image !== 'object' || typeof image.id !== 'number' || !Number.isFinite(image.id)) return false
  if (
    typeof image.filename !== 'string'
    || image.filename.length === 0
    || image.filename === '.'
    || image.filename === '..'
    || new TextEncoder().encode(image.filename).length > 255
    || /[/\\\x00-\x1f\x7f-\x9f]/u.test(image.filename)
    || typeof image.width !== 'number'
    || !Number.isFinite(image.width)
    || image.width <= 0
    || typeof image.height !== 'number'
    || !Number.isFinite(image.height)
    || image.height <= 0
    || typeof image.alt !== 'string'
  ) return false

  return true
}

export function GalleryBlock({ block }: GalleryBlockProps) {
  const images = (block.images ?? [])
    .slice(0, 12)
    .filter((item): item is GalleryImage & { image: Media } => Boolean(item && hasRenderableMedia(item.image)))

  if (images.length === 0) return null

  return (
    <EditorialSection wide>
      <ul className={styles.gallery} aria-label="Gallery">
        {images.map((item) => (
          <li className={styles.item} key={item.id ?? item.image.id}>
            <ResponsiveMedia
              media={item.image}
              caption={item.caption}
              sizes="(min-width: 1600px) 760px, (min-width: 700px) 48vw, 100vw"
            />
          </li>
        ))}
      </ul>
    </EditorialSection>
  )
}
