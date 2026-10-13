import type { Post, User } from '../../payload-types'
import { visibleContentText } from '../../payload/contentText'
import { confirmedText, entityIds, isoDate, publicMediaUrl, type SchemaNode } from './core'
import { buildPersonSchema, type PublicPerson } from './organisation'

const strictSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

function isPopulatedAuthor(author: number | User): author is User {
  return typeof author === 'object' && author !== null && typeof author.name === 'string' && typeof author.slug === 'string'
}

function publicPerson(author: User): PublicPerson {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    publicTitle: author.publicTitle,
    publicBio: author.publicBio,
    portrait: author.portrait,
    createdAt: author.createdAt,
    updatedAt: author.updatedAt,
  }
}

/** Build BlogPosting JSON-LD from a published public post projection. */
export function buildArticleGraph(post: Post, origin: string): SchemaNode[] {
  const title = confirmedText(post.title)
  if (post._status !== 'published' || !title || post.slug.length > 200 || !strictSlug.test(post.slug)) return []

  const route = `${origin}/journal/${encodeURIComponent(post.slug)}`
  const ids = entityIds(origin)
  const article: SchemaNode = {
    '@type': 'BlogPosting',
    '@id': `${route}#article`,
    url: route,
    mainEntityOfPage: { '@type': 'WebPage', '@id': route },
    headline: title,
    publisher: { '@id': ids.organisation },
    inLanguage: 'en-AU',
  }

  const description = confirmedText(post.excerpt)
  if (description) article.description = description

  const datePublished = isoDate(post.publishedAt)
  const dateModified = isoDate(post.updatedAt)
  if (datePublished) article.datePublished = datePublished
  if (dateModified) article.dateModified = dateModified

  const image = publicMediaUrl(post.heroImage, origin)
  if (image) article.image = image

  const bodyText = visibleContentText('posts', { body: post.body })
  const wordCount = bodyText.split(/\s+/u).filter(Boolean).length
  if (wordCount > 0) article.wordCount = wordCount

  const authors = (post.authors ?? []).filter(isPopulatedAuthor)
  const people = new Map<string, SchemaNode>()
  for (const author of authors) {
    if (author.publicProfile === false) continue
    const person = buildPersonSchema(publicPerson(author), origin)
    if (person && person['@id']) people.set(person['@id'], person)
  }
  if (people.size) article.author = [...people.keys()].map((id) => ({ '@id': id }))

  return [article, ...people.values()]
}
