import { cache } from 'react'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isStaff } from '../payload/access'
import { getPublicDocument, type PublicDocument } from './public-content'

/** Draft cookies select a mode, never an identity. Only a current staff session can read drafts. */
export const getRequestDocument = cache(async <Collection extends 'pages' | 'posts'>(
  collection: Collection,
  slug: string,
): Promise<{ document: PublicDocument<Collection> | null; preview: boolean }> => {
  const mode = await draftMode()
  if (mode.isEnabled) {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })
    if (isStaff(user)) {
      const result = await payload.find({
        collection, where: { slug: { equals: slug } },
        limit: 1, depth: 3, draft: true, overrideAccess: false, user,
      })
      return { document: (result.docs[0] as PublicDocument<Collection> | undefined) ?? null, preview: true }
    }
  }
  return { document: await getPublicDocument(collection, slug), preview: false }
})
