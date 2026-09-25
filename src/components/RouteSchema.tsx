import { JsonLd } from './JsonLd'
import { siteOrigin, type SchemaNode } from '../lib/seo/core'
import { breadcrumbSchema, type Crumb } from '../lib/seo/page'

export function RouteSchema({ path, title, parents = [], nodes = [] }: { path: string; title: string; parents?: Crumb[]; nodes?: SchemaNode[] }) {
  return <JsonLd nodes={[...nodes, breadcrumbSchema([{ name: 'Home', path: '/' }, ...parents, { name: title, path }], siteOrigin())]} />
}
