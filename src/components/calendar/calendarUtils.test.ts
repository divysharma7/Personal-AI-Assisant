import {
  timeToGridRow,
  gridRowSpan,
  formatDuration,
  startOfWeek,
  isSameDay,
  isToday,
  isPast,
  getMonthGrid,
  formatHeaderLabel,
  getHourLabels,
  getContrastTextColor,
  timeToY,
  yToTime,
  getRelativeDayLabel,
  getMiniMonthGrid,
} from './calendarUtils'

// ── timeToGridRow ────────────────────────────────────────────────

describe('timeToGridRow', () => {
  it('returns 1 for midnight (00:00)', () => {
    expect(timeToGridRow(new Date(2025, 0, 1, 0, 0))).toBe(1)
  })

  it('returns 5 for 1:00 AM', () => {
    expect(timeToGridRow(new Date(2025, 0, 1, 1, 0))).toBe(5)
  })

  it('returns 49 for 12:00 PM (noon)', () => {
    expect(timeToGridRow(new Date(2025, 0, 1, 12, 0))).toBe(49)
  })

  it('returns 96 for 23:45', () => {
    expect(timeToGridRow(new Date(2025, 0, 1, 23, 45))).toBe(96)
  })

  it('returns 3 for 00:30', () => {
    expect(timeToGridRow(new Date(2025, 0, 1, 0, 30))).toBe(3)
  })
})

// ── gridRowSpan ──────────────────────────────────────────────────

describe('gridRowSpan', () => {
  it('returns 1 for 15-minute event', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 10, 15)
    expect(gridRowSpan(start, end)).toBe(1)
  })

  it('returns 4 for 1-hour event', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 11, 0)
    expect(gridRowSpan(start, end)).toBe(4)
  })

  it('returns minimum 1 for zero-length event', () => {
    const d = new Date(2025, 0, 1, 10, 0)
    expect(gridRowSpan(d, d)).toBe(1)
  })

  it('returns 8 for 2-hour event', () => {
    const start = new Date(2025, 0, 1, 14, 0)
    const end = new Date(2025, 0, 1, 16, 0)
    expect(gridRowSpan(start, end)).toBe(8)
  })
})

// ── formatDuration ───────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats 45 minutes as "45m"', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 10, 45)
    expect(formatDuration(start, end)).toBe('45m')
  })

  it('formats 1 hour as "1h"', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 11, 0)
    expect(formatDuration(start, end)).toBe('1h')
  })

  it('formats 1.5 hours as "1h 30m"', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 11, 30)
    expect(formatDuration(start, end)).toBe('1h 30m')
  })

  it('formats 2 hours as "2h"', () => {
    const start = new Date(2025, 0, 1, 10, 0)
    const end = new Date(2025, 0, 1, 12, 0)
    expect(formatDuration(start, end)).toBe('2h')
  })
})

// ── startOfWeek ──────────────────────────────────────────────────

describe('startOfWeek', () => {
  it('returns Monday for a Wednesday input', () => {
    // Jan 8, 2025 is a Wednesday
    const wed = new Date(2025, 0, 8, 15, 30)
    const result = startOfWeek(wed)
    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(6)
    expect(result.getHours()).toBe(0)
  })

  it('returns same Monday for a Monday input', () => {
    // Jan 6, 2025 is a Monday
    const mon = new Date(2025, 0, 6, 12, 0)
    const result = startOfWeek(mon)
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(6)
  })

  it('returns previous Monday for a Sunday input', () => {
    // Jan 5, 2025 is a Sunday
    const sun = new Date(2025, 0, 5, 12, 0)
    const result = startOfWeek(sun)
    expect(result.getDay()).toBe(1)
    // Sunday Jan 5 -> Monday Dec 30, 2024
    expect(result.getDate()).toBe(30)
    expect(result.getMonth()).toBe(11) // December
    expect(result.getFullYear()).toBe(2024)
  })

  it('returns Monday for a Saturday input', () => {
    // Jan 4, 2025 is a Saturday
    const sat = new Date(2025, 0, 4, 12, 0)
    const result = startOfWeek(sat)
    expect(result.getDay()).toBe(1)
    // Saturday Jan 4 -> Monday Dec 30, 2024
    expect(result.getDate()).toBe(30)
    expect(result.getMonth()).toBe(11)
  })
})

// ── isSameDay ────────────────────────────────────────────────────

describe('isSameDay', () => {
  it('returns true for same calendar day at different times', () => {
    const a = new Date(2025, 5, 15, 8, 0)
    const b = new Date(2025, 5, 15, 22, 30)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for different calendar days', () => {
    const a = new Date(2025, 5, 15, 23, 59)
    const b = new Date(2025, 5, 16, 0, 0)
    expect(isSameDay(a, b)).toBe(false)
  })

  it('returns true for midnight boundary of same day', () => {
    const a = new Date(2025, 5, 15, 0, 0, 0, 0)
    const b = new Date(2025, 5, 15, 23, 59, 59, 999)
    expect(isSameDay(a, b)).toBe(true)
  })

  it('returns false for same day in different months', () => {
    const a = new Date(2025, 0, 15)
    const b = new Date(2025, 1, 15)
    expect(isSameDay(a, b)).toBe(false)
  })
})

// ── isToday ──────────────────────────────────────────────────────

describe('isToday', () => {
  it('returns true for current date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
    expect(isToday(new Date(2025, 5, 15, 8, 30))).toBe(true)
    vi.useRealTimers()
  })

  it('returns false for yesterday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
    expect(isToday(new Date(2025, 5, 14, 12, 0))).toBe(false)
    vi.useRealTimers()
  })
})

// ── isPast ───────────────────────────────────────────────────────

describe('isPast', () => {
  it('returns true for yesterday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
    expect(isPast(new Date(2025, 5, 14))).toBe(true)
    vi.useRealTimers()
  })

  it('returns false for today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
    expect(isPast(new Date(2025, 5, 15))).toBe(false)
    vi.useRealTimers()
  })

  it('returns false for tomorrow', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
    expect(isPast(new Date(2025, 5, 16))).toBe(false)
    vi.useRealTimers()
  })
})

// ── getMonthGrid ─────────────────────────────────────────────────

describe('getMonthGrid', () => {
  it('returns exactly 42 dates', () => {
    const grid = getMonthGrid(new Date(2025, 0, 1))
    expect(grid).toHaveLength(42)
  })

  it('starts on Monday', () => {
    const grid = getMonthGrid(new Date(2025, 0, 1))
    expect(grid[0].getDay()).toBe(1) // Monday
  })

  it('contains all days from Date objects', () => {
    const grid = getMonthGrid(new Date(2025, 0, 1))
    expect(grid.every((d) => d instanceof Date)).toBe(true)
  })

  it('contains the 1st of the given month', () => {
    const grid = getMonthGrid(new Date(2025, 5, 1))
    const hasFirst = grid.some(
      (d) => d.getFullYear() === 2025 && d.getMonth() === 5 && d.getDate() === 1
    )
    expect(hasFirst).toBe(true)
  })
})

// ── formatHeaderLabel ────────────────────────────────────────────

describe('formatHeaderLabel', () => {
  // Jan 8, 2025 is a Wednesday
  const date = new Date(2025, 0, 8)

  it('day view: "Wednesday, January 8"', () => {
    expect(formatHeaderLabel(date, 'day')).toBe('Wednesday, January 8')
  })

  it('week view: includes month and date range', () => {
    const label = formatHeaderLabel(date, 'week')
    expect(label).toContain('January')
  })

  it('month view: "January 2025"', () => {
    expect(formatHeaderLabel(date, 'month')).toBe('January 2025')
  })

  it('year view: "2025"', () => {
    expect(formatHeaderLabel(date, 'year')).toBe('2025')
  })

  it('agenda view: "January 2025"', () => {
    expect(formatHeaderLabel(date, 'agenda')).toBe('January 2025')
  })

  it('3day view: shows 3-day range', () => {
    const label = formatHeaderLabel(date, '3day')
    // Should contain a dash/range
    expect(label).toContain('\u2013')
  })
})

// ── getHourLabels ────────────────────────────────────────────────

describe('getHourLabels', () => {
  it('returns 24 entries', () => {
    expect(getHourLabels()).toHaveLength(24)
  })

  it('starts with "12 AM"', () => {
    expect(getHourLabels()[0]).toBe('12 AM')
  })

  it('has "12 PM" at index 12', () => {
    expect(getHourLabels()[12]).toBe('12 PM')
  })

  it('ends with "11 PM"', () => {
    expect(getHourLabels()[23]).toBe('11 PM')
  })

  it('has "1 AM" at index 1', () => {
    expect(getHourLabels()[1]).toBe('1 AM')
  })
})

// ── getContrastTextColor ─────────────────────────────────────────

describe('getContrastTextColor', () => {
  it('returns white for dark background (#000000)', () => {
    expect(getContrastTextColor('#000000')).toBe('#FFFFFF')
  })

  it('returns dark for light background (#FFFFFF)', () => {
    expect(getContrastTextColor('#FFFFFF')).toBe('#1A1A1F')
  })

  it('returns white for medium-dark blue (#3b82f6)', () => {
    expect(getContrastTextColor('#3b82f6')).toBe('#FFFFFF')
  })

  it('returns dark for bright yellow (#FFFF00)', () => {
    expect(getContrastTextColor('#FFFF00')).toBe('#1A1A1F')
  })

  it('handles hex without hash prefix', () => {
    // The function strips # so it should handle both
    expect(getContrastTextColor('000000')).toBe('#FFFFFF')
  })
})

// ── timeToY / yToTime round-trip ─────────────────────────────────

describe('timeToY and yToTime', () => {
  it('timeToY converts 0:00 to 0px', () => {
    expect(timeToY(0, 0, 60)).toBe(0)
  })

  it('timeToY converts 1:00 to hourHeight px', () => {
    expect(timeToY(1, 0, 60)).toBe(60)
  })

  it('timeToY converts 1:30 to 1.5 * hourHeight', () => {
    expect(timeToY(1, 30, 60)).toBe(90)
  })

  it('yToTime converts 0 back to 0:00', () => {
    expect(yToTime(0, 60)).toEqual({ hours: 0, minutes: 0 })
  })

  it('yToTime converts 90 back to 1:30', () => {
    expect(yToTime(90, 60)).toEqual({ hours: 1, minutes: 30 })
  })

  it('round-trip consistency: timeToY -> yToTime', () => {
    const hourHeight = 60
    for (const [h, m] of [[0, 0], [6, 15], [12, 30], [18, 45], [23, 0]]) {
      const y = timeToY(h, m, hourHeight)
      const result = yToTime(y, hourHeight)
      expect(result.hours).toBe(h)
      expect(result.minutes).toBe(m)
    }
  })

  it('yToTime clamps hours to 0-23 and minutes to 0-59', () => {
    // Very large y -> hours clamped to 23
    const result = yToTime(99999, 60)
    expect(result.hours).toBe(23)
    expect(result.minutes).toBeLessThanOrEqual(59)
    expect(result.minutes).toBeGreaterThanOrEqual(0)
    // Negative y -> clamped to 0:00
    const resultNeg = yToTime(-10, 60)
    expect(resultNeg.hours).toBe(0)
    expect(resultNeg.minutes).toBe(0)
  })
})

// ── getRelativeDayLabel ──────────────────────────────────────────

describe('getRelativeDayLabel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Today" for today', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 15))).toBe('Today')
  })

  it('returns "Tomorrow" for tomorrow', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 16))).toBe('Tomorrow')
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 14))).toBe('Yesterday')
  })

  it('returns "in 3 days" for 3 days from now', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 18))).toBe('in 3 days')
  })

  it('returns "3 days ago" for 3 days ago', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 12))).toBe('3 days ago')
  })

  it('returns empty string for dates beyond a week', () => {
    expect(getRelativeDayLabel(new Date(2025, 5, 25))).toBe('')
  })
})

// ── getMiniMonthGrid ─────────────────────────────────────────────

describe('getMiniMonthGrid', () => {
  it('returns 35 or 42 cells', () => {
    const grid = getMiniMonthGrid(2025, 0) // January 2025
    expect([35, 42]).toContain(grid.length)
  })

  it('starts with correct number of null padding cells', () => {
    // January 2025: Jan 1 is Wednesday (day=3)
    // Week starts Sunday so startPad = 3
    const grid = getMiniMonthGrid(2025, 0)
    expect(grid[0]).toBeNull()
    expect(grid[1]).toBeNull()
    expect(grid[2]).toBeNull()
    expect(grid[3]).not.toBeNull()
    expect(grid[3]!.getDate()).toBe(1)
  })

  it('contains all days of the month', () => {
    const grid = getMiniMonthGrid(2025, 0) // January 2025 has 31 days
    const nonNullDays = grid.filter((d): d is Date => d !== null)
    expect(nonNullDays).toHaveLength(31)
    expect(nonNullDays[0].getDate()).toBe(1)
    expect(nonNullDays[30].getDate()).toBe(31)
  })

  it('ends with null padding cells', () => {
    const grid = getMiniMonthGrid(2025, 0)
    expect(grid[grid.length - 1]).toBeNull()
  })

  it('handles February correctly', () => {
    // Feb 2025 has 28 days, Feb 1 is Saturday (day=6)
    const grid = getMiniMonthGrid(2025, 1)
    const nonNullDays = grid.filter((d): d is Date => d !== null)
    expect(nonNullDays).toHaveLength(28)
  })
})
