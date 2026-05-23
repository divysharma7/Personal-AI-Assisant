/**
 * LAIF MCP Server -- Model Context Protocol
 *
 * Functional tool handlers that connect to MongoDB via Mongoose.
 * Each handler: connectDB() -> query -> return JSON result.
 *
 * Tools exposed:
 *   1. list_tasks     -- List tasks with filters (status, priority, limit)
 *   2. create_task    -- Create a task with title, priority, due date
 *   3. complete_task  -- Mark a task as done
 *   4. list_habits    -- View habits
 *   5. check_in_habit -- Log habit completion
 *   6. get_calendar   -- View scheduled events in a date range
 *   7. get_stats      -- Task & habit statistics
 */

import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'

/* ─── Tool definitions (for UI display & validation) ─── */

// Import from shared tools definition (safe for client import)
import { MCP_TOOLS } from './tools'
export { MCP_TOOLS }

/* ─── Tool type map ─── */

type ToolName = (typeof MCP_TOOLS)[number]['name']

/* ─── Individual handlers ─── */

async function listTasks(userId: string, params: Record<string, unknown>) {
  await connectDB()
  const filter: Record<string, unknown> = { createdBy: userId, isHabit: { $ne: true } }
  if (params.status) filter.status = params.status
  if (params.priority) filter.priority = params.priority
  const limit = typeof params.limit === 'number' ? Math.min(params.limit, 100) : 20
  const tasks = await TaskModel.find(filter).sort({ updatedAt: -1 }).limit(limit).lean()
  return { tasks, count: tasks.length }
}

async function createTask(userId: string, params: Record<string, unknown>) {
  await connectDB()
  const title = params.title as string
  if (!title || typeof title !== 'string') {
    return { error: 'title is required' }
  }
  const doc: Record<string, unknown> = {
    title,
    createdBy: userId,
    status: 'todo',
  }
  if (params.priority) doc.priority = params.priority
  if (params.dueDate) doc.dueDate = new Date(params.dueDate as string)
  if (params.description) doc.description = params.description
  const task = await TaskModel.create(doc)
  return { task: task.toObject() }
}

async function completeTask(userId: string, params: Record<string, unknown>) {
  await connectDB()
  const taskId = params.taskId as string
  if (!taskId) return { error: 'taskId is required' }
  const task = await TaskModel.findOneAndUpdate(
    { _id: taskId, createdBy: userId },
    { status: 'done', completedAt: new Date() },
    { new: true },
  ).lean()
  if (!task) return { error: 'Task not found' }
  return { task }
}

async function listHabits(userId: string) {
  await connectDB()
  const habits = await TaskModel.find({ createdBy: userId, isHabit: true })
    .sort({ updatedAt: -1 })
    .lean()
  return { habits, count: habits.length }
}

async function checkInHabit(userId: string, params: Record<string, unknown>) {
  await connectDB()
  const habitId = params.habitId as string
  if (!habitId) return { error: 'habitId is required' }
  const dateStr = (params.date as string) || new Date().toISOString().slice(0, 10)
  const habit = await TaskModel.findOne({ _id: habitId, createdBy: userId, isHabit: true })
  if (!habit) return { error: 'Habit not found' }

  // Check if already checked in for this date
  const existing = habit.completions?.find(
    (c: { date: string }) => c.date === dateStr,
  )
  if (existing) {
    return { error: `Already checked in for ${dateStr}`, habit: habit.toObject() }
  }

  habit.completions = habit.completions || []
  habit.completions.push({
    date: dateStr,
    status: 'achieved',
    value: 1,
    loggedAt: new Date(),
  })
  habit.streakCurrent = (habit.streakCurrent || 0) + 1
  if (habit.streakCurrent > (habit.streakBest || 0)) {
    habit.streakBest = habit.streakCurrent
  }
  habit.streakLastUpdated = new Date()
  await habit.save()
  return { habit: habit.toObject() }
}

async function getCalendar(userId: string, params: Record<string, unknown>) {
  await connectDB()
  const startDate = params.startDate as string
  const endDate = params.endDate as string
  if (!startDate || !endDate) return { error: 'startDate and endDate are required' }
  const start = new Date(startDate)
  const end = new Date(endDate)
  const events = await TaskModel.find({
    createdBy: userId,
    scheduledStart: { $gte: start, $lte: end },
  })
    .sort({ scheduledStart: 1 })
    .lean()
  return { events, count: events.length }
}

async function getStats(userId: string) {
  await connectDB()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const [totalTasks, completedToday, overdue, totalHabits] = await Promise.all([
    TaskModel.countDocuments({ createdBy: userId, isHabit: { $ne: true } }),
    TaskModel.countDocuments({
      createdBy: userId,
      status: 'done',
      completedAt: { $gte: todayStart, $lt: todayEnd },
    }),
    TaskModel.countDocuments({
      createdBy: userId,
      isHabit: { $ne: true },
      status: { $nin: ['done', 'dropped'] },
      dueDate: { $lt: todayStart },
    }),
    TaskModel.countDocuments({ createdBy: userId, isHabit: true }),
  ])

  return {
    totalTasks,
    completedToday,
    overdue,
    totalHabits,
  }
}

/* ─── Main dispatcher ─── */

const handlers: Record<ToolName, (userId: string, params: Record<string, unknown>) => Promise<unknown>> = {
  list_tasks: listTasks,
  create_task: createTask,
  complete_task: completeTask,
  list_habits: (userId) => listHabits(userId),
  check_in_habit: checkInHabit,
  get_calendar: getCalendar,
  get_stats: (userId) => getStats(userId),
}

export async function handleToolCall(
  toolName: string,
  params: Record<string, unknown>,
  userId: string,
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const handler = handlers[toolName as ToolName]
  if (!handler) {
    return { success: false, error: `Unknown tool: ${toolName}` }
  }
  try {
    const result = await handler(userId, params)
    // If the handler itself returned an error field, propagate it
    if (result && typeof result === 'object' && 'error' in result) {
      return { success: false, error: (result as { error: string }).error }
    }
    return { success: true, result }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[MCP] ${toolName} failed:`, message)
    return { success: false, error: message }
  }
}
