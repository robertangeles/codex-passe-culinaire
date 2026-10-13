import { cache } from 'react'
import type { Event, Page, Post, Service } from '../payload-types'
import { getPublicShell, listPublicContent } from './public-content'
import { getRequestDocument } from './request-content'

export type PageBlock = NonNullable<Page['layout']>[number]
export type BlockContent = { posts: Post[]; services: Service[]; events: Event[] }

export function feedLimit(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(1, Math.min(12, Math.floor(value)))
    : 3
}

/** Fetch each collection at most once, before rendering any page content. */
export async function getBlockContent(blocks: Page['layout'], now = new Date()): Promise<BlockContent> {
  let postLimit = 0
  let eventLimit = 0
  let needsServices = false
  for (const block of blocks ?? []) {
    if (block.blockType === 'journalFeed') postLimit = Math.max(postLimit, feedLimit(block.limit))
    if (block.blockType === 'upcomingEvents') eventLimit = Math.max(eventLimit, feedLimit(block.limit))
    if (block.blockType === 'serviceList' && !block.services?.length) needsServices = true
  }
  const [posts, services, events] = await Promise.all([
    postLimit ? listPublicContent('posts', { limit: postLimit, sort: '-publishedAt' }).then(result => result.docs) : [],
    needsServices ? listPublicContent('services', { limit: 24, sort: 'title' }).then(result => result.docs) : [],
    eventLimit ? listPublicContent('events', {
      limit: eventLimit, sort: 'startDate',
      where: { and: [
        { eventStatus: { in: ['upcoming', 'sold-out'] } },
        { startDate: { greater_than_equal: now.toISOString() } },
      ] },
    }).then(result => result.docs) : [],
  ])
  return { posts, services, events }
}

/** React cache shares required reads between a route and its metadata in one request. */
export const getPageViewModel = cache(async (slug: string) => {
  const [{ document: page, preview }, shell] = await Promise.all([getRequestDocument('pages', slug), getPublicShell()])
  if (!page) return null
  const content = await getBlockContent(page.layout)
  return { page, content, preview, settings: shell.siteSettings, externalEmbedsEnabled: shell.siteSettings.externalEmbedsEnabled === true }
})
