import { afterEach, describe, expect, it, vi } from 'vitest'
import sharp from 'sharp'

const mocks = vi.hoisted(() => ({ getPublicDocument: vi.fn() }))

vi.mock('../src/lib/public-content', () => ({ getPublicDocument: mocks.getPublicDocument }))

import { GET } from '../src/app/(public)/journal/[slug]/og/route'

afterEach(() => {
  vi.clearAllMocks()
})

describe('journal OG image rendering', () => {
  it('renders the real local Fraunces font to a 1200 by 630 PNG', async () => {
    mocks.getPublicDocument.mockResolvedValue({
      title: 'A quiet kitchen note',
      slug: 'quiet-kitchen-note',
      seo: { metaTitle: null },
    })

    const response = await GET(new Request('https://example.test'), {
      params: Promise.resolve({ slug: 'quiet-kitchen-note' }),
    })
    const png = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(png).metadata()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    expect(metadata).toMatchObject({ format: 'png', width: 1200, height: 630 })
  })
})
