import { sitemapIndex } from '../../../lib/sitemaps'
import { siteOrigin } from '../../../lib/seo/core'
import { PUBLIC_EXPORT_CACHE } from '../../../lib/export-response'
export const dynamic = 'force-dynamic'
export function GET() {
  return new Response(sitemapIndex(siteOrigin()), { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': PUBLIC_EXPORT_CACHE } })
}
