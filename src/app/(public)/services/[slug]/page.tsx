import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EditorialSection } from '../../../../components/EditorialSection'
import { FAQBlock } from '../../../../components/blocks/FAQBlock'
import { HeroBlock } from '../../../../components/blocks/HeroBlock'
import { RichText } from '../../../../components/RichText'
import type { Faq, Service } from '../../../../payload-types'
import { safePublicHref } from '../../../../lib/urls'
import { getPublicDocument, getPublicShell } from '../../../../lib/public-content'
import styles from './page.module.css'

export const revalidate = 600

type PageProps = { params: Promise<{ slug: string }> }
type ServiceViewModel = {
  service: Service
  externalEmbedsEnabled: boolean
}

function isServiceSlug(slug: string): boolean {
  return slug.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
}

/** Share the published service and site setting reads with metadata for this request. */
const getServiceViewModel = cache(async (slug: string): Promise<ServiceViewModel | null> => {
  const [service, shell] = await Promise.all([
    getPublicDocument('services', slug),
    getPublicShell(),
  ])
  if (!service || service._status !== 'published') return null
  return {
    service,
    externalEmbedsEnabled: shell.siteSettings.externalEmbedsEnabled === true,
  }
})

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isServiceSlug(slug)) notFound()

  const model = await getServiceViewModel(slug)
  if (!model) return {}

  const { service } = model
  return {
    title: service.seo?.metaTitle || service.title,
    description: service.seo?.metaDescription || service.oneLiner || undefined,
    robots: {
      index: service.seo?.noIndex !== true,
      follow: service.seo?.noFollow !== true,
    },
  }
}

function hasPopulatedHeroImage(service: Service): service is Service & { heroImage: Exclude<Service['heroImage'], number | null | undefined> } {
  return typeof service.heroImage === 'object'
    && service.heroImage !== null
    && typeof service.heroImage.id === 'number'
}

function populatedFaq(service: Service): Faq['items'] {
  return (service.faq ?? []).filter((item): item is NonNullable<Service['faq']>[number] & { question: string } =>
    typeof item.question === 'string' && item.question.trim().length > 0,
  ).map((item) => ({
    id: item.id,
    question: item.question.trim(),
    answer: item.answer,
  }))
}

const formatLabels: Record<NonNullable<Service['format']>, string> = {
  'on-site': 'On-site',
  online: 'Online',
  hybrid: 'Hybrid',
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (!isServiceSlug(slug)) notFound()

  const model = await getServiceViewModel(slug)
  if (!model) notFound()

  const { service, externalEmbedsEnabled } = model
  const heroImage = hasPopulatedHeroImage(service) ? service.heroImage : undefined
  const ctaLabel = service.cta?.label?.trim()
  const ctaHref = safePublicHref(service.cta?.url)
  const faqItems = populatedFaq(service)

  return (
    <main id="main-content" tabIndex={-1}>
      <HeroBlock
        block={{
          blockType: 'hero',
          heading: service.title,
          summary: service.oneLiner,
          style: heroImage ? 'image' : 'quiet',
          image: heroImage,
        }}
        headingLevel={1}
      />

      {service.whoItIsFor?.trim() && (
        <EditorialSection>
          <div className={styles.prose}>
            <h2>Who it is for</h2>
            <p>{service.whoItIsFor.trim()}</p>
          </div>
        </EditorialSection>
      )}

      {service.whatYouGet && (
        <EditorialSection>
          <div className={styles.prose}>
            <h2>What you get</h2>
            <RichText data={service.whatYouGet} externalEmbedsEnabled={externalEmbedsEnabled} />
          </div>
        </EditorialSection>
      )}

      {(service.format || service.duration?.trim() || service.priceNote?.trim()) && (
        <EditorialSection>
          <dl className={styles.details}>
            {service.format && <div><dt>Format</dt><dd>{formatLabels[service.format]}</dd></div>}
            {service.duration?.trim() && <div><dt>Duration</dt><dd>{service.duration.trim()}</dd></div>}
            {service.priceNote?.trim() && <div><dt>Price</dt><dd>{service.priceNote.trim()}</dd></div>}
          </dl>
        </EditorialSection>
      )}

      {faqItems && faqItems.length > 0 && (
        <FAQBlock block={{ blockType: 'faq', items: faqItems }} externalEmbedsEnabled={externalEmbedsEnabled} />
      )}

      {ctaLabel && ctaHref && (
        <EditorialSection>
          <a className={styles.cta} href={ctaHref}>{ctaLabel}</a>
        </EditorialSection>
      )}
    </main>
  )
}
