import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { handleApiError } from '@/lib/apiHelpers'
import * as handlers from '@/lib/alexa/intentHandlers'
import { alexaResponse } from '@/lib/alexa/responseBuilder'

export async function POST(req: Request) {
  try {
    await connectDB()
    const body = await req.json()

    const requestType = body?.request?.type
    const intentName = body?.request?.intent?.name
    const slots = body?.request?.intent?.slots || {}

    const getSlot = (name: string): string => slots[name]?.value || ''

    // Launch: "Alexa, open LAIF"
    if (requestType === 'LaunchRequest') {
      return NextResponse.json(alexaResponse(
        "Welcome to LAIF, your life assistant. You can add tasks, check your schedule, log habits, or get a daily briefing. What would you like to do?",
        false,
      ))
    }

    // Intent: user said a specific command
    if (requestType === 'IntentRequest') {
      let result
      switch (intentName) {
        case 'AddTaskIntent':
          result = await handlers.handleAddTask(getSlot('taskName'))
          break
        case 'ListTodayTasksIntent':
          result = await handlers.handleListTodayTasks()
          break
        case 'ListInboxIntent':
          result = await handlers.handleListInbox()
          break
        case 'CompleteTaskIntent':
          result = await handlers.handleCompleteTask(getSlot('taskName'))
          break
        case 'OverdueTasksIntent':
          result = await handlers.handleOverdueTasks()
          break
        case 'SetPriorityIntent':
          result = await handlers.handleSetPriority(getSlot('taskName'), getSlot('priority'))
          break
        case 'DailyBriefingIntent':
          result = await handlers.handleDailyBriefing()
          break
        case 'LogHabitIntent':
          result = await handlers.handleLogHabit(getSlot('habitName'))
          break
        case 'HabitStreakIntent':
          result = await handlers.handleHabitStreak(getSlot('habitName'))
          break
        case 'CalendarTodayIntent':
          result = await handlers.handleCalendarToday()
          break
        case 'WorkflowStatusIntent':
          result = await handlers.handleWorkflowStatus(getSlot('workflowName'))
          break
        case 'MoveTaskIntent':
          result = await handlers.handleMoveTask(getSlot('taskName'), getSlot('columnName'))
          break
        case 'AMAZON.HelpIntent':
          result = handlers.handleHelp()
          break
        case 'AMAZON.StopIntent':
        case 'AMAZON.CancelIntent':
          result = handlers.handleStop()
          break
        default:
          result = alexaResponse("I didn't quite get that. Try saying: add a task, daily briefing, or what's on my today list.", false)
      }
      return NextResponse.json(result)
    }

    // Session ended
    if (requestType === 'SessionEndedRequest') {
      return NextResponse.json({ version: '1.0', response: {} })
    }

    return NextResponse.json(alexaResponse("I didn't understand that request."))
  } catch (err) {
    return handleApiError(err)
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    service: 'LAIF Alexa Skill',
    status: 'active',
    intents: [
      'AddTaskIntent', 'ListTodayTasksIntent', 'ListInboxIntent',
      'CompleteTaskIntent', 'OverdueTasksIntent', 'SetPriorityIntent',
      'DailyBriefingIntent', 'LogHabitIntent', 'HabitStreakIntent',
      'CalendarTodayIntent', 'WorkflowStatusIntent', 'MoveTaskIntent',
    ],
  })
}
