import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Category, Media, Post, User } from '../src/payload-types'
import { JournalEditorial } from '../src/components/JournalEditorial'

function post(id: number, overrides: Partial<Post> = {}): Post {
  return {
    id,
    title: `Kitchen note ${id}`,
    slug: `kitchen-note-${id}`,
    excerpt: `A note about preparation ${id}.`,
    updatedAt: '2026-09-28T00:00:00.000Z',
    createdAt: '2026-09-28T00:00:00.000Z',
    _status: 'published',
    ...overrides,
  }
}

function render(posts: Post[]): string {
  return renderToStaticMarkup(
    <JournalEditorial posts={posts} title="Journal" description="Notes from our work in kitchens." />,
  )
}

describe('JournalEditorial', () => {
  it('renders the approved empty state with the supplied photograph and truthful links', () => {
    const html = render([])

    expect(html).toContain('A place for kitchen notes.')
    expect(html).toContain('There are no journal entries to read yet.')
    expect(html).toContain('%2Fimages%2Fjournal%2Fkitchen-notebook.webp')
    expect(html).toContain('alt="Concept photograph of a kitchen notebook beside a prepared dish"')
    expect(html).toContain('href="/about"')
    expect(html).toContain('href="/culinaire-kitchen"')
    expect(html).not.toContain('Further reading')
  })

  it('renders one published entry as the lead without empty follower or archive sections', () => {
    const html = render([post(1)])

    expect(html.match(/<article\b/gu)).toHaveLength(1)
    expect(html).toContain('Kitchen note 1')
    expect(html).not.toContain('Further reading')
    expect(html).not.toContain('Older journal entries')
  })

  it('renders four followers after the lead at five posts', () => {
    const html = render(Array.from({ length: 5 }, (_, index) => post(index + 1)))

    expect(html.match(/<article\b/gu)).toHaveLength(5)
    expect(html).toContain('aria-labelledby="journal-following-heading"')
    expect(html).toContain('<h2 id="journal-following-heading">Further reading</h2>')
    expect(html).toContain('Kitchen note 5')
  })

  it('keeps every entry after the four follower stories in the compact archive', () => {
    const html = render(Array.from({ length: 12 }, (_, index) => post(index + 1)))

    expect(html.match(/<article\b/gu)).toHaveLength(12)
    expect(html).toContain('Kitchen note 12')
    expect(html).toContain('aria-label="Older journal entries"')
  })

  it('filters drafts, invalid slugs, blank titles and duplicate ids before assigning layout positions', () => {
    const html = render([
      post(1),
      post(1, { title: 'Duplicate id' }),
      post(2, { _status: 'draft' }),
      post(3, { slug: '../private' }),
      post(4, { title: '   ' }),
      post(5, { slug: 'Upper-case' }),
    ])

    expect(html.match(/<article\b/gu)).toHaveLength(1)
    expect(html).toContain('Kitchen note 1')
    expect(html).not.toContain('Duplicate id')
    expect(html).not.toContain('Kitchen note 2')
    expect(html).not.toContain('private')
  })

  it('renders only populated public author and category names and safely formats real dates', () => {
    const publicAuthor = {
      id: 4,
      name: 'Ari & Co',
      slug: 'ari-co',
      publicProfile: true,
      email: 'private@example.test',
      role: 'admin',
      resetPasswordToken: 'private-token',
    } as unknown as User
    const category = { id: 8, name: 'Pâtisserie', slug: 'patisserie' } as Category
    const html = render([post(1, {
      publishedAt: '2026-09-28T14:30:00.000Z',
      authors: [4, publicAuthor],
      categories: [9, category],
    })])

    expect(html).toContain('Ari &amp; Co')
    expect(html).toContain('Pâtisserie')
    expect(html).toContain('29 September 2026')
    expect(html).not.toContain('private@example.test')
    expect(html).not.toContain('private-token')
    expect(html).not.toContain('admin')
  })

  it('omits invalid publication dates and unusable media without leaving image space', () => {
    const media = {
      id: 1,
      alt: 'Image alt',
      filename: '../unsafe.webp',
      width: 1600,
      height: 900,
      createdAt: '2026-09-28T00:00:00.000Z',
      updatedAt: '2026-09-28T00:00:00.000Z',
    } as Media
    const html = render([post(1, { publishedAt: 'not-a-date', heroImage: media })])

    expect(html).not.toContain('<time')
    expect(html).not.toContain('/media/')
    expect(html).not.toContain('Image alt')
  })
})
