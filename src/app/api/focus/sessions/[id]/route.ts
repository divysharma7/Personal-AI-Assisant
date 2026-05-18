import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import FocusSession from '@/lib/models/FocusSession'
import TaskModel from '@/lib/models/Task'

type LeanDoc = Record<string, unknown> & { _id: unknown }

interface ActionBody {
  action: 'pause' | 'resume' | 'extend' | 'complete' | 'cancel'
  additionalMin?: number
  endedReason?: 'timer_ended' | 'user_completed' | 'user_cancelled'
  postSessionNote?: string
}

function serialize(doc: LeanDoc) {
  return { ...doc, _id: String(doc._id) }
}

/**
 * PATCH /api/focus/sessions/[id] — Session lifecycle actions
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try {
    payload = await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = (await req.json()) as ActionBody

  if (!body.action) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }

  await connectDB()

  const session = await FocusSession.findOne({
    _id: id,
    userId: payload.userId,
  }).lean() as LeanDoc | null

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const now = new Date()
  const update: Record<string, unknown> = {}

  switch (body.action) {
    case 'pause': {
      // Idempotent: only set pausedAt if not already paused
      if (session.pausedAt) {
        return NextResponse.json(serialize(session))
      }
      if (session.status !== 'active') {
        return NextResponse.json({ error: 'Session is not active' }, { status: 400 })
      }
      update.pausedAt = now
      break
    }

    case 'resume': {
      // Idempotent: only resume if currently paused
      if (!session.pausedAt) {
        return NextResponse.json(serialize(session))
      }
      const pausedAt = new Date(session.pausedAt as string)
      const pausedMs = now.getTime() - pausedAt.getTime()
      update.totalPausedMs = (session.totalPausedMs as number || 0) + pausedMs
      update.pausedAt = null
      break
    }

    case 'extend': {
      const additionalMin = body.additionalMin ?? 15
      // Idempotent: we always allow extending
      update.extendedByMin = (session.extendedByMin as number || 0) + additionalMin
      update.plannedDurationMin = (session.plannedDurationMin as number || 25) + additionalMin
      // If session was completed, set it back to extended
      if (session.status === 'completed') {
        update.status = 'extended'
        update.endedAt = null
        update.endedReason = null
      }
      break
    }

    case 'complete': {
      // Idempotent: don't complete if already completed
      if (session.status === 'completed') {
        return NextResponse.json(serialize(session))
      }

      // If paused, add remaining pause time
      let totalPaused = session.totalPausedMs as number || 0
      if (session.pausedAt) {
        const pausedAt = new Date(session.pausedAt as string)
        totalPaused += now.getTime() - pausedAt.getTime()
      }

      const startedAt = new Date(session.startedAt as string)
      const actualDurationMin = Math.round(
        (now.getTime() - startedAt.getTime() - totalPaused) / 60000,
      )

      update.status = 'completed'
      update.endedAt = now
      update.actualDurationMin = Math.max(0, actualDurationMin)
      update.totalPausedMs = totalPaused
      update.pausedAt = null
      update.endedReason = body.endedReason ?? 'user_completed'

      if (body.postSessionNote) {
        update.postSessionNote = body.postSessionNote.slice(0, 200)
      }

      // Update linked task's actualEffort
      if (session.taskId) {
        const effortHours = Math.max(0, actualDurationMin) / 60
        await TaskModel.findByIdAndUpdate(session.taskId, {
          $inc: { actualEffort: effortHours },
        })

        // If task isHabit and no check-in today, create completion entry
        const task = await TaskModel.findById(session.taskId).lean() as LeanDoc | null
        if (task && task.isHabit) {
          const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'UTC' })
          const completions = (task.completions as Array<{ date: string }>) ?? []
          const hasCheckinToday = completions.some(c => c.date === todayStr)

          if (!hasCheckinToday) {
            await TaskModel.findByIdAndUpdate(session.taskId, {
              $push: {
                completions: {
                  date: todayStr,
                  status: 'achieved',
                  loggedAt: now,
                },
              },
              $set: { streakLastUpdated: now },
            })
          }
        }
      }

      break
    }

    case 'cancel': {
      // Idempotent: don't cancel if already cancelled
      if (session.status === 'cancelled') {
        return NextResponse.json(serialize(session))
      }
      update.status = 'cancelled'
      update.endedAt = now
      update.endedReason = 'user_cancelled'
      update.pausedAt = null
      break
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const updated = await FocusSession.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true },
  ).lean() as LeanDoc

  return NextResponse.json(serialize(updated))
}
