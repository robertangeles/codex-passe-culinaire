import type { Cta, FounderCard } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import { ResponsiveMedia } from './ResponsiveMedia'
import { RichText } from './RichText'
import { KitchenFilm } from './KitchenFilm'
import styles from './HomeEditorial.module.css'

export function HomeProduct() {
  return (
    <section className={`${styles.section} ${styles.product}`}>
      <KitchenFilm />
    </section>
  )
}

export function HomeFounders({ blocks, externalEmbedsEnabled }: { blocks: FounderCard[]; externalEmbedsEnabled: boolean }) {
  return (
    <section className={`${styles.section} ${styles.founders}`}>
      <div className={styles.foundersIntro}>
        <p className={styles.eyebrow}>The people behind the work</p>
        <h2 className={styles.heading}>{blocks.length === 2 && <>Two chefs.<br /></>}A shared perspective.</h2>
      </div>
      {blocks.map((block, index) => (
        <article key={block.id ?? `${block.name}-${index}`}>
          {typeof block.portrait === 'object' && block.portrait && !block.portrait.placeholder && (
            <ResponsiveMedia media={block.portrait} sizes="(min-width: 741px) 480px, 200vw" className={styles.portrait} />
          )}
          <div className={styles.founderCopy}>
            <h3>{block.name}</h3>
            {block.title && <p className={styles.role}>{block.title}</p>}
            {block.bio && <RichText data={block.bio} externalEmbedsEnabled={externalEmbedsEnabled} />}
            {(block.links ?? []).map((link, linkIndex) => {
              const href = safePublicHref(link.url)
              return href && link.label?.trim() ? <a className={styles.link} key={link.id ?? linkIndex} href={href}>{link.label}</a> : null
            })}
          </div>
        </article>
      ))}
    </section>
  )
}

export function HomeScope({ block }: { block: Cta }) {
  const href = safePublicHref(block.url)
  return (
    <section className={`${styles.section} ${styles.scope}`}>
      <h2>Kitchen tools.<br />Training.<br />Advisory.<br />Publishing.</h2>
      <div>
        <p>{block.statement}</p>
        {href && block.label?.trim() && <a className={styles.link} href={href}>{block.label}</a>}
      </div>
    </section>
  )
}
