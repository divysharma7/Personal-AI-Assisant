import { useMemo } from 'react'
import type { AgendaItem, AgendaResponse } from '@/hooks/useAgenda'
import type { CalendarPreferences } from '@/hooks/useSettings'

/* ── Types ─────────────────────────────────────────────────── */

export interface FocusWindow {
  id: string
  start: string
  end: string
  durationMinutes: number
  reason: string
}

interface CapacityInfo {
  /** Total working minutes from calendar preferences */
  totalWorkingMinutes: number
  /** Minutes already committed (busy events + scheduled tasks) */
  committedMinutes: number
  /** Minutes still available */
  availableMinutes: number
  /** Suggested focus windows in free slots */
  suggestedWindows: FocusWindow[]
  /** Whether the day has any capacity */
  hasCapacity: boolean
  /** Percentage of day committed (0-100) */
  committedPercent: number
}

/* ── Helpers ───────────────────────────────────────────────── */

function parseTime(iso: string): Date {
  return new Date(iso)
}

function minutesBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60_000))
}

function toIsoString(d: Date): string {
  return d.toISOString()
}

/** Build windows of free time between busy intervals */
function findFreeSlots(
  busySlots: { start: Date; end: Date }[],
  rangeStart: Date,
  rangeEnd: Date,
): { start: Date; end: Date }[] {
  // Sort by start time
  const sorted = [...busySlots]
    .filter((s) => s.end > rangeStart && s.start < rangeEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  const free: { start: Date; end: Date }[] = []
  let cursor = rangeStart

  for (const slot of sorted) {
    const slotStart = slot.start < rangeStart ? rangeStart : slot.start
    if (cursor < slotStart) {
      free.push({ start: cursor, end: slotStart })
    }
    cursor = slot.end > cursor ? slot.end : cursor
  }

  if (cursor < rangeEnd) {
    free.push({ start: cursor, end: rangeEnd })
  }

  return free
}

/* ── Capacity calculation (LOS-502) ────────────────────────── */

/**
 * Computes available capacity and suggests focus windows
 * based on:
 * - Working hours (from calendar preferences)
 * - Active busy events only
 * - Existing scheduled tasks
 * - Task estimate and preferred focus rhythm
 *
 * Does NOT persist suggestions — they are ephemeral until accepted.
 */
export function useCapacity(
  agenda: AgendaResponse,
  preferences: CalendarPreferences | null,
  selectedTaskEstimateMinutes?: number,
): CapacityInfo {
  return useMemo(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()

    // Working hours from preferences (default: 9-17)
    const workStartHour = preferences?.hiddenHoursStart ?? 9
    const workEndHour = preferences?.hiddenHoursEnd ?? 17
    const dailyCapacityHours = preferences?.dailyCapacityHours ?? 8

    // Build the working day range
    const todayStr = agenda.date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const workStart = new Date(`${todayStr}T${String(workStartHour).padStart(2, '0')}:00:00`)
    const workEnd = new Date(`${todayStr}T${String(workEndHour).padStart(2, '0')}:00:00`)

    // If the working day hasn't started yet, use the start; if it has, use now
    const effectiveStart = now > workStart ? now : workStart
    const totalWorkingMinutes = dailyCapacityHours * 60

    // Collect busy intervals: external events (busy) + scheduled tasks
    const busySlots: { start: Date; end: Date }[] = []

    for (const item of agenda.items) {
      if (!item.start || !item.end) continue
      if (item.availability === 'free') continue // Passive/free events don't reduce capacity

      const start = parseTime(item.start)
      const end = parseTime(item.end)

      // Only count items within today
      if (end <= workStart || start >= workEnd) continue

      busySlots.push({ start, end })
    }

    // Calculate committed minutes within working hours
    const committedMinutes = busySlots.reduce((total, slot) => {
      const s = slot.start < workStart ? workStart : slot.start
      const e = slot.end > workEnd ? workEnd : slot.end
      return total + minutesBetween(s, e)
    }, 0)

    const availableMinutes = Math.max(0, totalWorkingMinutes - committedMinutes)

    // Find free slots and generate suggested windows
    const freeSlots = findFreeSlots(busySlots, effectiveStart, workEnd)
    const focusDuration = selectedTaskEstimateMinutes || 50 // Default: 50 min focus block

    const suggestedWindows: FocusWindow[] = []
    let windowIndex = 0

    for (const slot of freeSlots) {
      if (suggestedWindows.length >= 3) break // Max 3 suggestions

      const slotMinutes = minutesBetween(slot.start, slot.end)

      // Only suggest windows that can fit the focus duration
      if (slotMinutes < 25) continue // Min 25 min (shortest pomodoro)

      const actualDuration = Math.min(slotMinutes, focusDuration, 90) // Cap at 90 min
      windowIndex++

      // Generate a reason
      let reason: string
      const slotStartHour = slot.start.getHours()
      if (slotStartHour >= 9 && slotStartHour < 12) {
        reason = 'Morning focus block — best for deep work'
      } else if (slotStartHour >= 12 && slotStartHour < 14) {
        reason = 'Midday slot — good for lighter focus'
      } else if (slotStartHour >= 14 && slotStartHour < 17) {
        reason = 'Afternoon block — sustained work time'
      } else {
        reason = 'Available time slot'
      }

      suggestedWindows.push({
        id: `suggestion-${windowIndex}`,
        start: toIsoString(slot.start),
        end: toIsoString(new Date(slot.start.getTime() + actualDuration * 60_000)),
        durationMinutes: actualDuration,
        reason,
      })
    }

    const hasCapacity = availableMinutes >= 25
    const committedPercent = totalWorkingMinutes > 0
      ? Math.min(100, Math.round((committedMinutes / totalWorkingMinutes) * 100))
      : 0

    return {
      totalWorkingMinutes,
      committedMinutes,
      availableMinutes,
      suggestedWindows,
      hasCapacity,
      committedPercent,
    }
  }, [agenda, preferences, selectedTaskEstimateMinutes])
}

/* ── Time formatting ───────────────────────────────────────── */

export function formatWindowTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
