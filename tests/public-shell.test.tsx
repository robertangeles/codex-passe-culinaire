import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PublicShell from '../src/components/PublicShell'
import { getPublicShell } from '../src/lib/public-content'
import { safePublicHref } from '../src/lib/urls'

vi.mock('../src/lib/public-content', () => ({ getPublicShell: vi.fn() }))

describe('safePublicHref', () => {
  it('accepts safe internal paths, fragments, and credential-free HTTPS links', () => {
    expect(safePublicHref('/journal?sort=latest')).toBe('/journal?sort=latest')
    expect(safePublicHref('#contact')).toBe('#contact')
    expect(safePublicHref('https://example.com/about')).toBe('https://example.com/about')
  })

  it('rejects executable, credentialed, protocol-relative, and malformed links', () => {
    expect(safePublicHref('javascript:alert(1)')).toBeUndefined()
    expect(safePublicHref('data:text/html,hi')).toBeUndefined()
    expect(safePublicHref('//example.com')).toBeUndefined()
    expect(safePublicHref('https://user:pass@example.com')).toBeUndefined()
    expect(safePublicHref('https://@example.com')).toBeUndefined()
    expect(safePublicHref('/\\evil.example')).toBeUndefined()
    expect(safePublicHref('#bad%')).toBeUndefined()
  })
})

describe('PublicShell', () => {
  beforeEach(() => {
    vi.mocked(getPublicShell).mockResolvedValue({
      siteSettings: { id: 1, name: 'Passe Culinaire', socialLinks: [{ label: 'Instagram', url: 'https://instagram.com/passeculinaire' }] },
      header: {
        id: 1,
        navItems: [
          { label: 'Journal', url: '/journal', children: [{ label: 'Kitchen notes', url: '/journal/kitchen-notes' }] },
          { label: 'Unsafe', url: 'javascript:alert(1)' },
        ],
      },
      footer: {
        id: 1,
        columns: [{ heading: 'Company', links: [{ label: 'About', url: '/about' }, { label: 'Unsafe', url: 'javascript:alert(1)' }] }],
        legalText: 'Melbourne, Australia',
      },
    })
  })

  it('renders CMS navigation, footer content, theme control, and supplied main content in server HTML', async () => {
    const html = renderToStaticMarkup(await PublicShell({ children: <main id="main-content"><h1>Company</h1></main> }))

    expect(html).toContain('aria-label="Main navigation"')
    expect(html).toContain('<summary class="')
    expect(html).toContain('href="/journal/kitchen-notes"')
    expect(html).not.toContain('javascript:')
    expect(html).toContain('Melbourne, Australia')
    expect(html).toContain('ABN: [TO CONFIRM]')
    expect(html).toContain('aria-label="Social media"')
    expect(html).toContain('Colour theme')
    expect(html.match(/<main\b/g)).toHaveLength(1)
  })
})
