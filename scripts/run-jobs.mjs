const origin = process.env.NEXT_PUBLIC_SERVER_URL
const secret = process.env.CRON_SECRET
if (!origin || !secret) throw new Error('NEXT_PUBLIC_SERVER_URL and CRON_SECRET are required.')
const endpoint = new URL('/api/jobs/run', origin)
if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password)
  throw new Error('Use a valid server origin.')
try {
  const response = await fetch(endpoint, {
    method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(45000),
  })
  if (!response.ok) throw new Error(`Job runner returned HTTP ${response.status}.`)
  const result = await response.json()
  console.log(`Jobs processed: ${Number(result.processed) || 0}; succeeded: ${Number(result.succeeded) || 0}; retryable: ${Number(result.retryable) || 0}.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Job runner failed.')
  process.exitCode = 1
}
