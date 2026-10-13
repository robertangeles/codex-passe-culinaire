vi.mock('../src/components/LivePreviewRefresh', () => ({ LivePreviewRefresh: () => null }))
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  shell: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../src/lib/request-content', () => ({ getRequestDocument: mocks.request }))
vi.mock('../src/lib/public-content', () => ({ getPublicShell: mocks.shell }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import JournalDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../src/app/(public)/journal/[slug]/page'

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }],
  direction: 'ltr',
  format: '',
  indent: 0,
})

const post = {
  id: 12,
  title: 'A calmer pass at service',
  slug: 'a-calmer-pass-at-service',
  excerpt: 'A short note about preparing for service.',
  heroImage: null,
  body: { root: { type: 'root', version: 1, children: [paragraph('Keep the mise en place clear.'), paragraph('Call the next plate before the pass fills.')], direction: 'ltr', format: '', indent: 0 } },
  authors: [{ id: 2, name: 'Alex Chef', slug: 'alex-chef', email: 'private@example.test', roles: ['admin'], password: 'secret', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' }],
  categories: [{ id: 1, name: 'Service', slug: 'service' }],
  tags: [{ id: 3, name: 'Preparation', slug: 'preparation' }],
  readingTime: 3,
  seo: { metaTitle: 'A calmer pass', metaDescription: 'Notes for the pass.', noIndex: false, noFollow: false },
  publishedAt: '2026-09-10T01:00:00.000Z',
  updatedAt: '2026-09-10T01:00:00.000Z',
  createdAt: '2026-09-01T00:00:00.000Z',
  _status: 'published',
}

describe('journal detail route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.request.mockResolvedValue({ document: post, preview: false })
    mocks.shell.mockResolvedValue({ siteSettings: { externalEmbedsEnabled: false } })
  })

  it('renders article copy, taxonomy links, and public author fields in server HTML', async () => {
    const element = await JournalDetailPage({ params: Promise.resolve({ slug: post.slug }) })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('A calmer pass at service')
    expect(html).toContain('Keep the mise en place clear.')
    expect(html).toContain('Call the next plate before the pass fills.')
    expect(html).toContain('href="/journal/author/alex-chef"')
    expect(html).toContain('href="/journal/category/service"')
    expect(html).toContain('href="/journal/tag/preparation"')
    expect(html).not.toContain('private@example.test')
    expect(html).not.toContain('secret')
    expect(html).not.toContain('admin')
    expect(mocks.request).toHaveBeenCalledWith('posts', post.slug)
    expect(mocks.shell).toHaveBeenCalledTimes(1)
  })

  it('returns not found for an absent article and invalid slugs', async () => {
    mocks.request.mockResolvedValue({ document: null, preview: false })
    await expect(JournalDetailPage({ params: Promise.resolve({ slug: 'missing' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(JournalDetailPage({ params: Promise.resolve({ slug: 'Bad-Slug' }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('marks previews noindex and exposes an exit link', async () => {
    mocks.request.mockResolvedValue({ document: post, preview: true })

    await expect(generateMetadata({ params: Promise.resolve({ slug: post.slug }) })).resolves.toMatchObject({
      title: 'A calmer pass',
      description: 'Notes for the pass.',
      robots: { index: false, follow: false },
    })
    const html = renderToStaticMarkup(await JournalDetailPage({ params: Promise.resolve({ slug: post.slug }) }))
    expect(html).toContain('Draft preview')
    expect(html).toContain('href="/api/preview?exit=1"')
  })

  it('uses on-demand static params', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})
