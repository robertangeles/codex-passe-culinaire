import type { PlainStatement } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import styles from './PlainStatementBlock.module.css'

type PlainStatementBlockProps = {
  block: PlainStatement
}

export function PlainStatementBlock({ block }: PlainStatementBlockProps) {
  return (
    <EditorialSection>
      <p className={styles.statement}>{block.statement}</p>
    </EditorialSection>
  )
}
