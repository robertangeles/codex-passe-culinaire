import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { isStaff } from '../../../../payload/access'
import { validateSlugValue } from '../../../../payload/fields'

const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie, Authorization' }

const errorResponse = (status: number, message: string): Response => Response.json(
  { error: message },
  { status, headers: privateHeaders },
)

const redirectResponse = (location: string): Response => new Response(null, {
  status: 303,
  headers: {
    ...privateHeaders,
    'X-Robots-Tag': 'noindex, nofollow',
    Location: location,
  },
})

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const exitValues = url.searchParams.getAll('exit')

  if (exitValues.length) {
    if (exitValues.length !== 1 || exitValues[0] !== '1' || [...url.searchParams.keys()].some((key) => key !== 'exit'))
      return errorResponse(400, 'Preview request is invalid.')
    try {
      await (await draftMode()).disable()
      return redirectResponse('/')
    } catch {
      return errorResponse(503, 'Preview is temporarily unavailable.')
    }
  }

  const collections = url.searchParams.getAll('collection')
  const slugs = url.searchParams.getAll('slug')
  if (collections.length !== 1 || slugs.length !== 1 || [...url.searchParams.keys()].some((key) => key !== 'collection' && key !== 'slug'))
    return errorResponse(400, 'Preview request is invalid.')

  const collection = collections[0]
  const slug = slugs[0]
  if ((collection !== 'pages' && collection !== 'posts') || typeof slug !== 'string' || slug.length > 200 || validateSlugValue(slug, collection === 'pages') !== true)
    return errorResponse(400, 'Preview request is invalid.')

  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!isStaff(user)) return errorResponse(401, 'Sign in as a staff member to preview this draft.')

    const result = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: false,
      user,
    })
    if (!result.docs[0]) return errorResponse(404, 'Draft not found.')

    await (await draftMode()).enable()
    const destination = collection === 'posts'
      ? `/journal/${encodeURIComponent(slug)}`
      : slug === 'home' ? '/' : `/${encodeURIComponent(slug)}`
    return redirectResponse(destination)
  } catch {
    return errorResponse(503, 'Preview is temporarily unavailable.')
  }
}
