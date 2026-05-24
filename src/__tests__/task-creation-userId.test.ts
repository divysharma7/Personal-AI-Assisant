import { readFileSync } from 'fs'
import { resolve } from 'path'
import { CreateTaskSchema } from '@/lib/validation'

/**
 * Regression tests ensuring every task-creation path sets userId.
 *
 * The critical bug: tasks created without userId are invisible to the owner
 * because all queries filter by userId. These tests verify via
 * both source-level assertions and schema behavior that userId is always set.
 */
describe('Task Creation - userId Assignment (Regression)', () => {
  // ── REST API POST route ────────────────────────────────────────────────────

  describe('REST API POST /api/tasks', () => {
    const routeSource = readFileSync(
      resolve(__dirname, '../app/api/tasks/route.ts'),
      'utf-8',
    )

    it('calls getAuthUserId in the POST handler', () => {
      expect(routeSource).toContain('getAuthUserId()')
    })

    it('spreads userId into taskData', () => {
      expect(routeSource).toContain('userId')
      expect(routeSource).toMatch(/taskData\s*=\s*\{/)
    })

    it('adds userId conditionally when authenticated', () => {
      expect(routeSource).toContain('userId ? { userId }')
    })

    it('Zod schema strips userId from client body (server adds it)', () => {
      const parsed = CreateTaskSchema.safeParse({
        title: 'Test',
        userId: 'user-spoofed',
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data).not.toHaveProperty('userId')
      }
    })

    it('merges parsed data with userId, not the other way around', () => {
      const taskDataLine = routeSource.match(/const taskData = \{[\s\S]*?\}/)?.[0] ?? ''
      expect(taskDataLine).toBeTruthy()
      const parsedIdx = taskDataLine.indexOf('parsed.data')
      const userIdIdx = taskDataLine.indexOf('userId')
      expect(parsedIdx).toBeLessThan(userIdIdx)
    })
  })

  // ── Chat agent (add_task tool) ──────────────────────────────────────────

  describe('Chat agent add_task', () => {
    const chatRouteSource = readFileSync(
      resolve(__dirname, '../app/api/chat/route.ts'),
      'utf-8',
    )

    it('calls getAuthUserId in the chat route', () => {
      expect(chatRouteSource).toContain('getAuthUserId()')
    })

    it('toolAddTask sets userId', () => {
      expect(chatRouteSource).toContain('userId,')
    })

    it('toolAddTask calls getAuthUserId before DB write', () => {
      const addTaskMatch = chatRouteSource.match(
        /async function toolAddTask[\s\S]*?(?=async function|$)/,
      )
      expect(addTaskMatch).toBeTruthy()
      const fnBody = addTaskMatch![0]
      expect(fnBody).toContain('getAuthUserId()')
      expect(fnBody).toContain('userId,')
    })
  })

  // ── MCP server (create_task tool) ──────────────────────────────────────

  describe('MCP server create_task', () => {
    const mcpSource = readFileSync(
      resolve(__dirname, '../mcp/server.ts'),
      'utf-8',
    )

    it('createTask receives userId as first parameter', () => {
      expect(mcpSource).toMatch(/async function createTask\(userId:\s*string/)
    })

    it('createTask sets userId', () => {
      const createTaskMatch = mcpSource.match(
        /async function createTask[\s\S]*?(?=async function|$)/,
      )
      expect(createTaskMatch).toBeTruthy()
      const fnBody = createTaskMatch![0]
      expect(fnBody).toContain('userId,')
    })

    it('handleToolCall passes userId to all handlers', () => {
      expect(mcpSource).toContain('handler(userId, params)')
    })
  })

  // ── Schema-level verification ──────────────────────────────────────────

  describe('Schema-level userId behavior', () => {
    it('CreateTaskSchema does not include userId as a field', () => {
      const shape = CreateTaskSchema.shape
      expect(shape).not.toHaveProperty('userId')
    })

    it('client-sent userId is safely stripped by validation', () => {
      const result = CreateTaskSchema.safeParse({
        title: 'Malicious task',
        userId: 'attacker-id',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('userId')
      }
    })
  })
})
