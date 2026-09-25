import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { getJournalListing } from '../src/lib/journal-listing'
import { JournalListing } from '../src/components/JournalListing'

type JournalModel = NonNullable<Awaited<ReturnType<typeof getJournalListing>>>
const privateAccountFields = {
  email: 'private@example.test',
  role: 'admin',
  resetPasswordToken: 'private-token',
}

const model = {
  title: 'Journal',
  description: 'Notes from the kitchen.',
  basePath: '/journal',
  noIndex: false,
  author: null,
  externalEmbedsEnabled: false,
    settings: { id: 1, name: 'Passe Culinaire' },
  listing: {
    docs: [{
      id: 17,
      title: 'A morning at the pastry bench',
      slug: 'morning-pastry-bench',
      excerpt: 'The first dough is mixed before service.',
      publishedAt: '2026-07-12T00:00:00.000Z',
      updatedAt: '2026-07-12T00:00:00.000Z',
      createdAt: '2026-07-12T00:00:00.000Z',
      _status: 'published',
    }],
    totalDocs: 25,
    limit: 12,
    totalPages: 3,
    page: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: true,
    prevPage: null,
    nextPage: 2,
  },
} satisfies JournalModel

describe('JournalListing', () => {
  it('renders published journal content and its canonical next-page link', () => {
    const html = renderToStaticMarkup(<JournalListing model={model} />)

    expect(html).toContain('<h1')
    expect(html).toContain('Notes from the kitchen.')
    expect(html).toContain('A morning at the pastry bench')
    expect(html).toContain('The first dough is mixed before service.')
    expect(html).toContain('href="/journal/page/2"')
    expect(html).toContain('aria-label="Pagination"')
  })

  it('renders the full public author bio while excluding private account fields', () => {
    const authorModel = {
      ...model,
      title: 'Mara Chen',
      description: 'Journal entries by Mara Chen.',
      basePath: '/journal/author/mara-chen',
      author: {
        ...privateAccountFields,
        id: 8,
        name: 'Mara Chen',
        slug: 'mara-chen',
        publicTitle: 'Pastry chef',
        publicBio: {
          root: {
            type: 'root',
            children: [{
              type: 'paragraph',
              version: 1,
              children: [{ type: 'text', text: 'Mara works through laminated dough before the morning service.', version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
            }],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        noIndex: false,
        excludeFromSitemap: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    } satisfies JournalModel
    const html = renderToStaticMarkup(<JournalListing model={authorModel} />)

    expect(html).toContain('Mara works through laminated dough before the morning service.')
    expect(html).not.toContain(privateAccountFields.email)
    expect(html).not.toContain(privateAccountFields.role)
    expect(html).not.toContain(privateAccountFields.resetPasswordToken)
  })
})
