import type { Cta } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import styles from './CTABlock.module.css'

type CTABlockProps = {
  block: Cta
}

export function CTABlock({ block }: CTABlockProps) {
  const href = safePublicHref(block.url)
  const label = block.label?.trim()

  return (
    <EditorialSection>
      <p className={styles.statement}>{block.statement}</p>
      {href && label && <a className={styles.link} href={href}>{label}</a>}
    </EditorialSection>
  )
}
