import type { ReactNode } from 'react'

import styles from './EditorialSection.module.css'

type EditorialSectionProps = {
  children: ReactNode
  wide?: boolean
  className?: string
  id?: string
}

export function EditorialSection({
  children,
  wide = false,
  className,
  id,
}: EditorialSectionProps) {
  const sectionClassName = [styles.section, className].filter(Boolean).join(' ')
  const contentClassName = wide ? `${styles.content} ${styles.wide}` : styles.content

  return (
    <section className={sectionClassName} id={id}>
      <div className={styles.grid}>
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  )
}
