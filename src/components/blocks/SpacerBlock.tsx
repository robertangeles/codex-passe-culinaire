import type { Spacer } from '../../payload-types'
import styles from './SpacerBlock.module.css'

type SpacerSize = NonNullable<Spacer['size']>

const sizeClasses: Record<SpacerSize, string> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
}

type SpacerBlockProps = {
  block: Spacer
}

export function SpacerBlock({ block }: SpacerBlockProps) {
  const size = block.size ?? 'medium'

  return <div className={sizeClasses[size]} aria-hidden="true" />
}
