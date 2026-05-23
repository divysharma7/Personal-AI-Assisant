import { CreateTaskSchema, parseBody } from '@/lib/validation'

describe('Task Creation Validation', () => {
  // ── Valid cases ────────────────────────────────────────────────────────────

  it('accepts minimal task (title only)', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Buy groceries' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Buy groceries')
    }
  })

  it('accepts full task with all fields', () => {
    const data = {
      title: 'Full task',
      priority: 'high',
      status: 'todo',
      dueDate: '2026-05-23T09:00:00Z',
      scheduledStart: '2026-05-23T09:00:00Z',
      scheduledEnd: '2026-05-23T10:00:00Z',
      listId: 'list-abc',
      description: 'A detailed description',
      estimatedEffort: 60,
      parentId: 'parent-123',
      labelIds: ['label-1', 'label-2'],
      tags: ['urgent', 'work'],
      kanbanOrder: 3,
      sectionId: 'section-xyz',
      repeat: 'FREQ=DAILY;COUNT=5',
      reminders: [
        { id: 'r1', type: 'before-start' as const, offsetMinutes: 15 },
      ],
    }
    const result = CreateTaskSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(data)
    }
  })

  it('accepts task with reminders array', () => {
    const data = {
      title: 'Task with reminders',
      reminders: [
        { id: 'r1', type: 'before-start' as const, offsetMinutes: 30 },
        { id: 'r2', type: 'on-day-at' as const, timeOfDay: '09:00' },
        { id: 'r3', type: 'absolute' as const, absoluteTime: '2026-05-23T08:00:00Z', sent: false },
      ],
    }
    const result = CreateTaskSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminders).toHaveLength(3)
      expect(result.data.reminders![0].type).toBe('before-start')
      expect(result.data.reminders![1].type).toBe('on-day-at')
      expect(result.data.reminders![2].type).toBe('absolute')
    }
  })

  it('accepts task with repeat/rrule', () => {
    const data = {
      title: 'Weekly standup',
      repeat: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
    }
    const result = CreateTaskSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.repeat).toBe('FREQ=WEEKLY;BYDAY=MO,WE,FR')
    }
  })

  it('accepts task with kanbanOrder and sectionId', () => {
    const data = {
      title: 'Kanban task',
      kanbanOrder: 5,
      sectionId: 'section-456',
    }
    const result = CreateTaskSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.kanbanOrder).toBe(5)
      expect(result.data.sectionId).toBe('section-456')
    }
  })

  it('accepts task with labelIds', () => {
    const data = {
      title: 'Labeled task',
      labelIds: ['label-a', 'label-b', 'label-c'],
    }
    const result = CreateTaskSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.labelIds).toEqual(['label-a', 'label-b', 'label-c'])
    }
  })

  // ── Invalid cases ──────────────────────────────────────────────────────────

  it('rejects task without title', () => {
    const result = CreateTaskSchema.safeParse({ priority: 'medium' })
    expect(result.success).toBe(false)
  })

  it('rejects task with empty title', () => {
    const result = CreateTaskSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects task with title over 500 chars', () => {
    const result = CreateTaskSchema.safeParse({ title: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('accepts task with title at exactly 500 chars', () => {
    const result = CreateTaskSchema.safeParse({ title: 'x'.repeat(500) })
    expect(result.success).toBe(true)
  })

  it('rejects task with invalid priority', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', priority: 'critical' })
    expect(result.success).toBe(false)
  })

  it('rejects task with invalid status', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('rejects task with invalid reminder type', () => {
    const result = CreateTaskSchema.safeParse({
      title: 'Test',
      reminders: [{ id: 'r1', type: 'push-notification' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects task with reminder missing id', () => {
    const result = CreateTaskSchema.safeParse({
      title: 'Test',
      reminders: [{ type: 'before-start', offsetMinutes: 10 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects null body entirely', () => {
    const result = CreateTaskSchema.safeParse(null)
    expect(result.success).toBe(false)
  })

  it('rejects undefined body', () => {
    const result = CreateTaskSchema.safeParse(undefined)
    expect(result.success).toBe(false)
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('strips unknown fields (Zod default)', () => {
    const result = CreateTaskSchema.safeParse({
      title: 'Test',
      unknownField: 'should-be-stripped',
      anotherRandom: 123,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('unknownField')
      expect(result.data).not.toHaveProperty('anotherRandom')
    }
  })

  it('accepts null dueDate', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', dueDate: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeNull()
    }
  })

  it('accepts null listId', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', listId: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.listId).toBeNull()
    }
  })

  it('accepts empty reminders array', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', reminders: [] })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminders).toEqual([])
    }
  })

  it('accepts null scheduledStart and scheduledEnd', () => {
    const result = CreateTaskSchema.safeParse({
      title: 'Test',
      scheduledStart: null,
      scheduledEnd: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.scheduledStart).toBeNull()
      expect(result.data.scheduledEnd).toBeNull()
    }
  })

  it('accepts null description', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', description: null })
    expect(result.success).toBe(true)
  })

  it('accepts null priority', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', priority: null })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBeNull()
    }
  })

  it('accepts null parentId', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', parentId: null })
    expect(result.success).toBe(true)
  })

  it('accepts null sectionId', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', sectionId: null })
    expect(result.success).toBe(true)
  })

  it('accepts null repeat', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Test', repeat: null })
    expect(result.success).toBe(true)
  })

  it('accepts all valid priority values', () => {
    for (const priority of ['low', 'medium', 'high']) {
      const result = CreateTaskSchema.safeParse({ title: 'Test', priority })
      expect(result.success).toBe(true)
    }
  })

  it('accepts all valid status values', () => {
    for (const status of ['backlog', 'todo', 'in-progress', 'done', 'dropped']) {
      const result = CreateTaskSchema.safeParse({ title: 'Test', status })
      expect(result.success).toBe(true)
    }
  })

  // ── parseBody helper ───────────────────────────────────────────────────────

  describe('parseBody helper', () => {
    it('returns success: true with parsed data for valid input', () => {
      const result = parseBody(CreateTaskSchema, { title: 'Valid task' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Valid task')
      }
    })

    it('returns success: false with error string for invalid input', () => {
      const result = parseBody(CreateTaskSchema, { title: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(typeof result.error).toBe('string')
        expect(result.error.length).toBeGreaterThan(0)
      }
    })

    it('returns success: false for null body', () => {
      const result = parseBody(CreateTaskSchema, null)
      expect(result.success).toBe(false)
    })

    it('returns success: false for non-object body', () => {
      const result = parseBody(CreateTaskSchema, 'just a string')
      expect(result.success).toBe(false)
    })

    it('strips extra fields and returns clean data', () => {
      const result = parseBody(CreateTaskSchema, {
        title: 'Clean',
        extraField: 'nope',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('extraField')
      }
    })
  })
})
