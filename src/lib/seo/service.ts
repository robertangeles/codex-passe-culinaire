import type { Service, Testimonial1 } from '../../payload-types'
import { visibleContentText } from '../../payload/contentText'
import { confirmedText, entityIds, publicMediaUrl, type SchemaNode } from './core'

const strictSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

function faqAnswerText(answer: unknown): string | undefined {
  const text = visibleContentText('pages', { layout: [{ items: [{ answer }] }] })
  return confirmedText(text)
}

function serviceId(origin: string, slug: string): string {
  return `${origin}/services/${encodeURIComponent(slug)}#service`
}

function testimonialServiceId(testimonial: Testimonial1): number | undefined {
  const relation = testimonial.relatedTo
  if (!relation || relation.relationTo !== 'services') return undefined
  return typeof relation.value === 'number' ? relation.value : relation.value.id
}

/** Build public structured data for a published service and its real reviews. */
export function buildServiceGraph(
  service: Service,
  testimonials: Testimonial1[],
  origin: string,
): SchemaNode[] {
  const name = confirmedText(service.title)
  if (service._status !== 'published' || !name || !strictSlug.test(service.slug) || service.slug.length > 200) return []

  const id = serviceId(origin, service.slug)
  const serviceNode: SchemaNode = {
    '@type': 'Service',
    '@id': id,
    url: `${origin}/services/${encodeURIComponent(service.slug)}`,
    name,
    provider: { '@id': entityIds(origin).organisation },
    serviceType: name,
    audience: {
      '@type': 'Audience',
      audienceType: ['Chefs', 'Restaurant owners', 'Culinary professionals'],
    },
  }

  const description = confirmedText(service.oneLiner)
  if (description) serviceNode.description = description

  const image = publicMediaUrl(service.heroImage, origin)
  if (image) serviceNode.image = image

  const nodes: SchemaNode[] = [serviceNode]
  for (const testimonial of testimonials) {
    if (testimonial.published !== true || testimonialServiceId(testimonial) !== service.id) continue
    const author = confirmedText(testimonial.name)
    const quote = confirmedText(testimonial.quote)
    if (!author || !quote) continue
    nodes.push({
      '@type': 'Review',
      '@id': `${origin}/services/${encodeURIComponent(service.slug)}#review-${testimonial.id}`,
      reviewBody: quote,
      author: { '@type': 'Person', name: author },
      itemReviewed: { '@id': id },
    })
  }

  const faqEntities = (service.faq ?? []).flatMap((faq) => {
    const question = confirmedText(faq.question)
    const answer = faqAnswerText(faq.answer)
    return question && answer ? [{ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }] : []
  })
  if (faqEntities.length > 0) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${origin}/services/${encodeURIComponent(service.slug)}#faq`,
      mainEntity: faqEntities,
    })
  }

  return nodes
}
