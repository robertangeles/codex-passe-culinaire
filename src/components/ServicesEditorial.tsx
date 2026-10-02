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

function EmptyServices() {
  return (
    <div className={styles.emptyState}>
      <h3>Service details are being prepared.</h3>
      <p>You can still tell us what you are working on. Start with a conversation about your kitchen.</p>
      <Link className={styles.inlineLink} href="/contact" prefetch={false}>Discuss your kitchen <span aria-hidden="true">↗</span></Link>
    </div>
  )
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
          <p className={styles.kicker}>Passe Culinaire · Services</p>
          <h1 id="services-title">Start with<br />the kitchen.</h1>
          <p className={styles.intro}>Tell us about your kitchen, your team and the work you want to do.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/contact" prefetch={false}>Discuss your kitchen <span aria-hidden="true">↗</span></Link>
            <Link className={styles.textLink} href="/about" prefetch={false}>Meet the founders</Link>
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
            <p className={styles.kicker}>Services</p>
            <h2 id="services-section-title">{entries.length === 0 ? 'A place to begin.' : 'The work we can discuss.'}</h2>
          </div>
          {entries.length === 0 ? (
            <EmptyServices />
          ) : (
            <div className={styles.catalogueIntro}>
              <h3>Explore the services</h3>
              <p>Read about each service and who it is for.</p>
            </div>
          )}
        </div>
        {entries.length > 0 ? (
          <>
            <ServiceCatalogue services={entries} />
            {pagination && <div className={styles.pagination}>{pagination}</div>}
          </>
        ) : (
          <ul className={styles.prompts} aria-label="Topics to bring to a conversation">
            <li><h3>Your kitchen</h3><p>Tell us about the operation and the kind of service you run.</p></li>
            <li><h3>Your team</h3><p>Share who is involved and where experience or support is needed.</p></li>
            <li><h3>Your priorities</h3><p>Describe what you want to work on, and any timing you have in mind.</p></li>
          </ul>
        )}
      </section>

      <section className={`${styles.container} ${styles.section} ${styles.people}`} aria-labelledby="services-people-title">
        <div>
          <p className={styles.kicker}>The people behind the work</p>
          <h2 id="services-people-title">Culinary experience.<br />A shared perspective.</h2>
        </div>
        <div>
          <div className={styles.founders}>
            <div>
              <p className={styles.personName}>Alex Charasse</p>
              <p>Maître Pâtissier.<br />Maître Chocolatier.</p>
            </div>
            <div>
              <p className={styles.personName}>Rob Angeles</p>
              <p>Chef trained in pastry and hot kitchen. Data Architect.</p>
            </div>
          </div>
          <Link className={styles.textLink} href="/about" prefetch={false}>About Passe Culinaire <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className={styles.continuation} aria-labelledby="services-continuation-title">
        <div className={`${styles.container} ${styles.continuationInner}`}>
          <h2 id="services-continuation-title">Our first offer.<br />CulinAIre Kitchen.</h2>
          <div>
            <p>Alongside the company’s training, advisory and publishing scope, explore the kitchen tool we are building.</p>
            <Link className={styles.textLink} href="/culinaire-kitchen" prefetch={false}>Explore CulinAIre Kitchen <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
