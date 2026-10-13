import { RouteSchema } from '../../../../components/RouteSchema'
import { TestimonialBlock } from '../../../../components/blocks/TestimonialBlock'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'
import { applySchemaOverride } from '../../../../lib/seo/page'
import { buildTrainingGraph } from '../../../../lib/seo/training'
import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'

import { HeroBlock } from '../../../../components/blocks/HeroBlock'
import { EditorialSection } from '../../../../components/EditorialSection'
import { RichText } from '../../../../components/RichText'
import type { Event, Media, User } from '../../../../payload-types'
import { getPublicDocument, getPublicShell, getPublicTestimonials } from '../../../../lib/public-content'
import { safePublicHref } from '../../../../lib/urls'
import styles from './page.module.css'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }> }

function isTrainingSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

function isPopulatedMedia(value: Event['heroImage']): value is Media {
  return typeof value === 'object' && value !== null
    && typeof value.filename === 'string'
    && value.filename.length > 0
    && typeof value.width === 'number' && Number.isFinite(value.width) && value.width > 0
    && typeof value.height === 'number' && Number.isFinite(value.height) && value.height > 0
    && typeof value.alt === 'string'
}

const getTrainingViewModel = cache(async (slug: string) => {
  const [event, shell] = await Promise.all([
    getPublicDocument('events', slug),
    getPublicShell(),
  ])
  if (!event || event._status !== 'published') return null
  return { event, settings: shell.siteSettings, testimonials: await getPublicTestimonials('events', event.id), externalEmbedsEnabled: shell.siteSettings.externalEmbedsEnabled === true }
})

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isTrainingSlug(slug)) notFound()

  const model = await getTrainingViewModel(slug)
  if (!model) notFound()

  const { event, settings } = model
  return buildPageMetadata({ path: `/training/${event.slug}`, title: event.title,
    description: event.descriptionSummary, seo: event.seo, heroImage: event.heroImage, settings }, siteOrigin())
}

function timeZoneFor(value: string | null | undefined): string {
  if (typeof value === 'string' && value.trim()) {
    try {
      new Intl.DateTimeFormat('en-AU', { timeZone: value }).format(new Date(0))
      return value
    } catch { /* Use Melbourne for invalid or unsupported zone names. */ }
  }
  return 'Australia/Melbourne'
}

function eventDate(value: string | null | undefined, timeZone: string): { iso: string; label: string } | undefined {
  if (typeof value !== 'string') return undefined
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return undefined
  const label = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(date)
  return { iso: date.toISOString(), label }
}

function statusLabel(status: Event['eventStatus']): string | undefined {
  switch (status) {
    case 'upcoming': return 'Upcoming'
    case 'sold-out': return 'Sold out'
    case 'past': return 'Past'
    case 'cancelled': return 'Cancelled'
    default: return undefined
  }
}

function isFutureDate(value: string | undefined): boolean {
  return value !== undefined && new Date(value).getTime() > Date.now()
}

function populatedInstructors(value: Event['instructors']): User[] {
  return (value ?? []).filter((instructor): instructor is User =>
    typeof instructor === 'object' && instructor !== null
    && typeof instructor.name === 'string' && instructor.name.trim().length > 0,
  )
}

export default async function TrainingDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (!isTrainingSlug(slug)) notFound()

  const model = await getTrainingViewModel(slug)
  if (!model) notFound()

  const { event, externalEmbedsEnabled, testimonials } = model
  const timezone = timeZoneFor(event.timezone)
  const start = eventDate(event.startDate, timezone)
  const end = eventDate(event.endDate, timezone)
  const canBook = event.eventStatus === 'upcoming' && isFutureDate(start?.iso)
  const bookingHref = canBook ? safePublicHref(event.bookingUrl) : undefined
  const media = isPopulatedMedia(event.heroImage) ? event.heroImage : undefined
  const instructors = populatedInstructors(event.instructors)
  const eventStatus = statusLabel(event.eventStatus)
  const venueName = event.venue?.name?.trim()
  const address = event.venue?.address?.trim()

  const graph = buildTrainingGraph(event, testimonials, siteOrigin()).map((node, index) => index === 0 ? applySchemaOverride(node, event.seo?.structuredDataOverride) : node)
  return (
    <main id="main-content" tabIndex={-1}>
      <RouteSchema path={`/training/${event.slug}`} title={event.title} parents={[{ name: 'Training', path: '/training' }]} nodes={graph} />
      <HeroBlock
        headingLevel={1}
        block={{
          blockType: 'hero',
          heading: event.title,
          summary: event.descriptionSummary || undefined,
          style: media ? 'image' : 'quiet',
          image: media,
        }}
      />
      <EditorialSection wide>
        <div className={styles.layout}>
          <dl className={styles.details}>
            {eventStatus && (
              <div>
                <dt>Status</dt>
                <dd><span className={styles.status}>{eventStatus}</span></dd>
              </div>
            )}
            {event.type && <div><dt>Format</dt><dd>{event.type}</dd></div>}
            {start && <div><dt>Starts</dt><dd><time dateTime={start.iso}>{start.label}</time></dd></div>}
            {end && <div><dt>Ends</dt><dd><time dateTime={end.iso}>{end.label}</time></dd></div>}
            {event.venue?.online && <div><dt>Location</dt><dd>Online</dd></div>}
            {venueName && <div><dt>Venue</dt><dd>{venueName}</dd></div>}
            {address && <div><dt>Address</dt><dd>{address}</dd></div>}
            {event.price?.trim() && <div><dt>Price</dt><dd>{event.price}</dd></div>}
            {typeof event.capacity === 'number' && Number.isFinite(event.capacity) && event.capacity > 0
              && <div><dt>Capacity</dt><dd>{event.capacity}</dd></div>}
            {instructors.length > 0 && (
              <div>
                <dt>Instructors</dt>
                <dd>
                  <ul className={styles.instructors}>
                    {instructors.map((instructor) => {
                      const authorPath = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(instructor.slug)
                        ? safePublicHref(`/journal/author/${instructor.slug}`)
                        : undefined
                      return (
                        <li key={instructor.id}>
                          {authorPath ? <a href={authorPath}>{instructor.name}</a> : instructor.name}
                        </li>
                      )
                    })}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          {bookingHref && <p className={styles.booking}><a href={bookingHref}>Book a place</a></p>}
        </div>
      </EditorialSection>
      {event.description && (
        <EditorialSection>
          <div className={styles.description}>
            <RichText data={event.description} externalEmbedsEnabled={externalEmbedsEnabled} />
          </div>
        </EditorialSection>
      )}
      {testimonials.map(testimonial => <TestimonialBlock key={testimonial.id} block={{ blockType: 'testimonial', testimonial }} />)}
    </main>
  )
}
