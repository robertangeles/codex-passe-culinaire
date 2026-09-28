import sharp from 'sharp'
import { ensureHomepageImage, homepageLayout } from './homepage-content'
import { getPayload } from 'payload'
import type { Page, Post } from '../src/payload-types'

process.loadEnvFile('.env')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const required = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required to seed`)
  return value
}
const rich = (sentence: string): NonNullable<Post['body']> => ({
  root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
    children: [{ type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0,
      children: [{ type: 'text', version: 1, text: sentence, format: 0, detail: 0, mode: 'normal', style: '' }] }] },
})
const exists = async (collection: 'users' | 'media' | 'pages' | 'posts' | 'services' | 'events' | 'forms', field: string, value: string) =>
  (await payload.count({ collection, overrideAccess: true, where: { [field]: { equals: value } } })).totalDocs > 0

async function user(name: string, slug: string, email: string, password: string, title: string) {
  if (await exists('users', 'email', email)) return
  await payload.create({ collection: 'users', overrideAccess: true,
    context: { seedProvisioning: required('PAYLOAD_SECRET') },
    data: { name, slug, email, password, role: 'admin', publicProfile: true, publicTitle: title,
      publicBio: rich(slug === 'alex-charasse'
        ? 'Alex Charasse founded Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street in Melbourne. He is a Maître Pâtissier and Maître Chocolatier.'
        : 'Rob Angeles trained in pastry and hot kitchen. He is a Data Architect.') } })
}
await user('Rob Angeles', 'rob-angeles', required('ROB_ADMIN_EMAIL'), required('ROB_ADMIN_PASSWORD'), 'CTO')
await user('Alex Charasse', 'alex-charasse', required('ALEX_ADMIN_EMAIL'), required('ALEX_ADMIN_PASSWORD'), 'CEO')

const panels = [
  'Kitchen work', 'Pastry work', 'Menu planning', 'Ingredients', 'Service preparation', 'Recipe notes',
  'Training', 'Workshop', 'Journal', 'Founder portrait', 'Product overview', 'Contact',
]
for (let index = 0; index < panels.length; index += 1) {
  const number = String(index + 1).padStart(2, '0')
  const filename = `placeholder-${number}.webp`
  if (await exists('media', 'filename', filename)) continue
  const label = `PLACEHOLDER ${number}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#F4F1EA"/><rect x="24" y="24" width="592" height="352" fill="none" stroke="#8A8A82"/><text x="48" y="210" font-family="sans-serif" font-size="28" fill="#1A1A18">${label}</text></svg>`
  const data = await sharp(Buffer.from(svg)).webp().toBuffer()
  await payload.create({ collection: 'media', overrideAccess: true,
    data: { alt: `Bone-coloured placeholder panel ${number} labelled ${label}.`, caption: `${panels[index]} image to come.`, placeholder: true },
    file: { data, mimetype: 'image/webp', name: filename, size: data.length },
  })
}
const media = await payload.find({ collection: 'media', overrideAccess: true, limit: 20, sort: 'filename' })
const image = (index: number) => media.docs.find((doc) => doc.filename === `placeholder-${String(index).padStart(2, '0')}.webp`)?.id
const rob = (await payload.find({ collection: 'users', overrideAccess: true, where: { slug: { equals: 'rob-angeles' } }, limit: 1 })).docs[0]
const alex = (await payload.find({ collection: 'users', overrideAccess: true, where: { slug: { equals: 'alex-charasse' } }, limit: 1 })).docs[0]

if (!(await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })).name) await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: {
  name: 'Passe Culinaire', tagline: 'Chefs working with chefs',
  description: 'Passe Culinaire is a Melbourne company founded by two chefs. CulinAIre Kitchen is its first product.',
  organisation: { legalName: 'PASSE CULINAIRE PTY LTD', city: 'Melbourne', region: 'Victoria', country: 'Australia', founders: [alex.id, rob.id], knowsAbout: [
    { topic: 'culinary AI' }, { topic: 'restaurant operations' }, { topic: 'pastry' }, { topic: 'recipe costing' }, { topic: 'kitchen training' },
  ] }, analyticsEnabled: false, robotsTxtExtra: '', defaultSitemap: { priority: '0.5', changeFrequency: 'monthly' },
} })
if (!(await payload.findGlobal({ slug: 'header', overrideAccess: true })).createdAt) await payload.updateGlobal({ slug: 'header', overrideAccess: true, data: { navItems: [
  ['Services', '/services'], ['Training', '/training'], ['CulinAIre Kitchen', '/culinaire-kitchen'],
  ['Journal', '/journal'], ['About', '/about'], ['Contact', '/contact'],
].map(([label, url]) => ({ label, url })) } })
if (!(await payload.findGlobal({ slug: 'footer', overrideAccess: true })).createdAt) await payload.updateGlobal({ slug: 'footer', overrideAccess: true, data: {
  columns: [{ heading: 'Explore', links: [{ label: 'Services', url: '/services' }, { label: 'Training', url: '/training' }, { label: 'Journal', url: '/journal' }] },
    { heading: 'Company', links: [{ label: 'About', url: '/about' }, { label: 'Contact', url: '/contact' }] }],
  legalText: 'PASSE CULINAIRE PTY LTD\nPostal address: Unit 27, 29 Little Collins St\nMelbourne VIC 3000, Australia.', abn: '23 700 551 800',
} })
if (!(await exists('forms', 'key', 'contact'))) await payload.create({ collection: 'forms', overrideAccess: true,
  data: { key: 'contact', title: 'Contact', enabled: true, description: 'Send a note to the team.' } })

const heroImage = await ensureHomepageImage(payload)
const pages = [
  { slug: 'home', title: 'Passe Culinaire', description: 'Passe Culinaire is a Melbourne company founded by two chefs. Explore CulinAIre Kitchen and our work.', layout: homepageLayout(heroImage.id) },
  { slug: 'about', title: 'About Passe Culinaire', description: 'Meet chefs Alex Charasse and Rob Angeles, the founders of Passe Culinaire in Melbourne.', layout: [
    { blockType: 'hero', heading: 'About', style: 'quiet' },
    { blockType: 'prose', body: rich('Passe Culinaire is based in Melbourne. Alex Charasse and Rob Angeles are its founders.') },
    { blockType: 'founderCard', name: 'Alex Charasse', title: 'CEO', portrait: image(10), bio: rich('Alex Charasse founded Almost French Patisserie in Richmond and Almost French Epicure on Little Collins Street in Melbourne. He is a Maître Pâtissier and Maître Chocolatier.') },
    { blockType: 'founderCard', name: 'Rob Angeles', title: 'CTO', portrait: image(10), bio: rich('Rob Angeles trained in pastry and hot kitchen. He is a Data Architect.') },
  ] },
  { slug: 'culinaire-kitchen', title: 'CulinAIre Kitchen', description: 'CulinAIre Kitchen helps kitchen teams organise prep lists from the daily menu.', layout: [
    { blockType: 'hero', heading: 'CulinAIre Kitchen', style: 'quiet' },
    { blockType: 'prose', body: rich("CulinAIre Kitchen uses AI to help organise a prep list from today's menu, including components used in more than one dish.") },
    { blockType: 'cta', statement: 'Explore the product', label: 'Visit CulinAIre Kitchen', url: 'https://www.culinaire.kitchen' },
  ] },
  { slug: 'contact', title: 'Contact', description: 'Send a note to Passe Culinaire about kitchens, training, advisory or CulinAIre Kitchen.', layout: [
    { blockType: 'hero', heading: 'Contact', style: 'quiet' },
    { blockType: 'prose', body: rich('Tell us what you need. The contact form appears below.') },
  ] },
] as const
for (const page of pages) {
  if (await exists('pages', 'slug', page.slug)) continue
  await payload.create({ collection: 'pages', overrideAccess: true, data: {
    title: page.title, slug: page.slug, layout: page.layout as unknown as Page['layout'],
    seo: { metaDescription: page.description, sitemapPriority: page.slug === 'home' ? '1.0' : '0.7' }, _status: 'published', publishedAt: new Date().toISOString(),
  } })
}

const serviceSeeds = [
  ['ai-for-the-pass', 'AI for the pass', 'Kitchen team workshop', 'For kitchen teams.'],
  ['ai-for-the-office', 'AI for the office', 'Owner and manager training', 'For owners and managers.'],
  ['advisory', 'Advisory', 'Restaurant group advisory', 'For restaurant groups.'],
] as const
for (const [slug, title, oneLiner, whoItIsFor] of serviceSeeds) {
  if (await exists('services', 'slug', slug)) continue
  await payload.create({ collection: 'services', overrideAccess: true, draft: true,
    data: { slug, title, oneLiner, whoItIsFor, whatYouGet: rich('[TO CONFIRM]'),
      heroImage: image(5), seo: { metaDescription: `${title}. Details to confirm with the founders.` }, _status: 'draft' } })
}
const now = Date.now()
for (const [slug, title, type, days] of [
  ['kitchen-workshop', 'Kitchen workshop', 'workshop', 60],
  ['online-course', 'Online course', 'course', 90],
] as const) {
  if (await exists('events', 'slug', slug)) continue
  await payload.create({ collection: 'events', overrideAccess: true, draft: true,
    data: { slug, title, type, eventStatus: 'upcoming', startDate: new Date(now + days * 86400000).toISOString(),
      endDate: new Date(now + days * 86400000 + 7200000).toISOString(), timezone: 'Australia/Melbourne',
      description: rich('[TO CONFIRM]'), descriptionSummary: 'Details to confirm with the founders.',
      venue: { online: type === 'course', name: type === 'course' ? 'Online' : '[TO CONFIRM]' },
      heroImage: image(8), seo: { metaDescription: `${title}. Details to confirm with the founders.` }, _status: 'draft' } })
}
for (const [slug, title, excerpt] of [
  ['pastry-notes', 'Pastry notes', 'A draft note about pastry work.'],
  ['data-notes', 'Data notes', 'A draft note about kitchen data.'],
  ['software-for-kitchens', 'Software for kitchens', 'A draft note about building software for kitchens.'],
] as const) {
  if (await exists('posts', 'slug', slug)) continue
  await payload.create({ collection: 'posts', overrideAccess: true, draft: true,
    data: { slug, title, excerpt, body: rich('[TO CONFIRM]'), authors: [rob.id, alex.id], heroImage: image(9),
      seo: { metaDescription: excerpt }, _status: 'draft' } })
}
console.log('Seed complete: two admins, twelve placeholders, one concept image, four pages, three draft services, two draft training events, three draft journal entries.')
await payload.destroy()
process.exit(0)
