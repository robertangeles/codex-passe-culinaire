import { LivePreviewRefresh } from '../../../components/LivePreviewRefresh'
import { buildPageMetadata } from '../../../lib/seo/metadata'
import { siteOrigin } from '../../../lib/seo/core'
import { JsonLd } from '../../../components/JsonLd'
import { buildPageGraph } from '../../../lib/seo/page'
import { randomUUID } from 'node:crypto'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ContactForm from '../../../components/ContactForm'
import { BlockRenderer } from '../../../components/BlockRenderer'
import { getPageViewModel } from '../../../lib/page-view-model'
import type { ContactFormValues } from '../../../lib/contact-form-state'
import { sendContactMessage } from './actions'
import styles from './page.module.css'

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

  const { page, preview, settings } = model
  return buildPageMetadata({ path: '/contact', title: page.title, seo: page.seo, preview, settings }, siteOrigin())
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
      {!preview && <JsonLd nodes={buildPageGraph(page, siteOrigin())} />}
      {preview && (
        <aside aria-label="Draft preview">
          <LivePreviewRefresh />
          <p>Draft preview</p>
          <Link href="/api/preview?exit=1" prefetch={false}>Exit preview</Link>
        </aside>
      )}
      <div className={styles.layout}>
        <div className={styles.intro}>
          <BlockRenderer
            blocks={page.layout}
            title={page.title}
            content={content}
            externalEmbedsEnabled={externalEmbedsEnabled}
          />
          <aside className={styles.founders} aria-label="About the founders">
            <p className={styles.location}>Passe Culinaire · Melbourne</p>
            <p className={styles.names}>Alex Charasse<br />Rob Angeles</p>
            <Link href="/about">Meet the founders</Link>
          </aside>
        </div>
        <section className={styles.formRegion} aria-labelledby="contact-enquiry-heading">
          <header className={styles.formHeader}>
            <h2 id="contact-enquiry-heading">Your enquiry</h2>
            <p>Required unless marked optional.</p>
          </header>
          <ContactForm initialState={initialState} action={sendContactMessage} />
        </section>
      </div>
    </main>
  )
}
