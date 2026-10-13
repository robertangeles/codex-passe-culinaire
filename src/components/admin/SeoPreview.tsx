'use client'

import { useFormFields } from '@payloadcms/ui'
import type { FormState } from 'payload'
import { buildCanonicalPreview, buildSeoPreview } from '@/lib/seo-preview'
import styles from './SeoPreview.module.css'

export type SeoPreviewProps = {
  publicOrigin?: string
  collection?: string
}

const valueAt = (fields: FormState, path: string): unknown => fields[path]?.value

export default function SeoPreview({ publicOrigin, collection }: SeoPreviewProps) {
  const fields = useFormFields(([currentFields]) => ({
    title: valueAt(currentFields, 'title'),
    metaTitle: valueAt(currentFields, 'seo.metaTitle'),
    metaDescription: valueAt(currentFields, 'seo.metaDescription'),
    excerpt: valueAt(currentFields, 'excerpt'),
    oneLiner: valueAt(currentFields, 'oneLiner'),
    descriptionSummary: valueAt(currentFields, 'descriptionSummary'),
    slug: valueAt(currentFields, 'slug'),
    noIndex: valueAt(currentFields, 'seo.noIndex'),
    canonicalUrl: valueAt(currentFields, 'seo.canonicalUrl'),
  }))
  const preview = buildSeoPreview(fields)
  const canonical = buildCanonicalPreview(publicOrigin, collection, fields.slug, fields.canonicalUrl)

  return (
    <section className={styles.preview} aria-labelledby="seo-preview-heading">
      <div className={styles.headingRow}>
        <h3 className={styles.heading} id="seo-preview-heading">Search preview</h3>
        <p className={preview.noIndex ? styles.excluded : styles.indexable}>
          {preview.noIndex ? 'Excluded from search indexing' : 'Eligible for search indexing'}
        </p>
      </div>

      <div className={styles.result}>
        {canonical ? <p className={styles.url}>{canonical}</p> : <p className={styles.url}>Public address appears when the page is saved.</p>}
        <p className={styles.resultTitle}>{preview.title || 'Search title will appear here'}</p>
        <p className={styles.description}>{preview.description || 'Search description will appear here'}</p>
      </div>

      <div className={styles.counters}>
        <span aria-label={`Title length: ${preview.titleLength} of 60 characters`}>
          Title {preview.titleLength}/60
        </span>
        <span aria-label={`Description length: ${preview.descriptionLength} of 160 characters`}>
          Description {preview.descriptionLength}/160
        </span>
      </div>

      {(preview.titleMissing || preview.titleOverLimit || preview.descriptionMissing || preview.descriptionOverLimit) && (
        <ul className={styles.messages}>
          {preview.titleMissing && <li>Add a search title or page title.</li>}
          {preview.titleOverLimit && <li>Search title is over 60 characters.</li>}
          {preview.descriptionMissing && <li>Add a search description or summary.</li>}
          {preview.descriptionOverLimit && <li>Search description is over 160 characters.</li>}
        </ul>
      )}
    </section>
  )
}
