import Link from 'next/link'

import { safePublicHref } from '../lib/urls'
import styles from './Pagination.module.css'

type PaginationProps = {
  basePath: string
  page: number
  totalPages: number
}

function pageHref(basePath: string, page: number): string | undefined {
  const path = page === 1
    ? basePath
    : `${basePath === '/' ? '' : basePath}/page/${page}`

  return safePublicHref(path)
}

export function Pagination({ basePath, page, totalPages: allPages }: PaginationProps) {
  const totalPages = Math.min(allPages, 1000)
  const safeBasePath = safePublicHref(basePath)
  if (!safeBasePath || !safeBasePath.startsWith('/') || safeBasePath.startsWith('//')
    || safeBasePath.includes('?') || safeBasePath.includes('#')
    || !Number.isFinite(page) || !Number.isInteger(page)
    || !Number.isFinite(allPages) || !Number.isInteger(allPages)
    || totalPages < 1 || page < 1 || page > totalPages) return null

  if (totalPages <= 1) return null

  const previousHref = page > 1 ? pageHref(safeBasePath, page - 1) : undefined
  const nextHref = page < totalPages ? pageHref(safeBasePath, page + 1) : undefined
  if ((page > 1 && !previousHref) || (page < totalPages && !nextHref)) return null

  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      {previousHref
        ? <Link className={styles.link} href={previousHref} prefetch={false}>Previous</Link>
        : <span />}
      <span className={styles.status}>Page {page} of {totalPages}{allPages > totalPages && <> · First 1,000 pages</>}</span>
      {nextHref
        ? <Link className={styles.link} href={nextHref} prefetch={false}>Next</Link>
        : <span />}
    </nav>
  )
}
