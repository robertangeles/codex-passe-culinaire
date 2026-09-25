import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import HomePage from '../src/app/(public)/page'

describe('Phase 1 public home', () => {
  it('renders its content in server HTML with one heading and a main landmark', () => {
    const html = renderToStaticMarkup(<HomePage />)

    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<h1 class="wordmark">passe culinaire</h1>')
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('https://www.culinaire.kitchen')
  })
})
