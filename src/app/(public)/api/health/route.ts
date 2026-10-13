import { databaseIsHealthy } from '../../../../lib/health'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(): Promise<Response> {
  const healthy = await databaseIsHealthy()
  return Response.json(
    { status: healthy ? 'ok' : 'unavailable' },
    { status: healthy ? 200 : 503, headers },
  )
}
