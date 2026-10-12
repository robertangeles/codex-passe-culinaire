import { createHmac } from 'node:crypto'
import type { Payload } from 'payload'

export type ContactInput = {
  requestId: string
  name: string
  email: string
  venue?: string
  role: 'chef' | 'owner' | 'manager' | 'other'
  need: 'training' | 'advisory' | 'culinaire-kitchen' | 'press' | 'other'
  message: string
}

export class ContactValidationError extends Error {
  constructor(message: string, readonly field: keyof ContactInput) {
    super(message)
    this.name = 'ContactValidationError'
  }
}

const roles = new Set(['chef', 'owner', 'manager', 'other'])
const needs = new Set(['training', 'advisory', 'culinaire-kitchen', 'press', 'other'])

export function validateContact(input: unknown): ContactInput {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const requestId = typeof record.requestId === 'string' ? record.requestId : ''
  const name = typeof record.name === 'string' ? record.name.trim() : ''
  const email = typeof record.email === 'string' ? record.email.trim().toLowerCase() : ''
  const venue = typeof record.venue === 'string' ? record.venue.trim() : ''
  const message = typeof record.message === 'string' ? record.message.trim() : ''
  const role = typeof record.role === 'string' && roles.has(record.role) ? record.role as ContactInput['role'] : undefined
  const need = typeof record.need === 'string' && needs.has(record.need) ? record.need as ContactInput['need'] : undefined
  if (!/^[a-f0-9-]{36}$/.test(requestId)) throw new ContactValidationError('Please refresh the form and try again.', 'requestId')
  if (!name || name.length > 120) throw new ContactValidationError('Add your name, up to 120 characters.', 'name')
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ContactValidationError('Add a valid reply email.', 'email')
  if (venue.length > 160) throw new ContactValidationError('Keep the venue name under 160 characters.', 'venue')
  if (!role) throw new ContactValidationError('Choose your role.', 'role')
  if (!need) throw new ContactValidationError('Choose a topic.', 'need')
  if (!message || message.length > 5000) throw new ContactValidationError('Add a message, up to 5000 characters.', 'message')
  return { requestId, name, email, venue, role, need, message }
}

/** Server route supplies a trusted peer IP and a validated ContactInput. This helper never accepts delivery fields. */
export async function submitContact(payload: Payload, rawInput: unknown, peerIp: string): Promise<{ id: number | string; deliveryStatus: 'saved' | 'emailed' | 'failed' }> {
  const input = validateContact(rawInput)
  const prior = await payload.find({ collection: 'form-submissions', overrideAccess: true, limit: 1,
    where: { requestId: { equals: input.requestId } } })
  if (prior.docs[0]) return { id: prior.docs[0].id, deliveryStatus: prior.docs[0].deliveryStatus === 'emailed' ? 'emailed' : prior.docs[0].deliveryStatus === 'failed' ? 'failed' : 'saved' }

  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('Contact form is not configured.')
  const sourceHash = createHmac('sha256', secret).update(peerIp).digest('hex')
  const recent = await payload.count({ collection: 'form-submissions', overrideAccess: true,
    where: { and: [{ sourceHash: { equals: sourceHash } }, { createdAt: { greater_than: new Date(Date.now() - 3600000).toISOString() } }] } })
  if (recent.totalDocs >= 5) throw new Error('Too many messages. Try again later.')
  const forms = await payload.find({ collection: 'forms', overrideAccess: true, limit: 1, where: { key: { equals: 'contact' } } })
  const form = forms.docs[0]
  if (!form?.enabled) throw new Error('Contact is unavailable right now.')

  let saved
  try {
    saved = await payload.create({ collection: 'form-submissions', overrideAccess: true, data: {
      form: form.id, requestId: input.requestId, sourceHash, name: input.name,
      email: input.email, venue: input.venue, role: input.role, need: input.need,
      message: input.message, deliveryStatus: 'saved',
    } })
  } catch (error) {
    const existing = await payload.find({ collection: 'form-submissions', overrideAccess: true, limit: 1,
      where: { requestId: { equals: input.requestId } } })
    if (!existing.docs[0]) throw error
    return { id: existing.docs[0].id, deliveryStatus: existing.docs[0].deliveryStatus === 'emailed' ? 'emailed' : existing.docs[0].deliveryStatus === 'failed' ? 'failed' : 'saved' }
  }

  const recordStatus = async (data: { deliveryAttemptedAt?: string; deliveryStatus?: 'emailed' | 'failed'; deliveryError?: string; emailedAt?: string }): Promise<boolean> => {
    try {
      await payload.update({ collection: 'form-submissions', id: saved.id, overrideAccess: true, data })
      return true
    } catch {
      payload.logger.error({ submissionId: saved.id }, 'Contact delivery status could not be saved.')
      return false
    }
  }
  const configured = process.env.MAIL_PROVIDER === 'resend' ? Boolean(process.env.RESEND_API_KEY) : Boolean(process.env.SMTP_HOST)
  const recipients = (process.env.CONTACT_TO_ADDRESS ?? '').split(',').map((address) => address.trim())
  const validRecipients = recipients.length <= 2 && recipients.every((address) => /^[^\s,@]+@[^\s,@]+\.[^\s,@]+$/.test(address))
  const attemptedAt = new Date().toISOString()
  if (!configured || !validRecipients) {
    const recorded = await recordStatus({ deliveryAttemptedAt: attemptedAt, deliveryStatus: 'failed', deliveryError: 'Email delivery is not configured.' })
    return { id: saved.id, deliveryStatus: recorded ? 'failed' : 'saved' }
  }
  if (!(await recordStatus({ deliveryAttemptedAt: attemptedAt }))) return { id: saved.id, deliveryStatus: 'saved' }
  let sent = false
  try {
    await payload.sendEmail({ to: recipients, replyTo: input.email,
      subject: 'New Passe Culinaire contact message',
      text: `Name: ${input.name}\nEmail: ${input.email}\nVenue: ${input.venue}\nRole: ${input.role}\nTopic: ${input.need}\n\n${input.message}`,
    })
    sent = true
  } catch {
    // The persisted enquiry remains available for a manual reply.
  }
  if (sent) {
    const recorded = await recordStatus({ deliveryStatus: 'emailed', emailedAt: new Date().toISOString() })
    return { id: saved.id, deliveryStatus: recorded ? 'emailed' : 'saved' }
  }
  const recorded = await recordStatus({ deliveryStatus: 'failed', deliveryError: 'Email provider rejected delivery.' })
  return { id: saved.id, deliveryStatus: recorded ? 'failed' : 'saved' }
}
