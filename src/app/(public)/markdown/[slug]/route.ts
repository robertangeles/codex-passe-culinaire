import { getPublicDocument } from '../../../../lib/public-content'
import { isPublishedExport } from '../../../../lib/discovery-policy'
import { postMarkdown } from '../../../../lib/document-export'
import { siteOrigin } from '../../../../lib/seo/core'
import { PUBLIC_EXPORT_CACHE } from '../../../../lib/export-response'
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return missing()
  const post = await getPublicDocument('posts', slug)
  if (!post || !isPublishedExport(post)) return missing()
  return new Response(postMarkdown(post, siteOrigin()), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': PUBLIC_EXPORT_CACHE } })
}
function missing() { return new Response('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } }) }
