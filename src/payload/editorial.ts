import { randomUUID } from 'node:crypto'
import type { CollectionBeforeChangeHook, FieldHook, TaskConfig } from 'payload'
import { isAdmin } from './access'

/** Payload resets nested row IDs; reset publication and URL identity alongside the slug. */
export const duplicateEditorialSlug: FieldHook = ({ value, data }) => {
  if (data) {
    data._status = 'draft'
    data.publishedAt = null
    data.scheduledPublishAt = null
    if (data.seo && typeof data.seo === 'object') data.seo.canonicalUrl = null
  }
  const base = typeof value === 'string' ? value.slice(0, 158).replace(/-+$/, '') : 'page'
  return `${base}-copy-${randomUUID()}`
}

export const stampPublication: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data._status === 'published' && !data.publishedAt && !originalDoc?.publishedAt)
    data.publishedAt = new Date().toISOString()
  return data
}

type EditorialCollection = 'pages' | 'posts' | 'services' | 'events'
type ScheduleInput = {
  type?: 'publish' | 'unpublish' | null
  doc?: { relationTo: EditorialCollection; value: number | string } | null
  user?: { relationTo: 'users'; value: number | string } | null
  timezone?: string | null
  localTime?: string | null
}

/** Payload persists and claims these jobs; publication always rechecks the scheduling identity. */
export const scheduledPublicationTask: TaskConfig<{ input: ScheduleInput; output: { published: boolean } }> = {
  slug: 'schedulePublish',
  inputSchema: [
    { name: 'type', type: 'select', options: ['publish', 'unpublish'], required: true },
    { name: 'doc', type: 'relationship', relationTo: ['pages', 'posts', 'services', 'events'], required: true },
    { name: 'user', type: 'relationship', relationTo: ['users'], required: true },
    { name: 'timezone', type: 'text' }, { name: 'localTime', type: 'text' },
  ],
  retries: { attempts: 5, backoff: { delay: 10000, type: 'fixed' } },
  handler: async ({ input, req }) => {
    const document = input.doc
    const identity = input.user
    if (!document || !['pages', 'posts', 'services', 'events'].includes(document.relationTo)
      || !identity || identity.relationTo !== 'users' || !identity.value
      || !input.type || !['publish', 'unpublish'].includes(input.type))
      throw new Error('Schedule this publication again while signed in as a administrator.')
    const user = await req.payload.findByID({ collection: 'users', id: identity.value, overrideAccess: true, depth: 0, disableErrors: true })
    if (!user || !isAdmin(user)) throw new Error('The scheduling account no longer has publishing access.')
    await req.payload.update({ collection: document.relationTo, id: document.value,
      user: { ...user, collection: 'users' }, overrideAccess: false, depth: 0,
      data: { _status: input.type === 'publish' ? 'published' : 'draft' },
    })
    return { output: { published: input.type === 'publish' } }
  },
}
