import { describe, expect, it } from 'vitest'
import type { Event as TrainingEvent, Service, SiteSetting, Testimonial1 } from '../src/payload-types'
import { buildServiceGraph } from '../src/lib/seo/service'

const origin = 'https://example.test'

const answer = {
  root: {
    type: 'root',
    children: [{
      type: 'paragraph',
      version: 1,
      children: [{ type: 'text', version: 1, text: 'A practical answer from the service team.' }],
    }],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const service: Service = {
  id: 41,
  title: 'Kitchen advisory',
  slug: 'kitchen-advisory',
  oneLiner: 'Practical advice for working kitchens.',
  heroImage: {
    id: 5,
    filename: 'kitchen.jpg',
    alt: 'A working kitchen',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  faq: [
    { question: 'Who can take part?', answer },
    { question: '[TO CONFIRM] question', answer },
    { question: 'When is it available?', answer: null },
  ],
  _status: 'published',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const testimonial = (overrides: Partial<Testimonial1> = {}): Testimonial1 => ({
  id: 83,
  quote: 'The advice helped our kitchen team plan service.',
  name: 'Alex Example',
  relatedTo: { relationTo: 'services', value: 41 },
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('service JSON-LD', () => {
  it('builds a service with audience, real reviews and safe FAQ text', () => {
    const graph = buildServiceGraph(service, [testimonial()], origin)
    expect(graph).toHaveLength(3)
    expect(graph[0]).toMatchObject({
      '@type': 'Service',
      '@id': `${origin}/services/kitchen-advisory#service`,
      url: `${origin}/services/kitchen-advisory`,
      name: 'Kitchen advisory',
      description: 'Practical advice for working kitchens.',
      provider: { '@id': `${origin}/#organisation` },
      serviceType: 'Kitchen advisory',
      audience: { audienceType: ['Chefs', 'Restaurant owners', 'Culinary professionals'] },
      image: `${origin}/media/kitchen.jpg`,
    })
    expect(graph[1]).toMatchObject({
      '@type': 'Review',
      '@id': `${origin}/services/kitchen-advisory#review-83`,
      author: { '@type': 'Person', name: 'Alex Example' },
      itemReviewed: { '@id': `${origin}/services/kitchen-advisory#service` },
    })
    expect(graph[2]).toMatchObject({
      '@type': 'FAQPage',
      '@id': `${origin}/services/kitchen-advisory#faq`,
      mainEntity: [{
        '@type': 'Question',
        name: 'Who can take part?',
        acceptedAnswer: { '@type': 'Answer', text: 'A practical answer from the service team.' },
      }],
    })
    expect(JSON.stringify(graph)).not.toContain('[TO CONFIRM]')
    expect(JSON.stringify(graph)).not.toContain('aggregateRating')
  })

  it('omits unrelated, unpublished, or unconfirmed testimonials and placeholder media', () => {
    const unrelated = testimonial({ id: 84, relatedTo: { relationTo: 'services', value: 99 } })
    const eventReview = testimonial({ id: 85, relatedTo: { relationTo: 'events', value: { id: 41, title: 'Kitchen workshop', slug: 'kitchen-workshop', updatedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' } satisfies TrainingEvent } })
    const unpublished = testimonial({ id: 86, published: false })
    const unconfirmed = testimonial({ id: 87, quote: '[TO CONFIRM] quote' })
    const unknownName = testimonial({ id: 88, name: '[TO CONFIRM] name' })
    const graph = buildServiceGraph(
      { ...service, heroImage: { ...service.heroImage as Exclude<Service['heroImage'], number | null | undefined>, placeholder: true } },
      [unrelated, eventReview, unpublished, unconfirmed, unknownName],
      origin,
    )
    expect(graph.filter((node) => node['@type'] === 'Review')).toHaveLength(0)
    expect(graph[0]).not.toHaveProperty('image')
  })

  it('matches populated service relations by ID without treating office location as service coverage', () => {
    const populatedReview = testimonial({
      id: 90,
      relatedTo: { relationTo: 'services', value: { ...service, _status: 'draft' } },
    })
    const officeSettings: SiteSetting = {
      id: 2,
      name: 'Passe Culinaire',
      organisation: { city: 'Melbourne', region: 'Victoria', country: 'Australia' },
    }
    const graph = buildServiceGraph(service, [populatedReview], origin)
    expect(officeSettings.organisation?.city).toBe('Melbourne')
    expect(graph[1]?.['@id']).toBe(`${origin}/services/kitchen-advisory#review-90`)
    expect(graph[0]).not.toHaveProperty('areaServed')
  })

  it('rejects draft services and malformed or overlong slugs', () => {
    expect(buildServiceGraph({ ...service, _status: 'draft' }, [], origin)).toEqual([])
    expect(buildServiceGraph({ ...service, slug: '../unsafe' }, [], origin)).toEqual([])
    expect(buildServiceGraph({ ...service, slug: `a${'b'.repeat(200)}` }, [], origin)).toEqual([])
  })
})
