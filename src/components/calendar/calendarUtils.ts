/** Pure utility functions for calendar date/time calculations. */

/**
 * Convert a Date's hours+minutes to a CSS grid row (1-indexed, 96 rows for 15-min slots).
 * Row 1 = 00:00, Row 4 = 00:45, Row 5 = 01:00, etc.
 */
export function timeToGridRow(date: Date): number {
  return date.getHours() * 4 + Math.floor(date.getMinutes() / 15) + 1
}

/**
 * Compute the grid row span between two dates.
 * Minimum span = 1 (15 minutes).
 */
export function gridRowSpan(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime()
  const slots = Math.max(1, Math.round(diffMs / (15 * 60 * 1000)))
  return slots
}

/**
 * Format duration between two dates, e.g. "1h 30m", "45m", "2h".
 */
export function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime()
  const totalMinutes = Math.round(diffMs / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Get the start-of-week (Monday) for a given date.
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday = 1
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Check if two dates are the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Check if a date is in the past (before today).
 */
export function isPast(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compare = new Date(date)
  compare.setHours(0, 0, 0, 0)
  return compare.getTime() < today.getTime()
}

/**
 * Get all 42 cells (6 weeks x 7 days) for a month grid, starting Monday.
 */
export function getMonthGrid(date: Date): Date[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startDay = startOfWeek(firstOfMonth)

  const cells: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDay)
    d.setDate(startDay.getDate() + i)
    cells.push(d)
  }
  return cells
}

/**
 * Format a date for the header label depending on the view.
 */
export function formatHeaderLabel(date: Date, view: 'day' | 'week' | 'month'): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (view === 'day') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  if (view === 'week') {
    const weekStart = startOfWeek(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const startMonth = months[weekStart.getMonth()]
    const endMonth = months[weekEnd.getMonth()]

    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()}\u2013${weekEnd.getDate()}`
    }
    return `${startMonth} ${weekStart.getDate()} \u2013 ${endMonth} ${weekEnd.getDate()}`
  }

  // month
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Generate hour labels for the time grid (0-23).
 */
export function getHourLabels(): string[] {
  const labels: string[] = []
  for (let h = 0; h < 24; h++) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ampm = h < 12 ? 'AM' : 'PM'
    labels.push(`${hour12} ${ampm}`)
  }
  return labels
}

/**
 * Determine text color (white or dark) based on background hex color for contrast.
 */
export function getContrastTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1A1A1F' : '#FFFFFF'
}
