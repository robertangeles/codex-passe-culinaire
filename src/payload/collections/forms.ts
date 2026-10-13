import type { CollectionConfig } from 'payload'
import { adminOnly, adminField, staffOnly } from '../access'

export const Forms: CollectionConfig = {
  slug: 'forms', access: { create: adminOnly, read: staffOnly, update: adminOnly, delete: adminOnly },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true },
    { name: 'enabled', type: 'checkbox', defaultValue: true }, { name: 'description', type: 'textarea' },
  ],
}
export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions', access: { create: staffOnly, read: staffOnly, update: staffOnly, delete: adminOnly },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
    { name: 'sourceHash', type: 'text', index: true, admin: { hidden: true }, access: { read: adminField, create: adminField, update: adminField } },
    { name: 'requestId', type: 'text', required: true, unique: true, index: true, access: { update: () => false } },
    { name: 'name', type: 'text', required: true, maxLength: 120 },
    { name: 'email', type: 'email', required: true },
    { name: 'venue', type: 'text', maxLength: 160 },
    { name: 'role', type: 'select', required: true, options: ['chef', 'owner', 'manager', 'other'] },
    { name: 'need', type: 'select', required: true, options: [{ label: 'Training', value: 'training' }, { label: 'Advisory', value: 'advisory' }, { label: 'CulinAIre Kitchen', value: 'culinaire-kitchen' }, { label: 'Press', value: 'press' }, { label: 'Other', value: 'other' }] },
    { name: 'message', type: 'textarea', required: true, maxLength: 5000 },
    { name: 'deliveryStatus', type: 'select', access: { create: adminField, update: adminField }, defaultValue: 'saved', options: ['saved', 'emailed', 'failed', 'handled'] },
    { name: 'deliveryError', type: 'textarea', access: { read: adminField, create: adminField, update: adminField } }, { name: 'deliveryAttemptedAt', type: 'date', access: { create: adminField, update: adminField } },
    { name: 'emailedAt', type: 'date', access: { create: adminField, update: adminField } },
    { name: 'handledAt', type: 'date' }, { name: 'operatorNotes', type: 'textarea' },
  ],
}
