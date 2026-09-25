import type { SiteSetting } from '../src/payload-types'
import { describe, expect, it } from 'vitest'
import { buildRobots } from '../src/lib/robots'

const crawlerAgents = [
  '*', 'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User',
  'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Googlebot', 'Bingbot', 'Applebot', 'CCBot',
]
const settings = (robotsTxtExtra?: string | null): SiteSetting => ({ id: 1, name: 'Passe Culinaire', robotsTxtExtra })

describe('robots.txt generation', () => {
  it('sets explicit public and private path rules for wildcard and every named crawler', () => {
    const robots = buildRobots(settings(), 'https://example.test')
    const groups = robots.trim().split(/\n\s*\n/)
    expect(groups).toHaveLength(crawlerAgents.length + 1)

    for (const [index, agent] of crawlerAgents.entries()) {
      expect(groups[index]).toBe([
        `User-agent: ${agent}`,
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api',
        'Disallow: /search',
      ].join('\n'))
    }
    expect(robots).toContain('Sitemap: https://example.test/sitemap.xml')
    expect(robots).not.toContain('Disallow: /media')
  })

  it('normalises the sitemap URL to the validated public origin', () => {
    const robots = buildRobots(settings(), 'https://example.test/path?q=ignored')
    expect(robots).toContain('Sitemap: https://example.test/sitemap.xml')
  })

  it('appends editor directives and comments while removing carriage returns and null bytes', () => {
    const robots = buildRobots(settings('# editorial note\nDisallow: /private\r\nAllow: /media/\0'), 'https://example.test')
    expect(robots).toContain('Sitemap: https://example.test/sitemap.xml\n\n# editorial note\nDisallow: /private\nAllow: /media/')
    expect(robots).not.toContain('\r')
    expect(robots).not.toContain('\0')
  })

  it('omits an empty optional editor section and rejects unsafe origins', () => {
    expect(buildRobots(settings(' \n\t '), 'http://localhost:3000')).not.toContain('\n\n\n')
    expect(() => buildRobots(settings(), 'javascript:alert(1)')).toThrow('The public origin is invalid.')
    expect(() => buildRobots(settings(), 'https://user:secret@example.test')).toThrow('The public origin is invalid.')
  })
})
