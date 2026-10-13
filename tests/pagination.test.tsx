import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { Pagination } from '../src/components/Pagination'

describe('Pagination', () => {
  it('renders canonical first-page next links without page buttons or query strings', () => {
    const html = renderToStaticMarkup(<Pagination basePath="/journal" page={1} totalPages={3} />)

    expect(html).toContain('<nav aria-label="Pagination"')
    expect(html).toContain('Page 1 of 3')
    expect(html).toContain('href="/journal/page/2"')
    expect(html).toContain('>Next</a>')
    expect(html).not.toContain('>Previous</a>')
    expect(html).not.toContain('?')
    expect(html).not.toContain('>2</a>')
  })

  it('returns the previous link from page two to the canonical base path', () => {
    const html = renderToStaticMarkup(<Pagination basePath="/journal" page={2} totalPages={3} />)

    expect(html).toContain('href="/journal"')
    expect(html).toContain('href="/journal/page/3"')
  })

  it('explains its page bound and never links beyond the route limit', () => {
    const html = renderToStaticMarkup(<Pagination basePath="/journal" page={1000} totalPages={1500} />)
    expect(html).toContain('Page 1000 of 1000')
    expect(html).toContain('First 1,000 pages')
    expect(html).not.toContain('/page/1001')
  })

  it('hides the next link on the last page', () => {
    const html = renderToStaticMarkup(<Pagination basePath="/journal" page={3} totalPages={3} />)

    expect(html).toContain('href="/journal/page/2"')
    expect(html).not.toContain('>Next</a>')
  })

  it.each([
    { basePath: '//example.com', page: 1, totalPages: 2 },
    { basePath: '/journal?sort=recent', page: 1, totalPages: 2 },
    { basePath: '/journal', page: 0, totalPages: 2 },
    { basePath: '/journal', page: 1.5, totalPages: 2 },
    { basePath: '/journal', page: 3, totalPages: 2 },
    { basePath: '/journal', page: 1, totalPages: 0 },
    { basePath: '/journal', page: Number.POSITIVE_INFINITY, totalPages: 2 },
  ])('omits pagination for invalid props %#', (props) => {
    expect(renderToStaticMarkup(<Pagination {...props} />)).toBe('')
  })

  it('omits navigation when there is only one page', () => {
    expect(renderToStaticMarkup(<Pagination basePath="/journal" page={1} totalPages={1} />)).toBe('')
  })
})
