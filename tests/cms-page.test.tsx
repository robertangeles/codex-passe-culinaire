import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ page: vi.fn(), notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }) }))

vi.mock('../src/lib/page-view-model', () => ({ getPageViewModel: mocks.page }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import CMSPage, { generateMetadata, generateStaticParams } from '../src/app/(public)/[slug]/page'

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
