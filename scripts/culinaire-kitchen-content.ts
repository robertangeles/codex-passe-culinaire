import { isDeepStrictEqual } from 'node:util'
import type { Page, Post } from '../src/payload-types'
import { layoutsMatch } from './homepage-content'

type KitchenLayout = Page['layout']
type KitchenPageSnapshot = Pick<Page, 'id' | 'updatedAt' | '_status' | 'layout'>
type TextNode = { type: 'text'; version: 1; text: string; format: number; detail: number; mode: 'normal'; style: string }
type LinkNode = { type: 'link'; version: 1; fields: { linkType: 'custom'; url: string; newTab: false }; children: TextNode[] }
type ParagraphNode = { type: 'paragraph'; version: 1; direction: 'ltr'; format: ''; indent: 0; children: Array<TextNode | LinkNode> }
type RichNode = TextNode | LinkNode | ParagraphNode | { type: 'heading'; tag: 'h2' | 'h3'; version: 1; direction: 'ltr'; format: ''; indent: 0; children: TextNode[] }

const text = (value: string, format = 0): TextNode => ({ type: 'text', version: 1, text: value, format, detail: 0, mode: 'normal', style: '' })
const paragraph = (...children: Array<TextNode | LinkNode>) => ({ type: 'paragraph' as const, version: 1 as const, direction: 'ltr' as const, format: '' as const, indent: 0 as const, children })
const heading = (value: string, tag: 'h2' | 'h3' = 'h3'): RichNode => ({ type: 'heading', tag, version: 1, direction: 'ltr', format: '', indent: 0, children: [text(value)] })
const rich = (children: Array<ParagraphNode | RichNode>): NonNullable<Post['body']> => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
})
const linkedText = (label: string, url: string) => ({
  type: 'paragraph' as const, version: 1 as const, direction: 'ltr' as const, format: '' as const, indent: 0 as const,
  children: [{ type: 'link' as const, version: 1 as const, fields: { linkType: 'custom' as const, url, newTab: false as const }, children: [text(label)] }, text('  ')],
})

export function seededCulinaireKitchenLayout(): KitchenLayout {
  return [
    { blockType: 'hero', heading: 'CulinAIre Kitchen', style: 'quiet' },
    { blockType: 'prose', body: rich([paragraph(text("CulinAIre Kitchen uses AI to help organise a prep list from today's menu, including components used in more than one dish."))]) },
    { blockType: 'cta', statement: 'Explore the product', label: 'Visit CulinAIre Kitchen', url: 'https://www.culinaire.kitchen' },
  ]
}

export function approvedCulinaireKitchenLayout(layout: KitchenLayout = seededCulinaireKitchenLayout()): KitchenLayout {
  const hero = layout?.find((block) => block.blockType === 'hero')
  const cta = layout?.find((block) => block.blockType === 'cta')
  if (!hero || hero.blockType !== 'hero' || !cta || cta.blockType !== 'cta') {
    throw new Error('The original CulinAIre Kitchen layout is incomplete.')
  }

  return [
    { ...hero, blockName: 'Kitchen introduction', heading: 'Behind every service.', eyebrow: 'CulinAIre Kitchen · By Passe Culinaire', style: 'image', summary: 'The recipes, stock, preparation and people. A connected view of the kitchen, from the first plan to the final sales record.' },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen operation introduction', heading: 'A kitchen day,\nconsidered.', body: rich([paragraph(text('For chefs running service and owners keeping the whole business in view.'))]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen operation 1', heading: 'Plan the day.', body: rich([
      paragraph(text('Begin with the service ahead: what to prepare, who is working and what the team needs to know.')),
      paragraph(text('Forecasting & rostering: ', 1), text('Review expected covers, preparation priorities and section coverage.')),
      paragraph(text('Team messaging: ', 1), text('Keep the team’s preparation plan and conversations together.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen operation 2', heading: 'Know what comes in.', body: rich([
      paragraph(text('Follow the ingredients from the purchase order to the stockroom, then on to the section.')),
      paragraph(text('Purchasing & receiving: ', 1), text('Prepare orders, check deliveries and record what was accepted.')),
      paragraph(text('Inventory & stock transfers: ', 1), text('Keep stock, batches and movement between sections in view.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen operation 3', heading: 'Prepare for service.', body: rich([
      paragraph(text('Bring the plan to the bench. Keep preparation, production and menu costs connected.')),
      paragraph(text('Mise en Place & production: ', 1), text('Draw ingredients, organise the work and record completed batches.')),
      paragraph(text('Menu & costing: ', 1), text('Connect recipes and portions to the cost of the menu.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen operation 4', heading: 'Understand what went out.', body: rich([
      paragraph(text('Close the day with a record of what was used, lost and sold. Bring that view to the next service.')),
      paragraph(text('Waste Management: ', 1), text('Record losses and their reasons, separately from usable stock returned.')),
      paragraph(text('Sales: ', 1), text('Upload sales data and review what was planned, prepared and sold.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen labs', heading: 'Three disciplines.\nSpace to explore.', body: rich([
      paragraph(text('Recipe · Patisserie · Cocktail')),
      heading('Recipe Lab'), paragraph(text('Develop dishes around ingredients, portions and technique. Refine the recipe and review its cost.')),
      heading('Patisserie Lab'), paragraph(text('Work through pastry components, methods and make-ahead preparation.')),
      heading('Cocktail Lab'), paragraph(text('Explore spirit, flavour and style. Build a drink specification and a batch for service.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen example', heading: 'Two dishes.\nOne preparation.', body: rich([
      paragraph(text('Lemon tart and fruit tart share pâte sucrée. CulinAIre Kitchen uses AI to help organise the prep list around components used in more than one dish.')),
      paragraph(text('Lemon tart', 1), text(' · Pâte sucrée')),
      paragraph(text('Fruit tart', 1), text(' · Pâte sucrée')),
      paragraph(text('The chef reviews the quantities and the preparation plan.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen film', heading: 'Watch the day\ncome together.', body: rich([paragraph(text('From forecast and preparation to service, waste and sales.'))]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen founders', heading: 'Culinary practice.\nA technical perspective.', body: rich([
      heading('Alex Charasse'), paragraph(text('Maître Pâtissier and Maître Chocolatier. Founder of Almost French Patisserie.')),
      heading('Rob Angeles'), paragraph(text('Trained in pastry and hot kitchen. Data Architect.')),
    ]) },
    { blockType: 'feature', imageSide: 'left', blockName: 'Kitchen continuation', heading: 'See where it fits\nin your kitchen.', body: rich([
      paragraph(text('Explore CulinAIre Kitchen, or talk with us about the way your team works.')),
      linkedText('Visit CulinAIre Kitchen', 'https://www.culinaire.kitchen'),
      linkedText('Talk to us', '/contact'),
    ]) },
  ]
}

function isPublished(snapshot: KitchenPageSnapshot): boolean {
  return snapshot._status === 'published'
}

export type CulinaireKitchenUpdateResult = { changed: false } | { changed: true; layout: KitchenLayout }

export async function runGuardedCulinaireKitchenUpdate(options: {
  published: KitchenPageSnapshot | undefined
  latest: KitchenPageSnapshot | undefined
  backup: () => Promise<void>
  reread: () => Promise<KitchenPageSnapshot | undefined>
  update: (id: number, layout: KitchenLayout) => Promise<void>
}): Promise<CulinaireKitchenUpdateResult> {
  const { published, latest } = options
  if (!published || !isPublished(published)) throw new Error('No published CulinAIre Kitchen page is available.')
  if (!latest || latest.id !== published.id || !isPublished(latest) || latest.updatedAt !== published.updatedAt) {
    throw new Error('An unpublished CulinAIre Kitchen edit exists. Preserve it before applying this update.')
  }

  const approved = approvedCulinaireKitchenLayout()
  if (layoutsMatch(published.layout, approved)) return { changed: false }
  if (!layoutsMatch(published.layout, seededCulinaireKitchenLayout())) {
    throw new Error('The CulinAIre Kitchen page differs from its original seeded layout. Aborting to preserve editorial changes.')
  }

  const layout = approvedCulinaireKitchenLayout(published.layout)
  await options.backup()
  const fresh = await options.reread()
  if (!fresh || fresh.id !== published.id || !isPublished(fresh) || fresh.updatedAt !== published.updatedAt || !isDeepStrictEqual(fresh.layout, published.layout)) {
    throw new Error('The CulinAIre Kitchen page changed during backup. Aborting before the page update.')
  }
  await options.update(published.id, layout)
  return { changed: true, layout }
}
