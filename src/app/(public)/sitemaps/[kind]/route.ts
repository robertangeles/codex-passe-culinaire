import { getPayload } from 'payload'
import config from '@payload-config'
import { sitemapChunks, sitemapKinds, type SitemapKind } from '../../../../lib/sitemaps'
import { siteOrigin } from '../../../../lib/seo/core'
import { completedExportResponse } from '../../../../lib/export-response'
export const dynamic = 'force-dynamic'
export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!sitemapKinds.includes(kind as SitemapKind)) return new Response('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } })
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false, depth: 0 })
  return completedExportResponse(sitemapChunks(payload, kind as SitemapKind, settings, siteOrigin()), 'application/xml; charset=utf-8')
}
