import type { ReactNode } from 'react'
import Link from 'next/link'

import styles from './LegalPage.module.css'

export function LegalPage({ title, introduction, children }: { title: string; introduction: string; children: ReactNode }) {
  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <div className={styles.heading}>
        <Link href="/about">About Passe Culinaire</Link>
        <p className={styles.eyebrow}>Company information</p>
        <h1>{title}</h1>
        <p className={styles.introduction}>{introduction}</p>
        <p className={styles.updated}>Effective 15 October 2026</p>
      </div>
      <article className={styles.content}>{children}</article>
      <nav aria-label="Other company policy" className={styles.related}>
        <Link href="/about/privacy-policy">Privacy policy</Link>
        <Link href="/about/terms-and-conditions">Terms and conditions</Link>
      </nav>
    </main>
  )
}
