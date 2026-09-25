import type { PullQuote } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import styles from './PullQuoteBlock.module.css'

type PullQuoteBlockProps = {
  block: PullQuote
}

export function PullQuoteBlock({ block }: PullQuoteBlockProps) {
  return (
    <EditorialSection>
      <figure className={styles.figure}>
        <blockquote className={styles.quote}>
          <p className={styles.text}>{block.quote}</p>
        </blockquote>
        {block.attribution && <figcaption className={styles.attribution}>{block.attribution}</figcaption>}
      </figure>
    </EditorialSection>
  )
}
