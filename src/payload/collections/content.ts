import type { CollectionConfig, Field } from 'payload'
import { adminOnly, publishedFlagOrStaff, publishedOrStaff, staffOnly } from '../access'
import { pageBlocks } from '../blocks'
import { seoFields, slugField, validatePublication, validateSlugOnSave } from '../fields'
import { guardMediaWrite } from '../mediaReferences'
import { deriveContentText } from '../contentText'
import { queuePublicationChange, queuePublicationDelete } from '../publication'
import { isRedirectPath, redirectLookupCapability } from '../../lib/redirects'
import { duplicateEditorialSlug, stampPublication } from '../editorial'

const access: CollectionConfig['access'] = { create: staffOnly, read: publishedOrStaff, update: staffOnly, delete: adminOnly }
const versions: CollectionConfig['versions'] = { drafts: { autosave: { interval: 800, showSaveDraftButton: true } }, maxPerDoc: 30 }
const title: Field = { name: 'title', type: 'text', required: true, maxLength: 120 }
const publishDate: Field = { name: 'publishedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } }
const settings = (slug: string, label: string, fields: Field[], priority: string, allowReserved = false): CollectionConfig => ({
  slug, labels: { singular: label, plural: label === 'Journal' || label === 'Training' ? label : `${label}s` },
  admin: {
    useAsTitle: 'title', defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    description: 'Save a draft while you work. Publish when it is ready. Scheduled times use the timezone shown in the date picker.',
    ...(slug === 'pages' || slug === 'posts' ? {
      preview: data => typeof data.slug === 'string' ? `/api/preview?collection=${slug}&slug=${encodeURIComponent(data.slug)}` : null,
      livePreview: {
        url: ({ data }) => data.id && typeof data.slug === 'string' ? `/api/preview?collection=${slug}&slug=${encodeURIComponent(data.slug)}` : null,
        breakpoints: [{ label: 'Mobile', name: 'mobile', width: 375, height: 812 }, { label: 'Desktop', name: 'desktop', width: 1440, height: 900 }],
      },
    } : {}),
  },
  access, versions, fields: [
    title, { ...slugField(allowReserved), hooks: { beforeDuplicate: [duplicateEditorialSlug] } } as Field,
    { type: 'tabs', tabs: [
      { label: 'Content', fields },
      { label: 'SEO', fields: [
        { name: 'seoPreview', type: 'ui', admin: { components: { Field: { path: './components/admin/SeoPreview', clientProps: { publicOrigin: process.env.NEXT_PUBLIC_SERVER_URL || '', collection: slug } } } } },
        seoFields(priority),
      ] },
      { label: 'Publish', fields: [{ name: 'schedulePanel', type: 'ui', admin: { components: { Field: './components/admin/SchedulePanel' } } }] },
    ] },
    { ...publishDate, disableDuplicate: true } as Field,
  ],
  hooks: { beforeValidate: [validateSlugOnSave(allowReserved), validatePublication], beforeChange: [stampPublication, guardMediaWrite, deriveContentText], afterChange: [queuePublicationChange], afterDelete: [queuePublicationDelete] },
})

export const Pages = settings('pages', 'Page', [
  { name: 'layout', type: 'blocks', blocks: pageBlocks, required: true },
  { name: 'searchText', type: 'textarea', admin: { hidden: true, readOnly: true } },
], '0.7', true)

export const Posts = settings('posts', 'Journal', [
  { name: 'excerpt', type: 'textarea', maxLength: 300 },
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'body', type: 'richText' },
  { name: 'authors', type: 'relationship', relationTo: 'users', hasMany: true },
  { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
  { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
  { name: 'readingTime', type: 'number', admin: { readOnly: true } },
  { name: 'searchText', type: 'textarea', admin: { hidden: true, readOnly: true } },
  { name: 'scheduledPublishAt', type: 'date', disableDuplicate: true, admin: { hidden: true, readOnly: true, description: 'Legacy field. Use the Schedule publish action.' } },
], '0.5')

export const Services = settings('services', 'Service', [
  { name: 'oneLiner', type: 'text', maxLength: 160 },
  { name: 'whoItIsFor', type: 'textarea' },
  { name: 'whatYouGet', type: 'richText' },
  { name: 'format', type: 'select', options: [{ label: 'On-site', value: 'on-site' }, 'online', 'hybrid'] },
  { name: 'duration', type: 'text' },
  { name: 'priceNote', type: 'text' },
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'faq', type: 'array', fields: [{ name: 'question', type: 'text' }, { name: 'answer', type: 'richText' }] },
  { name: 'cta', type: 'group', fields: [{ name: 'label', type: 'text' }, { name: 'url', type: 'text' }] },
], '0.7')

export const Events = settings('events', 'Training', [
  { name: 'type', type: 'select', options: ['workshop', 'course', 'masterclass', 'talk'] },
  { name: 'description', type: 'richText' },
  { name: 'descriptionSummary', type: 'textarea', maxLength: 160 },
  { name: 'startDate', type: 'date' },
  { name: 'endDate', type: 'date' },
  { name: 'timezone', type: 'text', defaultValue: 'Australia/Melbourne' },
  { name: 'venue', type: 'group', fields: [{ name: 'name', type: 'text' }, { name: 'address', type: 'text' }, { name: 'online', type: 'checkbox' }] },
  { name: 'capacity', type: 'number', min: 0 },
  { name: 'price', type: 'text' },
  { name: 'bookingUrl', type: 'text' },
  { name: 'instructors', type: 'relationship', relationTo: 'users', hasMany: true },
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'eventStatus', type: 'select', defaultValue: 'upcoming', options: [{ label: 'Upcoming', value: 'upcoming' }, { label: 'Sold out', value: 'sold-out' }, 'past', 'cancelled'] },
], '0.7')

const taxonomy = (slug: string): CollectionConfig => ({
  slug, hooks: { beforeValidate: [validateSlugOnSave()], afterChange: [queuePublicationChange], afterDelete: [queuePublicationDelete] }, access: { create: staffOnly, read: () => true, update: staffOnly, delete: adminOnly },
  fields: [{ name: 'name', type: 'text', required: true }, slugField(), { name: 'description', type: 'textarea' }, { name: 'noIndex', type: 'checkbox', defaultValue: false }, { name: 'excludeFromSitemap', type: 'checkbox', defaultValue: false }],
})
export const Categories = taxonomy('categories')
export const Tags = taxonomy('tags')

export const Testimonials: CollectionConfig = {
  slug: 'testimonials', hooks: { afterChange: [queuePublicationChange], afterDelete: [queuePublicationDelete], beforeChange: [guardMediaWrite] }, access: { create: staffOnly, read: publishedFlagOrStaff, update: staffOnly, delete: adminOnly },
  fields: [
    { name: 'quote', type: 'textarea', required: true }, { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text' }, { name: 'venue', type: 'text' }, { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'relatedTo', type: 'relationship', relationTo: ['services', 'events'] },
    { name: 'published', type: 'checkbox', defaultValue: false },
  ],
}

export const Redirects: CollectionConfig = {
  slug: 'redirects', access: { create: adminOnly, read: args => args.req.context.redirectLookup === redirectLookupCapability || adminOnly(args), update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'from', type: 'text', required: true, unique: true,
      validate: (value: unknown) => isRedirectPath(value, true) || 'Use a public internal pathname.' },
    { name: 'to', type: 'text', required: true,
      validate: (value: unknown) => isRedirectPath(value) || 'Use a public internal path.' },
    { name: 'statusCode', type: 'select', required: true, defaultValue: '301', options: ['301', '302', '307', '308'] },
  ],
}
