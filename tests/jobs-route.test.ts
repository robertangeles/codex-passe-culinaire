import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createLocalReq: vi.fn(),
  getPayload: vi.fn(),
  run: vi.fn(),
}))

vi.mock('payload', () => ({
  createLocalReq: mocks.createLocalReq,
  getPayload: mocks.getPayload,
}))
vi.mock('@payload-config', () => ({ default: {} }))

import { POST } from '../src/app/(public)/api/jobs/run/route'

const secret = 'test-cron-secret-should-not-leak'
const localRequest = { payloadRequest: true }

function request(authorization?: string, url = 'https://example.test/api/jobs/run', body?: string): Request {
  const headers = new Headers()
  if (authorization) headers.set('Authorization', authorization)
  return new Request(url, { method: 'POST', headers, body })
}

describe('authenticated jobs runner route', () => {
  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', secret)
    mocks.createLocalReq.mockResolvedValue(localRequest)
    mocks.getPayload.mockResolvedValue({ jobs: { run: mocks.run } })
    mocks.run.mockResolvedValue({ jobStatus: {}, remainingJobsFromQueried: 0 })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('returns 503 when no server secret is configured', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const response = await POST(request(`Bearer ${secret}`))

    expect(response.status).toBe(503)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(mocks.getPayload).not.toHaveBeenCalled()
  })

  it('checks missing or wrong credentials before initializing Payload', async () => {
    for (const authorization of [undefined, `Bearer ${secret}x`, `bearer ${secret}`, `Bearer ${secret} extra`]) {
      const response = await POST(request(authorization))
      expect(response.status).toBe(401)
      expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    }

    expect(mocks.getPayload).not.toHaveBeenCalled()
  })

  it('drains two bounded batches across all queues and reports counts only', async () => {
    mocks.run
      .mockResolvedValueOnce({ jobStatus: { a: { status: 'success' }, b: { status: 'success' } }, remainingJobsFromQueried: 0 })
      .mockResolvedValueOnce({ jobStatus: { c: { status: 'success' } }, remainingJobsFromQueried: 0 })
    const response = await POST(request(`Bearer ${secret}`, 'https://example.test/api/jobs/run?jobid=private&collection=users', '{"jobid":"secret-id","collection":"private"}'))

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(response.headers.get('Vary')).toBe('Authorization')
    const responseData = await response.json()
    expect(responseData).toEqual({ processed: 3, succeeded: 3, retryable: 0 })
    expect(mocks.getPayload).toHaveBeenCalledOnce()
    expect(mocks.createLocalReq).toHaveBeenCalledWith({ req: expect.objectContaining({ url: expect.stringContaining('/api/jobs/run') }) }, expect.anything())
    expect(mocks.run).toHaveBeenCalledTimes(2)
    for (const [options] of mocks.run.mock.calls) {
      expect(options).toMatchObject({ allQueues: true, limit: 20, overrideAccess: true, req: localRequest })
      expect(options).not.toHaveProperty('id')
      expect(options).not.toHaveProperty('where')
    }
    const body = JSON.stringify(responseData)
    expect(body).not.toContain(secret)
    expect(body).not.toContain('private')
    expect(body).not.toContain('secret-id')
  })

  it('returns 503 with safe counts when a job fails', async () => {
    mocks.run
      .mockResolvedValueOnce({ jobStatus: { a: { status: 'error' } }, remainingJobsFromQueried: 1 })
      .mockResolvedValueOnce({ jobStatus: {}, remainingJobsFromQueried: 0 })
    const response = await POST(request(`Bearer ${secret}`))

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ processed: 1, succeeded: 0, retryable: 1 })
  })

  it('returns a calm 503 on Payload initialization, request construction, or runner errors', async () => {
    mocks.getPayload.mockRejectedValueOnce(new Error(`database ${secret}`))
    let response = await POST(request(`Bearer ${secret}`))
    expect(response.status).toBe(503)
    expect(await response.text()).toBe(JSON.stringify({ error: 'Jobs are temporarily unavailable.' }))

    mocks.getPayload.mockResolvedValue({ jobs: { run: mocks.run } })
    mocks.createLocalReq.mockRejectedValueOnce(new Error(`request ${secret}`))
    response = await POST(request(`Bearer ${secret}`))
    expect(response.status).toBe(503)
    expect(await response.text()).toBe(JSON.stringify({ error: 'Jobs are temporarily unavailable.' }))

    mocks.run.mockRejectedValueOnce(new Error(`runner ${secret}`))
    response = await POST(request(`Bearer ${secret}`))
    expect(response.status).toBe(503)
    const body = await response.text()
    expect(body).toBe(JSON.stringify({ error: 'Jobs are temporarily unavailable.' }))
    expect(body).not.toContain(secret)
  })
})
