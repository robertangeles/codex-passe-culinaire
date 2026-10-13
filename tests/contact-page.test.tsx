vi.mock('../src/components/LivePreviewRefresh', () => ({ LivePreviewRefresh: () => null }))
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  page: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  formRequestIds: [] as string[],
}))

vi.mock('../src/lib/page-view-model', () => ({ getPageViewModel: mocks.page }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }))
vi.mock('../src/app/(public)/contact/actions', () => ({ sendContactMessage: vi.fn() }))
vi.mock('../src/components/ContactForm', () => ({
  default: ({ initialState }: { initialState: { requestId: string } }) => {
    mocks.formRequestIds.push(initialState.requestId)
    return <form aria-label="Contact form" />
  },
}))

import ContactPage, { dynamic, generateMetadata } from '../src/app/(public)/contact/page'

const contactModel = {
  page: {
    title: 'Contact Passe Culinaire',
    layout: [
      { blockType: 'plainStatement' as const, statement: 'Talk with us about your kitchen.' },
      { blockType: 'plainStatement' as const, statement: 'Keep this additional CMS introduction copy.' },
    ],
    seo: { metaTitle: 'Contact the team', metaDescription: 'Send a message to Passe Culinaire.', noIndex: false, noFollow: false },
  },
  content: { posts: [], services: [], events: [] },
  preview: false,
  externalEmbedsEnabled: false,
}

describe('contact page route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.formRequestIds.length = 0
    mocks.page.mockResolvedValue(contactModel)
  })

  it('renders CMS contact copy and the message form in server HTML', async () => {
    const html = renderToStaticMarkup(await ContactPage())

    expect(html).toContain('<main id="main-content" tabindex="-1">')
    expect(html).toContain('<h1')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Talk with us about your kitchen.')
    expect(html).toContain('Keep this additional CMS introduction copy.')
    expect(html).toContain('<h2 id="contact-enquiry-heading">Your enquiry</h2>')
    expect(html).toContain('Required unless marked optional.')
    expect(html).not.toContain('Meet the founders')
    expect(html).toContain('aria-label="Contact form"')
    expect(html).not.toMatch(/mailto:|@[^\s<]+\.[^\s<]+/u)
  })

  it('creates a distinct request id for each rendered visitor', async () => {
    renderToStaticMarkup(await ContactPage())
    renderToStaticMarkup(await ContactPage())

    expect(mocks.formRequestIds).toHaveLength(2)
    expect(mocks.formRequestIds[0]).not.toBe(mocks.formRequestIds[1])
    expect(mocks.formRequestIds[0]).toMatch(/^[0-9a-f-]{36}$/u)
  })

  it('returns not found when the CMS page is missing', async () => {
    mocks.page.mockResolvedValue(null)

    await expect(ContactPage()).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('uses CMS metadata and marks preview metadata noindex', async () => {
    await expect(generateMetadata()).resolves.toMatchObject({
      title: 'Contact the team',
      description: 'Send a message to Passe Culinaire.',
      robots: { index: true, follow: true },
    })

    mocks.page.mockResolvedValue({ ...contactModel, preview: true })
    await expect(generateMetadata()).resolves.toMatchObject({
      robots: { index: false, follow: false },
    })
    expect(renderToStaticMarkup(await ContactPage())).toContain('href="/api/preview?exit=1"')
    expect(dynamic).toBe('force-dynamic')
  })
})
