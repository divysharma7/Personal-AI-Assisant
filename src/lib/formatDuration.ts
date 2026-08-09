/**
 * Format duration in seconds to compact display format
 * Examples:
 *   0s → "0m"
 *   60s → "1m"
 *   1500s → "25m"
 *   3600s → "1h"
 *   4500s → "1h 15m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0
  if (seconds < 60) return '0m'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Format seconds to timer display (MM:SS or HH:MM:SS)
 */
export function formatTimerDisplay(seconds: number, showHours: boolean = false): string {
  if (seconds < 0) seconds = 0

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (showHours || hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Format duration for display in records (e.g., "25 min", "1 hr 15 min")
 */
export function formatDurationLong(seconds: number): string {
  if (seconds < 0) seconds = 0
  if (seconds < 60) return `${seconds} sec`

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours} hr`)
  if (minutes > 0) parts.push(`${minutes} min`)
  if (secs > 0 && hours === 0) parts.push(`${secs} sec`)

  return parts.join(' ') || '0 min'
}

/**
 * Format date to relative time (e.g., "Today", "Yesterday", "Aug 8")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (targetDate.getTime() === today.getTime()) return 'Today'
  if (targetDate.getTime() === yesterday.getTime()) return 'Yesterday'

  // Check if within this week
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  if (targetDate >= weekStart) {
    return d.toLocaleDateString(undefined, { weekday: 'long' })
  }

  // Format as date
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Format time range (e.g., "10:00 - 10:25")
 */
export function formatTimeRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end

  const formatTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  return `${formatTime(startDate)} - ${formatTime(endDate)}`
}

/**
 * Get timezone-aware date string (YYYY-MM-DD)
 */
export function getLocalDateString(date: Date | string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (timezone) {
    return d.toLocaleDateString('en-CA', { timeZone: timezone })
  }
  return d.toISOString().slice(0, 10)
}
