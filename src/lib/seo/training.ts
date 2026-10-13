import type { Event, Testimonial1, User } from '../../payload-types'
import { absolutePublicUrl, confirmedText, entityIds, isoDate, publicMediaUrl, type SchemaNode } from './core'

const validSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

const relatedEventId = (testimonial: Testimonial1): number | undefined => {
  const related = testimonial.relatedTo
  if (!related || related.relationTo !== 'events') return undefined
  const value = related.value
  return typeof value === 'number' ? value : value.id
}

type TrainingInstructor = Pick<User, 'name' | 'slug'> & Partial<Pick<User, 'publicProfile' | 'publicTitle' | 'noIndex'>>

const safeInstructor = (value: number | TrainingInstructor): TrainingInstructor | undefined => {
  if (typeof value === 'number' || value.publicProfile === false || value.noIndex === true || !validSlug(value.slug)) return undefined
  if (!confirmedText(value.name)) return undefined
  return value
}

export function buildTrainingGraph(event: Event, testimonials: Testimonial1[], origin: string, now = new Date()): SchemaNode[] {
  if (event._status !== 'published' || !validSlug(event.slug)) return []

  const url = new URL(`/training/${encodeURIComponent(event.slug)}`, origin).href
  const eventId = `${url}#event`
  const orgId = entityIds(origin).organisation
  const title = confirmedText(event.title)
  if (!title) return []

  const startDate = isoDate(event.startDate)
  const endDate = isoDate(event.endDate)
  const eventNode: SchemaNode = {
    '@type': event.type === 'course' ? ['Event', 'CourseInstance'] : 'Event',
    '@id': eventId,
    url,
    name: title,
    organizer: { '@id': orgId },
  }

  const description = confirmedText(event.descriptionSummary)
  if (description) eventNode.description = description
  if (startDate) eventNode.startDate = startDate
  if (endDate) eventNode.endDate = endDate
  const image = publicMediaUrl(event.heroImage, origin)
  if (image) eventNode.image = image

  if (event.eventStatus === 'cancelled') eventNode.eventStatus = 'https://schema.org/EventCancelled'
  else if (['upcoming', 'sold-out', 'past'].includes(event.eventStatus ?? '')) {
    eventNode.eventStatus = 'https://schema.org/EventScheduled'
  }

  const instructors = (event.instructors ?? []).map(safeInstructor).filter((person): person is TrainingInstructor => person !== undefined)
  if (instructors.length) {
    eventNode.performer = instructors.map((person) => ({ '@id': entityIds(origin).person(person.slug) }))
  }

  if (event.venue?.online === true) {
    eventNode.eventAttendanceMode = 'https://schema.org/OnlineEventAttendanceMode'
    eventNode.location = { '@type': 'VirtualLocation', url }
  } else {
    const placeName = confirmedText(event.venue?.name)
    const address = confirmedText(event.venue?.address)
    if (event.venue?.online === false || placeName || address) {
      eventNode.eventAttendanceMode = 'https://schema.org/OfflineEventAttendanceMode'
    }
    if (placeName || address) {
      const place: SchemaNode = { '@type': 'Place' }
      if (placeName) place.name = placeName
      if (address) place.address = address
      eventNode.location = place
    }
  }

  const startTimestamp = startDate ? Date.parse(startDate) : Number.NaN
  if (event.bookingUrl && Number.isFinite(startTimestamp) && startTimestamp > now.getTime()
    && (event.eventStatus === 'upcoming' || event.eventStatus === 'sold-out')) {
    const bookingUrl = absolutePublicUrl(event.bookingUrl, origin)
    if (bookingUrl) {
      eventNode.offers = {
        '@type': 'Offer',
        url: bookingUrl,
        availability: event.eventStatus === 'sold-out'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
      }
    }
  }

  const nodes: SchemaNode[] = [eventNode]

  if (instructors.length) {
    nodes.push(...instructors.map((person): SchemaNode => {
      const personUrl = new URL(`/journal/author/${encodeURIComponent(person.slug)}`, origin).href
      const personNode: SchemaNode = {
        '@type': 'Person',
        '@id': `${personUrl}#person`,
        url: personUrl,
        name: person.name,
      }
      const jobTitle = confirmedText(person.publicTitle)
      if (jobTitle) personNode.jobTitle = jobTitle
      return personNode
    }))
  }

  if (event.type === 'course') {
    const course: SchemaNode = {
      '@type': 'Course',
      '@id': `${url}#course`,
      url,
      name: title,
      provider: { '@id': orgId },
      hasCourseInstance: { '@id': eventId },
    }
    if (description) course.description = description
    nodes.push(course)
  }

  for (const testimonial of testimonials) {
    if (testimonial.published !== true || relatedEventId(testimonial) !== event.id) continue
    const body = confirmedText(testimonial.quote)
    const author = confirmedText(testimonial.name)
    if (!body || !author) continue
    nodes.push({
      '@type': 'Review',
      '@id': `${url}#review-${testimonial.id}`,
      itemReviewed: { '@id': eventId },
      reviewBody: body,
      author: { '@type': 'Person', name: author },
    })
  }

  return nodes
}
