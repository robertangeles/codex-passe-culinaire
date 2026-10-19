import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import styles from './LegalPage.module.css'

export function LegalPage({ title, introduction, imageSrc, imageAlt, children }: {
  title: string
  introduction: string
  imageSrc: string
  imageAlt: string
  children: ReactNode
}) {
  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <div className={styles.hero}>
        <div className={styles.heading}>
          <Link href="/about">About Passe Culinaire</Link>
          <p className={styles.eyebrow}>Company information</p>
          <h1>{title}</h1>
          <p className={styles.introduction}>{introduction}</p>
          <p className={styles.updated}>Effective 15 October 2026</p>
        </div>
        <figure className={styles.heroImage}>
          <Image src={imageSrc} alt={imageAlt} width={1600} height={900} sizes="(max-width: 800px) 100vw, 50vw" loading="eager" fetchPriority="high" />
        </figure>
      </div>
      <article className={styles.content}>{children}</article>
    </main>
  )
}
