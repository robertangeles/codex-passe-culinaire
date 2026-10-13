import { RouteSchema } from '../../../../components/RouteSchema'
import { buildPageMetadata } from '../../../../lib/seo/metadata'
import { siteOrigin } from '../../../../lib/seo/core'
import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { ServicesEditorial } from '../../../../components/ServicesEditorial'
import { Pagination } from '../../../../components/Pagination'
import { listPublicContent, getPublicShell } from '../../../../lib/public-content'

export const revalidate = 600

const PAGE_SIZE = 12
const MAX_PAGE = 1000

type PageProps = { params: Promise<{ page?: string[] }> }

function parsePage(value: string): number | null {
  if (!/^[1-9][0-9]{0,3}$/u.test(value)) return null
  const page = Number(value)
  return page <= MAX_PAGE ? page : null
}

function resolvePage(segments?: string[]): number {
  if (!segments || segments.length === 0) return 1
  if (segments.length !== 2 || segments[0] !== 'page') notFound()

  const page = parsePage(segments[1] ?? '')
  if (page === null) notFound()
  if (page === 1) permanentRedirect('/services')
  return page
}

const getServicesListing = cache(async (page: number) => {
  const listing = await listPublicContent('services', {
    page,
    limit: PAGE_SIZE,
    sort: ['title', 'id'],
  })
  if (page > 1 && (!listing.docs.length || page > listing.totalPages)) return null
  return listing
})

export async function generateStaticParams(): Promise<never[]> {
  return []
}

async function getRouteModel(params: PageProps['params']) {
  const { page: segments } = await params
  const page = resolvePage(segments)
  const listing = await getServicesListing(page)
  if (!listing) notFound()
  return { listing, page }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await getRouteModel(params)
  return buildPageMetadata({ title: page > 1 ? `Services · Page ${page}` : 'Services', description: 'Bring a real kitchen problem to Passe Culinaire. Explore CulinAIre Kitchen and the work connecting menus, prep, stock and teams.',
    path: page > 1 ? `/services/page/${page}` : '/services', settings: (await getPublicShell()).siteSettings }, siteOrigin())
}

export default async function ServicesIndexPage({ params }: PageProps) {
  const { listing, page } = await getRouteModel(params)
  return (
    <main id="main-content" tabIndex={-1}>
      <RouteSchema path={page > 1 ? `/services/page/${page}` : '/services'} title={page > 1 ? `Services · Page ${page}` : 'Services'}
        parents={page > 1 ? [{ name: 'Services', path: '/services' }] : []} />
      <ServicesEditorial
        services={listing.docs}
        pagination={listing.totalPages > 1
          ? <Pagination basePath="/services" page={page} totalPages={listing.totalPages} />
          : undefined}
      />
    </main>
  )
}
