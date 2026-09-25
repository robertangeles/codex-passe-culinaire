import type { SiteSetting } from '../payload-types'

const crawlerAgents = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'CCBot',
]

function validatedOrigin(value: string): string {
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('The public origin is invalid.')
  }
  return url.origin
}

function extraLines(value: string | null | undefined): string {
  if (!value) return ''
  // Textareas can contain carriage returns, nulls, or lone UTF-16 surrogates.
  // TextEncoder/Decoder replaces invalid scalar values while preserving newlines.
  const clean = new TextDecoder().decode(new TextEncoder().encode(value.replace(/[\r\0]/g, '')))
  return clean.trim() ? clean : ''
}

export function buildRobots(settings: SiteSetting, origin: string): string {
  const base = 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /search'
  const named = crawlerAgents.map(agent =>
    `User-agent: ${agent}\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /search`,
  )
  const sitemap = `Sitemap: ${validatedOrigin(origin)}/sitemap.xml`
  const extra = extraLines(settings.robotsTxtExtra)
  return [base, ...named, sitemap, extra].filter(Boolean).join('\n\n') + '\n'
}
