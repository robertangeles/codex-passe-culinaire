import Link from 'next/link'

import { EditorialSection } from '../../components/EditorialSection'
import { HeroBlock } from '../../components/blocks/HeroBlock'
import styles from './not-found.module.css'

export default function PublicNotFound() {
  const hero = { blockType: 'hero', heading: 'Page not found', style: 'quiet' } as const

  return (
    <main id="main-content" tabIndex={-1}>
      <HeroBlock block={hero} headingLevel={1} />
      <EditorialSection>
        <div className={styles.content}>
          <p>This page is not available.</p>
          <nav aria-label="Helpful pages">
            <ul className={styles.links}>
              <li><Link href="/" prefetch={false}>Go to the home page</Link></li>
              <li><Link href="/search" prefetch={false}>Search the site</Link></li>
            </ul>
          </nav>
        </div>
      </EditorialSection>
    </main>
  )
}
