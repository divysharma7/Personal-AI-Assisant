import { getTomorrow, getNextMonday, PRIORITY_OPTIONS } from './useBatchActions'

describe('useBatchActions helpers', () => {
  // ── getTomorrow ──────────────────────────────────────────────────────────

  it('getTomorrow returns a date 1 day after today', () => {
    const tomorrow = getTomorrow()
    const today = new Date()
    today.setDate(today.getDate() + 1)
    expect(tomorrow.getFullYear()).toBe(today.getFullYear())
    expect(tomorrow.getMonth()).toBe(today.getMonth())
    expect(tomorrow.getDate()).toBe(today.getDate())
  })

  it('getTomorrow has time set to midnight', () => {
    const tomorrow = getTomorrow()
    expect(tomorrow.getHours()).toBe(0)
    expect(tomorrow.getMinutes()).toBe(0)
    expect(tomorrow.getSeconds()).toBe(0)
    expect(tomorrow.getMilliseconds()).toBe(0)
  })

  // ── getNextMonday ────────────────────────────────────────────────────────

  it('getNextMonday returns a Monday', () => {
    const monday = getNextMonday()
    expect(monday.getDay()).toBe(1)
  })

  it('getNextMonday returns a date in the future', () => {
    const monday = getNextMonday()
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    expect(monday.getTime()).toBeGreaterThan(now.getTime())
  })

  it('getNextMonday has time set to midnight', () => {
    const monday = getNextMonday()
    expect(monday.getHours()).toBe(0)
    expect(monday.getMinutes()).toBe(0)
    expect(monday.getSeconds()).toBe(0)
    expect(monday.getMilliseconds()).toBe(0)
  })

  // ── PRIORITY_OPTIONS ─────────────────────────────────────────────────────

  it('PRIORITY_OPTIONS has 3 entries with expected values', () => {
    expect(PRIORITY_OPTIONS).toHaveLength(3)
    const values = PRIORITY_OPTIONS.map((o) => o.value)
    expect(values).toEqual(['low', 'medium', 'high'])
  })

  it('each PRIORITY_OPTIONS entry has a label and color', () => {
    for (const opt of PRIORITY_OPTIONS) {
      expect(opt.label).toBeTruthy()
      expect(opt.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
