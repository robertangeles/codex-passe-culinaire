import type { ReactNode } from 'react'
import Link from 'next/link'

import type { Footer, Header, SiteSetting } from '../payload-types'
import { getPublicShell } from '../lib/public-content'
import { safePublicHref } from '../lib/urls'
import ThemeControl from './ThemeControl'
import { BrandMonogram } from './BrandMonogram'
import { JsonLd } from './JsonLd'
import { buildOrganisationGraph } from '../lib/seo/organisation'
import { siteOrigin } from '../lib/seo/core'
import styles from './PublicShell.module.css'

type NavigationItem = NonNullable<Header['navItems']>[number]
type FooterColumn = NonNullable<Footer['columns']>[number]
type FooterLink = NonNullable<FooterColumn['links']>[number]
type SocialLink = NonNullable<SiteSetting['socialLinks']>[number]

function NavigationLinks({ items }: { items: Header['navItems'] }) {
  return (
    <ul className={styles.navigationList}>
      {(items ?? []).map((item: NavigationItem, index: number) => {
        const label = item.label.trim()
        if (!label) return null
        const href = safePublicHref(item.url)
        const children = (item.children ?? []).filter((child) => child.label.trim() && safePublicHref(child.url))

        if (children.length > 0) {
          return (
            <li className={styles.navigationItem} key={item.id ?? `${label}-${index}`}>
              <details className={styles.disclosure}>
                <summary className={styles.disclosureSummary}>{label}</summary>
                <ul className={styles.subnavigation}>
                  {href ? <li><a className={styles.navigationLink} href={href}>{label}</a></li> : null}
                  {children.map((child, childIndex) => {
                    const childHref = safePublicHref(child.url)
                    return childHref ? (
                      <li key={child.id ?? `${child.label}-${childIndex}`}>
                        <a className={styles.navigationLink} href={childHref}>{child.label}</a>
                      </li>
                    ) : null
                  })}
                </ul>
              </details>
            </li>
          )
        }

        return href ? (
          <li className={styles.navigationItem} key={item.id ?? `${label}-${index}`}>
            <a className={styles.navigationLink} href={href}>{label}</a>
          </li>
        ) : null
      })}
    </ul>
  )
}

function FooterColumns({ columns }: { columns: Footer['columns'] }) {
  return (
    <div className={styles.footerColumns}>
      {(columns ?? []).map((column: FooterColumn, index: number) => {
        const links = (column.links ?? []).filter((link: FooterLink) => link.label?.trim() && safePublicHref(link.url))
        if (!column.heading?.trim() && links.length === 0) return null
        return (
          <section className={styles.footerColumn} key={column.id ?? `${column.heading ?? 'links'}-${index}`}>
            {column.heading?.trim() ? <h2 className={styles.footerHeading}>{column.heading}</h2> : null}
            {links.length > 0 ? (
              <ul className={styles.footerLinks}>
                {links.map((link: FooterLink, linkIndex: number) => {
                  const href = safePublicHref(link.url)
                  return href ? (
                    <li key={link.id ?? `${link.label ?? 'link'}-${linkIndex}`}>
                      <a className={styles.footerLink} href={href}>{link.label}</a>
                    </li>
                  ) : null
                })}
              </ul>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

function SocialLinks({ links }: { links: SiteSetting['socialLinks'] }) {
  const safeLinks = (links ?? []).flatMap((link: SocialLink, index: number) => {
    const href = safePublicHref(link.url)
    return href && link.label?.trim() ? [{ href, label: link.label, key: link.id ?? `${link.label}-${index}` }] : []
  })
  if (safeLinks.length === 0) return null

  return (
    <nav aria-label="Social media" className={styles.socialNavigation}>
      <ul className={styles.footerLinks}>
        {safeLinks.map((link) => <li key={link.key}><a className={styles.footerLink} href={link.href}>{link.label}</a></li>)}
      </ul>
    </nav>
  )
}

export default async function PublicShell({ children }: { children: ReactNode }) {
  const { siteSettings, header, footer } = await getPublicShell()
  const companyName = siteSettings.name?.trim() || 'Passe Culinaire'

  return (
    <>
      <JsonLd nodes={buildOrganisationGraph(siteSettings, siteOrigin())} />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.wordmark} href="/" aria-label={companyName} prefetch={false}>
            <BrandMonogram className={styles.headerMark} />
            <span>{companyName}</span>
          </Link>
          <nav aria-label="Main navigation" className={styles.navigation}>
            <NavigationLinks items={header.navItems} />
          </nav>
          <details className={styles.mobileMenu}>
            <summary>Menu</summary>
            <nav aria-label="Mobile navigation"><NavigationLinks items={header.navItems} /></nav>
          </details>
        </div>
      </header>
      {children}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <Link className={styles.wordmark} href="/" aria-label={companyName} prefetch={false}>
              <BrandMonogram className={styles.footerMark} /><span>{companyName}</span>
            </Link>
            <FooterColumns columns={footer.columns} />
          </div>
          <div className={styles.footerBottom}>
            <div className={styles.legal}>
              {footer.legalText?.trim() ? <p>{footer.legalText}</p> : null}
              <p>ABN: {footer.abn?.trim() || '[TO CONFIRM]'}</p>
            </div>
            <SocialLinks links={siteSettings.socialLinks} />
            <ThemeControl />
          </div>
        </div>
      </footer>
    </>
  )
}
