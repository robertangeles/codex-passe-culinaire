'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { ContactField, ContactFormAction, ContactFormState } from '@/lib/contact-form-state'
import styles from './ContactForm.module.css'

type ContactFormProps = {
  initialState: ContactFormState
  action: ContactFormAction
}

const fields: Array<{ name: ContactField; label: string; required: boolean; type?: 'email' | 'text'; maxLength: number; autoComplete?: string }> = [
  { name: 'name', label: 'Your name', required: true, maxLength: 120, autoComplete: 'name' },
  { name: 'email', label: 'Email address', required: true, type: 'email', maxLength: 254, autoComplete: 'email' },
  { name: 'venue', label: 'Venue (optional)', required: false, maxLength: 160, autoComplete: 'organization' },
]

function fieldErrorId(field: ContactField): string {
  return `contact-${field}-error`
}

export default function ContactForm({ initialState, action }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState, '/contact')
  const summaryRef = useRef<HTMLDivElement>(null)
  const isDurablySaved = state.status === 'saved' || state.status === 'emailed' || state.status === 'failed'

  useEffect(() => {
    if (state.status !== 'idle') {
      summaryRef.current?.focus()
    }
  }, [state])

  if (isDurablySaved) {
    return (
      <div
        className={styles.saved}
        aria-labelledby="contact-saved-heading"
        ref={summaryRef}
        role="status"
        tabIndex={-1}
      >
        <h2 id="contact-saved-heading">Message received</h2>
        {state.message ? <p>{state.message}</p> : null}
        {state.receipt ? <p className={styles.receipt}>{state.receipt}</p> : null}
        <form action="/contact" method="get">
          <button className={styles.link} type="submit">Send another message</button>
        </form>
      </div>
    )
  }

  const hasAlert = state.status === 'invalid' || state.status === 'unavailable'

  return (
    <form className={styles.form} action={formAction}>
      <input type="hidden" name="requestId" value={state.requestId} />

      {hasAlert ? (
        <div
          className={styles.summary}
          id="contact-form-summary"
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
        >
          <p>{state.message || (state.status === 'invalid' ? 'Please check the highlighted fields.' : 'The message could not be processed right now.')}</p>
        </div>
      ) : null}

      {fields.map((field) => {
        const errorId = fieldErrorId(field.name)
        const error = state.errors[field.name]
        return (
          <div className={styles.field} key={field.name}>
            <label htmlFor={`contact-${field.name}`}>{field.label}</label>
            <input
              autoComplete={field.autoComplete}
              defaultValue={state.values[field.name]}
              id={`contact-${field.name}`}
              maxLength={field.maxLength}
              name={field.name}
              required={field.required}
              type={field.type ?? 'text'}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error ? <p className={styles.error} id={errorId}>{error}</p> : null}
          </div>
        )
      })}

      <div className={styles.field}>
        <label htmlFor="contact-role">Your role</label>
        <select
          defaultValue={state.values.role}
          key={state.values.role}
          id="contact-role"
          name="role"
          required
          aria-invalid={state.errors.role ? true : undefined}
          aria-describedby={state.errors.role ? fieldErrorId('role') : undefined}
        >
          <option value="">Select a role</option>
          <option value="chef">Chef</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="other">Other</option>
        </select>
        {state.errors.role ? <p className={styles.error} id={fieldErrorId('role')}>{state.errors.role}</p> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-need">What can we help with?</label>
        <select
          defaultValue={state.values.need}
          key={state.values.need}
          id="contact-need"
          name="need"
          required
          aria-invalid={state.errors.need ? true : undefined}
          aria-describedby={state.errors.need ? fieldErrorId('need') : undefined}
        >
          <option value="">Select a topic</option>
          <option value="training">Training</option>
          <option value="advisory">Advisory</option>
          <option value="culinaire-kitchen">CulinAIre Kitchen</option>
          <option value="press">Press</option>
          <option value="other">Other</option>
        </select>
        {state.errors.need ? <p className={styles.error} id={fieldErrorId('need')}>{state.errors.need}</p> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          defaultValue={state.values.message}
          id="contact-message"
          maxLength={5000}
          name="message"
          required
          rows={7}
          aria-invalid={state.errors.message ? true : undefined}
          aria-describedby={state.errors.message ? fieldErrorId('message') : undefined}
        />
        {state.errors.message ? <p className={styles.error} id={fieldErrorId('message')}>{state.errors.message}</p> : null}
      </div>

      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
