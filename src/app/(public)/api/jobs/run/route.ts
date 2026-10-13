import { timingSafeEqual } from 'node:crypto'
import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const batchLimit = 20
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Authorization' }

const json = (body: Record<string, number | string>, status: number): Response => Response.json(
  body,
  { status, headers: privateHeaders },
)

const isAuthorised = (request: Request, secret: string): boolean => {
  const match = /^Bearer ([^\s]+)$/u.exec(request.headers.get('authorization') ?? '')
  if (!match) return false

  const expectedBytes = Buffer.from(secret)
  const suppliedBytes = Buffer.from(match[1])
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes)
}

type JobRunSummary = {
  processed: number
  succeeded: number
  retryable: number
  failed: boolean
}

const summarise = (results: Array<{
  jobStatus?: Record<string, { status: string }>
  remainingJobsFromQueried: number
}>): JobRunSummary => {
  let processed = 0
  let succeeded = 0
  let retryable = 0
  let failed = false

  for (const result of results) {
    for (const job of Object.values(result.jobStatus ?? {})) {
      processed += 1
      if (job.status === 'success') succeeded += 1
      else {
        failed = true
        if (job.status === 'error') retryable += 1
      }
    }
  }

  return { processed, succeeded, retryable, failed }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret) return json({ error: 'Job runner is not configured.' }, 503)
  if (!isAuthorised(request, secret)) return json({ error: 'Unauthorised.' }, 401)

  try {
    const payload = await getPayload({ config })
    const req = await createLocalReq({ req: { headers: request.headers, url: request.url } }, payload)
    const run = payload.jobs.run.bind(payload.jobs)
    const options = { allQueues: true, limit: batchLimit, overrideAccess: true, req }
    const results = [await run(options), await run(options)]
    const summary = summarise(results)
    const response = {
      processed: summary.processed,
      succeeded: summary.succeeded,
      retryable: summary.retryable,
    }

    if (summary.failed) return json(response, 503)
    return json(response, 200)
  } catch {
    return json({ error: 'Jobs are temporarily unavailable.' }, 503)
  }
}
