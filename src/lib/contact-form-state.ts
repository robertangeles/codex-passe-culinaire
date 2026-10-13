export type ContactField = 'name' | 'email' | 'venue' | 'role' | 'need' | 'message'
export type ContactFormValues = Record<ContactField, string>
export type ContactFormState = {
  requestId: string
  values: ContactFormValues
  errors: Partial<Record<ContactField, string>>
  status: 'idle' | 'invalid' | 'unavailable' | 'saved' | 'emailed' | 'failed'
  message?: string
  receipt?: string
}
export type ContactFormAction = (state: ContactFormState, data: FormData) => Promise<ContactFormState>
