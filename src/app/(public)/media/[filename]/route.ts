import { getPayload } from 'payload'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import config from '@payload-config'

const variants = ['avif480', 'webp480', 'avif960', 'webp960', 'avif1440', 'webp1440', 'avif2400', 'webp2400'] as const
const unavailable = () => new Response('Media is temporarily unavailable.', { status: 503, headers: { 'Cache-Control': 'no-store' } })

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }): Promise<Response> {
  const { filename } = await params
  if (!filename || filename === '.' || filename === '..' || Buffer.byteLength(filename, 'utf8') > 255 || /[/\\\x00-\x1f\x7f-\x9f]/u.test(filename))
    return new Response('Invalid image address.', { status: 400 })

  try {
    const payload = await getPayload({ config })
    const media = await payload.find({
      collection: 'media', overrideAccess: false, depth: 0, limit: 1,
      where: { or: [
        { filename: { equals: filename } },
        ...variants.map((variant) => ({ [`sizes.${variant}.filename`]: { equals: filename } })),
      ] },
    })
    if (!media.docs.length) return new Response('Image not found.', { status: 404 })

    const record = media.docs[0]
    const original = record.filename === filename
    const match = original ? null : variants.find((variant) => record.sizes?.[variant]?.filename === filename)
    if (!original && !match) return new Response('Image not found.', { status: 404 })
    const mime = match ? record.sizes?.[match]?.mimeType : record.mimeType
    if (typeof mime !== 'string' || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(mime))
      return new Response('Image type is unavailable.', { status: 415 })

    if (process.env.MEDIA_STORAGE === 's3') {
      const base = process.env.S3_PUBLIC_BASE_URL
      if (!base || !/^https:\/\//.test(base)) return unavailable()
      return Response.redirect(`${base.replace(/\/$/, '')}/${encodeURIComponent(filename)}`, 302)
    }
    const base = path.resolve(/* turbopackIgnore: true */ process.env.MEDIA_DIR || './media')
    const location = path.join(/* turbopackIgnore: true */ base, filename)
    try {
      const file = await stat(/* turbopackIgnore: true */ location)
      if (!file.isFile()) return new Response('Image not found.', { status: 404 })
      return new Response(Readable.toWeb(createReadStream(/* turbopackIgnore: true */ location)) as ReadableStream, {
        headers: { 'Content-Type': mime, 'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400', 'Content-Length': String(file.size) },
      })
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
        return new Response('Image not found.', { status: 404 })
      throw error
    }
  } catch {
    return unavailable()
  }
}
