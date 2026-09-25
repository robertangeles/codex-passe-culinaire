import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Hero, Media } from '../src/payload-types'
import { HeroBlock, heroImageForDate, seasonInMelbourne } from '../src/components/blocks/HeroBlock'

const summerImage = {
  id: 1,
  alt: 'Summer prep on a kitchen bench',
  filename: 'summer.avif',
  width: 1600,
  height: 1000,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} satisfies Media

const autumnImage = { ...summerImage, id: 2, filename: 'autumn.avif', alt: 'Autumn vegetables on a bench' } satisfies Media
const winterImage = { ...summerImage, id: 3, filename: 'winter.avif', alt: 'Winter kitchen work' } satisfies Media
const springImage = { ...summerImage, id: 4, filename: 'spring.avif', alt: 'Spring produce in a kitchen' } satisfies Media

const homeBlock = {
  blockType: 'hero',
  heading: 'passe culinaire',
  eyebrow: 'Melbourne, Australia',
  summary: 'A company built by chefs in Melbourne.',
  style: 'quiet',
  seasonalImages: [
    { season: 'summer', image: summerImage },
    { season: 'autumn', image: autumnImage },
    { season: 'winter', image: winterImage },
    { season: 'spring', image: springImage },
  ],
} satisfies Hero

describe('HeroBlock', () => {
  it('renders a single requested heading level and the home product link', () => {
    const html = renderToStaticMarkup(<HeroBlock block={homeBlock} headingLevel={1} home />)

    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).not.toMatch(/<h[2-6]\b/)
    expect(html).toContain('<h1')
    expect(html).toContain('passe culinaire</h1>')
    expect(html).toContain('Melbourne, Australia')
    expect(html).toContain('A company built by chefs in Melbourne.')
    expect(html).toContain('href="/culinaire-kitchen">Explore CulinAIre Kitchen</a>')
    expect(html).not.toContain('<img')
  })

  it('uses a section heading by default on non-home content', () => {
    const html = renderToStaticMarkup(<HeroBlock block={homeBlock} />)

    expect(html.match(/<h2\b/g)).toHaveLength(1)
    expect(html).not.toMatch(/<h[1,3-6]\b/)
    expect(html).not.toContain('Explore CulinAIre Kitchen')
  })

  it('maps Melbourne seasons around month boundaries using Melbourne local time', () => {
    expect(seasonInMelbourne(new Date('2026-02-28T12:59:00.000Z'))).toBe('summer')
    expect(seasonInMelbourne(new Date('2026-02-28T13:01:00.000Z'))).toBe('autumn')
    expect(seasonInMelbourne(new Date('2026-05-31T14:00:00.000Z'))).toBe('winter')
    expect(seasonInMelbourne(new Date('2026-08-31T14:00:00.000Z'))).toBe('spring')
    expect(seasonInMelbourne(new Date('2026-11-30T13:00:00.000Z'))).toBe('summer')
    expect(seasonInMelbourne(new Date(Number.NaN))).toBeNull()
  })

  it('selects the matching populated seasonal image and falls back to the ordinary image', () => {
    const dateAtMelbourneAutumn = new Date('2026-03-01T00:00:00.000Z')
    expect(heroImageForDate(homeBlock, dateAtMelbourneAutumn)).toBe(autumnImage)

    const missingSeason = {
      ...homeBlock,
      seasonalImages: [{ season: 'autumn', image: 42 }],
      image: winterImage,
    } satisfies Hero
    expect(heroImageForDate(missingSeason, dateAtMelbourneAutumn)).toBe(winterImage)

    const unpopulatedSeason = {
      ...homeBlock,
      seasonalImages: [{ season: 'autumn', image: 42 }],
    } satisfies Hero
    expect(heroImageForDate(unpopulatedSeason, dateAtMelbourneAutumn)).toBeUndefined()
  })

  it('renders a large image separately from readable text and lets the shared component own its caption', () => {
    const imageBlock = {
      ...homeBlock,
      style: 'image',
      image: winterImage,
      seasonalImages: null,
    } satisfies Hero
    const html = renderToStaticMarkup(<HeroBlock block={imageBlock} home />)

    expect(html).toContain('<picture>')
    expect(html).toContain('src="/media/winter.avif"')
    expect(html).toContain('loading="eager"')
    expect(html).toContain('Explore CulinAIre Kitchen')
    expect(html.match(/<h2\b/g)).toHaveLength(1)

    const leadHero = renderToStaticMarkup(<HeroBlock block={imageBlock} headingLevel={1} />)
    expect(leadHero).toContain('loading="eager"')
    expect(leadHero).toContain('fetchPriority="high"')

    const laterHero = renderToStaticMarkup(<HeroBlock block={imageBlock} headingLevel={2} />)
    expect(laterHero).toContain('loading="lazy"')
    expect(laterHero).not.toContain('fetchPriority="high"')
  })
})
