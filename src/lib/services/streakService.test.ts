import { computeStreak, computeBestStreak, getCompletionRate } from './streakService'

/** Helper: make a YYYY-MM-DD string relative to a fixed "today" */
function dateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

describe('computeStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Fix "today" to 2025-06-15 (Sunday)
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for no completions', () => {
    expect(computeStreak({ completions: [] })).toBe(0)
  })

  it('returns 0 for undefined completions', () => {
    expect(computeStreak({})).toBe(0)
  })

  it('returns 3 for 3 consecutive days ending today', () => {
    const habit = {
      completions: [
        { date: '2025-06-13', status: 'achieved' },
        { date: '2025-06-14', status: 'achieved' },
        { date: '2025-06-15', status: 'achieved' },
      ],
    }
    expect(computeStreak(habit)).toBe(3)
  })

  it('returns 2 for 3 days with missed day in the middle (streak from yesterday)', () => {
    // Today is 2025-06-15
    // 13: achieved, 14: missed, 15: achieved
    // Streak walking back from today: 15 achieved (1), 14 no entry + due -> break
    const habit = {
      completions: [
        { date: '2025-06-13', status: 'achieved' },
        { date: '2025-06-15', status: 'achieved' },
      ],
    }
    expect(computeStreak(habit)).toBe(1)
  })

  it('starts from yesterday if today has no entry', () => {
    // Today is 2025-06-15, no entry
    // 14: achieved, 13: achieved
    const habit = {
      completions: [
        { date: '2025-06-13', status: 'achieved' },
        { date: '2025-06-14', status: 'achieved' },
      ],
    }
    expect(computeStreak(habit)).toBe(2)
  })

  it('counts frozen days as streak-continuing', () => {
    const habit = {
      completions: [
        { date: '2025-06-13', status: 'achieved' },
        { date: '2025-06-14', status: 'frozen' },
        { date: '2025-06-15', status: 'achieved' },
      ],
    }
    expect(computeStreak(habit)).toBe(3)
  })

  it('breaks streak on unachieved status', () => {
    const habit = {
      completions: [
        { date: '2025-06-13', status: 'achieved' },
        { date: '2025-06-14', status: 'unachieved' },
        { date: '2025-06-15', status: 'achieved' },
      ],
    }
    // Walking back from today: 15 achieved (1), 14 unachieved -> break
    expect(computeStreak(habit)).toBe(1)
  })

  it('skips non-due days when frequency has daysOfWeek', () => {
    // Habit is only due Mon/Wed/Fri (1, 3, 5)
    // Today is Sunday (2025-06-15, day=0) -> no entry, so start from Saturday
    // Saturday (14, day=6) -> not due, skip
    // Friday (13, day=5) -> due, achieved -> count
    // Thursday (12, day=4) -> not due, skip
    // Wednesday (11, day=3) -> due, achieved -> count
    const habit = {
      habitFrequency: { type: 'daily', daysOfWeek: [1, 3, 5] },
      completions: [
        { date: '2025-06-11', status: 'achieved' },
        { date: '2025-06-13', status: 'achieved' },
      ],
    }
    expect(computeStreak(habit)).toBe(2)
  })
})

describe('computeBestStreak', () => {
  it('returns 0 for no completions', () => {
    expect(computeBestStreak({ completions: [] })).toBe(0)
  })

  it('returns the longest consecutive achieved run', () => {
    const habit = {
      completions: [
        { date: '2025-06-01', status: 'achieved' },
        { date: '2025-06-02', status: 'achieved' },
        { date: '2025-06-03', status: 'unachieved' },
        { date: '2025-06-04', status: 'achieved' },
        { date: '2025-06-05', status: 'achieved' },
        { date: '2025-06-06', status: 'achieved' },
      ],
    }
    // First run: 2, second run: 3
    expect(computeBestStreak(habit)).toBe(3)
  })

  it('returns 1 for a single achieved day', () => {
    const habit = {
      completions: [{ date: '2025-06-01', status: 'achieved' }],
    }
    expect(computeBestStreak(habit)).toBe(1)
  })

  it('counts frozen as streak-continuing', () => {
    const habit = {
      completions: [
        { date: '2025-06-01', status: 'achieved' },
        { date: '2025-06-02', status: 'frozen' },
        { date: '2025-06-03', status: 'achieved' },
      ],
    }
    expect(computeBestStreak(habit)).toBe(3)
  })

  it('returns 0 for all unachieved completions', () => {
    const habit = {
      completions: [
        { date: '2025-06-01', status: 'unachieved' },
        { date: '2025-06-02', status: 'unachieved' },
      ],
    }
    expect(computeBestStreak(habit)).toBe(0)
  })
})

describe('getCompletionRate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 0 for no completions over 7 days', () => {
    expect(getCompletionRate({ completions: [] }, 7)).toBe(0)
  })

  it('returns 1 for 100% completion', () => {
    // All 7 days achieved
    const completions = []
    for (let i = 0; i < 7; i++) {
      const d = new Date('2025-06-15T12:00:00Z')
      d.setDate(d.getDate() - i)
      completions.push({ date: d.toISOString().split('T')[0], status: 'achieved' })
    }
    expect(getCompletionRate({ completions }, 7)).toBe(1)
  })

  it('returns 0.5 for 50% completion', () => {
    // 3 out of 6 due days achieved (use 6 days to get exact 0.5)
    const completions = [
      { date: '2025-06-15', status: 'achieved' },
      { date: '2025-06-14', status: 'unachieved' },
      { date: '2025-06-13', status: 'achieved' },
      { date: '2025-06-12', status: 'unachieved' },
      { date: '2025-06-11', status: 'achieved' },
      { date: '2025-06-10', status: 'unachieved' },
    ]
    expect(getCompletionRate({ completions }, 6)).toBe(0.5)
  })

  it('counts frozen as achieved', () => {
    const completions = [
      { date: '2025-06-15', status: 'frozen' },
      { date: '2025-06-14', status: 'frozen' },
    ]
    expect(getCompletionRate({ completions }, 2)).toBe(1)
  })

  it('does not count days before habit creation', () => {
    const habit = {
      createdAt: '2025-06-14',
      completions: [{ date: '2025-06-15', status: 'achieved' }],
    }
    // Only 2 days are countable (14 and 15), achieved on 15 only
    const rate = getCompletionRate(habit, 7)
    expect(rate).toBe(0.5) // 1 achieved out of 2 due days
  })
})
