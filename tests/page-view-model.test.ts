import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Page } from '../src/payload-types'

const mocks = vi.hoisted(() => ({ list: vi.fn(), document: vi.fn(), shell: vi.fn() }))
vi.mock('../src/lib/public-content', () => ({
  listPublicContent: mocks.list, getPublicShell: mocks.shell,
}))
vi.mock('../src/lib/request-content', () => ({ getRequestDocument: mocks.document }))
import { getBlockContent, getPageViewModel } from '../src/lib/page-view-model'

describe('page view models', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.list.mockResolvedValue({ docs: [] })
    mocks.shell.mockResolvedValue({ siteSettings: { externalEmbedsEnabled: false } })
  })

  it('batches repeated feeds at their largest bounded limit', async () => {
    const blocks: Page['layout'] = [
      { blockType: 'journalFeed', limit: 2 }, { blockType: 'journalFeed', limit: 1000 },
      { blockType: 'upcomingEvents', limit: 4 }, { blockType: 'upcomingEvents', limit: 2 },
      { blockType: 'serviceList' }, { blockType: 'serviceList' },
    ]
    await getBlockContent(blocks, new Date('2026-09-25T12:00:00Z'))
    expect(mocks.list).toHaveBeenCalledTimes(3)
    expect(mocks.list).toHaveBeenCalledWith('posts', { limit: 12, sort: '-publishedAt' })
    expect(mocks.list).toHaveBeenCalledWith('services', { limit: 24, sort: 'title' })
    expect(mocks.list).toHaveBeenCalledWith('events', {
      limit: 4, sort: 'startDate', where: { and: [
        { eventStatus: { in: ['upcoming', 'sold-out'] } },
        { startDate: { greater_than_equal: '2026-09-25T12:00:00.000Z' } },
      ] },
    })
  })

  it('does not replace selected inaccessible services with unrelated public offerings', async () => {
    expect(await getBlockContent([{ blockType: 'serviceList', services: [123] }])).toEqual({ posts: [], services: [], events: [] })
    expect(mocks.list).not.toHaveBeenCalled()
  })

  it('returns null for missing pages and propagates required feed failures', async () => {
    mocks.document.mockResolvedValue({ document: null, preview: false })
    expect(await getPageViewModel('missing')).toBeNull()
    expect(mocks.list).not.toHaveBeenCalled()
    mocks.document.mockResolvedValue({ document: { id: 5, layout: [{ blockType: 'journalFeed' }] }, preview: false })
    mocks.list.mockRejectedValue(new Error('Database unavailable'))
    await expect(getPageViewModel('home')).rejects.toThrow('Database unavailable')
  })
})
