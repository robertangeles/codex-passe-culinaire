'use server'

import { isIP } from 'node:net'
import { randomUUID } from 'node:crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ContactValidationError, submitContact, validateContact } from '../../../lib/contact'
import type { ContactField, ContactFormState } from '../../../lib/contact-form-state'

const formFields = ['name', 'email', 'venue', 'role', 'need', 'message'] as const satisfies readonly ContactField[]
const unavailableMessages = new Set([
  'Too many messages. Try again later.',
  'Contact is unavailable right now.',
])

function readString(data: FormData, field: string): string {
  const value = data.get(field)
  return typeof value === 'string' ? value : ''
}

function readValues(data: FormData): ContactFormState['values'] {
  return Object.fromEntries(formFields.map((field) => [field, readString(data, field)])) as ContactFormState['values']
}

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined
}

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = readValues(formData)
  const submittedRequestId = readString(formData, 'requestId')
  let requestId = submittedRequestId
  const rawInput = { ...values, requestId }

  let validated: ReturnType<typeof validateContact>
  try {
    validated = validateContact(rawInput)
  } catch (error) {
    if (error instanceof ContactValidationError) {
      if (error.field === 'requestId') requestId = randomUUID()
      return {
        requestId,
        values,
        errors: error.field === 'requestId' ? {} : { [error.field]: error.message },
        status: 'invalid',
        message: error.field === 'requestId' ? 'Please refresh the form and try again.' : 'Please check the highlighted fields.',
      }
    }
    return {
      requestId,
      values,
      errors: {},
      status: 'invalid',
      message: 'Please check the highlighted fields.',
    }
  }

  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()
    const forwardedPeer = requestHeaders.get('x-passe-client-ip')
    const peerIp = process.env.TRUST_PROXY === 'true' && forwardedPeer && isIP(forwardedPeer) !== 0
      ? forwardedPeer
      : 'untrusted-source'
    const result = await submitContact(payload, validated, peerIp)
    const receipt = `Reference ${result.id}`

    if (result.deliveryStatus === 'emailed') {
      return { requestId, values, errors: {}, status: 'emailed', message: 'Your message has been saved and an email notification sent.', receipt }
    }
    if (result.deliveryStatus === 'failed') {
      return { requestId, values, errors: {}, status: 'failed', message: 'Your message has been saved. We could not send the email notification. You do not need to send it again.', receipt }
    }
    return { requestId, values, errors: {}, status: 'saved', message: 'Your message has been saved.', receipt }
  } catch (error) {
    const message = errorMessage(error)
    if (message && unavailableMessages.has(message)) {
      return { requestId, values, errors: {}, status: 'unavailable', message }
    }
    return {
      requestId,
      values,
      errors: {},
      status: 'unavailable',
      message: 'Your message could not be saved. Please try again.',
    }
  }
}
