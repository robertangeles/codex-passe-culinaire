import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND') }),
  permanentRedirect: vi.fn((location: string) => { throw new Error(`NEXT_REDIRECT:${location}`) }),
}))

vi.mock('../src/lib/public-content', () => ({ getPublicShell: vi.fn().mockResolvedValue({ siteSettings: { id: 1, name: 'Passe Culinaire' } }), listPublicContent: mocks.list }))
vi.mock('next/navigation', () => ({ notFound: mocks.notFound, permanentRedirect: mocks.permanentRedirect }))

import ServicesIndexPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from '../src/app/(public)/services/[[...page]]/page'
import type { listPublicContent } from '../src/lib/public-content'
import type { Service } from '../src/payload-types'

type ServiceListing = Awaited<ReturnType<typeof listPublicContent<'services'>>>

function createListing(page = 1, totalPages = 1, docs: Service[] = []): ServiceListing {
  return {
    docs,
    totalDocs: docs.length,
    limit: 12,
    totalPages,
    page,
    pagingCounter: (page - 1) * 12 + 1,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  }
}

const publishedService = {
  id: 12,
  title: 'Menu development',
  slug: 'menu-development',
  oneLiner: 'Build a menu around the kitchen and its service.',
  whoItIsFor: 'For independent kitchens.',
  _status: 'published',
} as Service

describe('services index route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.list.mockResolvedValue(createListing())
  })

  it('renders the truthful draft-only empty state and reads published services', async () => {
    const html = renderToStaticMarkup(await ServicesIndexPage({ params: Promise.resolve({}) }))

    expect(revalidate).toBe(600)
    expect(await generateStaticParams()).toEqual([])
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1')
    expect(html).toContain('Start with')
    expect(html).toContain('the kitchen.')
    expect(html).toContain('Tell us about your kitchen, your team and the work you want to do.')
    expect(html).toContain('A place to begin.')
    expect(html).toContain('Service details are being prepared.')
    expect(html).toContain('Your kitchen')
    expect(html).toContain('Your team')
    expect(html).toContain('Your priorities')
    expect(html).toContain('Alex Charasse')
    expect(html).toContain('Rob Angeles')
    expect(html).toContain('Our first offer.')
    expect(html).toContain('href="/culinaire-kitchen"')
    expect(html).toContain('href="/contact"')
    expect(mocks.list).toHaveBeenCalledWith('services', {
      page: 1,
      limit: 12,
      sort: ['title', 'id'],
    })
  })

  it('renders published services with their safe detail links', async () => {
    mocks.list.mockResolvedValue(createListing(1, 1, [publishedService]))
    const html = renderToStaticMarkup(await ServicesIndexPage({ params: Promise.resolve({}) }))

    expect(html).toContain('Menu development')
    expect(html).toContain('Build a menu around the kitchen and its service.')
    expect(html).toContain('For independent kitchens.')
    expect(html).toContain('href="/services/menu-development"')
    expect(html).toContain('The work we can discuss.')
    expect(html).toContain('Explore the services')
    expect(html).not.toContain('specimen')
    expect(html).not.toContain('Your kitchen')
    expect(html).not.toContain('Service details are being prepared.')
  })

  it('renders multiple published services full-width with long titles and real summaries', async () => {
    const longTitle = 'Kitchen operations and menu development for independent hospitality teams'
    mocks.list.mockResolvedValue(createListing(1, 1, [
      publishedService,
      {
        ...publishedService,
        id: 18,
        title: longTitle,
        slug: 'kitchen-operations-and-menu-development',
        oneLiner: 'A longer service description remains readable in the catalogue.',
        whoItIsFor: 'For established restaurant teams.',
      } as Service,
    ]))
    const html = renderToStaticMarkup(await ServicesIndexPage({ params: Promise.resolve({}) }))

    expect(html).toContain('Menu development')
    expect(html).toContain(longTitle)
    expect(html).toContain('A longer service description remains readable in the catalogue.')
    expect(html).toContain('For established restaurant teams.')
    expect(html).toContain('href="/services/kitchen-operations-and-menu-development"')
    expect(html).not.toContain('Your priorities')
  })

  it('omits drafts, blank titles, and unsafe slugs while retaining published audience details', async () => {
    mocks.list.mockResolvedValue(createListing(1, 1, [
      publishedService,
      { ...publishedService, id: 13, title: 'Draft service', slug: 'draft-service', _status: 'draft' } as Service,
      { ...publishedService, id: 14, title: '   ', slug: 'blank-title' } as Service,
      { ...publishedService, id: 15, title: 'Unsafe service', slug: '../contact' } as Service,
      { ...publishedService, id: 16, title: 'Unsafe encoded service', slug: 'bad%2fslug' } as Service,
    ]))
    const html = renderToStaticMarkup(await ServicesIndexPage({ params: Promise.resolve({}) }))

    expect(html).toContain('For independent kitchens.')
    expect(html).not.toContain('Draft service')
    expect(html).not.toContain('Unsafe service')
    expect(html).not.toContain('blank-title')
    expect(html).toContain('href="/services/menu-development"')
  })

  it('keeps a published entry when its optional summary is absent', async () => {
    const serviceWithoutDetails = {
      id: publishedService.id,
      title: publishedService.title,
      slug: publishedService.slug,
      _status: 'published',
    } as Service
    mocks.list.mockResolvedValue(createListing(1, 1, [serviceWithoutDetails]))
    const html = renderToStaticMarkup(await ServicesIndexPage({ params: Promise.resolve({}) }))

    expect(html).toContain('Menu development')
    expect(html).toContain('href="/services/menu-development"')
    expect(html).not.toContain('Build a menu around the kitchen and its service.')
    expect(html).not.toContain('For independent kitchens.')
  })

  it('renders path pagination and metadata for later pages', async () => {
    mocks.list.mockResolvedValue(createListing(2, 3, [publishedService]))
    const params = Promise.resolve({ page: ['page', '2'] })
    const html = renderToStaticMarkup(await ServicesIndexPage({ params }))

    expect(html).toContain('href="/services"')
    expect(html).toContain('href="/services/page/3"')
    expect(html.indexOf('href="/services/page/3"')).toBeLessThan(html.indexOf('Alex Charasse'))
    await expect(generateMetadata({ params: Promise.resolve({ page: ['page', '2'] }) })).resolves.toMatchObject({
      title: 'Services · Page 2',
      description: 'Explore services from Passe Culinaire.',
    })
  })

  it('rejects invalid path segments and redirects explicit page one', async () => {
    await expect(ServicesIndexPage({ params: Promise.resolve({ page: ['page', '01'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mocks.notFound).toHaveBeenCalled()

    await expect(ServicesIndexPage({ params: Promise.resolve({ page: ['page', '1'] }) })).rejects.toThrow('NEXT_REDIRECT:/services')
    expect(mocks.permanentRedirect).toHaveBeenCalledWith('/services')
  })

  it('returns not found for an empty or out-of-range later page', async () => {
    mocks.list.mockResolvedValue(createListing(2, 1, []))
    await expect(ServicesIndexPage({ params: Promise.resolve({ page: ['page', '2'] }) })).rejects.toThrow('NEXT_NOT_FOUND')

    mocks.list.mockResolvedValue(createListing(2, 1, [publishedService]))
    await expect(ServicesIndexPage({ params: Promise.resolve({ page: ['page', '2'] }) })).rejects.toThrow('NEXT_NOT_FOUND')
  })
})
