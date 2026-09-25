import type { Block, Field } from 'payload'

const text = (name: string, required = false): Field => ({ name, type: 'text', required })
const image = (name: string): Field => ({ name, type: 'upload', relationTo: 'media' })
const link: Field[] = [text('label'), { name: 'url', type: 'text' }]
const rich = (name: string): Field => ({ name, type: 'richText' })

export const pageBlocks: Block[] = [
  { slug: 'hero', fields: [text('heading', true), text('eyebrow'), text('summary'), { name: 'style', type: 'select', defaultValue: 'quiet', options: ['quiet', 'image'] }, image('image'), { name: 'seasonalImages', type: 'array', maxRows: 4, fields: [{ name: 'season', type: 'select', required: true, options: ['summer', 'autumn', 'winter', 'spring'] }, image('image')] }] },
  { slug: 'prose', fields: [rich('body')] },
  { slug: 'feature', fields: [text('heading'), rich('body'), image('image'), { name: 'imageSide', type: 'select', defaultValue: 'left', options: ['left', 'right'] }] },
  { slug: 'gallery', fields: [{ name: 'images', type: 'array', minRows: 2, maxRows: 12, fields: [image('image'), text('caption')] }] },
  { slug: 'pullQuote', fields: [text('quote', true), text('attribution')] },
  { slug: 'founderCard', fields: [text('name', true), text('title'), image('portrait'), rich('bio'), { name: 'links', type: 'array', fields: link }] },
  { slug: 'productSpotlight', fields: [text('heading'), rich('body'), image('image'), { name: 'webUrl', type: 'text' }, { name: 'appStoreUrl', type: 'text' }] },
  { slug: 'journalFeed', fields: [text('heading'), { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 }] },
  { slug: 'faq', fields: [{ name: 'items', type: 'array', fields: [text('question', true), rich('answer')] }] },
  { slug: 'serviceList', fields: [text('heading'), { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true }] },
  { slug: 'upcomingEvents', fields: [text('heading'), { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 }] },
  { slug: 'testimonial', fields: [{ name: 'testimonial', type: 'relationship', relationTo: 'testimonials' }] },
  { slug: 'plainStatement', fields: [text('statement', true)] },
  { slug: 'cta', fields: [text('statement', true), ...link] },
  { slug: 'spacer', fields: [{ name: 'size', type: 'select', defaultValue: 'medium', options: ['small', 'medium', 'large'] }] },
]

export const lexicalBlocks: Block[] = [
  { slug: 'inlineImage', fields: [image('image'), text('caption')] },
  { slug: 'inlinePullQuote', fields: [text('quote', true), text('attribution')] },
  { slug: 'inlineCode', fields: [{ name: 'language', type: 'select', options: ['text', 'javascript', 'typescript', 'json', 'css', 'html', 'bash'] }, { name: 'code', type: 'code', required: true }] },
  { slug: 'controlledEmbed', fields: [{ name: 'provider', type: 'select', required: true, options: ['youtube', 'vimeo'] }, { name: 'videoId', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9_-]{6,32}$/.test(value) || 'Use a video ID.' }, text('caption')] },
]
