import { describe, expect, it, vi } from 'vitest'
import { approvedCulinaireKitchenLayout, runGuardedCulinaireKitchenUpdate, seededCulinaireKitchenLayout } from '../scripts/culinaire-kitchen-content'
import type { Page } from '../src/payload-types'

const seed = seededCulinaireKitchenLayout()
const snapshot = (layout: Page['layout'] = seed, extras: Partial<{ id: number; updatedAt: string; _status: 'draft' | 'published' }> = {}) => ({
  id: 7, updatedAt: '2026-09-25T06:46:01.146Z', _status: 'published' as const, layout, ...extras,
})
function operations(published = snapshot(), latest = snapshot()) {
  return { published, latest, backup: vi.fn(async () => undefined), reread: vi.fn(async () => published), update: vi.fn(async () => undefined) }
}

describe('approved CulinAIre Kitchen content update', () => {
  it('starts from the three seeded blocks and produces editable approved feature blocks', () => {
    expect(seed).toHaveLength(3)
    const layout = approvedCulinaireKitchenLayout()
    expect(layout).toHaveLength(10)
    expect(layout?.[0]).toMatchObject({ blockType: 'hero', blockName: 'Kitchen introduction', eyebrow: 'CulinAIre Kitchen · By Passe Culinaire' })
    expect(layout?.filter((block) => block.blockType === 'feature')).toHaveLength(9)
    expect(JSON.stringify(layout)).toContain('Forecasting')
    expect(JSON.stringify(layout)).toContain('Inventory & stock transfers')
    expect(JSON.stringify(layout)).toContain('Patisserie Lab')
    expect(JSON.stringify(layout)).toContain('shows ingredients shared by selected dishes')
    expect(JSON.stringify(layout)).toContain('AI helps with recipe development and culinary questions.')
    expect(JSON.stringify(layout)).not.toContain('pâte sucrée')
  })

  it('backs up and updates only the exact published seed, and treats the approved layout as a no-op', async () => {
    const deps = operations()
    await expect(runGuardedCulinaireKitchenUpdate(deps)).resolves.toMatchObject({ changed: true })
    expect(deps.backup).toHaveBeenCalledOnce()
    expect(deps.update).toHaveBeenCalledWith(7, approvedCulinaireKitchenLayout(seed))

    const approved = snapshot(approvedCulinaireKitchenLayout(seed))
    const noOp = operations(approved, approved)
    await expect(runGuardedCulinaireKitchenUpdate(noOp)).resolves.toEqual({ changed: false })
    expect(noOp.backup).not.toHaveBeenCalled()
    expect(noOp.update).not.toHaveBeenCalled()
  })

  it('backs up before its final reread and mutation', async () => {
    const order: string[] = []
    const deps = {
      ...operations(),
      backup: vi.fn(async () => { order.push('backup') }),
      reread: vi.fn(async () => { order.push('reread'); return snapshot() }),
      update: vi.fn(async () => { order.push('update') }),
    }
    await runGuardedCulinaireKitchenUpdate(deps)
    expect(order).toEqual(['backup', 'reread', 'update'])
  })

  it('rejects a missing or unpublished page, mismatched latest ID, draft, and independent layout edits', async () => {
    await expect(runGuardedCulinaireKitchenUpdate({ published: undefined, latest: undefined, backup: vi.fn(), reread: vi.fn(), update: vi.fn() })).rejects.toThrow(/No published/u)
    const draft = operations(snapshot(), snapshot(seed, { _status: 'draft', updatedAt: '2026-10-02T00:00:00.000Z' }))
    await expect(runGuardedCulinaireKitchenUpdate(draft)).rejects.toThrow(/unpublished CulinAIre Kitchen edit/u)
    await expect(runGuardedCulinaireKitchenUpdate(operations(snapshot(), snapshot(seed, { id: 8 })))).rejects.toThrow(/unpublished CulinAIre Kitchen edit/u)
    const edited = [...seed, { blockType: 'plainStatement' as const, statement: 'Independent editorial content.' }] as Page['layout']
    await expect(runGuardedCulinaireKitchenUpdate(operations(snapshot(edited), snapshot(edited)))).rejects.toThrow(/differs from its original seeded layout/u)
  })

  it('stops when backup fails or a fresh reread detects a concurrent change', async () => {
    const failed = operations()
    failed.backup.mockRejectedValueOnce(new Error('backup unavailable'))
    await expect(runGuardedCulinaireKitchenUpdate(failed)).rejects.toThrow('backup unavailable')
    expect(failed.update).not.toHaveBeenCalled()

    const changed = operations()
    changed.reread.mockResolvedValueOnce(snapshot(seed, { updatedAt: '2026-10-02T00:00:00.000Z' }))
    await expect(runGuardedCulinaireKitchenUpdate(changed)).rejects.toThrow(/changed during backup/u)
    expect(changed.update).not.toHaveBeenCalled()
  })
})
