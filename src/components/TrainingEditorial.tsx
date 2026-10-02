import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { safePublicHref } from '../lib/urls'
import styles from './TrainingEditorial.module.css'

type TrainingEditorialProps = {
  upcoming: ReactNode
  hasUpcoming: boolean
  archive: ReactNode
  hasArchive: boolean
  showEmptyState: boolean
  showProgrammeLink: boolean
  pagination?: ReactNode
}

const contactHref = safePublicHref('/contact') ?? '/contact'
const aboutHref = safePublicHref('/about') ?? '/about'
const programmeHref = safePublicHref('#programme') ?? '#programme'

export function TrainingEditorial({
  upcoming,
  hasUpcoming,
  archive,
  hasArchive,
  showEmptyState,
  showProgrammeLink,
  pagination,
}: TrainingEditorialProps) {
  return (
    <div className={styles.page}>
      <section className={`${styles.container} ${styles.hero}`} aria-labelledby="training-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Passe Culinaire · Training</p>
          <h1 id="training-title">Make room<br />for the craft.</h1>
          <p className={styles.intro}>A place for culinary learning, grounded in the work of the kitchen.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={contactHref} prefetch={false}>Ask about training <span aria-hidden="true">↗</span></Link>
          </div>
          {showProgrammeLink && (
            <div className={styles.trainingNote}>
              {showEmptyState
                ? <Link className={styles.textLink} href={programmeHref} prefetch={false}>Training enquiries <span aria-hidden="true">↓</span></Link>
                : <Link className={styles.textLink} href={programmeHref} prefetch={false}>Explore training <span aria-hidden="true">↓</span></Link>}
            </div>
          )}
        </div>
        <figure className={styles.heroFigure}>
          <Image
            className={styles.heroImage}
            src="/images/company-pages/training.webp"
            width={1600}
            height={900}
            alt="Illustrative photograph of pastry preparation at a kitchen bench"
            sizes="(min-width: 1440px) 648px, (min-width: 801px) 46vw, calc(100vw - 48px)"
            preload
          />
        </figure>
      </section>

      {(hasUpcoming || showEmptyState) && (
        <section className={`${styles.container} ${styles.section}`} id="programme" aria-labelledby="training-programme-title">
          {showEmptyState ? (
            <div className={styles.programmeIntro}>
              <div>
                <p className={styles.kicker}>Training</p>
                <h2 id="training-programme-title">Tell us what<br />you want to learn.</h2>
              </div>
              <div className={styles.emptyState}>
                <p>There are no upcoming training dates.</p>
                <p>Tell us what you would like to learn and who the training would be for.</p>
                <Link className={styles.textLink} href={contactHref} prefetch={false}>Ask about training <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          ) : (
            <div className={styles.programmeHeading}>
              <p className={styles.kicker}>Training</p>
              <h2 id="training-programme-title">Upcoming sessions</h2>
            </div>
          )}
          {upcoming}
        </section>
      )}

      {hasArchive && (
        <section className={`${styles.container} ${styles.section} ${styles.archive}`} aria-labelledby="training-archive-title">
          <div className={styles.programmeHeading}>
            <p className={styles.kicker}>Training</p>
            <h2 id="training-archive-title">Past and cancelled training</h2>
          </div>
          {archive}
        </section>
      )}

      {pagination && (
        <div className={`${styles.container} ${styles.pagination}`}>
          {pagination}
        </div>
      )}

      <section className={`${styles.container} ${styles.section} ${styles.people}`} aria-labelledby="training-people-title">
        <div>
          <p className={styles.kicker}>Culinary foundations</p>
          <h2 id="training-people-title">Know the people<br />behind the company.</h2>
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
          <Link className={styles.textLink} href={aboutHref} prefetch={false}>Read the founders’ backgrounds <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  )
}
