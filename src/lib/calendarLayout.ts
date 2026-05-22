/**
 * Overlap / layout calculation for timed calendar events.
 *
 * Given a set of events on a single day, this module computes each event's
 * horizontal position (column index) and the total number of concurrent
 * columns so that overlapping events render side by side.
 */

export interface TimedEvent {
  id: string
  startMinutes: number // minutes from midnight
  endMinutes: number   // minutes from midnight
}

export interface LayoutSlot {
  id: string
  column: number
  totalColumns: number
}

/**
 * Compute side-by-side layout slots for a list of timed events.
 * Uses a greedy column-packing algorithm.
 */
export function computeOverlapLayout(events: TimedEvent[]): Map<string, LayoutSlot> {
  if (events.length === 0) return new Map()

  // Sort by start time, then by longer duration first
  const sorted = [...events].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
    return (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes)
  })

  // columns[i] = the end time of the last event placed in column i
  const columns: number[] = []
  const assignments = new Map<string, number>()

  for (const event of sorted) {
    // Find the first column where this event fits (no overlap)
    let placed = false
    for (let col = 0; col < columns.length; col++) {
      if (columns[col] <= event.startMinutes) {
        columns[col] = event.endMinutes
        assignments.set(event.id, col)
        placed = true
        break
      }
    }
    if (!placed) {
      assignments.set(event.id, columns.length)
      columns.push(event.endMinutes)
    }
  }

  // Now compute connected groups to determine totalColumns for each event.
  // Two events are in the same group if they overlap in time (transitively).
  const result = new Map<string, LayoutSlot>()

  // Build groups: find clusters of mutually overlapping events
  const groups: TimedEvent[][] = []
  let currentGroup: TimedEvent[] = []
  let groupEnd = 0

  for (const event of sorted) {
    if (currentGroup.length === 0 || event.startMinutes < groupEnd) {
      currentGroup.push(event)
      groupEnd = Math.max(groupEnd, event.endMinutes)
    } else {
      groups.push(currentGroup)
      currentGroup = [event]
      groupEnd = event.endMinutes
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  for (const group of groups) {
    // The total columns for this group = max column index + 1
    let maxCol = 0
    for (const event of group) {
      const col = assignments.get(event.id) ?? 0
      maxCol = Math.max(maxCol, col)
    }
    const totalColumns = maxCol + 1

    for (const event of group) {
      result.set(event.id, {
        id: event.id,
        column: assignments.get(event.id) ?? 0,
        totalColumns,
      })
    }
  }

  return result
}
