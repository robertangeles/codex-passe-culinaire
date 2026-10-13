'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

import styles from './error.module.css'

type PublicErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PublicError({ reset }: PublicErrorProps) {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.focus()
  }, [])

  return (
    <main ref={mainRef} className={styles.main} id="main-content" tabIndex={-1}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Passe Culinaire</p>
        <h1 className={styles.heading}>This page is unavailable</h1>
        <p className={styles.message}>Please try again in a moment.</p>
        <div className={styles.actions}>
          <button className={styles.retry} onClick={reset} type="button">Try again</button>
          <Link className={styles.home} href="/" prefetch={false}>Return home</Link>
        </div>
      </div>
    </main>
  )
}
