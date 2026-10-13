import { serializeJsonLd, type SchemaNode } from '../lib/seo/core'

export function JsonLd({ nodes }: { nodes: SchemaNode[] }) {
  return nodes.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes) }} /> : null
}
