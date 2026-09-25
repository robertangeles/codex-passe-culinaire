import { rmSync, writeFileSync } from 'node:fs'

// Run against loopback before admitting public traffic to a newly built release.
const secret = process.env.REVALIDATE_SECRET
const port = process.env.PORT || '3000'
if (!secret || !/^\d{1,5}$/.test(port)) throw new Error('Revalidation secret and a valid port are required.')
const origin = `http://127.0.0.1:${port}`
try {
  if (process.env.READINESS_FILE) rmSync(process.env.READINESS_FILE, { force: true })
  let ready = false
  for (let attempt = 0; attempt < 20; attempt++) {
    try { ready = (await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(2000) })).ok } catch { /* startup retry */ }
    if (ready) break
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  if (!ready) throw new Error('Application health did not become ready.')
  const invalidation = await fetch(`${origin}/api/revalidate`, {
    method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: 'site-settings', scope: 'global', documentId: 'release', broadInvalidation: true }),
    signal: AbortSignal.timeout(10000),
  })
  if (!invalidation.ok) throw new Error(`Release invalidation failed with HTTP ${invalidation.status}.`)
  for (const route of ['/', '/about', '/culinaire-kitchen', '/journal', '/contact', '/sitemap.xml', '/feed.xml', '/feed.json', '/llms.txt', '/llms-full.txt', '/robots.txt']) {
    const response = await fetch(origin + route, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`Release check failed: ${route} returned HTTP ${response.status}.`)
    await response.arrayBuffer()
  }
  if (process.env.READINESS_FILE) writeFileSync(process.env.READINESS_FILE, 'ready\n', { mode: 0o644 })
  console.log('Release cache invalidated and public routes warmed successfully.')
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Release warm-up failed.')
  process.exitCode = 1
}
