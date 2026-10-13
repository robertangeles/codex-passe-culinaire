import Link from 'next/link'
import type { Service, ServiceList } from '../../payload-types'
import { safePublicHref } from '../../lib/urls'
import { EditorialSection } from '../EditorialSection'
import styles from './ServiceListBlock.module.css'

type ServiceListBlockProps = {
  block: ServiceList
  services: Service[]
}

function isPublishedService(service: Service): boolean {
  return service._status === 'published'
}

export function ServiceListBlock({ block, services }: ServiceListBlockProps) {
  const selection = block.services ?? []
  const candidates = selection.length > 0
    ? selection.filter((service): service is Service =>
        typeof service === 'object' && service !== null && isPublishedService(service),
      )
    : services.filter(isPublishedService)
  const entries = candidates.flatMap((service) => {
    const title = service.title.trim()
    if (!title || !service.slug.trim()) return []

    try {
      const href = safePublicHref(`/services/${encodeURIComponent(service.slug)}`)
      return href ? [{ service, title, href }] : []
    } catch {
      return []
    }
  })

  return (
    <EditorialSection wide>
      <h2 className={styles.heading}>{block.heading?.trim() || 'Services'}</h2>
      {entries.length > 0 ? (
        <ul className={styles.list}>
          {entries.map(({ service, title, href }) => (
            <li className={styles.item} key={service.id}>
              <h3 className={styles.title}>
                <a href={href}>
                  {title}
                </a>
              </h3>
              {service.oneLiner && <p className={styles.description}>{service.oneLiner}</p>}
              {service.whoItIsFor && (
                <p className={styles.audience}>{service.whoItIsFor}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>Service details are being prepared.</p>
          <Link className={styles.contactLink} href="/contact" prefetch={false}>Discuss your kitchen</Link>
        </div>
      )}
    </EditorialSection>
  )
}
