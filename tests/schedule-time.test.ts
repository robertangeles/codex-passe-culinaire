import { describe, expect, it } from 'vitest'
import { resolveScheduleTime } from '../src/lib/schedule-time'
const now = new Date('2026-01-01T00:00:00Z')
describe('scheduled publication instants', () => {
  it('resolves winter and summer Melbourne wall times to the correct UTC instant', () => {
    expect(resolveScheduleTime('2026-07-01T12:00', 'Australia/Melbourne', now)).toBe('2026-07-01T02:00:00.000Z')
    expect(resolveScheduleTime('2026-12-01T12:00', 'Australia/Melbourne', now)).toBe('2026-12-01T01:00:00.000Z')
  })
  it('rejects the missing spring hour rather than moving it forwards', () => {
    expect(() => resolveScheduleTime('2026-10-04T02:30', 'Australia/Melbourne', now)).toThrow('does not exist')
    expect(resolveScheduleTime('2026-10-04T03:30', 'Australia/Melbourne', now)).toBe('2026-10-03T16:30:00.000Z')
  })
  it('rejects the repeated autumn hour and permits an explicitly chosen UTC instant', () => {
    expect(() => resolveScheduleTime('2026-04-05T02:30', 'Australia/Melbourne', now)).toThrow('occurs twice')
    expect(resolveScheduleTime('2026-04-04T15:30', 'UTC', now)).toBe('2026-04-04T15:30:00.000Z')
    expect(resolveScheduleTime('2026-04-04T16:30', 'UTC', now)).toBe('2026-04-04T16:30:00.000Z')
  })
  it('rejects malformed, impossible, past and unsupported-zone inputs', () => {
    for (const local of ['2026-02-30T12:00', '2026-13-01T00:00', 'invalid', '2026-01-01T00:00'])
      expect(() => resolveScheduleTime(local, 'UTC', now)).toThrow()
    expect(() => resolveScheduleTime('2026-12-01T12:00', 'Unknown/Zone', now)).toThrow('Choose Australia/Melbourne or UTC')
  })
})
