vi.mock('../src/components/LivePreviewRefresh', () => ({ LivePreviewRefresh: () => null }))
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ page: vi.fn(), notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))

vi.mock('../src/lib/page-view-model', () => ({ getPageViewModel: mocks.page }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import CMSPage, { generateMetadata, generateStaticParams } from '../src/app/(public)/[slug]/page'
import { approvedAboutLayout, seededAboutLayout } from '../scripts/about-content'
import { approvedCulinaireKitchenLayout } from '../scripts/culinaire-kitchen-content'

const companyModel = {
  page: {
    title: 'About Passe Culinaire',
    slug: 'about',
    layout: [{ blockType: 'plainStatement', statement: 'We work with kitchens through training and publishing.' }],
    seo: { metaTitle: 'Our company', metaDescription: 'Company information' },
  },
  content: { posts: [], services: [], events: [] },
  preview: false,
  externalEmbedsEnabled: false,
}

describe('generic CMS page route', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders company content in server HTML with its canonical page title', async () => {
    mocks.page.mockResolvedValue(companyModel)

    const element = await CMSPage({ params: Promise.resolve({ slug: 'about' }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('About Passe Culinaire')
    expect(html).toContain('We work with kitchens through training and publishing.')
    expect(html).not.toContain('Explore CulinAIre Kitchen')
  })

  it('renders the approved About content through its slug-scoped server route', async () => {
    mocks.page.mockResolvedValue({
      ...companyModel,
      page: { ...companyModel.page, id: 6, slug: 'about', layout: approvedAboutLayout(seededAboutLayout()) },
    })

    const element = await CMSPage({ params: Promise.resolve({ slug: 'about' }) })
    const html = renderToStaticMarkup(element)
    expect(html).toMatch(/<h1\b[^>]*>From the kitchen,/u)
    expect(html).toContain('Beyond')
    expect(html).toContain('href="/culinaire-kitchen"')
    expect(html).toContain('href="/contact"')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('renders the product-specific design only on its published slug', async () => {
    mocks.page.mockResolvedValue({
      ...companyModel,
      page: { ...companyModel.page, title: 'CulinAIre Kitchen', slug: 'culinaire-kitchen', layout: approvedCulinaireKitchenLayout() },
    })
    const product = await CMSPage({ params: Promise.resolve({ slug: 'culinaire-kitchen' }) })
    const productHtml = renderToStaticMarkup(product)
    expect(productHtml).toContain('Behind every service.')
    expect(productHtml).toContain('id="operation"')
    expect(productHtml).toContain('CulinAIre Kitchen shows ingredients shared by selected dishes')
    expect(productHtml.match(/<h1\b/g)).toHaveLength(1)

    mocks.page.mockResolvedValue({
      ...companyModel,
      page: { ...companyModel.page, slug: 'about', layout: [{ blockType: 'plainStatement', statement: 'The company shares kitchen experience through training and publishing.' }] },
    })
    const company = await CMSPage({ params: Promise.resolve({ slug: 'about' }) })
    const companyHtml = renderToStaticMarkup(company)
    expect(companyHtml).not.toContain('Behind every service.')
    expect(companyHtml).not.toContain('id="operation"')
  })

  it('returns no static slugs for on-demand generation', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })

  it('returns not found for a missing page and the home alias', async () => {
    mocks.page.mockResolvedValue(null)
    await expect(CMSPage({ params: Promise.resolve({ slug: 'missing' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(CMSPage({ params: Promise.resolve({ slug: 'home' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.page).toHaveBeenCalledTimes(1)
  })

  it('marks draft previews as unavailable to search engines', async () => {
    mocks.page.mockResolvedValue({ ...companyModel, preview: true })

    await expect(generateMetadata({ params: Promise.resolve({ slug: 'about' }) })).resolves.toMatchObject({
      title: 'Our company',
      description: 'Company information',
      robots: { index: false, follow: false },
    })

    const element = await CMSPage({ params: Promise.resolve({ slug: 'about' }) })
    const html = renderToStaticMarkup(element)
    expect(html).toContain('Draft preview')
    expect(html).toContain('/api/preview?exit=1')
  })
})
