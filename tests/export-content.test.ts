import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { iterateExportContent } from '../src/lib/export-content'
import { completedExportResponse } from '../src/lib/export-response'

describe('complete public exports', () => {
  it('uses bounded cursor batches and keeps noIndex separate from sitemap-only exclusions', async () => {
    const docs = Array.from({ length: 103 }, (_, index) => ({ id: index + 1, _status: 'published', seo: { noIndex: index === 1, excludeFromSitemap: index === 2 } }))
    const find = vi.fn(async (options: { limit: number; where: { and: Array<{ id?: { greater_than?: number } }> } }) => {
      if (options.limit === 1) return { docs: [docs[docs.length - 1]] }
      const after = options.where.and.find(item => item.id?.greater_than !== undefined)?.id?.greater_than ?? 0
      return { docs: docs.filter(doc => doc.id > after).slice(0, options.limit) }
    })
    const payload = { find } as unknown as Payload
    const exported = []
    for await (const document of iterateExportContent(payload, 'posts')) exported.push(document.id)
    expect(exported).toHaveLength(102)
    expect(exported).not.toContain(2)
    expect(exported).toContain(3)
    expect(exported).toContain(103)
    const sitemap = []
    for await (const document of iterateExportContent(payload, 'posts', true)) sitemap.push(document.id)
    expect(sitemap).toHaveLength(101)
    expect(sitemap).not.toContain(3)
    for (const [options] of find.mock.calls) expect(options).toMatchObject({ overrideAccess: false, draft: false })
  })
  it('finishes generation before creating a successful streaming response', async () => {
    const steps: number[] = []
    async function* chunks() { steps.push(1); yield 'First paragraph.\n'; steps.push(2); yield 'Second paragraph.' }
    const response = await completedExportResponse(chunks(), 'text/markdown; charset=utf-8')
    expect(steps).toEqual([1, 2])
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toContain('s-maxage=600')
    expect(await response.text()).toBe('First paragraph.\nSecond paragraph.')
  })
  it('does not turn a later database failure into a partial successful export', async () => {
    async function* broken() { yield 'First record'; throw new Error('Database unavailable') }
    await expect(completedExportResponse(broken(), 'text/plain')).rejects.toThrow('Database unavailable')
  })
})
