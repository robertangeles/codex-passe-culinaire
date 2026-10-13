import type { GlobalConfig } from 'payload'
import { adminOnly, staffOnly } from './access'
import { queueGlobalChange } from './publication'
import { guardGlobalMediaWrite } from './mediaReferences'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings', access: { read: () => true, update: adminOnly }, hooks: { beforeChange: [guardGlobalMediaWrite], afterChange: [queueGlobalChange] },
  fields: [
    { name: 'name', type: 'text', required: true }, { name: 'tagline', type: 'text' },
    { name: 'description', type: 'textarea' }, { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    { name: 'curatedLinks', type: 'array', maxRows: 10, fields: [
      { name: 'path', type: 'text', required: true, validate: (value: unknown) => typeof value === 'string' && /^\/(?!\/)[a-z0-9/-]*$/.test(value) || 'Use an internal path.' },
      { name: 'title', type: 'text', required: true, maxLength: 100 },
      { name: 'summary', type: 'text', required: true, maxLength: 200 },
    ] },
    { name: 'socialLinks', type: 'array', fields: [{ name: 'label', type: 'text' }, { name: 'url', type: 'text' }] },
    { name: 'organisation', type: 'group', fields: [
      { name: 'legalName', type: 'text' }, { name: 'city', type: 'text' }, { name: 'region', type: 'text' },
      { name: 'country', type: 'text' }, { name: 'founders', type: 'relationship', relationTo: 'users', hasMany: true },
      { name: 'knowsAbout', type: 'array', fields: [{ name: 'topic', type: 'text' }] },
    ] },
    { name: 'analyticsEnabled', type: 'checkbox', defaultValue: false },
    { name: 'externalEmbedsEnabled', type: 'checkbox', defaultValue: false }, { name: 'robotsTxtExtra', type: 'textarea' },
    { name: 'defaultSitemap', type: 'group', fields: [
      { name: 'priority', type: 'select', defaultValue: '0.5', options: ['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9','1.0'] },
      { name: 'changeFrequency', type: 'select', defaultValue: 'monthly', options: ['daily', 'weekly', 'monthly', 'yearly'] },
    ] },
  ],
}
export const Header: GlobalConfig = {
  slug: 'header', access: { read: () => true, update: staffOnly }, hooks: { beforeChange: [guardGlobalMediaWrite], afterChange: [queueGlobalChange] },
  fields: [{ name: 'navItems', type: 'array', fields: [
    { name: 'label', type: 'text', required: true }, { name: 'url', type: 'text' },
    { name: 'children', type: 'array', fields: [{ name: 'label', type: 'text', required: true }, { name: 'url', type: 'text', required: true }] },
  ] }],
}
export const Footer: GlobalConfig = {
  slug: 'footer', access: { read: () => true, update: staffOnly }, hooks: { beforeChange: [guardGlobalMediaWrite], afterChange: [queueGlobalChange] },
  fields: [
    { name: 'columns', type: 'array', fields: [{ name: 'heading', type: 'text' }, { name: 'links', type: 'array', fields: [{ name: 'label', type: 'text' }, { name: 'url', type: 'text' }] }] },
    { name: 'legalText', type: 'textarea' }, { name: 'abn', type: 'text' },
  ],
}
