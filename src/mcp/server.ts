/**
 * LAIF MCP Server -- Model Context Protocol
 *
 * This server exposes LAIF's capabilities as MCP tools that Claude Desktop
 * (or any MCP client) can call directly.
 *
 * Architecture:
 *   Claude Desktop -> MCP Protocol -> This server -> MongoDB (when connected)
 *
 * To run: npx tsx src/mcp/server.ts
 * To connect: Add to ~/Library/Application Support/Claude/claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "laif": {
 *         "command": "npx",
 *         "args": ["tsx", "/path/to/laif/src/mcp/server.ts"],
 *         "env": { "MONGODB_URI": "..." }
 *       }
 *     }
 *   }
 *
 * Tools exposed:
 *   1. laif_list_tasks     -- List tasks with filters (status, priority, list, date range)
 *   2. laif_create_task    -- Create a task with title, priority, due date, list
 *   3. laif_complete_task  -- Mark a task as done (plays completion sound on web)
 *   4. laif_get_today      -- Get today's schedule (tasks + habits + events)
 *   5. laif_start_focus    -- Start a Pomodoro session on a task
 *   6. laif_check_habits   -- Get today's habit status with streaks
 *   7. laif_checkin_habit  -- Check in a habit (achieved/unachieved)
 *   8. laif_get_stats      -- Get productivity statistics
 *   9. laif_create_list    -- Create a new list/folder
 *   10. laif_schedule_task -- Schedule a task to a time slot
 *
 * NOT IMPLEMENTED YET -- connect backend first, then:
 *   - import { Server } from '@anthropic-ai/mcp'
 *   - import mongoose from 'mongoose'
 *   - Register each tool with schema + handler
 *   - Start server on stdio transport
 */

export const MCP_TOOLS = [
  {
    name: 'laif_list_tasks',
    description: 'List tasks with optional filters',
    parameters: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done', 'dropped'] },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        listId: { type: 'string', description: 'Filter by list/folder ID' },
        dueBy: { type: 'string', description: 'ISO date -- tasks due by this date' },
        isHabit: { type: 'boolean', description: 'Filter habits only' },
        limit: { type: 'number', default: 20 },
      },
    },
  },
  {
    name: 'laif_create_task',
    description: 'Create a new task',
    parameters: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
        dueDate: { type: 'string', description: 'ISO date' },
        estimatedEffort: { type: 'number', description: 'Hours' },
        listId: { type: 'string' },
        status: { type: 'string', enum: ['backlog', 'todo'] },
      },
      required: ['title'],
    },
  },
  {
    name: 'laif_complete_task',
    description: 'Mark a task as done',
    parameters: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'laif_get_today',
    description: "Get today's schedule -- tasks due today, habits, events",
    parameters: { type: 'object' as const, properties: {} },
  },
  {
    name: 'laif_start_focus',
    description: 'Start a Pomodoro focus session on a task',
    parameters: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string' },
        durationMin: { type: 'number', default: 25 },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'laif_check_habits',
    description: "Get today's habits with completion status and streaks",
    parameters: { type: 'object' as const, properties: {} },
  },
  {
    name: 'laif_checkin_habit',
    description: 'Check in a habit for today',
    parameters: {
      type: 'object' as const,
      properties: {
        habitId: { type: 'string' },
        status: { type: 'string', enum: ['achieved', 'unachieved'] },
        value: { type: 'number', description: 'For count habits' },
        reason: { type: 'string', description: 'For unachieved -- why' },
      },
      required: ['habitId', 'status'],
    },
  },
  {
    name: 'laif_get_stats',
    description: 'Get productivity statistics',
    parameters: {
      type: 'object' as const,
      properties: {
        range: { type: 'string', enum: ['today', '7d', '30d'], default: '7d' },
      },
    },
  },
  {
    name: 'laif_create_list',
    description: 'Create a new list/folder',
    parameters: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' },
        icon: { type: 'string', description: 'Emoji icon' },
        groupTitle: { type: 'string', description: 'Sidebar group name' },
      },
      required: ['title'],
    },
  },
  {
    name: 'laif_schedule_task',
    description: 'Schedule a task to a specific time slot',
    parameters: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string' },
        scheduledStart: { type: 'string', description: 'ISO datetime' },
        scheduledEnd: { type: 'string', description: 'ISO datetime' },
        syncToGoogle: { type: 'boolean', default: false },
      },
      required: ['taskId', 'scheduledStart', 'scheduledEnd'],
    },
  },
]

// Stub -- will be implemented when backend is connected
export async function handleToolCall(toolName: string, args: Record<string, unknown>) {
  // NOTE: MCP tool execution pending backend connection
  return { success: false, error: 'Backend not connected' }
}
