import { getPayload } from 'payload'
import config from '@payload-config'
import { buildRobots } from '../../../lib/robots'
import { siteOrigin } from '../../../lib/seo/core'
import { PUBLIC_EXPORT_CACHE } from '../../../lib/export-response'
export const dynamic = 'force-dynamic'
export async function GET() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false, depth: 0 })
  return new Response(buildRobots(settings, siteOrigin()), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': PUBLIC_EXPORT_CACHE } })
}
