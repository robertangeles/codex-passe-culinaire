import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ContactForm from '../../../components/ContactForm'
import { BlockRenderer } from '../../../components/BlockRenderer'
import { EditorialSection } from '../../../components/EditorialSection'
import { getPageViewModel } from '../../../lib/page-view-model'
import type { ContactFormValues } from '../../../lib/contact-form-state'
import { sendContactMessage } from './actions'

export const dynamic = 'force-dynamic'

const emptyValues: ContactFormValues = {
  name: '',
  email: '',
  venue: '',
  role: '',
  need: '',
  message: '',
}

export async function generateMetadata(): Promise<Metadata> {
  const model = await getPageViewModel('contact')
  if (!model) return {}

  const { page, preview } = model
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || undefined,
    robots: preview
      ? { index: false, follow: false }
      : { index: page.seo?.noIndex !== true, follow: page.seo?.noFollow !== true },
  }
}

export default async function ContactPage() {
  const model = await getPageViewModel('contact')
  if (!model) notFound()

  const { page, content, preview, externalEmbedsEnabled } = model
  const initialState = {
    requestId: randomUUID(),
    values: emptyValues,
    errors: {},
    status: 'idle' as const,
  }

  return (
    <main id="main-content" tabIndex={-1}>
      {preview && (
        <aside aria-label="Draft preview">
          <p>Draft preview</p>
          <Link href="/api/preview?exit=1" prefetch={false}>Exit preview</Link>
        </aside>
      )}
      <BlockRenderer
        blocks={page.layout}
        title={page.title}
        content={content}
        externalEmbedsEnabled={externalEmbedsEnabled}
      />
      <EditorialSection>
        <h2>Send a message</h2>
        <ContactForm initialState={initialState} action={sendContactMessage} />
      </EditorialSection>
    </main>
  )
}
