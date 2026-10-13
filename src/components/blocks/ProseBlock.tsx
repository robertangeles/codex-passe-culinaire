import type { Prose } from '../../payload-types'
import { EditorialSection } from '../EditorialSection'
import { RichText } from '../RichText'

type ProseBlockProps = {
  block: Prose
  externalEmbedsEnabled?: boolean
}

export function ProseBlock({ block, externalEmbedsEnabled = false }: ProseBlockProps) {
  if (!block.body || block.body.root.children.length === 0) return null

  return (
    <EditorialSection>
      <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />
    </EditorialSection>
  )
}
