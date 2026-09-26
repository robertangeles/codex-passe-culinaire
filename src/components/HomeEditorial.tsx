import type { Cta, FounderCard, ProductSpotlight } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import { ResponsiveMedia } from './ResponsiveMedia'
import { RichText } from './RichText'
import styles from './HomeEditorial.module.css'

export function HomeProduct({ block, externalEmbedsEnabled }: { block: ProductSpotlight; externalEmbedsEnabled: boolean }) {
  const webUrl = safePublicHref(block.webUrl)
  const appStoreUrl = safePublicHref(block.appStoreUrl)
  const image = typeof block.image === 'object' && !block.image?.placeholder ? block.image : null
  return (
    <section className={`${styles.section} ${styles.product}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>Our first offer</p>
        <h2 className={styles.heading}>{block.heading}</h2>
        {block.body && <RichText data={block.body} externalEmbedsEnabled={externalEmbedsEnabled} />}
        {webUrl && <a className={styles.link} href={webUrl}>Explore CulinAIre Kitchen</a>}
        {appStoreUrl && <a className={styles.link} href={appStoreUrl}>View on the App Store</a>}
      </div>
      {image ? <ResponsiveMedia media={image} sizes="(min-width: 741px) 44vw, 100vw" /> : (
        <div className={styles.prep}>
          <p className={styles.eyebrow}>An illustrative kitchen example</p>
          <h3>Two dishes.<br />One component.</h3>
          <dl>
            <div><dt>Lemon tart</dt><dd>Pâte sucrée</dd></div>
            <div><dt>Fruit tart</dt><dd>Pâte sucrée</dd></div>
            <div><dt>Shared preparation</dt><dd>One component to identify</dd></div>
          </dl>
          <p className={styles.caption}>A use-case explanation, not a product screen or a claim of time saved.</p>
        </div>
      )}
    </section>
  )
}

export function HomeFounders({ blocks, externalEmbedsEnabled }: { blocks: FounderCard[]; externalEmbedsEnabled: boolean }) {
  return (
    <section className={`${styles.section} ${styles.founders}`}>
      <div>
        <p className={styles.eyebrow}>The people behind the work</p>
        <h2 className={styles.heading}>{blocks.length === 2 && <>Two chefs.<br /></>}A shared<br />perspective.</h2>
      </div>
      {blocks.map((block, index) => (
        <article key={block.id ?? `${block.name}-${index}`}>
          {typeof block.portrait === 'object' && block.portrait && !block.portrait.placeholder && (
            <ResponsiveMedia media={block.portrait} sizes="(min-width: 741px) 25vw, 100vw" />
          )}
          <h3>{block.name}</h3>
          {block.title && <p className={styles.role}>{block.title}</p>}
          {block.bio && <RichText data={block.bio} externalEmbedsEnabled={externalEmbedsEnabled} />}
          {(block.links ?? []).map((link, linkIndex) => {
            const href = safePublicHref(link.url)
            return href && link.label?.trim() ? <a className={styles.link} key={link.id ?? linkIndex} href={href}>{link.label}</a> : null
          })}
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
