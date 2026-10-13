import type { JournalFeed, Post } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import { ResponsiveMedia } from '../ResponsiveMedia'
import styles from './JournalFeedBlock.module.css'

type JournalFeedBlockProps = {
  block: JournalFeed
  posts: Post[]
}

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'long',
  timeZone: 'Australia/Melbourne',
})

function getPublishedDate(value: Post['publishedAt']): { dateTime: string; label: string } | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined

  return { dateTime: date.toISOString(), label: dateFormatter.format(date) }
}

function getLimit(value: JournalFeed['limit']): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 3
  return Math.min(12, Math.max(1, Math.trunc(value)))
}

export function JournalFeedBlock({ block, posts }: JournalFeedBlockProps) {
  const heading = block.heading?.trim() || 'Journal'
  const entries = posts
    .filter((post) => post._status === 'published')
    .flatMap((post) => {
      if (!post.slug || !post.title.trim()) return []
      const href = safePublicHref(`/journal/${encodeURIComponent(post.slug)}`)
      return href ? [{ post, href }] : []
    })
    .slice(0, getLimit(block.limit))

  return (
    <EditorialSection wide>
      <div className={styles.feed}>
        <h2 className={styles.heading}>{heading}</h2>
        {entries.length > 0 ? (
          <ul className={styles.entries}>
            {entries.map(({ post, href }) => {
              const publishedDate = getPublishedDate(post.publishedAt)
              const image = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null

              return (
                <li className={`${styles.entry}${image ? ` ${styles.withImage}` : ''}`} key={post.id}>
                  <div className={styles.copy}>
                    <h3 className={styles.title}>
                      <a className={styles.link} href={href}>{post.title}</a>
                    </h3>
                    {post.excerpt?.trim() && <p className={styles.excerpt}>{post.excerpt}</p>}
                    {publishedDate && (
                      <time className={styles.date} dateTime={publishedDate.dateTime}>
                        {publishedDate.label}
                      </time>
                    )}
                  </div>
                  {image && (
                    <div className={styles.media}>
                      <ResponsiveMedia
                        media={image}
                        sizes="(min-width: 1600px) 500px, (min-width: 900px) 33vw, 100vw"
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={styles.empty}>There are no journal entries to read yet.</p>
        )}
      </div>
    </EditorialSection>
  )
}
