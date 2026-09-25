import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getPublicDocument: vi.fn(),
  image: vi.fn(),
}))

vi.mock('../src/lib/public-content', () => ({ getPublicDocument: mocks.getPublicDocument }))
vi.mock('next/og', () => ({
  ImageResponse: class extends Response {
    constructor(element: unknown, options: ResponseInit & { width: number; height: number; fonts?: Array<{ name: string; data: ArrayBuffer; weight?: number }> }) {
      mocks.image(element, options)
      super(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'image/png' } })
    }
  },
}))

import { GET } from '../src/app/(public)/journal/[slug]/og/route'

function post(title = 'A quiet kitchen note', metaTitle: string | null = null) {
  return {
    title,
    slug: 'quiet-kitchen-note',
    seo: { metaTitle },
  } as never
}

describe('journal post OG route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getPublicDocument.mockResolvedValue(post())
  })

  it('rejects malformed or oversized slugs without querying public content', async () => {
    for (const slug of ['../private', 'Upper-case', 'has space', 'a'.repeat(201)]) {
      const response = await GET(new Request('https://example.test'), { params: Promise.resolve({ slug }) })
      expect(response.status).toBe(404)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      expect(response.headers.get('Content-Type')).toContain('text/plain')
    }
    expect(mocks.getPublicDocument).not.toHaveBeenCalled()
    expect(mocks.image).not.toHaveBeenCalled()
  })

  it('returns a private-safe 404 for missing or unpublished posts', async () => {
    mocks.getPublicDocument.mockResolvedValue(null)
    const response = await GET(new Request('https://example.test'), { params: Promise.resolve({ slug: 'quiet-kitchen-note' }) })

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.text()).toBe('Not found')
    expect(mocks.getPublicDocument).toHaveBeenCalledWith('posts', 'quiet-kitchen-note')
    expect(mocks.image).not.toHaveBeenCalled()
  })

  it('uses the local Fraunces font and the public cache policy for a published post', async () => {
    const response = await GET(new Request('https://example.test'), { params: Promise.resolve({ slug: 'quiet-kitchen-note' }) })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=600, stale-while-revalidate=86400')
    expect(mocks.getPublicDocument).toHaveBeenCalledWith('posts', 'quiet-kitchen-note')
    const [element, options] = mocks.image.mock.calls[0] as [
      { props: { children: Array<{ props: { children?: string; style?: { fontFamily?: string } } }> } },
      { width: number; height: number; fonts: Array<{ name: string; data: ArrayBuffer; weight: number }> },
    ]
    expect(options.width).toBe(1200)
    expect(options.height).toBe(630)
    expect(options.fonts).toHaveLength(1)
    expect(options.fonts[0]).toMatchObject({ name: 'Fraunces', weight: 400 })
    expect(options.fonts[0].data.byteLength).toBeGreaterThan(1000)
    expect(element.props.children[1].props).toMatchObject({ children: 'A quiet kitchen note' })
    expect(element.props.children[1].props.style!.fontFamily).toBe('Fraunces')
  })

  it('prefers SEO title and shortens long titles for the image layout', async () => {
    mocks.getPublicDocument.mockResolvedValue(post('The editorial title', 'A much better social title'))
    await GET(new Request('https://example.test'), { params: Promise.resolve({ slug: 'quiet-kitchen-note' }) })
    let element = mocks.image.mock.calls[0][0] as { props: { children: Array<{ props: { children?: string; style?: { fontFamily?: string } } }> } }
    expect(element.props.children[1].props.children).toBe('A much better social title')

    vi.clearAllMocks()
    mocks.getPublicDocument.mockResolvedValue(post('A title that is deliberately much longer than sixty characters to test the clipping behaviour'))
    await GET(new Request('https://example.test'), { params: Promise.resolve({ slug: 'quiet-kitchen-note' }) })
    element = mocks.image.mock.calls[0][0] as { props: { children: Array<{ props: { children?: string; style?: { fontFamily?: string } } }> } }
    expect(element.props.children[1].props.children!.length).toBeLessThanOrEqual(60)
    expect(element.props.children[1].props.children).toMatch(/…$/u)
  })

  it('lets public content database errors reach the infrastructure error handler', async () => {
    mocks.getPublicDocument.mockRejectedValue(new Error('Database unavailable'))
    await expect(GET(new Request('https://example.test'), { params: Promise.resolve({ slug: 'quiet-kitchen-note' }) }))
      .rejects.toThrow('Database unavailable')
    expect(mocks.image).not.toHaveBeenCalled()
  })
})
