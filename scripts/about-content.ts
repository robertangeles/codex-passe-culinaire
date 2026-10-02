import { isDeepStrictEqual } from 'node:util'
import type { Page, Post } from '../src/payload-types'
import { layoutsMatch } from './homepage-content'

type AboutLayout = Page['layout']
type Founder = Extract<NonNullable<AboutLayout>[number], { blockType: 'founderCard' }>
type AboutPageSnapshot = Pick<Page, 'id' | 'updatedAt' | '_status' | 'layout'>

const rich = (paragraphs: string[]): NonNullable<Post['body']> => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: paragraphs.map((text) => ({ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] })) },
})

function closingBody(): NonNullable<Post['body']> {
  return {
    root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [
        { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [{ type: 'text', version: 1, text: 'CulinAIre Kitchen is our first offer. Passe Culinaire’s wider scope includes training, advisory and publishing.', format: 0, detail: 0, mode: 'normal', style: '' }] },
        { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [
            { type: 'link', version: 1, fields: { linkType: 'custom', url: '/culinaire-kitchen', newTab: false }, children: [{ type: 'text', version: 1, text: 'Explore CulinAIre Kitchen', format: 0, detail: 0, mode: 'normal', style: '' }] },
            { type: 'text', version: 1, text: '  ', format: 0, detail: 0, mode: 'normal', style: '' },
            { type: 'link', version: 1, fields: { linkType: 'custom', url: '/contact', newTab: false }, children: [{ type: 'text', version: 1, text: 'Start a conversation', format: 0, detail: 0, mode: 'normal', style: '' }] },
          ] },
      ] },
  }
}

function headingRich(text: string): NonNullable<Post['body']> {
  return { root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{ type: 'heading', tag: 'h2', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
  }
}

export function seededAboutLayout(): AboutLayout {
  return [
    { blockType: 'hero', heading: 'About', style: 'quiet' },
    { blockType: 'prose', body: rich(['Passe Culinaire is based in Melbourne. Alex Charasse and Rob Angeles are its founders.']) },
    { blockType: 'founderCard', name: 'Alex Charasse', title: 'CEO', portrait: 10,
      bio: rich(['Alex Charasse founded Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street in Melbourne. He is a Maître Pâtissier and Maître Chocolatier.']) },
    { blockType: 'founderCard', name: 'Rob Angeles', title: 'CTO', portrait: 10,
      bio: rich(['Rob Angeles trained in pastry and hot kitchen. He is a Data Architect.']) },
  ]
}

function approvedFounder(founder: Founder, index: number): Founder {
  const alex = index === 0
  return {
    ...founder,
    title: alex ? 'Co-founder · CEO' : 'Co-founder · CTO',
    bio: rich(alex
      ? ['Maître Pâtissier · Maître Chocolatier', 'Alex founded Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street, Melbourne.']
      : ['Chef · Data Architect', 'Rob trained in pastry and hot kitchen. His work as a Data Architect brings another perspective to the company’s culinary practice.']),
  }
}

export function approvedAboutLayout(layout: AboutLayout): AboutLayout {
  const foundersSeen = { count: 0 }
  const transformed = (layout ?? []).map((block, index) => {
    if (index === 0 && block.blockType === 'hero') {
      return { ...block, heading: 'From the kitchen,\nlooking forward.', eyebrow: 'About Passe Culinaire', summary: 'Passe Culinaire is a Melbourne company founded by two chefs, bringing culinary practice and data architecture together.' }
    }
    if (index === 1 && block.blockType === 'prose') {
      return { ...block, blockName: 'About founders', body: headingRich('Two founders. Complementary experience.') }
    }
    if (block.blockType === 'founderCard') {
      const founder = approvedFounder(block, foundersSeen.count)
      foundersSeen.count += 1
      return founder
    }
    return block
  })

  const closing = transformed.find((block) => block.blockType === 'feature' && block.blockName === 'About continuation')
  if (closing?.blockType === 'feature') return transformed
  return [...transformed, { blockType: 'feature', blockName: 'About continuation', imageSide: 'left', heading: 'Experience,\nput to work.', body: closingBody() }]
}

function isPublished(snapshot: AboutPageSnapshot): boolean {
  return snapshot._status === 'published'
}

export type AboutUpdateResult = { changed: false } | { changed: true; layout: AboutLayout }

export async function runGuardedAboutUpdate(options: {
  published: AboutPageSnapshot | undefined
  latest: AboutPageSnapshot | undefined
  getMedia: (id: number) => Promise<{ id: number; placeholder?: boolean | null } | undefined>
  backup: () => Promise<void>
  reread: () => Promise<AboutPageSnapshot | undefined>
  update: (id: number, layout: AboutLayout) => Promise<void>
}): Promise<AboutUpdateResult> {
  const { published, latest } = options
  if (!published || !isPublished(published)) throw new Error('No published About page is available.')
  if (!latest || latest.id !== published.id || !isPublished(latest) || latest.updatedAt !== published.updatedAt) {
    throw new Error('An unpublished About page edit exists. Preserve it before applying this update.')
  }

  const approved = approvedAboutLayout(seededAboutLayout())
  if (layoutsMatch(published.layout, approved)) return { changed: false }
  if (!layoutsMatch(published.layout, seededAboutLayout())) {
    throw new Error('The About page differs from its original seeded layout. Aborting to preserve editorial changes.')
  }

  const founders = published.layout?.filter((block): block is Founder => block.blockType === 'founderCard') ?? []
  for (const founder of founders) {
    const portrait = founder.portrait
    if (portrait == null) continue
    const id = typeof portrait === 'number' ? portrait : portrait.id
    const media = await options.getMedia(id)
    if (!media || media.placeholder !== true) {
      throw new Error('A founder portrait is real or unresolved. Preserve it before applying this update.')
    }
  }

  const layout = approvedAboutLayout(published.layout)
  await options.backup()
  const fresh = await options.reread()
  if (!fresh || fresh.id !== published.id || !isPublished(fresh) || fresh.updatedAt !== published.updatedAt || !isDeepStrictEqual(fresh.layout, published.layout)) {
    throw new Error('The About page changed during backup. Aborting before the page update.')
  }
  await options.update(published.id, layout)
  return { changed: true, layout }
}

