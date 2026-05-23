/**
 * MCP tool definitions — shared between server (mcp/server.ts) and client (settings UI).
 * No server-side imports here — safe to import from 'use client' components.
 */
export const MCP_TOOLS = [
  {
    name: 'list_tasks',
    description: 'Query your tasks',
    parameters: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done', 'dropped'] },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        limit: { type: 'number', default: 20 },
      },
    },
  },
  {
    name: 'create_task',
    description: 'Create new tasks',
    parameters: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        dueDate: { type: 'string', description: 'ISO date' },
        description: { type: 'string' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark tasks done',
    parameters: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'list_habits',
    description: 'View habits',
    parameters: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_in_habit',
    description: 'Log habit completion',
    parameters: {
      type: 'object' as const,
      properties: {
        habitId: { type: 'string' },
        date: { type: 'string', description: 'YYYY-MM-DD (defaults to today)' },
      },
      required: ['habitId'],
    },
  },
  {
    name: 'get_calendar',
    description: 'View scheduled events',
    parameters: {
      type: 'object' as const,
      properties: {
        startDate: { type: 'string', description: 'ISO date' },
        endDate: { type: 'string', description: 'ISO date' },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'get_stats',
    description: 'Task & habit statistics',
    parameters: { type: 'object' as const, properties: {} },
  },
] as const
