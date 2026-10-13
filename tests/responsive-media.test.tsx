import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Media } from '../src/payload-types'
import { ResponsiveMedia } from '../src/components/ResponsiveMedia'

const mediaFixture = {
  id: 42,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  alt: 'A pastry on a workbench',
  filename: 'original pastry.webp',
  width: 1800,
  height: 1200,
  focalX: 120,
  focalY: -4,
  caption: 'Morning prep',
  credit: 'Alex',
  sizes: {
    avif480: { filename: 'pastry-480.avif', width: 480 },
    avif960: { filename: 'pastry-960.avif', width: 960 },
    webp480: { filename: 'pastry-480.webp', width: 480 },
    webp1440: { filename: 'pastry-1440.webp', width: 1440 },
  },
} satisfies Media

describe('ResponsiveMedia', () => {
  it('renders only stored variants with safe encoded URLs and reserves the original dimensions', () => {
    const html = renderToStaticMarkup(<ResponsiveMedia media={mediaFixture} />)

    expect(html).toContain('type="image/avif"')
    expect(html).toContain('/media/pastry-480.avif 480w, /media/pastry-960.avif 960w')
    expect(html).toContain('/media/pastry-480.webp 480w, /media/pastry-1440.webp 1440w')
    expect(html).toContain('sizes="(min-width: 960px) 80vw, 100vw"')
    expect(html).toContain('src="/media/original%20pastry.webp"')
    expect(html).toContain('width="1800"')
    expect(html).toContain('height="1200"')
    expect(html).not.toContain('https://')
    expect(html).toContain('object-position:100% 0%')
  })

  it('omits unpopulated IDs and unsafe or incomplete media without emitting a numeric ID', () => {
    expect(renderToStaticMarkup(<ResponsiveMedia media={42} />)).toBe('')
    expect(renderToStaticMarkup(<ResponsiveMedia media={null} />)).toBe('')
    expect(renderToStaticMarkup(<ResponsiveMedia media={{ ...mediaFixture, filename: 'bad/name.webp' }} />)).toBe('')
    expect(renderToStaticMarkup(<ResponsiveMedia media={{ ...mediaFixture, filename: 'bad\\name.webp' }} />)).toBe('')
    expect(renderToStaticMarkup(<ResponsiveMedia media={{ ...mediaFixture, height: null }} />)).toBe('')
  })

  it('uses high eager priority only when requested and shows a caption override with credit', () => {
    const lazy = renderToStaticMarkup(<ResponsiveMedia media={mediaFixture} />)
    expect(lazy).toContain('loading="lazy"')
    expect(lazy).not.toContain('fetchPriority="high"')

    const priority = renderToStaticMarkup(
      <ResponsiveMedia media={mediaFixture} priority caption="Service, 7 am" />,
    )
    expect(priority).toContain('loading="eager"')
    expect(priority).toContain('fetchPriority="high"')
    expect(priority).toContain('Service, 7 am')
    expect(priority).toContain('Credit: Alex')
    expect(priority).not.toContain('Morning prep')

    const emptyOverride = renderToStaticMarkup(<ResponsiveMedia media={mediaFixture} caption="  " />)
    expect(emptyOverride).not.toContain('Morning prep')
    expect(emptyOverride).toContain('Credit: Alex')
  })
})
