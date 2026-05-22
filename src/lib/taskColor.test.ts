import { getTaskColor, PRIORITY_COLORS, DEFAULT_COLOR, type ListInfo } from './taskColor'
import type { TaskRecord } from '@/hooks/useTasks'

/** Minimal TaskRecord factory for testing */
function makeTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    _id: 'task-1',
    type: 'task',
    title: 'Test Task',
    priority: 'none',
    status: 'active',
    ...overrides,
  }
}

describe('getTaskColor', () => {
  // ── Priority mode ────────────────────────────────────────────────

  describe('priority mode', () => {
    const settings = { taskColorMode: 'priority' }
    const lists: ListInfo[] = []

    it('returns red (#ef4444) for high priority', () => {
      expect(getTaskColor(makeTask({ priority: 'high' }), lists, settings)).toBe('#ef4444')
    })

    it('returns amber (#f59e0b) for medium priority', () => {
      expect(getTaskColor(makeTask({ priority: 'medium' }), lists, settings)).toBe('#f59e0b')
    })

    it('returns blue (#3b82f6) for low priority', () => {
      expect(getTaskColor(makeTask({ priority: 'low' }), lists, settings)).toBe('#3b82f6')
    })

    it('returns gray (#6b7280) for none priority', () => {
      expect(getTaskColor(makeTask({ priority: 'none' }), lists, settings)).toBe('#6b7280')
    })

    it('returns gray (#6b7280) for unknown priority string', () => {
      expect(getTaskColor(makeTask({ priority: 'unknown' }), lists, settings)).toBe('#6b7280')
    })
  })

  // ── List mode ────────────────────────────────────────────────────

  describe('list mode', () => {
    const settings = { taskColorMode: 'list' }

    it('returns list color when task has matching listId', () => {
      const lists: ListInfo[] = [{ id: 'list-1', color: '#10b981' }]
      const task = makeTask({ listId: 'list-1' })
      expect(getTaskColor(task, lists, settings)).toBe('#10b981')
    })

    it('returns default color when no matching list', () => {
      const lists: ListInfo[] = [{ id: 'list-1', color: '#10b981' }]
      const task = makeTask({ listId: 'list-999' })
      expect(getTaskColor(task, lists, settings)).toBe(DEFAULT_COLOR)
    })

    it('returns default color when listId is null', () => {
      const lists: ListInfo[] = [{ id: 'list-1', color: '#10b981' }]
      const task = makeTask({ listId: null })
      expect(getTaskColor(task, lists, settings)).toBe(DEFAULT_COLOR)
    })

    it('returns default color when listId is undefined', () => {
      const lists: ListInfo[] = [{ id: 'list-1', color: '#10b981' }]
      const task = makeTask()
      expect(getTaskColor(task, lists, settings)).toBe(DEFAULT_COLOR)
    })

    it('returns default color when list has null color', () => {
      const lists: ListInfo[] = [{ id: 'list-1', color: null }]
      const task = makeTask({ listId: 'list-1' })
      expect(getTaskColor(task, lists, settings)).toBe(DEFAULT_COLOR)
    })
  })

  // ── Tag mode ─────────────────────────────────────────────────────

  describe('tag mode', () => {
    it('falls through to list color (placeholder behavior)', () => {
      const settings = { taskColorMode: 'tag' }
      const lists: ListInfo[] = [{ id: 'list-1', color: '#ec4899' }]
      const task = makeTask({ listId: 'list-1' })
      expect(getTaskColor(task, lists, settings)).toBe('#ec4899')
    })
  })

  // ── Default mode ─────────────────────────────────────────────────

  describe('default/unknown mode', () => {
    it('falls through to list color for unknown mode', () => {
      const settings = { taskColorMode: 'whatever' }
      const lists: ListInfo[] = [{ id: 'list-1', color: '#8b5cf6' }]
      const task = makeTask({ listId: 'list-1' })
      expect(getTaskColor(task, lists, settings)).toBe('#8b5cf6')
    })
  })

  // ── Constants ────────────────────────────────────────────────────

  describe('exported constants', () => {
    it('PRIORITY_COLORS has 4 entries', () => {
      expect(Object.keys(PRIORITY_COLORS)).toHaveLength(4)
    })

    it('DEFAULT_COLOR is indigo (#6366f1)', () => {
      expect(DEFAULT_COLOR).toBe('#6366f1')
    })
  })
})
