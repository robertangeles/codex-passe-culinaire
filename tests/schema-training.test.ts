import { describe, expect, it } from 'vitest'
import type { Event, Testimonial1, User } from '../src/payload-types'
import { buildTrainingGraph } from '../src/lib/seo/training'

const publishedEvent: Event = {
  id: 21,
  title: 'Kitchen foundations',
  slug: 'kitchen-foundations',
  type: 'course',
  descriptionSummary: 'A practical course for kitchen teams.',
  startDate: '2027-03-12T09:00:00+11:00',
  endDate: '2027-03-12T16:00:00+11:00',
  timezone: 'Australia/Melbourne',
  venue: { name: 'The Test Kitchen', address: '12 Example Street, Melbourne', online: false },
  heroImage: { id: 44, alt: 'A cook preparing vegetables', filename: 'training-kitchen.webp', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  price: 'Free for selected venues',
  bookingUrl: '/contact',
  eventStatus: 'upcoming',
  _status: 'published',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const publicInstructor: User = {
  id: 8,
  name: 'Alex Chef',
  slug: 'alex-chef',
  role: 'editor',
  publicProfile: true,
  publicTitle: 'Chef educator',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'private@example.test',
  password: 'private-password',
  collection: 'users',
}

const testimonial: Testimonial1 = {
  id: 31,
  quote: 'The team used the new prep routine the next day.',
  name: 'Casey Owner',
  role: 'Owner',
  venue: 'Example Cafe',
  relatedTo: { relationTo: 'events', value: publishedEvent },
  published: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const detailNodes = (event: Event, reviews: Testimonial1[] = []) =>
  buildTrainingGraph(event, reviews, 'https://example.test', new Date('2026-01-01T00:00:00.000Z'))

describe('training JSON-LD graph', () => {
  it('builds stable course, event, physical venue, public instructor and matching review nodes', () => {
    const nodes = detailNodes({ ...publishedEvent, instructors: [publicInstructor] }, [
      testimonial,
      { ...testimonial, id: 32, published: false },
      { ...testimonial, id: 33, relatedTo: { relationTo: 'events', value: 999 } },
    ])
    const event = nodes.find((node) => Array.isArray(node['@type']) && node['@type'].includes('CourseInstance'))

    expect(event).toMatchObject({
      '@id': 'https://example.test/training/kitchen-foundations#event',
      '@type': ['Event', 'CourseInstance'],
      organizer: { '@id': 'https://example.test/#organisation' },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'The Test Kitchen', address: '12 Example Street, Melbourne' },
      image: 'https://example.test/media/training-kitchen.webp',
      startDate: '2027-03-11T22:00:00.000Z',
      endDate: '2027-03-12T05:00:00.000Z',
      offers: { '@type': 'Offer', url: 'https://example.test/contact', availability: 'https://schema.org/InStock' },
      performer: [{ '@id': 'https://example.test/journal/author/alex-chef#person' }],
    })
    expect(nodes.find((node) => node['@type'] === 'Course')).toMatchObject({
      '@id': 'https://example.test/training/kitchen-foundations#course',
      hasCourseInstance: { '@id': 'https://example.test/training/kitchen-foundations#event' },
    })
    expect(nodes.find((node) => node['@type'] === 'Person')).toMatchObject({
      '@id': 'https://example.test/journal/author/alex-chef#person', name: 'Alex Chef', jobTitle: 'Chef educator',
    })
    expect(nodes.filter((node) => node['@type'] === 'Review')).toHaveLength(1)
    expect(nodes.find((node) => node['@type'] === 'Review')).toMatchObject({
      '@id': 'https://example.test/training/kitchen-foundations#review-31',
      reviewBody: 'The team used the new prep routine the next day.',
      author: { '@type': 'Person', name: 'Casey Owner' },
      itemReviewed: { '@id': 'https://example.test/training/kitchen-foundations#event' },
    })
    expect(JSON.stringify(nodes)).not.toContain('private@example.test')
    expect(JSON.stringify(nodes)).not.toContain('private-password')
    expect(JSON.stringify(nodes)).not.toContain('aggregateRating')
    expect(JSON.stringify(nodes)).not.toContain('priceCurrency')
    expect(JSON.stringify(nodes)).not.toContain('Free for selected venues')
  })

  it('accepts public author projections without private publicProfile and keeps online events virtual', () => {
    const nodes = detailNodes({
      ...publishedEvent,
      type: 'workshop',
      venue: { online: true },
      instructors: [
        { name: 'Alex Chef', slug: 'alex-chef' } as User,
        { ...publicInstructor, id: 9, publicProfile: false },
        404,
      ],
    })
    expect(nodes[0]).toMatchObject({
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: { '@type': 'VirtualLocation', url: 'https://example.test/training/kitchen-foundations' },
    })
    expect(nodes.filter((node) => node['@type'] === 'Person')).toHaveLength(1)
    expect(nodes.find((node) => node['@type'] === 'Course')).toBeUndefined()
  })

  it('retains sold-out availability and omits booking offers for cancelled, past, invalid, or absent dates', () => {
    const soldOut = detailNodes({ ...publishedEvent, eventStatus: 'sold-out' })
    expect(soldOut[0]?.offers).toMatchObject({ availability: 'https://schema.org/SoldOut' })
    for (const status of ['cancelled', 'past'] as const) {
      const nodes = detailNodes({ ...publishedEvent, eventStatus: status })
      expect(nodes[0]?.offers).toBeUndefined()
      if (status === 'cancelled') expect(nodes[0]?.eventStatus).toBe('https://schema.org/EventCancelled')
      else expect(nodes[0]?.eventStatus).toBe('https://schema.org/EventScheduled')
    }
    expect(detailNodes({ ...publishedEvent, startDate: 'not-a-date' })[0]?.startDate).toBeUndefined()
    expect(detailNodes({ ...publishedEvent, startDate: null })[0]?.offers).toBeUndefined()
    expect(detailNodes({ ...publishedEvent, endDate: 'not-a-date' })[0]?.endDate).toBeUndefined()
    expect(detailNodes({ ...publishedEvent, heroImage: { ...publishedEvent.heroImage as Exclude<Event['heroImage'], number | null | undefined>, placeholder: true } })[0]?.image).toBeUndefined()
    expect(detailNodes({ ...publishedEvent, startDate: '2025-01-01T00:00:00.000Z' })[0]?.offers).toBeUndefined()
  })

  it('includes confirmed physical venue fields even when the online flag is absent', () => {
    const nodes = detailNodes({ ...publishedEvent, venue: { name: 'Confirmed Venue', online: undefined } })
    expect(nodes[0]).toMatchObject({
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Confirmed Venue' },
    })
  })

  it('returns no nodes for drafts and malformed public slugs', () => {
    expect(detailNodes({ ...publishedEvent, _status: 'draft' })).toEqual([])
    expect(detailNodes({ ...publishedEvent, slug: 'Bad/Path' })).toEqual([])
  })
})
