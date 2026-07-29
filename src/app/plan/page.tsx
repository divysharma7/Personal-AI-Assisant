import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sunrise,
  CalendarDays,
  Clock,
  Check,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'
import { ease, buttonPress } from '@/lib/motion'
import { useAgenda } from '@/hooks/useAgenda'
import { useTasks } from '@/hooks/useTasks'
import { useSettings } from '@/hooks/useSettings'
import { useCapacity, formatWindowTime, formatMinutes } from '@/hooks/useCapacity'
import { useRitualState, useTodayDate } from '@/hooks/useRitualState'
import RitualPage from '@/components/rituals/RitualPage'
import RitualStep from '@/components/rituals/RitualStep'
import RitualCard from '@/components/rituals/RitualCard'

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

/* ── Plan Page ─────────────────────────────────────────────── */

export default function PlanPage() {
  const navigate = useNavigate()
  const today = useTodayDate()
  const { agenda, isLoading: agendaLoading } = useAgenda(today)
  const { tasks, updateTask, createTask } = useTasks()
  const { preferences } = useSettings()
  const { state, updateRitual, isPending } = useRitualState(today)

  // Local step state — user can leave at any time
  const [currentStep, setCurrentStep] = useState(1)
  const [outcomeDraft, setOutcomeDraft] = useState(state.outcome ?? '')
  const [acceptedWindows, setAcceptedWindows] = useState<Set<string>>(
    new Set(state.acceptedWindows ?? []),
  )
  const [editingWindow, setEditingWindow] = useState<string | null>(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')
  const [confirmed, setConfirmed] = useState(state.planCompleted ?? false)
  const [confirming, setConfirming] = useState(false)

  // Sync outcome draft from state when it loads
  useEffect(() => {
    if (state.outcome && !outcomeDraft) setOutcomeDraft(state.outcome)
  }, [state.outcome])

  // Scheduled tasks for today
  const scheduledTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.scheduledStart &&
          t.scheduledEnd &&
          t.status !== 'done' &&
          t.status !== 'dropped',
      ),
    [tasks],
  )

  // Calendar events from agenda (external events only)
  const calendarEvents = useMemo(
    () => agenda.items.filter((i) => i.kind === 'external_event'),
    [agenda.items],
  )

  // Capacity & suggested windows
  const capacity = useCapacity(agenda, preferences)

  // Already completed? Show read-only summary
  const isPlanComplete = confirmed || state.planCompleted

  /* ── Step 1: See commitments ─────────────────────────────── */

  const commitmentsCount = scheduledTasks.length + calendarEvents.length

  /* ── Step 2: Choose outcome ──────────────────────────────── */

  const handleOutcomeChange = useCallback(
    (value: string) => {
      setOutcomeDraft(value)
    },
    [],
  )

  const handleSaveOutcome = useCallback(async () => {
    if (outcomeDraft.trim()) {
      await updateRitual({ outcome: outcomeDraft.trim() })
    }
  }, [outcomeDraft, updateRitual])

  /* ── Step 3: Protect time ────────────────────────────────── */

  const handleAcceptWindow = useCallback(
    async (windowId: string) => {
      const window = capacity.suggestedWindows.find((w) => w.id === windowId)
      if (!window) return

      // Schedule a focus block as a task
      await createTask({
        title: outcomeDraft.trim() || 'Focus time',
        status: 'todo',
        priority: 'high',
        scheduledStart: window.start,
        scheduledEnd: window.end,
        estimatedEffort: window.durationMinutes / 60,
      })

      const next = new Set(acceptedWindows)
      next.add(windowId)
      setAcceptedWindows(next)
      await updateRitual({ acceptedWindows: Array.from(next) })
    },
    [capacity.suggestedWindows, outcomeDraft, acceptedWindows, createTask, updateRitual],
  )

  const handleEditWindow = useCallback(
    (windowId: string) => {
      const window = capacity.suggestedWindows.find((w) => w.id === windowId)
      if (!window) return
      setEditingWindow(windowId)
      setEditStart(formatTime(window.start))
      setEditEnd(formatTime(window.end))
    },
    [capacity.suggestedWindows],
  )

  const handleSaveEditWindow = useCallback(
    async (windowId: string) => {
      const original = capacity.suggestedWindows.find((w) => w.id === windowId)
      if (!original || !editStart || !editEnd) return

      // Parse the edited times back to ISO (keeping the same date)
      const dateStr = today
      const parseEditedTime = (timeStr: string): string => {
        const [time, period] = timeStr.split(' ')
        const [hours, minutes] = time.split(':').map(Number)
        let h = hours
        if (period?.toLowerCase() === 'pm' && h !== 12) h += 12
        if (period?.toLowerCase() === 'am' && h === 12) h = 0
        return `${dateStr}T${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      }

      const newStart = parseEditedTime(editStart)
      const newEnd = parseEditedTime(editEnd)

      await createTask({
        title: outcomeDraft.trim() || 'Focus time',
        status: 'todo',
        priority: 'high',
        scheduledStart: newStart,
        scheduledEnd: newEnd,
      })

      const next = new Set(acceptedWindows)
      next.add(windowId)
      setAcceptedWindows(next)
      await updateRitual({ acceptedWindows: Array.from(next) })
      setEditingWindow(null)
    },
    [today, editStart, editEnd, capacity.suggestedWindows, outcomeDraft, acceptedWindows, createTask, updateRitual],
  )

  const handleSkipWindow = useCallback(
    (_windowId: string) => {
      // Do nothing — suggestions are ephemeral
    },
    [],
  )

  /* ── Step 4: Confirm day ─────────────────────────────────── */

  const handleConfirmDay = useCallback(async () => {
    setConfirming(true)
    try {
      await updateRitual({ planCompleted: true, outcome: outcomeDraft.trim() || undefined })
      setConfirmed(true)
    } finally {
      setConfirming(false)
    }
  }, [updateRitual, outcomeDraft])

  /* ── Keyboard: allow leaving freely ──────────────────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/agenda')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])

  /* ── Focus stats for step 4 ──────────────────────────────── */

  const scheduledFocusMinutes = useMemo(() => {
    return scheduledTasks
      .filter((t) => t.scheduledStart && t.scheduledEnd)
      .reduce((total, t) => {
        const mins = Math.round(
          (new Date(t.scheduledEnd!).getTime() - new Date(t.scheduledStart!).getTime()) / 60_000,
        )
        return total + mins
      }, 0)
  }, [scheduledTasks])

  /* ── Render ──────────────────────────────────────────────── */

  if (agendaLoading) {
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

  // Plan already completed — show read-only summary
  if (isPlanComplete) {
    return (
      <RitualPage
        icon={<Sunrise size={22} strokeWidth={1.5} />}
        title="Morning Plan"
        subtitle={formatDateFriendly()}
      >
        <RitualCard accent="var(--success)">
          <div className="flex items-center gap-3 mb-4">
            <Check size={20} strokeWidth={2} style={{ color: 'var(--success)' }} />
            <span className="text-[15px] font-semibold" style={{ color: 'var(--success)' }}>
              Day is planned
            </span>
          </div>
          {state.outcome && (
            <div className="mb-3">
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-faint)' }}>
                Today&apos;s outcome
              </p>
              <p className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
                {state.outcome}
              </p>
            </div>
          )}
          <div className="flex gap-4 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            <span>{scheduledTasks.length} task{scheduledTasks.length !== 1 ? 's' : ''} scheduled</span>
            <span>·</span>
            <span>{formatMinutes(scheduledFocusMinutes)} planned</span>
          </div>
        </RitualCard>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate('/agenda')}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}
            {...buttonPress}
          >
            Go to Agenda
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmed(false)
              updateRitual({ planCompleted: false })
            }}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-medium cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            Re-plan
          </button>
        </div>
      </RitualPage>
    )
  }

  return (
    <RitualPage
      icon={<Sunrise size={22} strokeWidth={1.5} />}
      title="Morning Plan"
      subtitle={`${formatDateFriendly()} — choose one outcome, protect time, start intentional.`}
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/agenda')}
            className="text-[13px] font-medium cursor-pointer"
            style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            Skip to Agenda
          </button>
          {currentStep < 4 && (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold cursor-pointer"
              style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-primary)', border: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
            >
              Continue
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      }
    >
      {/* ── Step 1: See commitments ──────────────────────────── */}
      <RitualStep
        step={1}
        title="See commitments"
        subtitle={`${commitmentsCount} item${commitmentsCount !== 1 ? 's' : ''} on your calendar today`}
        active
        accent="var(--accent)"
      >
        {commitmentsCount === 0 ? (
          <p className="text-[14px] py-2" style={{ color: 'var(--text-muted)' }}>
            Your day is open — no calendar events or scheduled tasks.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto" role="list" aria-label="Today's commitments">
            {/* All-day and calendar events */}
            {calendarEvents.map((event) => (
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
                {event.source?.displayName && (
                  <span className="text-[10px] shrink-0" style={{ color: 'var(--text-faint)' }}>
                    {event.source.displayName}
                  </span>
                )}
              </div>
            ))}

            {/* Scheduled tasks */}
            {scheduledTasks.map((task) => (
              <div
                key={task._id}
                role="listitem"
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ backgroundColor: 'var(--overlay-1)' }}
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: task.color || 'var(--accent)' }}
                />
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
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--overlay-2)',
                    color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : 'var(--text-faint)',
                  }}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </RitualStep>

      {/* ── Step 2: Choose one outcome ──────────────────────── */}
      <RitualStep
        step={2}
        title="Choose one outcome"
        subtitle="What is the most important result for today?"
        active={currentStep >= 2}
        accent="var(--accent-purple, #8f89fa)"
      >
        <div className="flex flex-col gap-3">
          <label htmlFor="outcome-input" className="sr-only">
            Today&apos;s most important outcome
          </label>
          <input
            id="outcome-input"
            type="text"
            value={outcomeDraft}
            onChange={(e) => handleOutcomeChange(e.target.value)}
            onBlur={handleSaveOutcome}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveOutcome()
                setCurrentStep(3)
              }
            }}
            placeholder="e.g. Finish the design review draft"
            className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
            style={{
              backgroundColor: 'var(--overlay-1)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              transition: 'border-color 150ms ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
            aria-describedby="outcome-hint"
          />
          <p id="outcome-hint" className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
            This becomes your north star for the day. You can change it anytime.
          </p>
        </div>
      </RitualStep>

      {/* ── Step 3: Protect time ────────────────────────────── */}
      <RitualStep
        step={3}
        title="Protect time"
        subtitle="Suggested focus windows based on your availability"
        active={currentStep >= 3}
        accent="var(--accent-custom-1, #bcdb71)"
      >
        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-faint)' }}>
              Day capacity
            </span>
            <span className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {formatMinutes(capacity.availableMinutes)} available of {formatMinutes(capacity.totalWorkingMinutes)}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={capacity.committedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${capacity.committedPercent}% committed`}
            style={{ backgroundColor: 'var(--overlay-2)' }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${capacity.committedPercent}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: capacity.committedPercent > 80
                  ? '#ef4444'
                  : capacity.committedPercent > 50
                    ? '#f59e0b'
                    : 'var(--accent)',
              }}
            />
          </div>
        </div>

        {/* Suggested windows */}
        {!capacity.hasCapacity ? (
          <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: 'var(--overlay-1)' }}
          >
            <AlertTriangle size={16} strokeWidth={1.5} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                No focus time available
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                Your day is fully committed. Consider moving or dropping a task.
              </p>
            </div>
          </div>
        ) : capacity.suggestedWindows.length === 0 ? (
          <p className="text-[13px] py-2" style={{ color: 'var(--text-muted)' }}>
            No suggested windows — schedule a focus block manually from Agenda.
          </p>
        ) : (
          <div className="flex flex-col gap-2" role="list" aria-label="Suggested focus windows">
            {capacity.suggestedWindows.map((window) => {
              const isAccepted = acceptedWindows.has(window.id)
              const isEditing = editingWindow === window.id

              return (
                <div
                  key={window.id}
                  role="listitem"
                  className="rounded-xl px-4 py-3"
                  style={{
                    backgroundColor: isAccepted ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--overlay-1)',
                    border: isAccepted ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid transparent',
                    transition: 'background-color 150ms ease, border-color 150ms ease',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {formatWindowTime(window.start)} – {formatWindowTime(window.end)}
                        </span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-faint)' }}
                        >
                          Suggestion
                        </span>
                        {isAccepted && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1"
                            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                          >
                            <Check size={10} /> Accepted
                          </span>
                        )}
                      </div>
                      <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                        {window.durationMinutes}m — {window.reason}
                      </p>
                    </div>

                    {/* Actions */}
                    {!isAccepted && !isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAcceptWindow(window.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold cursor-pointer"
                          style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}
                          aria-label={`Accept focus window from ${formatWindowTime(window.start)} to ${formatWindowTime(window.end)}`}
                          {...buttonPress}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditWindow(window.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                          style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                          aria-label="Edit this suggestion"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSkipWindow(window.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                          style={{ backgroundColor: 'transparent', color: 'var(--text-faint)', border: 'none' }}
                          aria-label="Skip this suggestion"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit mode */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                          <label className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                            Start
                            <input
                              type="text"
                              value={editStart}
                              onChange={(e) => setEditStart(e.target.value)}
                              className="ml-1 rounded-lg px-2 py-1 text-[12px] w-20 outline-none"
                              style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                              aria-label="Edit start time"
                            />
                          </label>
                          <label className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                            End
                            <input
                              type="text"
                              value={editEnd}
                              onChange={(e) => setEditEnd(e.target.value)}
                              className="ml-1 rounded-lg px-2 py-1 text-[12px] w-20 outline-none"
                              style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                              aria-label="Edit end time"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleSaveEditWindow(window.id)}
                            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold cursor-pointer"
                            style={{ backgroundColor: 'var(--accent)', color: 'white', border: 'none' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingWindow(null)}
                            className="rounded-lg px-3 py-1.5 text-[12px] font-medium cursor-pointer"
                            style={{ color: 'var(--text-faint)', background: 'none', border: 'none' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </RitualStep>

      {/* ── Step 4: Confirm day ─────────────────────────────── */}
      <RitualStep
        step={4}
        title="Confirm day"
        subtitle="Review your plan and start the day"
        active={currentStep >= 4}
        accent="var(--success, #34d399)"
      >
        <div className="flex flex-col gap-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Outcome
              </p>
              <p className="text-[14px] font-medium mt-1 truncate" style={{ color: 'var(--text-primary)' }}>
                {outcomeDraft.trim() || 'Not set'}
              </p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                Focus time
              </p>
              <p className="text-[14px] font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                {formatMinutes(scheduledFocusMinutes)} scheduled
              </p>
            </div>
          </div>

          {/* Scheduled items summary */}
          {scheduledTasks.length > 0 && (
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>
                Scheduled
              </p>
              <div className="flex flex-col gap-1">
                {scheduledTasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="flex items-center gap-2 text-[13px]">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: task.color || 'var(--accent)' }} />
                    <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                    {task.scheduledStart && task.scheduledEnd && (
                      <span className="shrink-0" style={{ color: 'var(--text-faint)' }}>
                        {formatTime(task.scheduledStart)} – {formatTime(task.scheduledEnd)}
                      </span>
                    )}
                  </div>
                ))}
                {scheduledTasks.length > 5 && (
                  <p className="text-[12px]" style={{ color: 'var(--text-faint)' }}>
                    +{scheduledTasks.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Remaining capacity */}
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--overlay-1)' }}>
            <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>
              Remaining capacity
            </p>
            <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
              {formatMinutes(capacity.availableMinutes)} free after commitments
            </p>
          </div>

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirmDay}
            disabled={confirming || isPending}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold cursor-pointer w-full"
            style={{
              backgroundColor: confirming ? 'var(--overlay-3)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              opacity: confirming ? 0.7 : 1,
              transition: 'opacity 150ms ease',
            }}
            aria-label="Confirm day plan"
            {...buttonPress}
          >
            {confirming ? (
              'Confirming…'
            ) : (
              <>
                <Check size={18} strokeWidth={2} />
                Confirm day
              </>
            )}
          </button>
        </div>
      </RitualStep>
    </RitualPage>
  )
}
