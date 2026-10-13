import type { Faq } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import { RichText } from '../RichText'
import styles from './FAQBlock.module.css'

type FAQBlockProps = {
  block: Faq
  externalEmbedsEnabled?: boolean
}

export function FAQBlock({ block, externalEmbedsEnabled = false }: FAQBlockProps) {
  const items = (block.items ?? []).filter((item) => item.question.trim().length > 0)
  if (items.length === 0) return null

  return (
    <EditorialSection>
      <div className={styles.items}>
        {items.map((item, index) => (
          <article className={styles.item} key={item.id ?? `${index}-${item.question}`}>
            <h2 className={styles.question}>{item.question}</h2>
            {item.answer && (
              <RichText data={item.answer} externalEmbedsEnabled={externalEmbedsEnabled} />
            )}
          </article>
        ))}
      </div>
    </EditorialSection>
  )
}
