import { CreateTaskSchema } from '@/lib/validation'

describe('Task Creation Paths - Data Shape', () => {
  // ── Path 1: Inbox page creation ──────────────────────────────────────────

  describe('Inbox page creation', () => {
    it('sends title, priority medium, status backlog', () => {
      const data = { title: 'Test', priority: 'medium', status: 'backlog' }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.title).toBe('Test')
        expect(parsed.data.priority).toBe('medium')
        expect(parsed.data.status).toBe('backlog')
      }
    })

    it('inbox creation does not include dueDate', () => {
      const data = { title: 'Inbox item', priority: 'medium', status: 'backlog' }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.dueDate).toBeUndefined()
      }
    })
  })

  // ── Path 2: Today page creation ──────────────────────────────────────────

  describe('Today page creation', () => {
    it('sends title, priority medium, status todo, dueDate today', () => {
      const data = {
        title: 'Test',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date().toISOString(),
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.status).toBe('todo')
        expect(parsed.data.dueDate).toBeDefined()
      }
    })

    it('today page dueDate is a valid ISO string', () => {
      const now = new Date()
      const data = {
        title: 'Today task',
        priority: 'medium',
        status: 'todo',
        dueDate: now.toISOString(),
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        // Should be parseable back into a valid date
        const parsedDate = new Date(parsed.data.dueDate!)
        expect(parsedDate.getTime()).not.toBeNaN()
      }
    })
  })

  // ── Path 3: Calendar creation (click) ────────────────────────────────────

  describe('Calendar creation', () => {
    it('sends title, dueDate, scheduledStart, scheduledEnd', () => {
      const data = {
        title: 'Test',
        dueDate: '2026-05-23T09:00:00Z',
        scheduledStart: '2026-05-23T09:00:00Z',
        scheduledEnd: '2026-05-23T10:00:00Z',
        priority: 'medium',
        status: 'todo',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.scheduledStart).toBe('2026-05-23T09:00:00Z')
        expect(parsed.data.scheduledEnd).toBe('2026-05-23T10:00:00Z')
        expect(parsed.data.dueDate).toBe('2026-05-23T09:00:00Z')
      }
    })

    it('calendar creation includes all time fields', () => {
      const data = {
        title: 'Meeting',
        dueDate: '2026-05-23T14:00:00Z',
        scheduledStart: '2026-05-23T14:00:00Z',
        scheduledEnd: '2026-05-23T15:00:00Z',
        priority: 'high',
        status: 'todo',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data).toHaveProperty('dueDate')
        expect(parsed.data).toHaveProperty('scheduledStart')
        expect(parsed.data).toHaveProperty('scheduledEnd')
      }
    })
  })

  // ── Path 4: Calendar drag-to-create ──────────────────────────────────────

  describe('Calendar drag-to-create', () => {
    it('sends with startTime and endTime via custom event detail', () => {
      const data = {
        title: 'New Task',
        dueDate: '2026-05-23T14:00:00Z',
        scheduledStart: '2026-05-23T14:00:00Z',
        scheduledEnd: '2026-05-23T15:30:00Z',
        priority: 'medium',
        status: 'todo',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.scheduledStart).toBe('2026-05-23T14:00:00Z')
        expect(parsed.data.scheduledEnd).toBe('2026-05-23T15:30:00Z')
      }
    })

    it('drag-to-create can produce multi-hour blocks', () => {
      const data = {
        title: 'Deep work',
        dueDate: '2026-05-23T09:00:00Z',
        scheduledStart: '2026-05-23T09:00:00Z',
        scheduledEnd: '2026-05-23T12:00:00Z',
        priority: 'medium',
        status: 'todo',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        const start = new Date(parsed.data.scheduledStart!)
        const end = new Date(parsed.data.scheduledEnd!)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        expect(hours).toBe(3)
      }
    })
  })

  // ── Path 5: List page creation ───────────────────────────────────────────

  describe('List page creation', () => {
    it('sends title, listId, priority, status', () => {
      const data = {
        title: 'Test',
        listId: 'list-123',
        priority: 'medium',
        status: 'todo',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.listId).toBe('list-123')
      }
    })

    it('list creation without dueDate is valid', () => {
      const data = {
        title: 'List item',
        listId: 'list-abc',
        priority: 'low',
        status: 'backlog',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.dueDate).toBeUndefined()
        expect(parsed.data.listId).toBe('list-abc')
      }
    })
  })

  // ── Path 6: Workflow board add task ──────────────────────────────────────

  describe('Workflow board add task', () => {
    it('sends title with sectionId for section mode', () => {
      const data = {
        title: 'Board task',
        priority: 'medium',
        status: 'todo',
        sectionId: 'section-123',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.sectionId).toBe('section-123')
      }
    })

    it('rejects empty title even with sectionId', () => {
      const data = {
        title: '',
        priority: 'medium',
        status: 'todo',
        sectionId: 'section-123',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(false)
    })

    it('sends title with dueDate for time mode', () => {
      const data = {
        title: 'Test',
        priority: 'medium',
        status: 'backlog',
        dueDate: '2026-05-24',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.dueDate).toBe('2026-05-24')
        expect(parsed.data.status).toBe('backlog')
      }
    })

    it('sends title with kanbanOrder for ordering', () => {
      const data = {
        title: 'Ordered task',
        priority: 'medium',
        status: 'todo',
        sectionId: 'section-123',
        kanbanOrder: 0,
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.kanbanOrder).toBe(0)
      }
    })
  })

  // ── Path 7a: Chat agent task creation ────────────────────────────────────

  describe('Chat agent task creation', () => {
    it('chat add_task data is valid', () => {
      const data = {
        title: 'Review PR',
        priority: 'medium',
        status: 'todo',
        description: 'Check the auth module',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.description).toBe('Check the auth module')
      }
    })

    it('chat agent can create task with all priority levels', () => {
      for (const priority of ['low', 'medium', 'high']) {
        const data = { title: 'Agent task', priority, status: 'todo' }
        const parsed = CreateTaskSchema.safeParse(data)
        expect(parsed.success).toBe(true)
      }
    })

    it('chat agent task with dueDate string is valid', () => {
      const data = {
        title: 'Deadline task',
        priority: 'high',
        status: 'todo',
        dueDate: '2026-06-15',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
    })
  })

  // ── Path 7b: MCP server task creation ────────────────────────────────────

  describe('MCP server task creation', () => {
    it('MCP create_task data is valid', () => {
      const data = {
        title: 'Deploy v2',
        priority: 'high',
        dueDate: '2026-06-01',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.title).toBe('Deploy v2')
        expect(parsed.data.priority).toBe('high')
        expect(parsed.data.dueDate).toBe('2026-06-01')
      }
    })

    it('MCP create_task with minimal fields (title only)', () => {
      const data = { title: 'Quick MCP task' }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
    })

    it('MCP create_task with status override', () => {
      const data = {
        title: 'In-progress task',
        priority: 'medium',
        status: 'in-progress',
      }
      const parsed = CreateTaskSchema.safeParse(data)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.status).toBe('in-progress')
      }
    })
  })

  // ── Cross-path consistency checks ────────────────────────────────────────

  describe('Cross-path consistency', () => {
    it('all paths produce data that includes a title', () => {
      const paths = [
        { title: 'Inbox', priority: 'medium', status: 'backlog' },
        { title: 'Today', priority: 'medium', status: 'todo', dueDate: new Date().toISOString() },
        { title: 'Calendar', dueDate: '2026-05-23T09:00:00Z', scheduledStart: '2026-05-23T09:00:00Z', scheduledEnd: '2026-05-23T10:00:00Z', priority: 'medium', status: 'todo' },
        { title: 'List', listId: 'l1', priority: 'medium', status: 'todo' },
        { title: 'Board', sectionId: 's1', priority: 'medium', status: 'todo' },
        { title: 'Chat', priority: 'medium', status: 'todo', description: 'From AI' },
        { title: 'MCP', priority: 'high', dueDate: '2026-06-01' },
      ]

      for (const data of paths) {
        const parsed = CreateTaskSchema.safeParse(data)
        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data.title).toBeTruthy()
        }
      }
    })

    it('no path sends userId in the Zod-validated body (userId is added server-side)', () => {
      const dataWithUserId = {
        title: 'Test',
        priority: 'medium',
        userId: 'user-123',
      }
      const parsed = CreateTaskSchema.safeParse(dataWithUserId)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        // userId should be stripped by Zod since it's not in the schema
        expect(parsed.data).not.toHaveProperty('userId')
      }
    })
  })
})
