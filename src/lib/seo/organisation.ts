import type { SiteSetting, User } from '../../payload-types'
import { visibleContentText } from '../../payload/contentText'
import { absolutePublicUrl, confirmedText, entityIds, publicMediaUrl, type SchemaNode } from './core'

export type PublicPerson = Pick<User, 'id' | 'name' | 'slug' | 'publicTitle' | 'publicBio' | 'portrait' | 'createdAt' | 'updatedAt'>

const validPersonSlug = (slug: string): boolean =>
  slug.length > 0 && slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)

const plainBio = (bio: PublicPerson['publicBio']): string | undefined => {
  if (!bio) return undefined
  const text = visibleContentText('posts', { body: bio })
  return confirmedText(text)
}

export function buildPersonSchema(person: PublicPerson, origin: string): SchemaNode | null {
  const name = confirmedText(person.name)
  if (!name || !validPersonSlug(person.slug)) return null

  const ids = entityIds(origin)
  const node: SchemaNode = {
    '@type': 'Person',
    '@id': ids.person(person.slug),
    name,
    url: `${origin}/journal/author/${encodeURIComponent(person.slug)}`,
  }
  const jobTitle = confirmedText(person.publicTitle)
  const description = plainBio(person.publicBio)
  const image = publicMediaUrl(person.portrait, origin)
  if (jobTitle) node.jobTitle = jobTitle
  if (description) node.description = description
  if (image) node.image = image
  return node
}

export function buildOrganisationGraph(settings: SiteSetting, origin: string): SchemaNode[] {
  const ids = entityIds(origin)
  const name = confirmedText(settings.name)
  const description = confirmedText(settings.description)
  const organisation = settings.organisation
  const legalName = confirmedText(organisation?.legalName)
  const city = confirmedText(organisation?.city)
  const region = confirmedText(organisation?.region)
  const country = confirmedText(organisation?.country)
  const address: SchemaNode | undefined = city || region || country
    ? {
        '@type': 'PostalAddress',
        ...(city ? { addressLocality: city } : {}),
        ...(region ? { addressRegion: region } : {}),
        ...(country ? { addressCountry: country } : {}),
      }
    : undefined

  const socialLinks = [...new Set((settings.socialLinks ?? [])
    .map((link) => typeof link?.url === 'string' && /^https:\/\//i.test(link.url)
      ? absolutePublicUrl(link.url, origin)
      : undefined)
    .filter((url): url is string => typeof url === 'string' && url.startsWith('https://')))]
  const knowsAbout = [...new Set((organisation?.knowsAbout ?? [])
    .map((entry) => confirmedText(entry?.topic))
    .filter((topic): topic is string => Boolean(topic)))]
  const founders = (organisation?.founders ?? [])
    .filter((founder): founder is User => Boolean(founder) && typeof founder === 'object' && 'name' in founder && 'slug' in founder)
    .map((founder) => buildPersonSchema({
      id: founder.id,
      name: founder.name,
      slug: founder.slug,
      publicTitle: founder.publicTitle,
      publicBio: founder.publicBio,
      portrait: founder.portrait,
      createdAt: founder.createdAt,
      updatedAt: founder.updatedAt,
    }, origin))
    .filter((founder): founder is SchemaNode => founder !== null)

  const graph: SchemaNode[] = [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': ids.organisation,
      ...(name ? { name } : {}),
      url: origin,
      ...(description ? { description } : {}),
      ...(legalName ? { legalName } : {}),
      ...(address ? { address } : {}),
      ...(socialLinks.length ? { sameAs: socialLinks } : {}),
      ...(knowsAbout.length ? { knowsAbout } : {}),
      ...(founders.length ? { founder: founders.map(({ '@id': id }) => ({ '@id': id })) } : {}),
      brand: { '@id': ids.brand },
    },
    {
      '@type': 'WebSite',
      '@id': ids.website,
      ...(name ? { name } : {}),
      url: origin,
      ...(description ? { description } : {}),
      publisher: { '@id': ids.organisation },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Brand',
      '@id': ids.brand,
      name: 'CulinAIre Kitchen',
      url: `${origin}/culinaire-kitchen`,
    },
    ...founders,
  ]
  return graph
}
