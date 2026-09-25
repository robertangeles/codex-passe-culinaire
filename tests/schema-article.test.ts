import { describe, expect, it } from 'vitest'
import type { Post, User } from '../src/payload-types'
import { buildArticleGraph } from '../src/lib/seo/article'
import { serializeJsonLd } from '../src/lib/seo/core'

const origin = 'https://passeculinaire.example'
const author = {
  id: 5,
  name: 'Alex Charasse',
  slug: 'alex-charasse',
  publicTitle: 'Chef educator',
  publicBio: null,
  portrait: null,
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-02-03T04:05:06.000Z',
} satisfies Pick<User, 'id' | 'name' | 'slug' | 'publicTitle' | 'publicBio' | 'portrait' | 'createdAt' | 'updatedAt'>

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 12,
    title: 'A kitchen note',
    slug: 'a-kitchen-note',
    excerpt: 'A short description.',
    body: {
      root: {
        type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
        children: [{ type: 'text', version: 1, text: 'Good mise en place helps service.' }],
      },
    },
    authors: [],
    publishedAt: '2026-03-04T05:06:07.000Z',
    updatedAt: '2026-03-05T06:07:08.000Z',
    createdAt: '2026-03-01T00:00:00.000Z',
    _status: 'published',
    ...overrides,
  }
}

describe('BlogPosting JSON-LD', () => {
  it('omits drafts and invalid slugs or unconfirmed titles', () => {
    expect(buildArticleGraph(makePost({ _status: 'draft' }), origin)).toEqual([])
    expect(buildArticleGraph(makePost({ slug: '../private' }), origin)).toEqual([])
    expect(buildArticleGraph(makePost({ slug: 'a'.repeat(201) }), origin)).toEqual([])
    expect(buildArticleGraph(makePost({ title: '[TO CONFIRM] title' }), origin)).toEqual([])
  })

  it('uses valid dates and non-placeholder media only', () => {
    const graph = buildArticleGraph(makePost({
      publishedAt: 'not-a-date',
      updatedAt: '2026-03-05T06:07:08.000Z',
      heroImage: { id: 9, alt: 'Placeholder', filename: 'placeholder.webp', createdAt: '', updatedAt: '', placeholder: true },
    }), origin)
    expect(graph[0]).not.toHaveProperty('datePublished')
    expect(graph[0]).toHaveProperty('dateModified', '2026-03-05T06:07:08.000Z')
    expect(graph[0]).not.toHaveProperty('image')
  })

  it('counts words from visible body text and adds only safe populated author references', () => {
    const privateUser = Object.assign({}, author, {
      email: 'private@example.com', password: 'secret', role: 'admin' as const,
      publicProfile: true,
    }) as User
    const graph = buildArticleGraph(makePost({
      title: 'Title words',
      excerpt: 'Excerpt words do not count.',
      body: {
        root: {
          type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
          children: [{ type: 'text', version: 1, text: 'One two three.' }],
        },
      },
      authors: [5, privateUser],
    }), origin)
    expect(graph[0]).toMatchObject({
      '@type': 'BlogPosting',
      '@id': `${origin}/journal/a-kitchen-note#article`,
      url: `${origin}/journal/a-kitchen-note`,
      headline: 'Title words',
      description: 'Excerpt words do not count.',
      wordCount: 3,
      author: [{ '@id': `${origin}/journal/author/alex-charasse#person` }],
      publisher: { '@id': `${origin}/#organisation` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${origin}/journal/a-kitchen-note` },
      inLanguage: 'en-AU',
    })
    expect(graph).toContainEqual(expect.objectContaining({
      '@type': 'Person',
      '@id': `${origin}/journal/author/alex-charasse#person`,
      name: 'Alex Charasse',
    }))
    expect(JSON.stringify(graph)).not.toMatch(/private@example|secret|password|email/i)
  })

  it('omits authors explicitly marked as private while accepting the public projection without that field', () => {
    const publicProjection = { ...author } as User
    const privateAuthor = Object.assign({}, author, { publicProfile: false }) as User

    const publicGraph = buildArticleGraph(makePost({ authors: [publicProjection] }), origin)
    expect(publicGraph[0]).toHaveProperty('author', [{ '@id': `${origin}/journal/author/alex-charasse#person` }])

    const privateGraph = buildArticleGraph(makePost({ authors: [privateAuthor] }), origin)
    expect(privateGraph[0]).not.toHaveProperty('author')
    expect(privateGraph).toHaveLength(1)
  })

  it('serialises hostile editorial text without opening a script element', () => {
    const graph = buildArticleGraph(makePost({
      title: '</script><script>alert("x")</script>',
      excerpt: 'Fish & chips',
    }), origin)
    const serialised = serializeJsonLd(graph)
    expect(serialised).not.toContain('</script>')
    expect(serialised).toContain('\\u003c/script\\u003e')
    expect(serialised).toContain('\\u0026')
  })
})
