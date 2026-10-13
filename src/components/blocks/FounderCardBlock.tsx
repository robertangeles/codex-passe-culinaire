import type { FounderCard, Media } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import { ResponsiveMedia } from '../ResponsiveMedia'
import { RichText } from '../RichText'
import styles from './FounderCardBlock.module.css'

type FounderCardBlockProps = {
  block: FounderCard
  priority?: boolean
  externalEmbedsEnabled?: boolean
}

function hasRenderablePortrait(portrait: FounderCard['portrait']): portrait is Media {
  return Boolean(
    portrait
    && typeof portrait === 'object'
    && typeof portrait.filename === 'string'
    && portrait.filename.length > 0
    && portrait.filename !== '.'
    && portrait.filename !== '..'
    && new TextEncoder().encode(portrait.filename).length <= 255
    && !/[/\\\x00-\x1f\x7f-\x9f]/u.test(portrait.filename)
    && typeof portrait.width === 'number'
    && Number.isFinite(portrait.width)
    && portrait.width > 0
    && typeof portrait.height === 'number'
    && Number.isFinite(portrait.height)
    && portrait.height > 0
    && typeof portrait.alt === 'string',
  )
}

export function FounderCardBlock({ block, priority = false, externalEmbedsEnabled = false }: FounderCardBlockProps) {
  const portrait = hasRenderablePortrait(block.portrait) ? block.portrait : undefined
  const links = (block.links ?? []).flatMap((link) => {
    const href = safePublicHref(link?.url)
    const label = link?.label?.trim()
    return href && label ? [{ href, label }] : []
  })
  const layoutClassName = portrait
    ? styles.layout
    : `${styles.layout} ${styles.withoutPortrait}`

  return (
    <EditorialSection wide>
      <article className={layoutClassName}>
        {portrait && (
          <div className={styles.portrait}>
            <ResponsiveMedia
              media={portrait}
              priority={priority}
              sizes="(min-width: 960px) 30vw, 100vw"
            />
          </div>
        )}
        <div className={styles.content}>
          <h2 className={styles.name}>{block.name}</h2>
          {block.title?.trim() && <p className={styles.title}>{block.title.trim()}</p>}
          {block.bio && <RichText data={block.bio} externalEmbedsEnabled={externalEmbedsEnabled} />}
          {links.length > 0 && (
            <ul className={styles.links}>
              {links.map((link, index) => (
                <li key={`${link.href}-${link.label}-${index}`}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </EditorialSection>
  )
}
