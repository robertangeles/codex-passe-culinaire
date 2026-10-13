import type { CollectionConfig } from 'payload'
import { adminOnly, adminField, isAdmin, isStaff, staffField } from '../access'
import { slugField } from '../fields'
import { queuePublicationChange, queuePublicationDelete } from '../publication'
import { guardMediaWrite } from '../mediaReferences'

export const Users: CollectionConfig = {
  slug: 'users', auth: { useAPIKey: false, maxLoginAttempts: 5, lockTime: 600000 },
  admin: { useAsTitle: 'name' },
  access: {
    create: adminOnly,
    read: ({ req }) => isStaff(req.user) || { publicProfile: { equals: true } },
    update: ({ req, id }) => isAdmin(req.user) || (isStaff(req.user) && String(req.user?.id) === String(id)),
    delete: adminOnly, admin: ({ req }) => isStaff(req.user),
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, access: { read: staffField } },
    { name: 'name', type: 'text', required: true }, slugField(),
    { name: 'role', type: 'select', required: true, defaultValue: 'editor', options: ['admin', 'editor'], access: { create: adminField, read: staffField, update: adminField } },
    { name: 'publicProfile', type: 'checkbox', defaultValue: false, access: { create: adminField, read: staffField, update: adminField } },
    { name: 'publicTitle', type: 'text' }, { name: 'publicBio', type: 'richText' },
    { name: 'portrait', type: 'upload', relationTo: 'media' },
    { name: 'noIndex', type: 'checkbox', defaultValue: false },
    { name: 'excludeFromSitemap', type: 'checkbox', defaultValue: false },
  ],
  hooks: { afterRead: [({ doc, req, overrideAccess }) => {
    if (overrideAccess || isStaff(req.user)) return doc
    return { id: doc.id, name: doc.name, slug: doc.slug, publicTitle: doc.publicTitle,
      publicBio: doc.publicBio, portrait: doc.portrait, noIndex: doc.noIndex,
      excludeFromSitemap: doc.excludeFromSitemap, createdAt: doc.createdAt, updatedAt: doc.updatedAt }
  }], afterChange: [queuePublicationChange], afterDelete: [queuePublicationDelete], beforeChange: [guardMediaWrite, ({ data, req, context }) => {
    if (isAdmin(req.user) || context.seedProvisioning === process.env.PAYLOAD_SECRET) return data
    data.role = req.user?.role === 'editor' ? 'editor' : data.role
    delete data.publicProfile
    return data
  }] },
}
