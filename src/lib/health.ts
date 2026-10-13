import { Pool } from 'pg'

const responseDeadlineMs = 1_800

let pool: Pool | undefined
let probeInFlight: Promise<boolean> | undefined

function getPool(): Pool | undefined {
  const connectionString = process.env.DATABASE_URI
  if (!connectionString) return undefined
  if (pool) return pool

  pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 1_000,
    statement_timeout: 1_000,
    query_timeout: 1_500,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  })
  pool.on('error', () => {})
  return pool
}

function startProbe(database: Pool): Promise<boolean> {
  if (probeInFlight) return probeInFlight

  const probe = database.query('SELECT 1').then(
    () => true,
    () => false,
  )
  probeInFlight = probe
  void probe.then(() => {
    if (probeInFlight === probe) probeInFlight = undefined
  })
  return probe
}

function withinDeadline(probe: Promise<boolean>): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), responseDeadlineMs)
    void probe.then((healthy) => {
      clearTimeout(timer)
      resolve(healthy)
    })
  })
}

export async function databaseIsHealthy(): Promise<boolean> {
  try {
    const database = getPool()
    if (!database) return false
    return await withinDeadline(startProbe(database))
  } catch {
    return false
  }
}
