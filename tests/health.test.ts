import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  on: vi.fn(),
  options: undefined as unknown,
}))

vi.mock('pg', () => ({
  Pool: class {
    constructor(options: unknown) {
      mocks.options = options
    }

    query = mocks.query
    on = mocks.on
  },
}))

async function getRoute() {
  const route = await import('../src/app/(public)/api/health/route')
  return route.GET()
}

describe('health route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('DATABASE_URI', 'postgres://health-test@localhost/passe_culinaire_test')
    mocks.query.mockResolvedValue({ rows: [{ '?column?': 1 }] })
    mocks.on.mockReset()
    mocks.options = undefined
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns a no-store healthy response after SELECT 1', async () => {
    const response = await getRoute()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ status: 'ok' })
    expect(mocks.query).toHaveBeenCalledWith('SELECT 1')
    expect(mocks.options).toEqual({
      connectionString: 'postgres://health-test@localhost/passe_culinaire_test',
      max: 1,
      connectionTimeoutMillis: 1_000,
      statement_timeout: 1_000,
      query_timeout: 1_500,
      idleTimeoutMillis: 10_000,
      allowExitOnIdle: true,
    })
    expect(mocks.on).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('returns a sanitised unavailable response when the database rejects the probe', async () => {
    mocks.query.mockRejectedValueOnce(new Error('private database host and password'))
    const response = await getRoute()

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ status: 'unavailable' })
  })

  it('returns unavailable when DATABASE_URI is missing without creating a pool', async () => {
    vi.stubEnv('DATABASE_URI', '')
    const response = await getRoute()

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ status: 'unavailable' })
    expect(mocks.query).not.toHaveBeenCalled()
    expect(mocks.options).toBeUndefined()
  })

  it('bounds the response when the pool query never settles', async () => {
    vi.useFakeTimers()
    mocks.query.mockReturnValueOnce(new Promise(() => {}))
    const responsePromise = getRoute()
    await vi.advanceTimersByTimeAsync(1_800)
    const response = await responsePromise

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(await response.json()).toEqual({ status: 'unavailable' })
  })
})
