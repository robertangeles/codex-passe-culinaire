import { createReadStream } from 'node:fs'
import { mkdtemp, open, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

export const PUBLIC_EXPORT_CACHE = 'public, s-maxage=600, stale-while-revalidate=86400'

/** Complete database work before sending 200, without retaining a whole export in memory. */
export async function completedExportResponse(chunks: AsyncIterable<string>, contentType: string): Promise<Response> {
  const directory = await mkdtemp(path.join(tmpdir(), 'passe-export-'))
  const filename = path.join(directory, 'content')
  try {
    const file = await open(filename, 'wx', 0o600)
    try { for await (const chunk of chunks) await file.writeFile(chunk, 'utf8') }
    finally { await file.close() }
    const { size } = await stat(filename)
    const stream = createReadStream(filename)
    stream.once('close', () => { void rm(directory, { recursive: true, force: true }).catch(() => undefined) })
    return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
      headers: { 'Content-Type': contentType, 'Content-Length': String(size), 'Cache-Control': PUBLIC_EXPORT_CACHE },
    })
  } catch (error) {
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}
