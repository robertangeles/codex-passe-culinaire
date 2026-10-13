import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { iterateExportContent } from '../../../lib/export-content'
import { pageMarkdown, postMarkdown } from '../../../lib/document-export'
import { getBlockContent } from '../../../lib/page-view-model'
import { siteOrigin } from '../../../lib/seo/core'
import { completedExportResponse } from '../../../lib/export-response'
export const dynamic = 'force-dynamic'
async function* content(payload: Payload, origin: string) {
  for await (const page of iterateExportContent(payload, 'pages')) {
    yield pageMarkdown(page, origin, await getBlockContent(page.layout)) + '\n---\n\n'
  }
  for await (const post of iterateExportContent(payload, 'posts')) yield postMarkdown(post, origin) + '\n---\n\n'
}
export async function GET() {
  const payload = await getPayload({ config })
  return completedExportResponse(content(payload, siteOrigin()), 'text/markdown; charset=utf-8')
}
