import type { CollectionConfig } from 'payload'
import { adminOnly, staffOnly } from '../access'
import { queuePublicationChange, queuePublicationDelete } from '../publication'
import { guardMediaDelete } from '../mediaReferences'

const widths = [480, 960, 1440, 2400]
const imageSizes = widths.flatMap((width) => (['avif', 'webp'] as const).map((format) => ({
  name: `${format}${width}`, width, withoutEnlargement: false,
  formatOptions: { format },
})))

const publicUrl = (filename: string) => `/media/${encodeURIComponent(filename)}`

export const Media: CollectionConfig = {
  slug: 'media',
  access: { create: staffOnly, read: () => true, update: staffOnly, delete: adminOnly },
  upload: {
    staticDir: process.env.MEDIA_DIR || './media',
    adminThumbnail: 'webp480',
    imageSizes,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    pasteURL: false,
    formatOptions: { format: 'webp' },
  },
  fields: [
    { name: 'alt', type: 'text', required: true, maxLength: 220 },
    { name: 'caption', type: 'textarea', maxLength: 500 },
    { name: 'credit', type: 'text', maxLength: 200 },
    { name: 'placeholder', type: 'checkbox', defaultValue: false },
  ],
  hooks: {
    beforeDelete: [guardMediaDelete],
    afterChange: [queuePublicationChange], afterDelete: [queuePublicationDelete],
    afterRead: [({ doc }) => {
      if (typeof doc.filename === 'string') doc.url = publicUrl(doc.filename)
      if (doc.sizes && typeof doc.sizes === 'object') {
        for (const value of Object.values(doc.sizes)) {
          if (value && typeof value === 'object' && 'filename' in value && typeof value.filename === 'string')
            (value as Record<string, unknown>).url = publicUrl(value.filename)
        }
      }
      return doc
    }],
  },
}
