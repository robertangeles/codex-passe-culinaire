import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Gallery, Media } from '../src/payload-types'
import { GalleryBlock } from '../src/components/blocks/GalleryBlock'

const firstImage = {
  id: 11,
  alt: 'Pastry being finished at the bench',
  caption: 'Asset caption',
  credit: 'Kitchen archive',
  filename: 'first image.avif',
  width: 1600,
  height: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  sizes: { webp480: { filename: 'first-480.webp', width: 480 } },
} satisfies Media

const secondImage = {
  ...firstImage,
  id: 12,
  filename: 'second.avif',
  alt: 'A plated dessert',
} satisfies Media

describe('GalleryBlock', () => {
  it('renders populated media in source order with gallery captions and shared credits', () => {
    const block = {
      blockType: 'gallery',
      images: [
        { id: 'gallery-1', image: firstImage, caption: 'First image caption' },
        { id: 'gallery-2', image: secondImage, caption: 'Second image caption' },
      ],
    } satisfies Gallery
    const html = renderToStaticMarkup(<GalleryBlock block={block} />)

    expect(html.indexOf('/media/first%20image.avif')).toBeLessThan(html.indexOf('/media/second.avif'))
    expect(html).toContain('First image caption')
    expect(html).toContain('Second image caption')
    expect(html).toContain('Credit: Kitchen archive')
    expect(html).not.toContain('Asset caption')
    expect(html).toContain('<ul')
    expect(html.match(/<figure\b/g)).toHaveLength(2)
    expect(html).toContain('sizes="(min-width: 1600px) 760px, (min-width: 700px) 48vw, 100vw"')
  })

  it('omits unresolved or malformed media without empty tiles', () => {
    const imageWithoutNumericId = {
      ...firstImage,
      id: undefined,
    } as unknown as Media
    const block = {
      blockType: 'gallery',
      images: [
        { image: 37 },
        { image: imageWithoutNumericId },
        { image: null },
        { image: secondImage },
      ],
    } satisfies Gallery
    const html = renderToStaticMarkup(<GalleryBlock block={block} />)

    expect(html.match(/<figure\b/g)).toHaveLength(1)
    expect(html).toContain('/media/second.avif')
    expect(html.match(/<li\b/g)).toHaveLength(1)
  })

  it('renders nothing when no populated images remain', () => {
    const block = {
      blockType: 'gallery',
      images: [{ image: 37 }, { image: null }],
    } satisfies Gallery

    expect(renderToStaticMarkup(<GalleryBlock block={block} />)).toBe('')
  })
})
