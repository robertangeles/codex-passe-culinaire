import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  document: vi.fn(),
  shell: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
}))

vi.mock('../src/lib/public-content', () => ({
  getPublicDocument: mocks.document,
  getPublicShell: mocks.shell,
}))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))

import ServiceDetailPage, {
  generateMetadata,
  generateStaticParams,
} from '../src/app/(public)/services/[slug]/page'

const service = {
  id: 9,
  title: 'Kitchen training',
  slug: 'kitchen-training',
  oneLiner: 'Practical sessions for kitchen teams.',
  whoItIsFor: 'Chefs and owners working in busy kitchens.',
  whatYouGet: {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'A session built around your kitchen.' }] }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  format: 'on-site' as const,
  duration: 'Half day',
  priceNote: 'Discuss your needs',
  faq: [{ question: 'Where does it happen?', answer: null }],
  cta: { label: 'Ask about training', url: '/contact' },
  _status: 'published' as const,
  seo: { metaTitle: 'Training for kitchens', noIndex: true },
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const shell = { siteSettings: { externalEmbedsEnabled: false } }

describe('service detail route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.shell.mockResolvedValue(shell)
  })

  it('renders the full service body in server HTML and uses service SEO', async () => {
    mocks.document.mockResolvedValue(service)

    const html = renderToStaticMarkup(await ServiceDetailPage({ params: Promise.resolve({ slug: service.slug }) }))
    expect(html).toContain('<main id="main-content"')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('<h1')
    expect(html).toContain('Kitchen training')
    expect(html).toContain('Practical sessions for kitchen teams.')
    expect(html).toContain('Who it is for')
    expect(html).toContain('Chefs and owners working in busy kitchens.')
    expect(html).toContain('What you get')
    expect(html).toContain('A session built around your kitchen.')
    expect(html).toContain('On-site')
    expect(html).toContain('Half day')
    expect(html).toContain('Discuss your needs')
    expect(html).toContain('Where does it happen?')
    expect(html).toContain('href="/contact"')
    await expect(generateMetadata({ params: Promise.resolve({ slug: service.slug }) })).resolves.toMatchObject({
      title: 'Training for kitchens',
      description: service.oneLiner,
      robots: { index: false, follow: true },
    })
  })

  it('returns 404 for unknown, draft and malformed slugs', async () => {
    mocks.document.mockResolvedValue(null)
    await expect(ServiceDetailPage({ params: Promise.resolve({ slug: 'missing' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    mocks.document.mockResolvedValue({ ...service, _status: 'draft' })
    await expect(ServiceDetailPage({ params: Promise.resolve({ slug: 'draft-service' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    await expect(ServiceDetailPage({ params: Promise.resolve({ slug: 'Bad-Slug' }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.document).toHaveBeenCalledTimes(2)
  })

  it('omits unsafe calls to action and empty optional fields without placeholder claims', async () => {
    mocks.document.mockResolvedValue({
      ...service,
      oneLiner: null,
      whoItIsFor: null,
      whatYouGet: null,
      format: null,
      duration: null,
      priceNote: null,
      faq: [{ question: '   ', answer: null }],
      cta: { label: 'Ask us', url: 'javascript:alert(1)' },
    })
    const html = renderToStaticMarkup(await ServiceDetailPage({ params: Promise.resolve({ slug: service.slug }) }))
    expect(html).not.toContain('Who it is for')
    expect(html).not.toContain('What you get')
    expect(html).not.toContain('Format')
    expect(html).not.toContain('Duration')
    expect(html).not.toContain('Price')
    expect(html).not.toContain('Where does it happen?')
    expect(html).not.toContain('Ask us')
    expect(html).not.toContain('from $')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
  })

  it('returns no static service slugs for on-demand generation', async () => {
    await expect(generateStaticParams()).resolves.toEqual([])
  })
})
