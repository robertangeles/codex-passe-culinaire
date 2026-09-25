import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { expect, it } from 'vitest'

async function rehearsal(fail: boolean) {
  const directory = mkdtempSync(path.join(tmpdir(), 'passe-ready-'))
  const marker = path.join(directory, 'ready')
  writeFileSync(marker, 'stale')
  const requests: string[] = []
  const premature: string[] = []
  const server = createServer((request, response) => {
    requests.push(request.url || '')
    if (existsSync(marker)) premature.push(request.url || '')
    response.statusCode = fail && request.url === '/api/revalidate' ? 401 : 200
    response.end('fixture')
  })
  server.listen(0, '127.0.0.1'); await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected loopback port')
  try {
    const child = spawn(process.execPath, ['scripts/warm-release.mjs'], { env: { ...process.env, PORT: String(address.port), REVALIDATE_SECRET: 'fixture-secret', READINESS_FILE: marker }, stdio: 'ignore' })
    const [exit] = await once(child, 'exit')
    return { exit, requests, premature, marker: existsSync(marker) ? readFileSync(marker, 'utf8') : null }
  } finally { server.closeAllConnections(); server.close(); rmSync(directory, { recursive: true, force: true }) }
}

it('opens readiness only after invalidation and every warm route succeeds', async () => {
  const result = await rehearsal(false)
  expect(result.exit).toBe(0)
  expect(result.premature).toEqual([])
  expect(result.requests).toContain('/api/revalidate')
  expect(result.requests).toContain('/robots.txt')
  expect(result.marker).toBe('ready\n')
})

it('closes stale readiness and stays closed when invalidation fails', async () => {
  const result = await rehearsal(true)
  expect(result.exit).toBe(1)
  expect(result.marker).toBeNull()
  expect(result.requests).toEqual(['/api/health', '/api/revalidate'])
})
