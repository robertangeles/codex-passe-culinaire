import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createElement } from 'react'
import { ImageResponse } from 'next/og'
import { getPublicDocument } from '../../../../../lib/public-content'
import { PUBLIC_EXPORT_CACHE } from '../../../../../lib/export-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FONT_PATH = join(process.cwd(), 'src', 'fonts', 'fraunces-og.ttf')
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

export type OgRouteContext = { params: Promise<{ slug: string }> }

function validSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

function imageTitle(metaTitle: string | null | undefined, title: string): string {
  const chosen = metaTitle?.trim() || title.trim()
  if (chosen.length <= 60) return chosen
  const prefix = chosen.slice(0, 59)
  const lastSpace = prefix.lastIndexOf(' ')
  return `${prefix.slice(0, lastSpace > 35 ? lastSpace : 59).trimEnd()}…`
}

function fontSize(title: string): number {
  if (title.length > 46) return 54
  if (title.length > 32) return 66
  return 78
}

export async function GET(_request: Request, { params }: OgRouteContext): Promise<Response> {
  const { slug } = await params
  if (!validSlug(slug)) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })

  const post = await getPublicDocument('posts', slug)
  if (!post) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })

  const title = imageTitle(post.seo?.metaTitle, post.title)
  const font = await readFile(FONT_PATH)
  const fontData = font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer
  const tree = createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '72px 80px',
      backgroundColor: '#F4F1EA',
      color: '#1A1A18',
    },
  },
  createElement('div', { style: { display: 'flex', fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase' } }, 'Passe Culinaire'),
  createElement('div', {
    style: { display: 'flex', maxWidth: '1000px', fontFamily: 'Fraunces', fontSize: fontSize(title), fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.03em', overflow: 'hidden' },
  }, title),
  createElement('div', { style: { display: 'flex', width: 96, height: 2, backgroundColor: '#8A8A82' } }),
  )
  const response = new ImageResponse(tree, {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    fonts: [{ name: 'Fraunces', data: fontData, weight: 400, style: 'normal' }],
  })
  response.headers.set('Cache-Control', PUBLIC_EXPORT_CACHE)
  return response
}
