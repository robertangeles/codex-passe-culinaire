import { describe, expect, it, vi } from 'vitest'
import { approvedAboutLayout, runGuardedAboutUpdate, seededAboutLayout } from '../scripts/about-content'
import type { Page } from '../src/payload-types'

const source = seededAboutLayout()
const snapshot = (layout: Page['layout'] = source, extras: Partial<{ id: number; updatedAt: string; _status: 'draft' | 'published' }> = {}) => ({
  id: 6,
  updatedAt: '2026-10-01T00:00:00.000Z',
  _status: 'published' as const,
  layout,
  ...extras,
})

function operations(published = snapshot(), latest = snapshot()) {
  return {
    published,
    latest,
    getMedia: vi.fn(async (id: number) => id === 10 ? { id, placeholder: true } : undefined),
    backup: vi.fn(async () => undefined),
    reread: vi.fn(async () => published),
    update: vi.fn(async () => undefined),
  }
}

describe('approved About content', () => {
  it('sets editable approved copy while retaining source block IDs and portrait references', () => {
    const original = source.map((block, index) => ({ ...block, id: `block-${index}` })) as Page['layout']
    const approved = approvedAboutLayout(original)

    expect(approved?.[0]).toMatchObject({
      id: 'block-0', eyebrow: 'About Passe Culinaire', heading: 'From the kitchen,\nlooking forward.',
      summary: 'Kitchens run on knowledge passed from one chef to another. They also run on daily decisions: what to prep, what to order, who is on, and what is selling. Too often, those answers sit in separate tools. Passe Culinaire is building one place to bring the work together, with chefs’ knowledge at its centre. We want to be the technology partner chefs and restaurant owners can turn to across the whole operation.',
    })
    expect(approved?.[1]).toMatchObject({ id: 'block-1', blockType: 'prose' })
    expect(approved?.[2]).toMatchObject({ id: 'block-2', portrait: 10, title: 'Co-founder · CEO', links: [] })
    expect(approved?.[3]).toMatchObject({ id: 'block-3', portrait: 10, title: 'Co-founder · CTO' })
    const rob = approved?.[3]
    expect(rob?.blockType).toBe('founderCard')
    if (rob?.blockType === 'founderCard') {
      expect(JSON.stringify(rob.bio)).toContain('graduated in 2026')
      expect(JSON.stringify(rob.bio)).toContain('builds the technology behind Passe Culinaire and CulinAIre Kitchen')
      expect(rob.links).toEqual([])
    }
    expect(approved?.at(-1)).toMatchObject({ blockType: 'feature', heading: 'Beyond\nthe recipe.' })
    expect(approvedAboutLayout(approved)).toEqual(approved)
  })

  it('handles zero, one, or several founder rows without dropping blocks', () => {
    const withFounder = source.filter((block) => block.blockType === 'founderCard')
    for (const founders of [[], withFounder.slice(0, 1), [...withFounder, ...withFounder]]) {
      const layout = [{ blockType: 'hero', heading: 'Original' }, ...founders] as Page['layout']
      const result = approvedAboutLayout(layout)
      expect(result).toHaveLength(layout.length + 1)
      expect(result?.[0]).toMatchObject({ blockType: 'hero', heading: 'From the kitchen,\nlooking forward.' })
    }
  })

  it('backs up and updates only the exact published seed, then returns a no-op for the approved layout', async () => {
    const deps = operations()
    const result = await runGuardedAboutUpdate(deps)
    expect(result.changed).toBe(true)
    expect(deps.backup).toHaveBeenCalledOnce()
    expect(deps.update).toHaveBeenCalledOnce()
    expect(deps.update).toHaveBeenCalledWith(6, approvedAboutLayout(source))

    const approved = snapshot(approvedAboutLayout(source))
    const noOp = operations(approved, approved)
    await expect(runGuardedAboutUpdate(noOp)).resolves.toEqual({ changed: false })
    expect(noOp.backup).not.toHaveBeenCalled()
    expect(noOp.update).not.toHaveBeenCalled()
  })

  it('accepts empty CMS defaults without treating them as editorial changes', async () => {
    const defaults = source.map(block => ({ ...block, blockName: null,
      ...(block.blockType === 'hero' ? { seasonalImages: [], image: null } : {}),
      ...(block.blockType === 'founderCard' ? { links: [] } : {}),
    })) as Page['layout']
    const deps = operations(snapshot(defaults), snapshot(defaults))
    await expect(runGuardedAboutUpdate(deps)).resolves.toMatchObject({ changed: true })
    const saved = approvedAboutLayout(defaults).map(block => block.blockType === 'feature' ? { ...block, imageSide: 'left' as const } : block)
    const approved = snapshot(saved)
    await expect(runGuardedAboutUpdate(operations(approved, approved))).resolves.toEqual({ changed: false })
  })

  it('refuses an independent draft, custom content, and a real portrait', async () => {
    const draft = operations(snapshot(), snapshot(source, { _status: 'draft', updatedAt: '2026-10-02T00:00:00.000Z' }))
    await expect(runGuardedAboutUpdate(draft)).rejects.toThrow(/unpublished About page edit/u)

    const customLayout = [...source, { blockType: 'plainStatement', statement: 'Independent copy' }] as Page['layout']
    const custom = operations(snapshot(customLayout), snapshot(customLayout))
    await expect(runGuardedAboutUpdate(custom)).rejects.toThrow(/differs from its original seeded layout/u)
    const populatedEmptyField = source.map((block) => block.blockType === 'founderCard' && block.name === 'Alex Charasse' ? { ...block, links: [{ label: 'New editorial link', url: '/contact' }] } : block) as Page['layout']
    await expect(runGuardedAboutUpdate(operations(snapshot(populatedEmptyField), snapshot(populatedEmptyField)))).rejects.toThrow(/differs from its original seeded layout/u)

    const withRealPortrait = source.map((block) => block.blockType === 'founderCard' && block.name === 'Alex Charasse'
      ? { ...block, portrait: { id: 44, filename: 'alex.jpg', alt: 'Alex in a kitchen', width: 800, height: 1000 } }
      : block) as Page['layout']
    const real = operations(snapshot(withRealPortrait), snapshot(withRealPortrait))
    await expect(runGuardedAboutUpdate(real)).rejects.toThrow(/differs from its original seeded layout/u)
    expect(real.update).not.toHaveBeenCalled()
  })

  it('refuses a changed published timestamp and a real media record marked non-placeholder', async () => {
    const changedPublished = operations(snapshot(), snapshot(source, { updatedAt: '2026-10-02T00:00:00.000Z' }))
    await expect(runGuardedAboutUpdate(changedPublished)).rejects.toThrow(/unpublished About page edit/u)

    const realMedia = operations()
    realMedia.getMedia.mockResolvedValue({ id: 10, placeholder: false })
    await expect(runGuardedAboutUpdate(realMedia)).rejects.toThrow(/portrait is real or unresolved/u)
    expect(realMedia.backup).not.toHaveBeenCalled()
    expect(realMedia.update).not.toHaveBeenCalled()
  })

  it('does not update when backup fails or the page changes during backup', async () => {
    const backupFailure = operations()
    backupFailure.backup.mockRejectedValueOnce(new Error('disk full'))
    await expect(runGuardedAboutUpdate(backupFailure)).rejects.toThrow('disk full')
    expect(backupFailure.update).not.toHaveBeenCalled()

    const changed = operations()
    changed.reread.mockResolvedValueOnce(snapshot(source, { updatedAt: '2026-10-02T00:00:00.000Z' }))
    await expect(runGuardedAboutUpdate(changed)).rejects.toThrow(/changed during backup/u)
    expect(changed.update).not.toHaveBeenCalled()
  })

  it('requires matching published IDs and publication states for both reads', async () => {
    const unpublished = operations(snapshot(), snapshot(source, { id: 8 }))
    await expect(runGuardedAboutUpdate(unpublished)).rejects.toThrow(/unpublished About page edit/u)
    const missingState = operations(snapshot(source, { _status: undefined }), snapshot(source, { _status: undefined }))
    await expect(runGuardedAboutUpdate(missingState)).rejects.toThrow(/published About page/u)
  })
})
