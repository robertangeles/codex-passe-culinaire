import type { CSSProperties } from 'react'
import type { Media } from '../payload-types'
import styles from './ResponsiveMedia.module.css'

type ResponsiveMediaProps = {
  media: Media | number | null | undefined
  priority?: boolean
  sizes?: string
  caption?: string | null
  className?: string
}

const variantWidths = [480, 960, 1440, 2400] as const
const defaultSizes = '(min-width: 960px) 80vw, 100vw'

function isSafeFilename(filename: string): boolean {
  return filename.length > 0
    && filename !== '.'
    && filename !== '..'
    && new TextEncoder().encode(filename).length <= 255
    && !/[/\\\x00-\x1f\x7f-\x9f]/u.test(filename)
}

function isPositiveDimension(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function mediaUrl(filename: string): string {
  return `/media/${encodeURIComponent(filename)}`
}

export function isRenderableMedia(media: Media | number | null | undefined): media is Media & { filename: string; width: number; height: number; alt: string } {
  return typeof media === 'object' && media !== null
    && typeof media.filename === 'string' && isSafeFilename(media.filename)
    && isPositiveDimension(media.width) && isPositiveDimension(media.height)
    && typeof media.alt === 'string'
}

export function ResponsiveMedia({
  media,
  priority = false,
  sizes = defaultSizes,
  caption,
  className,
}: ResponsiveMediaProps) {
  if (!isRenderableMedia(media)) return null

  const { filename, width, height, alt, sizes: variants } = media

  const avif = variantWidths.flatMap((variantWidth) => {
    const variant = variants?.[`avif${variantWidth}`]
    if (!variant || typeof variant.filename !== 'string' || !isSafeFilename(variant.filename) || !isPositiveDimension(variant.width)) return []
    return [`${mediaUrl(variant.filename)} ${variant.width}w`]
  })
  const webp = variantWidths.flatMap((variantWidth) => {
    const variant = variants?.[`webp${variantWidth}`]
    if (!variant || typeof variant.filename !== 'string' || !isSafeFilename(variant.filename) || !isPositiveDimension(variant.width)) return []
    return [`${mediaUrl(variant.filename)} ${variant.width}w`]
  })

  const focalX = typeof media.focalX === 'number' && Number.isFinite(media.focalX)
    ? Math.min(100, Math.max(0, media.focalX))
    : 50
  const focalY = typeof media.focalY === 'number' && Number.isFinite(media.focalY)
    ? Math.min(100, Math.max(0, media.focalY))
    : 50
  const figureClass = [styles.figure, className].filter(Boolean).join(' ')
  const imageStyle = { objectPosition: `${focalX}% ${focalY}%` } satisfies CSSProperties
  const resolvedCaption = caption !== undefined && caption !== null
    ? caption.trim()
    : media.caption?.trim() || ''
  const credit = media.credit?.trim() || ''

  return (
    <figure className={figureClass}>
      <picture>
        {avif.length > 0 && <source type="image/avif" srcSet={avif.join(', ')} sizes={sizes} />}
        {webp.length > 0 && <source type="image/webp" srcSet={webp.join(', ')} sizes={sizes} />}
        <img
          src={mediaUrl(filename)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          style={imageStyle}
        />
      </picture>
      {(resolvedCaption || credit) && (
        <figcaption className={styles.caption}>
          {resolvedCaption && <span>{resolvedCaption}</span>}
          {credit && <span>Credit: {credit}</span>}
        </figcaption>
      )}
    </figure>
  )
}
