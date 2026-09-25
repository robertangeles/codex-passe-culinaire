import Link from 'next/link'
import type { Event, UpcomingEvents } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import styles from './UpcomingEventsBlock.module.css'

type UpcomingEventsBlockProps = {
  block: UpcomingEvents
  events: Event[]
}

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'long',
  timeZone: 'Australia/Melbourne',
  timeZoneName: 'short',
  year: 'numeric',
})

function getLimit(value: UpcomingEvents['limit']): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 3
  return Math.min(12, Math.max(1, Math.trunc(value)))
}

function getStartDate(value: Event['startDate']): { dateTime: string; label: string } | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined

  return { dateTime: date.toISOString(), label: dateFormatter.format(date) }
}

export function UpcomingEventsBlock({ block, events }: UpcomingEventsBlockProps) {
  const heading = block.heading?.trim() || 'Training'
  const entries = events
    .filter((event) => event._status === 'published'
      && (event.eventStatus === 'upcoming' || event.eventStatus === 'sold-out'))
    .flatMap((event) => {
      const start = getStartDate(event.startDate)
      if (!start || !event.slug?.trim() || !event.title.trim()) return []

      const href = safePublicHref(`/training/${encodeURIComponent(event.slug)}`)
      return href ? [{ event, href, start }] : []
    })
    .slice(0, getLimit(block.limit))

  return (
    <EditorialSection wide>
      <div className={styles.events}>
        <h2 className={styles.heading}>{heading}</h2>
        {entries.length > 0 ? (
          <ul className={styles.entries}>
            {entries.map(({ event, href, start }) => {
              const venue = event.venue?.online
                ? 'Online'
                : event.venue?.name?.trim()
              const summary = event.descriptionSummary?.trim()

              return (
                <li className={styles.entry} key={event.id}>
                  <div className={styles.copy}>
                    <h3 className={styles.title}>
                      <a className={styles.link} href={href}>{event.title}</a>
                    </h3>
                    {summary && <p className={styles.summary}>{summary}</p>}
                    <time className={styles.date} dateTime={start.dateTime}>{start.label}</time>
                    {venue && <p className={styles.venue}>{venue}</p>}
                  </div>
                  {event.eventStatus === 'sold-out' && <p className={styles.status}>Sold out</p>}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p>There are no upcoming training dates.</p>
            <Link className={styles.contact} href="/contact" prefetch={false}>Ask about training</Link>
          </div>
        )}
      </div>
    </EditorialSection>
  )
}
