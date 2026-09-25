import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ContactFormState } from '../src/lib/contact-form-state'

const mocks = vi.hoisted(() => ({
  getPayload: vi.fn(),
  headers: vi.fn(),
  submitContact: vi.fn(),
}))

vi.mock('payload', () => ({ getPayload: mocks.getPayload }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('../src/lib/contact', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/lib/contact')>()
  return { ...original, submitContact: mocks.submitContact }
})

import { sendContactMessage } from '../src/app/(public)/contact/actions'

const requestId = '123e4567-e89b-42d3-a456-426614174000'
const submitted = {
  requestId,
  name: ' Alex Chef ',
  email: ' ALEX@example.com ',
  venue: ' The Kitchen ',
  role: 'chef',
  need: 'training',
  message: ' Please call after service. ',
}
const previousState: ContactFormState = {
  requestId: 'forged-previous-id',
  values: { name: 'Forged', email: 'forged@example.com', venue: '', role: '', need: '', message: '' },
  errors: {},
  status: 'emailed',
  message: 'forged prior state',
  receipt: 'forged receipt',
}

function formData(fields: Record<string, string | File> = submitted): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const headers = (values: Record<string, string> = {}) => new Headers(values)

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getPayload.mockResolvedValue({ payload: true })
  mocks.headers.mockResolvedValue(headers())
  mocks.submitContact.mockResolvedValue({ id: 'sub-42', deliveryStatus: 'saved' })
  delete process.env.TRUST_PROXY
})

afterEach(() => {
  delete process.env.TRUST_PROXY
})

describe('sendContactMessage', () => {
  it('validates before persistence and returns field errors with entered values', async () => {
    const fields = { ...submitted, email: 'bad-email' }
    const state = await sendContactMessage(previousState, formData(fields))

    expect(state).toMatchObject({
      requestId,
      values: { name: fields.name, email: fields.email, venue: fields.venue, role: fields.role, need: fields.need, message: fields.message },
      errors: { email: 'Add a valid reply email.' },
      status: 'invalid',
    })
    expect(state.message).toBe('Please check the highlighted fields.')
    expect(mocks.getPayload).not.toHaveBeenCalled()
    expect(mocks.submitContact).not.toHaveBeenCalled()
  })

  it('uses only named form fields and ignores forged delivery fields and previous state', async () => {
    const data = formData({ ...submitted, deliveryStatus: 'emailed', form: 'forged', sourceHash: 'attacker' })
    const state = await sendContactMessage(previousState, data)

    expect(state.status).toBe('saved')
    expect(state.requestId).toBe(requestId)
    expect(state.values.name).toBe(' Alex Chef ')
    expect(mocks.submitContact).toHaveBeenCalledWith(
      { payload: true },
      { requestId, name: 'Alex Chef', email: 'alex@example.com', venue: 'The Kitchen', role: 'chef', need: 'training', message: 'Please call after service.' },
      'untrusted-source',
    )
  })

  it('trusts only a valid configured proxy peer IP and never the forwarded-for header', async () => {
    process.env.TRUST_PROXY = 'true'
    mocks.headers.mockResolvedValue(headers({ 'x-passe-client-ip': '2001:db8::1', 'x-forwarded-for': '198.51.100.77' }))
    await sendContactMessage(previousState, formData())
    expect(mocks.submitContact.mock.calls[0]?.[2]).toBe('2001:db8::1')

    mocks.headers.mockResolvedValue(headers({ 'x-passe-client-ip': 'not-an-ip', 'x-forwarded-for': '198.51.100.77' }))
    await sendContactMessage(previousState, formData())
    expect(mocks.submitContact.mock.calls[1]?.[2]).toBe('untrusted-source')

    process.env.TRUST_PROXY = 'false'
    mocks.headers.mockResolvedValue(headers({ 'x-passe-client-ip': '198.51.100.8' }))
    await sendContactMessage(previousState, formData())
    expect(mocks.submitContact.mock.calls[2]?.[2]).toBe('untrusted-source')
  })

  it.each([
    ['saved', 'Your message has been saved.'],
    ['emailed', 'Your message has been saved and an email notification sent.'],
    ['failed', 'Your message has been saved. We could not send the email notification. You do not need to send it again.'],
  ] as const)('returns the actual %s delivery state and receipt', async (deliveryStatus, message) => {
    mocks.submitContact.mockResolvedValue({ id: 42, deliveryStatus })

    const state = await sendContactMessage(previousState, formData())

    expect(state).toMatchObject({ status: deliveryStatus, message, receipt: 'Reference 42', requestId })
  })

  it('returns unavailable for allowlisted operational errors and hides private failure details', async () => {
    mocks.submitContact.mockRejectedValueOnce(new Error('Too many messages. Try again later.'))
    const limited = await sendContactMessage(previousState, formData())
    expect(limited).toMatchObject({ status: 'unavailable', message: 'Too many messages. Try again later.' })

    mocks.getPayload.mockRejectedValueOnce(new Error('database password and connection string'))
    const failure = await sendContactMessage(previousState, formData())
    expect(failure).toMatchObject({
      status: 'unavailable',
      message: 'Your message could not be saved. Please try again.',
      requestId,
    })
    expect(failure.message).not.toContain('password')
    expect(failure.message).not.toContain('connection string')
  })

  it('replaces an invalid request ID while returning a calm refresh message', async () => {
    const state = await sendContactMessage(previousState, formData({ ...submitted, requestId: 'broken-id' }))
    expect(state.status).toBe('invalid')
    expect(state.message).toBe('Please refresh the form and try again.')
    expect(state.requestId).toMatch(/^[a-f0-9-]{36}$/)
    expect(state.requestId).not.toBe('broken-id')
    expect(mocks.getPayload).not.toHaveBeenCalled()
  })
})
