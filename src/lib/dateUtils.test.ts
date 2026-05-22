import { startOfToday, endOfToday, addDaysUtil, startOfDay, formatRelativeTime } from './dateUtils'

describe('startOfToday', () => {
  it('returns midnight of the current day', () => {
    const result = startOfToday()
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('returns today\'s date', () => {
    const result = startOfToday()
    const now = new Date()
    expect(result.getFullYear()).toBe(now.getFullYear())
    expect(result.getMonth()).toBe(now.getMonth())
    expect(result.getDate()).toBe(now.getDate())
  })
})

describe('endOfToday', () => {
  it('returns 23:59:59.999 of the current day', () => {
    const result = endOfToday()
    expect(result.getHours()).toBe(23)
    expect(result.getMinutes()).toBe(59)
    expect(result.getSeconds()).toBe(59)
    expect(result.getMilliseconds()).toBe(999)
  })

  it('returns today\'s date', () => {
    const result = endOfToday()
    const now = new Date()
    expect(result.getFullYear()).toBe(now.getFullYear())
    expect(result.getMonth()).toBe(now.getMonth())
    expect(result.getDate()).toBe(now.getDate())
  })
})

describe('addDaysUtil', () => {
  it('adds correct number of days', () => {
    const base = new Date('2026-01-15T10:30:00')
    const result = addDaysUtil(base, 5)
    expect(result.getDate()).toBe(20)
    expect(result.getMonth()).toBe(0) // January
  })

  it('handles negative days', () => {
    const base = new Date('2026-01-15T10:30:00')
    const result = addDaysUtil(base, -3)
    expect(result.getDate()).toBe(12)
  })

  it('handles month boundary crossing', () => {
    const base = new Date('2026-01-30T10:00:00')
    const result = addDaysUtil(base, 5)
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(4)
  })

  it('does not mutate the original date', () => {
    const base = new Date('2026-01-15T10:30:00')
    const originalTime = base.getTime()
    addDaysUtil(base, 10)
    expect(base.getTime()).toBe(originalTime)
  })

  it('preserves time of day', () => {
    const base = new Date('2026-01-15T14:30:45.123')
    const result = addDaysUtil(base, 2)
    expect(result.getHours()).toBe(14)
    expect(result.getMinutes()).toBe(30)
    expect(result.getSeconds()).toBe(45)
    expect(result.getMilliseconds()).toBe(123)
  })
})

describe('startOfDay', () => {
  it('zeroes hours, minutes, seconds, and milliseconds', () => {
    const input = new Date('2026-06-15T14:35:22.456')
    const result = startOfDay(input)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('preserves the date', () => {
    const input = new Date('2026-06-15T14:35:22.456')
    const result = startOfDay(input)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5) // June (0-indexed)
    expect(result.getDate()).toBe(15)
  })

  it('does not mutate the original date', () => {
    const input = new Date('2026-06-15T14:35:22.456')
    const originalTime = input.getTime()
    startOfDay(input)
    expect(input.getTime()).toBe(originalTime)
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for undefined input', () => {
    expect(formatRelativeTime(undefined)).toBe('just now')
  })

  it('returns "just now" for a date less than 1 minute ago', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('just now')
  })

  it('returns minutes ago for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('5 min ago')
  })

  it('returns hours ago for dates within a day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeHoursAgo.toISOString())).toBe('3h ago')
  })

  it('returns days ago for dates beyond 24 hours', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('2d ago')
  })
})
