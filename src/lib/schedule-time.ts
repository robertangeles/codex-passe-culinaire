const melbourne = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

function localValue(instant: number): string {
  const parts = melbourne.formatToParts(instant)
  const part = (name: string) => parts.find(item => item.type === name)?.value
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`
}

/** Resolve a wall-clock value without silently choosing a DST offset or normalising a missing hour. */
export function resolveScheduleTime(localTime: string, timezone: string, now = new Date()): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localTime)) throw new Error('Choose a date and time.')
  const wallClock = Date.parse(`${localTime}:00Z`)
  if (!Number.isFinite(wallClock) || new Date(wallClock).toISOString().slice(0, 16) !== localTime)
    throw new Error('Choose a valid date and time.')
  if (timezone !== 'Australia/Melbourne' && timezone !== 'UTC') throw new Error('Choose Australia/Melbourne or UTC.')
  // Melbourne uses AEST (+10) or AEDT (+11). Round-trip both candidates against the IANA database.
  const candidates = timezone === 'UTC' ? [wallClock]
    : [wallClock - 10 * 3600000, wallClock - 11 * 3600000].filter(instant => localValue(instant) === localTime)
  if (candidates.length === 0) throw new Error('That Melbourne time does not exist because daylight saving starts. Choose another time.')
  if (candidates.length > 1) throw new Error('That Melbourne time occurs twice because daylight saving ends. Choose UTC or another time.')
  if (candidates[0] <= now.getTime()) throw new Error('Choose a time in the future.')
  return new Date(candidates[0]).toISOString()
}
