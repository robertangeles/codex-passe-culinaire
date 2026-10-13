import { RouteSchema } from '../../../../components/RouteSchema'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import type { Where } from 'payload'
import { notFound, permanentRedirect } from 'next/navigation'

import { TrainingEditorial } from '../../../../components/TrainingEditorial'
import { Pagination } from '../../../../components/Pagination'
import type { Event } from '../../../../payload-types'
import { listPublicContent, getPublicShell } from '../../../../lib/public-content'
import { safePublicHref } from '../../../../lib/urls'
import styles from './page.module.css'

export const revalidate = 600

const PAGE_SIZE = 12
const MAX_PAGE = 1000
const DESCRIPTION = 'Upcoming training dates and past sessions from Passe Culinaire.'

type PageProps = { params: Promise<{ page?: string[] }> }
type TrainingListing = Awaited<ReturnType<typeof getTrainingListing>>

function parseListingPage(value: string[] | undefined): number | null {
  if (value === undefined) return 1
  if (value.length !== 2 || value[0] !== 'page' || !/^[1-9][0-9]{0,3}$/u.test(value[1] ?? '')) return null
  const page = Number(value[1])
  return page <= MAX_PAGE ? page : null
}

const getTrainingListing = cache(async (page: number) => {
  const nowISO = new Date().toISOString()
  const upcomingWhere: Where = {
    and: [
      { or: [{ eventStatus: { not_in: ['past', 'cancelled'] } }, { eventStatus: { exists: false } }] },
      { or: [
        { endDate: { greater_than_equal: nowISO } },
        { and: [
          { endDate: { exists: false } },
          { or: [{ startDate: { greater_than_equal: nowISO } }, { startDate: { exists: false } }] },
        ] },
      ] },
    ],
  }
  const archiveWhere: Where = {
    or: [
      { eventStatus: { in: ['past', 'cancelled'] } },
      { endDate: { less_than: nowISO } },
      { and: [{ endDate: { exists: false } }, { startDate: { less_than: nowISO } }] },
    ],
  }
  const [upcoming, archive] = await Promise.all([
    listPublicContent('events', { page, limit: PAGE_SIZE, sort: ['startDate', 'id'], where: upcomingWhere }),
    listPublicContent('events', { page, limit: PAGE_SIZE, sort: ['-startDate', '-id'], where: archiveWhere }),
  ])
  return { upcoming, archive, totalPages: Math.max(upcoming.totalPages, archive.totalPages) }
})

async function getRouteListing(params: PageProps['params']): Promise<{ page: number; model: TrainingListing }> {
  const segments = (await params).page
  const page = parseListingPage(segments)
  if (page === null) notFound()
  if (page === 1 && segments !== undefined) permanentRedirect('/training')
  const model = await getTrainingListing(page)
  if (page > 1 && page > model.totalPages) notFound()
  return { page, model }
}

export async function generateStaticParams(): Promise<never[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await getRouteListing(params)
  return buildPageMetadata({ title: page > 1 ? `Training · Page ${page}` : 'Training', description: DESCRIPTION,
    path: page > 1 ? `/training/page/${page}` : '/training', settings: (await getPublicShell()).siteSettings }, siteOrigin())
}

function formatDate(value: Event['startDate'] | Event['endDate'], timezone: string): { iso: string; label: string } | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined
  try {
    return {
      iso: date.toISOString(),
      label: new Intl.DateTimeFormat('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
        timeZone: timezone, timeZoneName: 'short',
      }).format(date),
    }
  } catch {
    return {
      iso: date.toISOString(),
      label: new Intl.DateTimeFormat('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
        timeZone: 'Australia/Melbourne', timeZoneName: 'short',
      }).format(date),
    }
  }
}

function isPublishedEvent(event: Event): boolean {
  return event._status === 'published'
}

function EventList({ events }: { events: Event[] }) {
  const visibleEvents = events.filter(isPublishedEvent)
  if (visibleEvents.length === 0) return null
  return (
    <ul className={styles.events}>
      {visibleEvents.map((event) => {
        const slug = typeof event.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(event.slug)
          ? safePublicHref(`/training/${encodeURIComponent(event.slug)}`)
          : undefined
        const start = formatDate(event.startDate, event.timezone || 'Australia/Melbourne')
        const end = formatDate(event.endDate, event.timezone || 'Australia/Melbourne')
        const title = event.title.trim()
        const summary = event.descriptionSummary?.trim()
        const status = event.eventStatus === 'sold-out' ? 'Sold out'
          : event.eventStatus === 'cancelled' ? 'Cancelled'
            : event.eventStatus === 'past' ? 'Past' : undefined
        return (
          <li className={styles.event} key={event.id}>
            <div>
              <h3 className={styles.title}>{slug && title ? <Link href={slug} prefetch={false}>{title}</Link> : title}</h3>
              {summary && <p className={styles.summary}>{summary}</p>}
              {start ? <p className={styles.date}><time dateTime={start.iso}>{start.label}</time>{end && <> to <time dateTime={end.iso}>{end.label}</time></>}</p> : <p className={styles.date}>Date to confirm.</p>}
            </div>
            {status && <p className={styles.status}>{status}</p>}
          </li>
        )
      })}
    </ul>
  )
}

export default async function TrainingIndexPage({ params }: PageProps) {
  const { page, model } = await getRouteListing(params)
  const upcoming = model.upcoming.docs.filter(isPublishedEvent)
  const archive = model.archive.docs.filter(isPublishedEvent)
  const showEmptyState = page === 1 && upcoming.length === 0
  return (
    <main id="main-content" tabIndex={-1}>
      <RouteSchema path={page > 1 ? `/training/page/${page}` : '/training'} title={page > 1 ? `Training · Page ${page}` : 'Training'}
        parents={page > 1 ? [{ name: 'Training', path: '/training' }] : []} />
      <TrainingEditorial
        upcoming={<EventList events={upcoming} />}
        hasUpcoming={upcoming.length > 0}
        archive={<EventList events={archive} />}
        hasArchive={archive.length > 0}
        showEmptyState={showEmptyState}
        showProgrammeLink={page === 1}
        pagination={model.totalPages > 1 ? <Pagination basePath="/training" page={page} totalPages={model.totalPages} /> : undefined}
      />
    </main>
  )
}
