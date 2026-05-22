import { computeOverlapLayout, type TimedEvent } from './calendarLayout'

describe('computeOverlapLayout', () => {
  it('returns empty Map for empty events array', () => {
    const result = computeOverlapLayout([])
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  it('assigns single event to column=0, totalColumns=1', () => {
    const events: TimedEvent[] = [{ id: 'a', startMinutes: 60, endMinutes: 120 }]
    const result = computeOverlapLayout(events)
    expect(result.get('a')).toEqual({ id: 'a', column: 0, totalColumns: 1 })
  })

  it('assigns two non-overlapping sequential events each to column=0, totalColumns=1', () => {
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 180, endMinutes: 240 },
    ]
    const result = computeOverlapLayout(events)
    expect(result.get('a')).toEqual({ id: 'a', column: 0, totalColumns: 1 })
    expect(result.get('b')).toEqual({ id: 'b', column: 0, totalColumns: 1 })
  })

  it('assigns two fully overlapping events to columns 0 and 1, totalColumns=2', () => {
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 60, endMinutes: 120 },
    ]
    const result = computeOverlapLayout(events)
    const colA = result.get('a')!.column
    const colB = result.get('b')!.column
    expect(new Set([colA, colB])).toEqual(new Set([0, 1]))
    expect(result.get('a')!.totalColumns).toBe(2)
    expect(result.get('b')!.totalColumns).toBe(2)
  })

  it('handles three events: A overlaps B, B overlaps C, A does not overlap C', () => {
    // A: 60-120, B: 90-180, C: 150-210
    // A overlaps B (60-120 vs 90-180), B overlaps C (90-180 vs 150-210)
    // A does NOT overlap C (60-120 vs 150-210)
    // All should be in one group because overlap is transitive
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 90, endMinutes: 180 },
      { id: 'c', startMinutes: 150, endMinutes: 210 },
    ]
    const result = computeOverlapLayout(events)
    // All in same group, so totalColumns should be the same for all
    const totalA = result.get('a')!.totalColumns
    const totalB = result.get('b')!.totalColumns
    const totalC = result.get('c')!.totalColumns
    expect(totalA).toBe(totalB)
    expect(totalB).toBe(totalC)
    // A and C don't overlap, so C can reuse A's column (greedy packing)
    // A gets col 0, B gets col 1 (overlaps with A), C gets col 0 (A ended at 120, C starts at 150)
    expect(result.get('a')!.column).toBe(0)
    expect(result.get('b')!.column).toBe(1)
    expect(result.get('c')!.column).toBe(0)
    expect(totalA).toBe(2)
  })

  it('treats adjacent events (end equals start) as NOT overlapping', () => {
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 120, endMinutes: 180 },
    ]
    const result = computeOverlapLayout(events)
    // Both should be in column 0 with totalColumns 1 since they don't overlap
    expect(result.get('a')).toEqual({ id: 'a', column: 0, totalColumns: 1 })
    expect(result.get('b')).toEqual({ id: 'b', column: 0, totalColumns: 1 })
  })

  it('assigns column 0 to longer event when events have same start time', () => {
    const events: TimedEvent[] = [
      { id: 'short', startMinutes: 60, endMinutes: 90 },
      { id: 'long', startMinutes: 60, endMinutes: 180 },
    ]
    const result = computeOverlapLayout(events)
    // Sorting: same start, longer duration first -> 'long' gets column 0
    expect(result.get('long')!.column).toBe(0)
    expect(result.get('short')!.column).toBe(1)
    expect(result.get('long')!.totalColumns).toBe(2)
  })

  it('handles 5+ concurrent events with correct totalColumns', () => {
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 60, endMinutes: 120 },
      { id: 'c', startMinutes: 60, endMinutes: 120 },
      { id: 'd', startMinutes: 60, endMinutes: 120 },
      { id: 'e', startMinutes: 60, endMinutes: 120 },
    ]
    const result = computeOverlapLayout(events)
    // All 5 overlap -> 5 columns
    for (const id of ['a', 'b', 'c', 'd', 'e']) {
      expect(result.get(id)!.totalColumns).toBe(5)
    }
    // All columns should be unique (0-4)
    const columns = new Set(['a', 'b', 'c', 'd', 'e'].map((id) => result.get(id)!.column))
    expect(columns.size).toBe(5)
  })

  it('handles mixed overlapping groups independently', () => {
    // Group 1: a and b overlap
    // Group 2: c alone
    const events: TimedEvent[] = [
      { id: 'a', startMinutes: 60, endMinutes: 120 },
      { id: 'b', startMinutes: 90, endMinutes: 150 },
      { id: 'c', startMinutes: 300, endMinutes: 360 },
    ]
    const result = computeOverlapLayout(events)
    expect(result.get('a')!.totalColumns).toBe(2)
    expect(result.get('b')!.totalColumns).toBe(2)
    expect(result.get('c')!.totalColumns).toBe(1)
    expect(result.get('c')!.column).toBe(0)
  })
})
