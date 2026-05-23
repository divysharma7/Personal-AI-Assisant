/**
 * Alexa intent handlers — each function handles one voice command.
 * Uses MongoDB directly via Mongoose models.
 */

import { connectDB } from '@/lib/mongodb'
import TaskModel from '@/lib/models/Task'
import WorkflowModel from '@/lib/models/Workflow'
import { alexaResponse, alexaCard } from './responseBuilder'

const USER_ID = '6a0ace89bbece9a4ac3e81c9' // Divy Sharma (single-user app)

function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r
}
function endOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r
}

// ─── Task Intents ─────────────────────────────────────────────────

export async function handleAddTask(taskName: string) {
  if (!taskName) return alexaResponse("What should I call the task?", false)
  await connectDB()
  await TaskModel.create({
    title: taskName,
    userId: USER_ID,
    priority: 'medium',
    status: 'todo',
    activities: [{ action: 'created', detail: 'Created via Alexa', timestamp: new Date() }],
  })
  return alexaCard('Task Added', taskName, `Done! I've added "${taskName}" to your tasks.`)
}

export async function handleListTodayTasks() {
  await connectDB()
  const today = startOfDay(new Date())
  const tonight = endOfDay(new Date())
  const tasks = await TaskModel.find({
    userId: USER_ID,
    status: { $nin: ['done', 'dropped'] },
    $or: [
      { dueDate: { $gte: today, $lte: tonight } },
      { scheduledStart: { $gte: today, $lte: tonight } },
    ],
  }).lean()

  if (tasks.length === 0) return alexaResponse("You have no tasks for today. Enjoy your free time!")
  const names = tasks.slice(0, 5).map((t: any) => t.title).join(', ')
  const more = tasks.length > 5 ? `, and ${tasks.length - 5} more` : ''
  return alexaCard('Today\'s Tasks', names, `You have ${tasks.length} tasks today: ${names}${more}.`)
}

export async function handleListInbox() {
  await connectDB()
  const tasks = await TaskModel.find({
    userId: USER_ID,
    status: { $nin: ['done', 'dropped'] },
    listId: null,
    isHabit: { $ne: true },
  }).sort({ createdAt: -1 }).limit(10).lean()

  if (tasks.length === 0) return alexaResponse("Your inbox is empty. Nice work!")
  const names = tasks.slice(0, 5).map((t: any) => t.title).join(', ')
  return alexaResponse(`You have ${tasks.length} tasks in your inbox. Here are the latest: ${names}.`)
}

export async function handleCompleteTask(taskName: string) {
  if (!taskName) return alexaResponse("Which task should I mark as done?", false)
  await connectDB()
  const task = await TaskModel.findOne({
    userId: USER_ID,
    title: { $regex: new RegExp(taskName, 'i') },
    status: { $ne: 'done' },
  })
  if (!task) return alexaResponse(`I couldn't find a task called "${taskName}".`)
  task.status = 'done'
  task.completedAt = new Date()
  await task.save()
  return alexaCard('Task Completed', task.title, `Nice! "${task.title}" is done.`)
}

export async function handleOverdueTasks() {
  await connectDB()
  const today = startOfDay(new Date())
  const tasks = await TaskModel.find({
    userId: USER_ID,
    status: { $nin: ['done', 'dropped'] },
    dueDate: { $lt: today },
  }).lean()

  if (tasks.length === 0) return alexaResponse("You have no overdue tasks. You're on track!")
  const names = tasks.slice(0, 5).map((t: any) => t.title).join(', ')
  return alexaResponse(`You have ${tasks.length} overdue tasks: ${names}.`)
}

export async function handleSetPriority(taskName: string, priority: string) {
  if (!taskName) return alexaResponse("Which task?", false)
  const validPriority = ['high', 'medium', 'low'].includes(priority?.toLowerCase()) ? priority.toLowerCase() : 'medium'
  await connectDB()
  const task = await TaskModel.findOneAndUpdate(
    { userId: USER_ID, title: { $regex: new RegExp(taskName, 'i') } },
    { priority: validPriority },
    { new: true },
  )
  if (!task) return alexaResponse(`I couldn't find "${taskName}".`)
  return alexaResponse(`Set "${task.title}" to ${validPriority} priority.`)
}

// ─── Daily Briefing ───────────────────────────────────────────────

export async function handleDailyBriefing() {
  await connectDB()
  const today = startOfDay(new Date())
  const tonight = endOfDay(new Date())

  const [totalActive, todayTasks, overdue, habits] = await Promise.all([
    TaskModel.countDocuments({ userId: USER_ID, status: { $nin: ['done', 'dropped'] }, isHabit: { $ne: true } }),
    TaskModel.countDocuments({ userId: USER_ID, status: { $nin: ['done', 'dropped'] }, $or: [{ dueDate: { $gte: today, $lte: tonight } }, { scheduledStart: { $gte: today, $lte: tonight } }] }),
    TaskModel.countDocuments({ userId: USER_ID, status: { $nin: ['done', 'dropped'] }, dueDate: { $lt: today } }),
    TaskModel.find({ userId: USER_ID, isHabit: true }).lean(),
  ])

  const parts: string[] = []
  parts.push(`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!`)
  parts.push(`You have ${totalActive} active tasks.`)
  if (todayTasks > 0) parts.push(`${todayTasks} scheduled for today.`)
  if (overdue > 0) parts.push(`${overdue} overdue.`)

  if (habits.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0]
    const checkedIn = habits.filter((h: any) =>
      h.completions?.some((c: any) => c.date?.startsWith?.(todayStr) && c.status === 'achieved')
    ).length
    parts.push(`Habits: ${checkedIn} of ${habits.length} checked in today.`)
  }

  return alexaCard('Daily Briefing', parts.join(' '), parts.join(' '))
}

// ─── Habit Intents ────────────────────────────────────────────────

export async function handleLogHabit(habitName: string) {
  if (!habitName) return alexaResponse("Which habit should I log?", false)
  await connectDB()
  const habit = await TaskModel.findOne({
    userId: USER_ID,
    isHabit: true,
    title: { $regex: new RegExp(habitName, 'i') },
  })
  if (!habit) return alexaResponse(`I couldn't find a habit called "${habitName}".`)

  const todayStr = new Date().toISOString().split('T')[0]
  const alreadyDone = habit.completions?.some((c: any) => c.date?.startsWith?.(todayStr) && c.status === 'achieved')
  if (alreadyDone) return alexaResponse(`You've already checked in "${habit.title}" today. Great job!`)

  habit.completions = habit.completions || []
  habit.completions.push({ date: new Date().toISOString(), status: 'achieved', value: 1 })
  habit.streakCurrent = (habit.streakCurrent || 0) + 1
  await habit.save()
  return alexaCard('Habit Logged', habit.title, `Logged "${habit.title}"! Your streak is now ${habit.streakCurrent} days.`)
}

export async function handleHabitStreak(habitName: string) {
  if (!habitName) return alexaResponse("Which habit?", false)
  await connectDB()
  const habit = await TaskModel.findOne({
    userId: USER_ID,
    isHabit: true,
    title: { $regex: new RegExp(habitName, 'i') },
  }).lean() as any
  if (!habit) return alexaResponse(`I couldn't find a habit called "${habitName}".`)
  return alexaResponse(`Your "${habit.title}" streak is ${habit.streakCurrent || 0} days. Best ever: ${habit.streakBest || 0} days.`)
}

// ─── Calendar Intents ─────────────────────────────────────────────

export async function handleCalendarToday() {
  await connectDB()
  const today = startOfDay(new Date())
  const tonight = endOfDay(new Date())
  const events = await TaskModel.find({
    userId: USER_ID,
    scheduledStart: { $gte: today, $lte: tonight },
  }).sort({ scheduledStart: 1 }).lean()

  if (events.length === 0) return alexaResponse("Nothing scheduled on your calendar today.")
  const list = events.slice(0, 5).map((e: any) => {
    const time = new Date(e.scheduledStart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${e.title} at ${time}`
  }).join(', ')
  return alexaResponse(`You have ${events.length} events today: ${list}.`)
}

// ─── Workflow Intents ─────────────────────────────────────────────

export async function handleWorkflowStatus(workflowName: string) {
  if (!workflowName) return alexaResponse("Which workflow?", false)
  await connectDB()
  const workflow = await WorkflowModel.findOne({
    ownerId: USER_ID,
    name: { $regex: new RegExp(workflowName, 'i') },
  }).lean() as any
  if (!workflow) return alexaResponse(`I couldn't find a workflow called "${workflowName}".`)

  const tasks = await TaskModel.find({ userId: USER_ID, workflowId: String(workflow._id), status: { $ne: 'done' } }).lean()
  if (tasks.length === 0) return alexaResponse(`Your "${workflow.name}" board is empty.`)

  const summary = (workflow.columns || []).map((col: any) => {
    const count = tasks.filter((t: any) => t.sectionId === col.id).length
    return count > 0 ? `${col.title}: ${count}` : null
  }).filter(Boolean).join(', ')

  return alexaResponse(`"${workflow.name}" has ${tasks.length} tasks. ${summary}.`)
}

export async function handleMoveTask(taskName: string, columnName: string) {
  if (!taskName || !columnName) return alexaResponse("Tell me which task and which column.", false)
  await connectDB()
  const task = await TaskModel.findOne({ userId: USER_ID, title: { $regex: new RegExp(taskName, 'i') } })
  if (!task) return alexaResponse(`I couldn't find "${taskName}".`)
  if (!task.workflowId) return alexaResponse(`"${task.title}" isn't in a workflow.`)

  const workflow = await WorkflowModel.findById(task.workflowId).lean() as any
  if (!workflow) return alexaResponse("Workflow not found.")
  const col = workflow.columns?.find((c: any) => c.title.toLowerCase() === columnName.toLowerCase())
  if (!col) return alexaResponse(`No column called "${columnName}" in "${workflow.name}". Available: ${workflow.columns?.map((c: any) => c.title).join(', ')}.`)

  task.sectionId = col.id
  await task.save()
  return alexaResponse(`Moved "${task.title}" to "${col.title}".`)
}

// ─── Built-in Intents ─────────────────────────────────────────────

export function handleHelp() {
  return alexaResponse(
    "You can say: add a task, what's on my today list, daily briefing, log my exercise, " +
    "mark a task as done, what's overdue, or what's on my calendar. What would you like?",
    false,
  )
}

export function handleStop() {
  return alexaResponse("Goodbye! Stay productive.")
}
