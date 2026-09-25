import { getPayload } from 'payload'
import config from '@payload-config'
import { llmsIndex } from '../../../lib/llms'
import { siteOrigin } from '../../../lib/seo/core'
import { PUBLIC_EXPORT_CACHE } from '../../../lib/export-response'
export const dynamic = 'force-dynamic'
export async function GET() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: false, depth: 0 })
  const result = await llmsIndex(payload, settings, siteOrigin())
  return new Response(result.markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': PUBLIC_EXPORT_CACHE, 'X-LLMS-Link-Count': String(result.count) } })
}
