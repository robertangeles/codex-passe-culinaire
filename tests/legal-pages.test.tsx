import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import PrivacyPolicyPage from '../src/app/(public)/about/privacy-policy/page'
import TermsPage from '../src/app/(public)/about/terms-and-conditions/page'

describe('company policies', () => {
  it('renders the privacy policy with the actual contact form and overseas handling in server HTML', () => {
    const html = renderToStaticMarkup(<PrivacyPolicyPage />)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Privacy policy')
    expect(html).toContain('keyed hash')
    expect(html).toContain('Singapore')
    expect(html).toContain('United States')
    expect(html).toContain('alt="Pears being weighed on a kitchen prep bench."')
    expect(html).toContain('href="/contact"')
    expect(html).not.toContain('href="/about/privacy-policy"')
    expect(html).not.toContain('href="/about/terms-and-conditions"')
  })

  it('keeps the website terms separate from paid services and preserves statutory rights', () => {
    const html = renderToStaticMarkup(<TermsPage />)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('They do not set the terms for buying CulinAIre Kitchen')
    expect(html).toContain('Australian Consumer Law')
    expect(html).toContain('alt="A kitchen notebook beside a prepared dish."')
    expect(html.match(/href="\/about\/privacy-policy"/g)).toHaveLength(1)
    expect(html).not.toContain('href="/about/terms-and-conditions"')
  })
})
