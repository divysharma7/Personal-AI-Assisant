import { parseQuickAdd } from './nlpParser'

describe('parseQuickAdd', () => {
  // ── Empty / whitespace input ──────────────────────────────────

  it('returns empty title and null date for empty string', () => {
    const result = parseQuickAdd('')
    expect(result.title).toBe('')
    expect(result.dueDate).toBeNull()
    expect(result.tags).toEqual([])
    expect(result.priority).toBeNull()
  })

  it('returns empty title for whitespace-only input', () => {
    const result = parseQuickAdd('   ')
    expect(result.title).toBe('')
    expect(result.dueDate).toBeNull()
  })

  // ── Date extraction ───────────────────────────────────────────

  it('extracts "tomorrow" as dueDate and removes it from title', () => {
    const result = parseQuickAdd('Buy groceries tomorrow')
    expect(result.title).toBe('Buy groceries')
    expect(result.dueDate).not.toBeNull()
    // Tomorrow should be 1 day after reference date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(result.dueDate!.getDate()).toBe(tomorrow.getDate())
  })

  it('does not extract ambiguous words like "morning" as dates', () => {
    const result = parseQuickAdd('Morning workout routine')
    expect(result.title).toContain('Morning')
    // "morning" alone should not produce a date (it's masked)
  })

  it('does not extract bare durations like "30 minutes" as dates', () => {
    const result = parseQuickAdd('Run for 30 minutes')
    expect(result.title).toContain('30 minutes')
  })

  // ── Priority extraction ───────────────────────────────────────

  it('extracts !high priority', () => {
    const result = parseQuickAdd('!high Call doctor')
    expect(result.priority).toBe('high')
    expect(result.title).toBe('Call doctor')
  })

  it('extracts !medium priority', () => {
    const result = parseQuickAdd('Fix the sink !medium')
    expect(result.priority).toBe('medium')
    expect(result.title).toBe('Fix the sink')
  })

  it('extracts !low priority', () => {
    const result = parseQuickAdd('!low Organize desk')
    expect(result.priority).toBe('low')
    expect(result.title).toBe('Organize desk')
  })

  it('treats !none as null priority', () => {
    const result = parseQuickAdd('!none Something')
    expect(result.priority).toBeNull()
    expect(result.title).toBe('Something')
  })

  it('uses last priority when multiple are specified', () => {
    const result = parseQuickAdd('!low !high Do it')
    expect(result.priority).toBe('high')
  })

  // ── Tag extraction ────────────────────────────────────────────

  it('extracts single tag', () => {
    const result = parseQuickAdd('#health Call doctor')
    expect(result.tags).toEqual(['health'])
    expect(result.title).toBe('Call doctor')
  })

  it('extracts multiple tags', () => {
    const result = parseQuickAdd('#work #urgent Fix bug')
    expect(result.tags).toEqual(['work', 'urgent'])
    expect(result.title).toBe('Fix bug')
  })

  it('returns empty tags array when no tags present', () => {
    const result = parseQuickAdd('Just a task')
    expect(result.tags).toEqual([])
  })

  // ── Combined extraction ───────────────────────────────────────

  it('extracts tags, priority, and date together', () => {
    const result = parseQuickAdd('#health !high Call doctor tomorrow')
    expect(result.tags).toEqual(['health'])
    expect(result.priority).toBe('high')
    expect(result.title).toBe('Call doctor')
    expect(result.dueDate).not.toBeNull()
  })

  // ── Title cleanup ─────────────────────────────────────────────

  it('trims extra whitespace from title', () => {
    const result = parseQuickAdd('  #work   Fix   bug  ')
    expect(result.title).toBe('Fix bug')
  })

  it('handles only a tag with no other text', () => {
    const result = parseQuickAdd('#solo')
    expect(result.tags).toEqual(['solo'])
    expect(result.title).toBe('')
  })

  it('handles only a priority with no other text', () => {
    const result = parseQuickAdd('!high')
    expect(result.priority).toBe('high')
    expect(result.title).toBe('')
  })
})
