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
          children: [{ type: 'text', version: 1, text: 'CulinAIre Kitchen is our first offer: a connected view of the work behind service, from recipes and prep to stock, people and sales.', format: 0, detail: 0, mode: 'normal', style: '' }] },
        { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [{ type: 'text', version: 1, text: 'From there, our plans extend to training, advisory and publishing. If you run a kitchen, tell us what still gets lost between your tools and your team.', format: 0, detail: 0, mode: 'normal', style: '' }] },
        { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [
            { type: 'link', version: 1, fields: { linkType: 'custom', url: '/culinaire-kitchen', newTab: false }, children: [{ type: 'text', version: 1, text: 'Explore CulinAIre Kitchen', format: 0, detail: 0, mode: 'normal', style: '' }] },
            { type: 'text', version: 1, text: '  ', format: 0, detail: 0, mode: 'normal', style: '' },
            { type: 'link', version: 1, fields: { linkType: 'custom', url: '/contact', newTab: false }, children: [{ type: 'text', version: 1, text: 'Tell us about your kitchen', format: 0, detail: 0, mode: 'normal', style: '' }] },
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
      ? [
          'Maître Pâtissier · Maître Chocolatier',
          'Alex trained in pastry and chocolate in France before moving to Melbourne in 2009. Here he led the pastry kitchen at Vue de Monde, worked on afternoon tea at The Windsor and helped shape dessert menus at Grossi Florentino and the NGV Tea Room.',
          'In 2019 he opened Almost French Patisserie in Richmond. Almost French Epicure, the bakery and wine bar on Little Collins Street, followed. At Passe Culinaire, Alex brings the experience of leading pastry teams and running food businesses of his own.',
        ]
      : [
          'Chef · Pâtissier · Data Architect',
          'Rob learned to cook in Pampanga beside his mother and grandmother. After three decades in consulting, he returned to culinary school in 2024 and graduated in 2026, training in pastry and hot kitchen. He also founded Comfort Spoon Co., a Melbourne food business rooted in Filipino cooking.',
          'Rob builds the technology behind Passe Culinaire and CulinAIre Kitchen. His work connects the information a kitchen depends on, from recipes and shared components to prep and stock. He brings both kitchen training and data architecture to the decisions behind the product.',
        ]),
    links: [],
  }
}

export function approvedAboutLayout(layout: AboutLayout): AboutLayout {
  const foundersSeen = { count: 0 }
  const transformed = (layout ?? []).map((block, index) => {
    if (index === 0 && block.blockType === 'hero') {
      return { ...block, heading: 'From the kitchen,\nlooking forward.', eyebrow: 'About Passe Culinaire', summary: 'Kitchens run on knowledge passed from one chef to another. They also run on daily decisions: what to prep, what to order, who is on, and what is selling. Too often, those answers sit in separate tools. Passe Culinaire is building one place to bring the work together, with chefs’ knowledge at its centre. We want to be the technology partner chefs and restaurant owners can turn to across the whole operation.' }
    }
    if (index === 1 && block.blockType === 'prose') {
      return { ...block, blockName: 'About founders', body: headingRich('The founders and their work.') }
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
  return [...transformed, { blockType: 'feature', blockName: 'About continuation', imageSide: 'left', heading: 'Beyond\nthe recipe.', body: closingBody() }]
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

