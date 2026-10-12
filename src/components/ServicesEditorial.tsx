import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Service } from '../payload-types'
import { safePublicHref } from '../lib/urls'
import styles from './ServicesEditorial.module.css'

type ServicesEditorialProps = {
  services: Service[]
  pagination?: ReactNode
}

type PublishedService = {
  id: number
  title: string
  href: string
  oneLiner: string
  whoItIsFor: string
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function publishedServices(services: Service[]): PublishedService[] {
  return services.flatMap((service) => {
    if (
      service._status !== 'published'
      || typeof service.id !== 'number'
      || typeof service.slug !== 'string'
      || !slugPattern.test(service.slug)
      || typeof service.title !== 'string'
      || !service.title.trim()
    ) return []

    const href = safePublicHref(`/services/${service.slug}`)
    if (!href) return []

    return [{
      id: service.id,
      title: service.title.trim(),
      href,
      oneLiner: typeof service.oneLiner === 'string' ? service.oneLiner.trim() : '',
      whoItIsFor: typeof service.whoItIsFor === 'string' ? service.whoItIsFor.trim() : '',
    }]
  })
}

function ServiceCatalogue({ services }: { services: PublishedService[] }) {
  return (
    <ul className={styles.catalogue} aria-label="Published services">
      {services.map((service) => (
        <li className={styles.catalogueItem} key={service.id}>
          <h3><Link href={service.href} prefetch={false}>{service.title}</Link></h3>
          <div className={styles.serviceDetails}>
            {service.oneLiner && <p>{service.oneLiner}</p>}
            {service.whoItIsFor && <p className={styles.audience}>{service.whoItIsFor}</p>}
          </div>
          <Link className={styles.rowLink} href={service.href} prefetch={false} aria-label={`Read about ${service.title}`}>
            Explore <span aria-hidden="true">↗</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function ServicesEditorial({ services, pagination }: ServicesEditorialProps) {
  const entries = publishedServices(services)

  return (
    <div className={styles.page}>
      <section className={`${styles.container} ${styles.hero}`} aria-labelledby="services-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Work with Passe Culinaire</p>
          <h1 id="services-title">The work behind service deserves better tools.</h1>
          <div className={styles.intro}>
            <p>A menu change reaches further than the menu. It changes the prep, the stock and what the team needs to know. Yet those connections often live in separate apps, scattered notes or one chef’s head.</p>
            <p>Passe Culinaire brings kitchen experience and technology together to work on that whole picture. CulinAIre Kitchen is our first offer. We are also developing training, advisory and publishing around the work chefs and owners do every day.</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/contact" prefetch={false}>Tell us about your kitchen <span aria-hidden="true">↗</span></Link>
            <Link className={styles.textLink} href="/culinaire-kitchen" prefetch={false}>Explore CulinAIre Kitchen <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <figure className={styles.heroFigure}>
          <Image
            className={styles.heroImage}
            src="/images/company-pages/services.webp"
            width={1600}
            height={900}
            alt="Illustrative kitchen photograph with produce and a working notebook"
            sizes="(min-width: 1440px) 616px, (min-width: 801px) 46vw, calc(100vw - 48px)"
            preload
          />
        </figure>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="services-section-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Where to begin</p>
            <h2 id="services-section-title">Where does the work get held up?</h2>
          </div>
          <p className={styles.sectionIntro}>Bring us a real example. A menu, a prep day or a handover tells us more than a polished brief.</p>
        </div>
        <ul className={styles.prompts} aria-label="Topics to bring to a conversation">
          <li><h3>From menu to prep</h3><p>When a recipe or quantity changes, how does that reach everyone preparing it?</p></li>
          <li><h3>From stock to service</h3><p>How does the team know what is on hand, what needs ordering and what needs making?</p></li>
          <li><h3>From chef to team</h3><p>Which instructions still depend on someone remembering to pass them on?</p></li>
        </ul>
      </section>

      {entries.length > 0 && (
        <section className={`${styles.container} ${styles.section}`} aria-labelledby="services-catalogue-title">
          <h2 id="services-catalogue-title">Ways to work with us.</h2>
          <ServiceCatalogue services={entries} />
          {pagination && <div className={styles.pagination}>{pagination}</div>}
        </section>
      )}

      <section className={styles.continuation} aria-labelledby="services-continuation-title">
        <div className={`${styles.container} ${styles.continuationInner}`}>
          <div>
            <p className={styles.kicker}>Our first offer</p>
            <h2 id="services-continuation-title">Meet CulinAIre Kitchen.</h2>
          </div>
          <div>
            <p>A connected view of recipes, stock, preparation and people, from the first plan to what went out. See the kitchen tool we are building.</p>
            <Link className={styles.textLink} href="/culinaire-kitchen" prefetch={false}>Explore CulinAIre Kitchen <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
