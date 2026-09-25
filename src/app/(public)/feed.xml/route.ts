import { getPayload } from 'payload'
import config from '@payload-config'
import { feedChunks } from '../../../lib/feeds'
import { siteOrigin } from '../../../lib/seo/core'
import { completedExportResponse } from '../../../lib/export-response'
export const dynamic = 'force-dynamic'
export async function GET() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false, depth: 0 })
  return completedExportResponse(feedChunks(payload, settings, siteOrigin(), 'rss'), 'application/rss+xml; charset=utf-8')
}
