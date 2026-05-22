import { CreateTaskSchema, UpdateTaskSchema, parseBody } from './validation'

describe('CreateTaskSchema', () => {
  const validTask = { title: 'Buy groceries' }

  it('accepts a minimal task with only title', () => {
    const result = CreateTaskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  // BUG 1 regression: reminders were silently stripped before the schema was extended
  it('accepts reminders array', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      reminders: [
        {
          id: 'rem-1',
          type: 'before-start',
          offsetMinutes: 15,
        },
        {
          id: 'rem-2',
          type: 'on-day-at',
          timeOfDay: '09:00',
        },
        {
          id: 'rem-3',
          type: 'absolute',
          absoluteTime: '2026-06-01T09:00:00Z',
          sent: false,
        },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reminders).toHaveLength(3)
      expect(result.data.reminders![0].type).toBe('before-start')
      expect(result.data.reminders![0].offsetMinutes).toBe(15)
    }
  })

  // BUG 1 regression: repeat/rrule was silently stripped before the schema was extended
  it('accepts repeat (rrule) string', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      repeat: 'FREQ=DAILY;INTERVAL=1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.repeat).toBe('FREQ=DAILY;INTERVAL=1')
    }
  })

  it('accepts repeat as null', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      repeat: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts kanbanOrder number', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      kanbanOrder: 42,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.kanbanOrder).toBe(42)
    }
  })

  it('accepts sectionId string', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      sectionId: 'section-abc',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sectionId).toBe('section-abc')
    }
  })

  it('accepts sectionId as null', () => {
    const result = CreateTaskSchema.safeParse({
      ...validTask,
      sectionId: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing title', () => {
    const result = CreateTaskSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects empty title', () => {
    const result = CreateTaskSchema.safeParse({ title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding max length', () => {
    const result = CreateTaskSchema.safeParse({ title: 'x'.repeat(501) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid priority value', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Task', priority: 'critical' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status value', () => {
    const result = CreateTaskSchema.safeParse({ title: 'Task', status: 'archived' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid reminder type', () => {
    const result = CreateTaskSchema.safeParse({
      title: 'Task',
      reminders: [{ id: 'r1', type: 'invalid-type' }],
    })
    expect(result.success).toBe(false)
  })
})

describe('UpdateTaskSchema', () => {
  it('accepts partial updates (title is optional)', () => {
    const result = UpdateTaskSchema.safeParse({ priority: 'high' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (no fields required)', () => {
    const result = UpdateTaskSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('parseBody', () => {
  it('returns success with parsed data for valid input', () => {
    const result = parseBody(CreateTaskSchema, { title: 'Hello' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Hello')
    }
  })

  it('returns error string for invalid input', () => {
    const result = parseBody(CreateTaskSchema, { title: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    }
  })
})
