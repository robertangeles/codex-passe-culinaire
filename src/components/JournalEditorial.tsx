import Image from 'next/image'
import Link from 'next/link'
import type { Post } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import { isRenderableMedia, ResponsiveMedia } from './ResponsiveMedia'
import { JournalMasonry } from './JournalMasonry'
import styles from './JournalEditorial.module.css'

type JournalEditorialProps = {
  posts: Post[]
  title: string
  description: string
}

type ValidEntry = {
  post: Post
  href: string
}

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'long',
  timeZone: 'Australia/Melbourne',
})

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validEntries(posts: Post[]): ValidEntry[] {
  const seen = new Set<Post['id']>()
  return posts.flatMap((post) => {
    if (
      post._status !== 'published'
      || typeof post.id !== 'number'
      || seen.has(post.id)
      || typeof post.slug !== 'string'
      || !slugPattern.test(post.slug)
      || typeof post.title !== 'string'
      || !post.title.trim()
    ) return []

    const href = safePublicHref(`/journal/${encodeURIComponent(post.slug)}`)
    if (!href) return []
    seen.add(post.id)
    return [{ post, href }]
  })
}

function publishedDate(value: Post['publishedAt']): { dateTime: string; label: string } | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return { dateTime: date.toISOString(), label: dateFormatter.format(date) }
}

function authorNames(value: Post['authors']): string[] {
  return (value ?? []).flatMap((author) => {
    if (!author || typeof author !== 'object') return []
    const name = author.name
    return typeof name === 'string' && name.trim() ? [name.trim()] : []
  })
}

function categoryNames(value: Post['categories']): string[] {
  return (value ?? []).flatMap((category) => {
    if (!category || typeof category !== 'object') return []
    const name = category.name
    return typeof name === 'string' && name.trim() ? [name.trim()] : []
  })
}

function EntryCategory({ post, latest = false }: { post: Post; latest?: boolean }) {
  const categories = [...(latest ? ['Latest entry'] : []), ...categoryNames(post.categories)]
  return categories.length > 0
    ? <p className={styles.category}>{categories.join(' · ')}</p>
    : null
}

function EntryByline({ post }: { post: Post }) {
  const date = publishedDate(post.publishedAt)
  const authors = authorNames(post.authors)
  if (authors.length === 0 && !date) return null

  return (
    <p className={styles.byline}>
      {authors.length > 0 && <span>{authors.join(', ')}</span>}
      {date && <time dateTime={date.dateTime}>{date.label}</time>}
    </p>
  )
}

function Story({ entry, kind, index = 0 }: { entry: ValidEntry; kind: 'lead' | 'follower' | 'archive'; index?: number }) {
  const { post, href } = entry
  const image = kind === 'archive' || !isRenderableMedia(post.heroImage) ? null : post.heroImage
  const excerpt = typeof post.excerpt === 'string' ? post.excerpt.trim() : ''

  return (
    <li className={`${styles.story} ${styles[kind]}${image ? ` ${styles.withImage}` : ''}${kind === 'follower' ? ` ${styles[`follower${index + 1}`]}` : ''}`}>
      <article>
        {image && (
          <div className={styles.media}>
            <ResponsiveMedia
              media={image}
              priority={kind === 'lead'}
              sizes={kind === 'lead'
                ? '(min-width: 1600px) 720px, (min-width: 741px) 55vw, calc(100vw - 48px)'
                : '(min-width: 1600px) 600px, (min-width: 741px) 40vw, calc(100vw - 48px)'}
            />
          </div>
        )}
        <div className={styles.copy}>
          <EntryCategory post={post} latest={kind === 'lead'} />
          <h2 className={styles.storyTitle}><a href={href}>{post.title.trim()}</a></h2>
          {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
          <EntryByline post={post} />
          {kind !== 'archive' && <a className={styles.readLink} href={href}>Read the entry <span aria-hidden="true">↗</span></a>}
        </div>
      </article>
    </li>
  )
}

function EmptyJournal() {
  return (
    <section className={styles.empty} aria-labelledby="journal-empty-heading">
      <Image
        className={styles.emptyImage}
        src="/images/journal/kitchen-notebook.webp"
        width={1600}
        height={900}
        alt="Concept photograph of a kitchen notebook beside a prepared dish"
        sizes="(min-width: 1440px) 717px, (min-width: 741px) 55vw, calc(100vw - 48px)"
        preload
      />
      <div className={styles.emptyCopy}>
        <p className={styles.kicker}>The journal</p>
        <h2 id="journal-empty-heading">A place for kitchen notes.</h2>
        <p className={styles.emptyMessage}>There are no journal entries to read yet.</p>
        <div className={styles.emptyLinks}>
          <Link href="/about" prefetch={false}>About Passe Culinaire</Link>
          <Link href="/culinaire-kitchen" prefetch={false}>Explore CulinAIre Kitchen</Link>
        </div>
      </div>
    </section>
  )
}

export function JournalEditorial({ posts, title, description }: JournalEditorialProps) {
  const entries = validEntries(posts)
  const [lead, ...remaining] = entries
  const followers = remaining.slice(0, 4)
  const archive = remaining.slice(4)
  const safeTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Journal'
  const safeDescription = typeof description === 'string' ? description.trim() : ''

  return (
    <div className={styles.page}>
      <header className={styles.mast}>
        <div>
          <p className={styles.kicker}>Passe Culinaire · Journal</p>
          <h1>{safeTitle}</h1>
        </div>
        {safeDescription && (
          <div className={styles.intro}>
            <p>{safeDescription}</p>
            {entries.length > 0 && <a href="#journal-entries">Browse the entries <span aria-hidden="true">↓</span></a>}
          </div>
        )}
      </header>

      {lead ? (
        <div id="journal-entries" className={styles.entries}>
          <ul className={styles.leadList} aria-label="Latest journal entry">
            <Story entry={lead} kind="lead" />
          </ul>
          {followers.length > 0 && (
            <section className={styles.following} aria-labelledby="journal-following-heading">
              <div className={styles.sectionHeading}>
                <h2 id="journal-following-heading">Further reading</h2>
                <span>From the journal</span>
              </div>
              <JournalMasonry label="More journal entries">
                {followers.map((entry, index) => <Story key={entry.post.id} entry={entry} kind="follower" index={index} />)}
              </JournalMasonry>
            </section>
          )}
          {archive.length > 0 && (
            <section className={styles.archive} aria-label="Older journal entries">
              <ul className={styles.archiveList}>
                {archive.map((entry) => <Story key={entry.post.id} entry={entry} kind="archive" />)}
              </ul>
            </section>
          )}
        </div>
      ) : <EmptyJournal />}
    </div>
  )
}
