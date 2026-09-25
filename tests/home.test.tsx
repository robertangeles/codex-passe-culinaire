import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomePage, { generateMetadata, revalidate } from '../src/app/(public)/page'
import { getPageViewModel } from '../src/lib/page-view-model'

vi.mock('../src/lib/page-view-model', () => ({ getPageViewModel: vi.fn() }))
vi.mock('next/navigation', () => ({ notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))

const publishedModel = {
  page: {
    id: 5,
    title: 'Passe Culinaire',
    slug: 'home',
    layout: [{
      blockType: 'hero' as const,
      heading: 'Passe Culinaire',
      summary: 'A Melbourne company for chefs and restaurant owners.',
      style: 'quiet' as const,
    }],
    seo: { metaTitle: 'Passe Culinaire for chefs', metaDescription: 'A company for chefs.', noIndex: false, noFollow: false },
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  content: { posts: [], services: [], events: [] },
  preview: false,
  settings: { id: 1, name: 'Passe Culinaire' },
  externalEmbedsEnabled: false,
} satisfies NonNullable<Awaited<ReturnType<typeof getPageViewModel>>>

function setModel(model: NonNullable<Awaited<ReturnType<typeof getPageViewModel>>> | null) {
  vi.mocked(getPageViewModel).mockResolvedValue(model)
}

describe('CMS home page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setModel(publishedModel)
  })

  it('renders published CMS content in server HTML with one h1 and a path to CulinAIre Kitchen', async () => {
    const html = renderToStaticMarkup(await HomePage())

    expect(html).toContain('<main id="main-content" tabindex="-1">')
    expect(html).toContain('A Melbourne company for chefs and restaurant owners.')
    expect(html).toContain('<h1')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('href="/culinaire-kitchen"')
    expect(html).toContain('Explore CulinAIre Kitchen')
  })

  it('calls notFound when the home page document is missing', async () => {
    setModel(null)
    await expect(HomePage()).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('marks draft previews noindex and provides an exit link', async () => {
    setModel({ ...publishedModel, preview: true })

    const html = renderToStaticMarkup(await HomePage())
    const metadata = await generateMetadata()

    expect(html).toContain('aria-label="Draft preview"')
    expect(html).toContain('Draft preview</p>')
    expect(html).toContain('href="/api/preview?exit=1"')
    expect(metadata.robots).toEqual({ index: false, follow: false })
  })

  it('uses CMS SEO overrides and public indexing preferences', async () => {
    const metadata = await generateMetadata()

    expect(metadata.title).toBe('Passe Culinaire for chefs')
    expect(metadata.description).toBe('A company for chefs.')
    expect(metadata.robots).toEqual({ index: true, follow: true })

    setModel({ ...publishedModel, page: { ...publishedModel.page, seo: { ...publishedModel.page.seo, noIndex: true, noFollow: true } } })
    expect((await generateMetadata()).robots).toEqual({ index: false, follow: false })
    expect(revalidate).toBe(600)
  })
})
