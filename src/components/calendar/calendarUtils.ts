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
export function formatHeaderLabel(date: Date, view: 'day' | '3day' | 'week' | 'multiweek' | 'month' | 'year' | 'agenda'): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (view === 'day') {
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  if (view === '3day') {
    // Center on date: show yesterday, today, tomorrow
    const startDate = new Date(date)
    startDate.setDate(date.getDate() - 1)
    const endDate = new Date(date)
    endDate.setDate(date.getDate() + 1)
    return `${shortDays[startDate.getDay()]}, ${shortMonths[startDate.getMonth()]} ${startDate.getDate()} \u2013 ${shortDays[endDate.getDay()]}, ${shortMonths[endDate.getMonth()]} ${endDate.getDate()}`
  }

  if (view === 'multiweek') {
    const weekStart = startOfWeek(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 13) // 2 weeks = 14 days, end is day 13 offset
    const startMonth = shortMonths[weekStart.getMonth()]
    const endMonth = shortMonths[weekEnd.getMonth()]
    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()} \u2013 ${weekEnd.getDate()}`
    }
    return `${startMonth} ${weekStart.getDate()} \u2013 ${endMonth} ${weekEnd.getDate()}`
  }

  if (view === 'week') {
    // TickTick-style: "Month Year" (based on the week's start date)
    const weekStart = startOfWeek(date)
    return `${months[weekStart.getMonth()]} ${weekStart.getFullYear()}`
  }

  if (view === 'year') {
    return `${date.getFullYear()}`
  }

  if (view === 'agenda') {
    return `${months[date.getMonth()]} ${date.getFullYear()}`
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

// ─── Pixel-based time helpers ──────────────────────────────────

/**
 * Convert time (hours, minutes) to a Y-pixel offset given an hourHeight.
 */
export function timeToY(hours: number, minutes: number, hourHeight: number): number {
  return hours * hourHeight + (minutes / 60) * hourHeight
}

/**
 * Convert a Y-pixel offset back to time (hours, minutes).
 */
export function yToTime(y: number, hourHeight: number): { hours: number; minutes: number } {
  const totalMinutes = (y / hourHeight) * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  return { hours: Math.min(23, Math.max(0, hours)), minutes: Math.min(59, Math.max(0, minutes)) }
}

// ─── Agenda view helpers ───────────────────────────────────────

/**
 * Returns a relative label for a date: "Today", "Tomorrow", "Yesterday",
 * "in N days", "N days ago", or empty string for dates beyond a week.
 */
export function getRelativeDayLabel(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffMs = target.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 6) return `in ${diffDays} days`
  if (diffDays < -1 && diffDays >= -6) return `${Math.abs(diffDays)} days ago`
  return ''
}

/**
 * Formats a date for agenda day headers: "Wed, Nov 19, 2026"
 */
export function formatAgendaDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${weekday}, ${month} ${day}, ${year}`
}

// ─── Month helpers ─────────────────────────────────────────────

/**
 * Returns the first day of the month for a given date.
 */
export function startOfMonth(date: Date): Date {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Returns the last day of the month for a given date.
 */
export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

// ─── Year view helpers ─────────────────────────────────────────

/**
 * Returns a grid of (Date | null)[] for rendering a mini-month calendar.
 * null entries represent empty padding cells before the first day or after the last day.
 * Grid is 35 or 42 cells to keep layout consistent.
 * Week starts on Sunday (0).
 */
export function getMiniMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun

  const totalDays = lastDay.getDate()
  const cells: (Date | null)[] = []

  // Leading nulls
  for (let i = 0; i < startPad; i++) cells.push(null)
  // Day cells
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d))
  // Trailing nulls to fill to 35 or 42
  const totalCells = cells.length <= 35 ? 35 : 42
  while (cells.length < totalCells) cells.push(null)

  return cells
}
