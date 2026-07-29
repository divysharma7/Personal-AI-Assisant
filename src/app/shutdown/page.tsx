import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon,
  CheckCircle2,
  Clock,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  Undo2,
  Move,
  Inbox,
  Trash2,
  Check,
} from 'lucide-react'
import { env } from '@/config/env'
import { trackEvent } from '@/lib/analytics'
import { buttonPress } from '@/lib/motion'
import { useAgenda } from '@/hooks/useAgenda'
import { useTasks } from '@/hooks/useTasks'
import { useRitualState, useTodayDate } from '@/hooks/useRitualState'
import { formatMinutes } from '@/hooks/useCapacity'
import RitualPage from '@/components/rituals/RitualPage'
import RitualStep from '@/components/rituals/RitualStep'
import RitualCard from '@/components/rituals/RitualCard'

/* ── Types ─────────────────────────────────────────────────── */

type TaskDecision = 'move' | 'unschedule' | 'complete' | 'drop'

interface FocusStats {
  today: { sessions: number; totalMin: number }
}

/* ── Helpers ───────────────────────────────────────────────── */

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateFriendly(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── Decision Badge ────────────────────────────────────────── */

function DecisionBadge({ decision }: { decision: TaskDecision }) {
  const labels: Record<TaskDecision, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    move: { label: 'Moved', color: 'var(--accent)', icon: Move },
    unschedule: { label: 'Unscheduled', color: 'var(--text-muted)', icon: Inbox },
    complete: { label: 'Completed', color: 'var(--success)', icon: Check },
    drop: { label: 'Dropped', color: 'var(--priority-high)', icon: Trash2 },
  }
  const { label, color, icon: Icon } = labels[decision]
  return (
    <span
      className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon size={11} strokeWidth={2} />
      {label}
    </span>
  )
}

/* ── Shutdown Page ─────────────────────────────────────────── */

export default function ShutdownPage() {
  const navigate = useNavigate()
  const today = useTodayDate()
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const { agenda, isLoading: agendaLoading } = useAgenda(today)
  const { agenda: tomorrowAgenda, isLoading: tomorrowLoading } = useAgenda(tomorrow)
  const { tasks, updateTask } = useTasks()
  const { state, updateRitual, isPending } = useRitualState(today)

  // Focus stats
  const [focusStats, setFocusStats] = useState<FocusStats | null>(null)

  useEffect(() => {
    fetch(`${env.VITE_API_URL}/api/focus/stats`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setFocusStats(data) })
      .catch(() => {})
  }, [])

  // Local decisions map
  const [decisions, setDecisions] = useState<Record<string, TaskDecision>>(
    state.taskDecisions as Record<string, TaskDecision> ?? {},
  )
  const [undoStack, setUndoStack] = useState<{ taskId: string; previous: TaskDecision | null }[]>([])
  const [dayClosed, setDayClosed] = useState(state.shutdownCompleted ?? false)
  const [closing, setClosing] = useState(false)

  // Unfinished scheduled tasks for today
  const unfinishedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'done' || t.status === 'dropped') return false
      if (!t.scheduledStart || !t.scheduledEnd) return false
      // Only tasks scheduled for today
      const start = new Date(t.scheduledStart)
      return (
        start.getFullYear() === new Date().getFullYear() &&
        start.getMonth() === new Date().getMonth() &&
        start.getDate() === new Date().getDate()
      )
    })
  }, [tasks])

  // Completed tasks today
  const completedTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== 'done') return false
      if (!t.completedAt) return false
      const completed = new Date(t.completedAt)
      const now = new Date()
      return (
        completed.getFullYear() === now.getFullYear() &&
        completed.getMonth() === now.getMonth() &&
        completed.getDate() === now.getDate()
      )
    })
  }, [tasks])

  // Tomorrow's calendar events
  const tomorrowEvents = useMemo(
    () => tomorrowAgenda.items.filter((i) => i.kind === 'external_event'),
    [tomorrowAgenda.items],
  )

  const tomorrowTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status === 'done' || t.status === 'dropped') return false
      if (!t.scheduledStart) return false
      const start = new Date(t.scheduledStart)
      const tDate = new Date(tomorrow + 'T00:00:00')
      const tDateEnd = new Date(tomorrow + 'T23:59:59')
      return start >= tDate && start <= tDateEnd
    })
  }, [tasks, tomorrow])

  // Decisions still needed
  const undecidedTasks = unfinishedTasks.filter((t) => !decisions[t._id])
  const allDecided = unfinishedTasks.length === 0 || undecidedTasks.length === 0

  /* ── Decision handlers ───────────────────────────────────── */

  const handleDecision = useCallback(
    async (taskId: string, decision: TaskDecision) => {
      const previous = decisions[taskId] ?? null
      setUndoStack((prev) => [...prev, { taskId, previous }])
      setDecisions((prev) => ({ ...prev, [taskId]: decision }))

      // Persist immediately
      if (decision === 'complete') {
        await updateTask(taskId, { status: 'done' })
      } else if (decision === 'drop') {
        await updateTask(taskId, { status: 'dropped' })
      } else if (decision === 'unschedule') {
        await updateTask(taskId, { scheduledStart: null, scheduledEnd: null })
      }
      // 'move' doesn't happen immediately — user must specify a date later
    },
    [decisions, updateTask],
  )

  const handleUndo = useCallback(async () => {
    const last = undoStack[undoStack.length - 1]
    if (!last) return

    setUndoStack((prev) => prev.slice(0, -1))
    setDecisions((prev) => {
      const next = { ...prev }
      if (last.previous) {
        next[last.taskId] = last.previous
      } else {
        delete next[last.taskId]
      }
      return next
    })

    // Revert the task change
    const task = tasks.find((t) => t._id === last.taskId)
    if (task && last.previous === null) {
      // Undoing a decision — restore the task to its previous state
      if (decisions[last.taskId] === 'complete') {
        await updateTask(last.taskId, { status: 'todo' })
      } else if (decisions[last.taskId] === 'drop') {
        await updateTask(last.taskId, { status: 'todo' })
      } else if (decisions[last.taskId] === 'unschedule') {
        // We can't fully restore the old schedule, but at least mark it
        // The user will need to re-schedule manually
      }
    }
  }, [undoStack, decisions, tasks, updateTask])

  /* ── Close the day ───────────────────────────────────────── */

  const handleCloseDay = useCallback(async () => {
    setClosing(true)
    try {
      await updateRitual({
        taskDecisions: decisions,
        shutdownCompleted: true,
      })
      setDayClosed(true)
      // Privacy-safe milestone: user completed their evening shutdown.
      trackEvent('evening_shutdown_completed')
    } finally {
      setClosing(false)
    }
  }, [decisions, updateRitual])

  /* ── Keyboard ────────────────────────────────────────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/agenda')
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, handleUndo])

  /* ── Loading state ───────────────────────────────────────── */

  if (agendaLoading || tomorrowLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid var(--accent)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    )
  }

  /* ── Day closed view ─────────────────────────────────────── */

  if (dayClosed) {
    return (
      <RitualPage
        icon={<Moon size={22} strokeWidth={1.5} />}
        title="Evening Shutdown"
        subtitle={formatDateFriendly()}
      >
        <RitualCard accent="var(--success)">
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 size={32} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
            <p className="text-[18px] font-semibold mt-3" style={{ color: 'var(--text-primary)' }}>
              Day closed. Tomorrow is ready.
            </p>
            <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
              {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
              {focusStats?.today.totalMin ? ` · ${formatMinutes(focusStats.today.totalMin)} focused` : ''}
            </p>
          </div>
        </RitualCard>

        <div className="flex gap-3 mt-4 justify-center">
          <button
            type="button"
            onClick={() => navigate('/plan')}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}
            {...buttonPress}
          >
            Plan tomorrow
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setDayClosed(false)
              updateRitual({ shutdownCompleted: false })
            }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-medium cursor-pointer"
            style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Reopen
          </button>
        </div>
      </RitualPage>
    )
  }

  /* ── Main render ─────────────────────────────────────────── */

  return (
    <RitualPage
      icon={<Moon size={22} strokeWidth={1.5} />}
      title="Evening Shutdown"
      subtitle="Close the loop. Decide what happens to unfinished work."
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              className="text-[13px] font-medium cursor-pointer"
              style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
            >
              Back to Agenda
            </button>
            {undoStack.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1.5 text-[12px] font-medium cursor-pointer"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
                aria-label="Undo last decision"
              >
                <Undo2 size={13} strokeWidth={1.5} />
                Undo
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseDay}
            disabled={!allDecided || closing || isPending}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold cursor-pointer"
            style={{
              backgroundColor: allDecided ? 'var(--accent)' : 'var(--overlay-3)',
              color: allDecided ? 'white' : 'var(--text-faint)',
              border: 'none',
              opacity: closing ? 0.7 : 1,
            }}
            aria-label="Close the day"
            aria-disabled={!allDecided}
            {...buttonPress}
          >
            {closing ? 'Closing…' : 'Close the day'}
          </button>
        </div>
      }
    >
      {/* ── Today Summary ───────────────────────────────────── */}
      <RitualStep
        step={1}
        title="Today summary"
        subtitle="What you accomplished"
        active
        accent="var(--accent)"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Completed tasks */}
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Completed
              </span>
            </div>
            <p className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {completedTasks.length}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
              task{completedTasks.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Focus time */}
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Focused
              </span>
            </div>
            <p className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatMinutes(focusStats?.today.totalMin ?? 0)}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
              {focusStats?.today.sessions ?? 0} session{(focusStats?.today.sessions ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Completed task list */}
        {completedTasks.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {completedTasks.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                style={{ backgroundColor: 'var(--overlay-1)' }}
              >
                <CheckCircle2 size={12} strokeWidth={2} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <span className="text-[13px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {task.title}
                </span>
              </div>
            ))}
            {completedTasks.length > 5 && (
              <p className="text-[12px] px-3" style={{ color: 'var(--text-faint)' }}>
                +{completedTasks.length - 5} more
              </p>
            )}
          </div>
        )}

        {completedTasks.length === 0 && (
          <p className="text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
            No tasks completed today. That happens — tomorrow is a fresh start.
          </p>
        )}
      </RitualStep>

      {/* ── Unfinished Decisions ────────────────────────────── */}
      <RitualStep
        step={2}
        title="Unfinished decisions"
        subtitle={
          unfinishedTasks.length > 0
            ? `${undecidedTasks.length} task${undecidedTasks.length !== 1 ? 's' : ''} need${undecidedTasks.length === 1 ? 's' : ''} a decision`
            : 'All tasks resolved'
        }
        active
        accent={undecidedTasks.length > 0 ? '#f59e0b' : 'var(--success)'}
      >
        {unfinishedTasks.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              No unfinished scheduled tasks. Clean slate.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3" role="list" aria-label="Unfinished tasks requiring decisions">
            {unfinishedTasks.map((task) => {
              const decision = decisions[task._id]
              const hasDecision = !!decision

              return (
                <div
                  key={task._id}
                  role="listitem"
                  className="rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: hasDecision ? 'var(--overlay-1)' : 'color-mix(in srgb, #f59e0b 6%, transparent)',
                    border: hasDecision ? '1px solid transparent' : '1px solid color-mix(in srgb, #f59e0b 20%, transparent)',
                    transition: 'background-color 150ms ease, border-color 150ms ease',
                  }}
                >
                  {/* Task info */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </p>
                      {task.scheduledStart && task.scheduledEnd && (
                        <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                          Scheduled: {formatTime(task.scheduledStart)} – {formatTime(task.scheduledEnd)}
                        </p>
                      )}
                    </div>
                    {hasDecision && <DecisionBadge decision={decision} />}
                  </div>

                  {/* Decision buttons */}
                  {!hasDecision && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`Decide what to do with ${task.title}`}>
                      <button
                        type="button"
                        onClick={() => handleDecision(task._id, 'complete')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-semibold cursor-pointer"
                        style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none' }}
                        aria-label={`Mark ${task.title} as complete`}
                        {...buttonPress}
                      >
                        <Check size={13} strokeWidth={2} />
                        Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(task._id, 'move')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
                        style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-primary)', border: 'none' }}
                        aria-label={`Move ${task.title} to another day`}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
                      >
                        <Move size={13} strokeWidth={1.5} />
                        Move
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(task._id, 'unschedule')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
                        style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-primary)', border: 'none' }}
                        aria-label={`Return ${task.title} to unscheduled`}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
                      >
                        <Inbox size={13} strokeWidth={1.5} />
                        Unscheduled
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision(task._id, 'drop')}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium cursor-pointer"
                        style={{ backgroundColor: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)' }}
                        aria-label={`Drop ${task.title}`}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--priority-high)'; e.currentTarget.style.color = 'var(--priority-high)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-faint)' }}
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                        Drop
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Hint if not all decided */}
        {undecidedTasks.length > 0 && (
          <div
            className="flex items-center gap-2 mt-3 rounded-lg px-3 py-2"
            style={{ backgroundColor: 'color-mix(in srgb, #f59e0b 6%, transparent)' }}
          >
            <AlertCircle size={14} strokeWidth={1.5} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
              Every unfinished task needs a decision before you can close the day.
            </p>
          </div>
        )}
      </RitualStep>

      {/* ── Tomorrow Preview ────────────────────────────────── */}
      <RitualStep
        step={3}
        title="Tomorrow preview"
        subtitle="What&apos;s already on the calendar"
        active
        accent="var(--accent-purple, #8f89fa)"
      >
        {tomorrowEvents.length === 0 && tomorrowTasks.length === 0 ? (
          <div className="py-2">
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              Tomorrow is open — no calendar events or scheduled tasks.
            </p>
            <button
              type="button"
              onClick={() => navigate('/plan')}
              className="flex items-center gap-2 mt-3 text-[13px] font-medium cursor-pointer"
              style={{ color: 'var(--accent)', background: 'none', border: 'none' }}
              aria-label="Plan tomorrow morning"
            >
              Plan it in the morning
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto" role="list" aria-label="Tomorrow's schedule">
            {tomorrowEvents.map((event) => (
              <div
                key={event.id}
                role="listitem"
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--overlay-1)' }}
              >
                <CalendarDays size={14} strokeWidth={1.5} style={{ color: event.color || 'var(--accent)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {event.title}
                  </p>
                  {event.start && event.end && !event.allDay && (
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {formatTime(event.start)} – {formatTime(event.end)}
                    </p>
                  )}
                  {event.allDay && (
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>All day</p>
                  )}
                </div>
              </div>
            ))}
            {tomorrowTasks.map((task) => (
              <div
                key={task._id}
                role="listitem"
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--overlay-1)' }}
              >
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: task.color || 'var(--accent)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                  </p>
                  {task.scheduledStart && task.scheduledEnd && (
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {formatTime(task.scheduledStart)} – {formatTime(task.scheduledEnd)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </RitualStep>
    </RitualPage>
  )
}
