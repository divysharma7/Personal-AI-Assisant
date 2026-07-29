import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  Flame,
  Timer,
  Calendar,
} from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { fade, ease, motionTokens } from '@/lib/motion'

// ── Types ──────────────────────────────────────────────────────

interface AgendaItem {
  id: string
  kind: 'task' | 'habit' | 'external_event' | 'focus_session'
  title: string
  start: string | null
  end: string | null
  allDay: boolean
  completed: boolean
  source: { type: string; displayName?: string }
  availability: 'busy' | 'free'
  color: string
  actions: string[]
}

interface UnscheduledTask {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes?: number
  dueDate?: string
}

interface AgendaResponse {
  date: string
  timeZone: string
  generatedAt: string
  sync: { state: string; lastSuccessfulAt: string | null }
  items: AgendaItem[]
  unscheduledPriorities: UnscheduledTask[]
}

// ── Mock data ──────────────────────────────────────────────────

function generateMockAgenda(dateStr: string): AgendaResponse {
  const now = new Date()
  const isToday = dateStr === now.toISOString().split('T')[0]

  const items: AgendaItem[] = [
    {
      id: 'ext-1',
      kind: 'external_event',
      title: 'Team standup',
      start: `${dateStr}T09:00:00`,
      end: `${dateStr}T09:30:00`,
      allDay: false,
      completed: false,
      source: { type: 'google', displayName: 'Work' },
      availability: 'busy',
      color: '#4285f4',
      actions: ['view'],
    },
    {
      id: 'task-1',
      kind: 'task',
      title: 'Review PR #142',
      start: `${dateStr}T10:00:00`,
      end: `${dateStr}T10:30:00`,
      allDay: false,
      completed: false,
      source: { type: 'lifeos' },
      availability: 'busy',
      color: '#6366f1',
      actions: ['complete', 'focus', 'reschedule'],
    },
    {
      id: 'habit-1',
      kind: 'habit',
      title: 'Morning meditation',
      start: `${dateStr}T07:00:00`,
      end: `${dateStr}T07:15:00`,
      allDay: false,
      completed: isToday && now.getHours() > 7,
      source: { type: 'lifeos' },
      availability: 'free',
      color: '#f59e0b',
      actions: ['complete'],
    },
    {
      id: 'ext-2',
      kind: 'external_event',
      title: 'Design review',
      start: `${dateStr}T14:00:00`,
      end: `${dateStr}T15:00:00`,
      allDay: false,
      completed: false,
      source: { type: 'google', displayName: 'Work' },
      availability: 'busy',
      color: '#4285f4',
      actions: ['view'],
    },
    {
      id: 'task-2',
      kind: 'task',
      title: 'Write migration docs',
      start: `${dateStr}T11:00:00`,
      end: `${dateStr}T12:00:00`,
      allDay: false,
      completed: false,
      source: { type: 'lifeos' },
      availability: 'busy',
      color: '#6366f1',
      actions: ['complete', 'focus', 'reschedule'],
    },
    {
      id: 'focus-1',
      kind: 'focus_session',
      title: 'Deep work: API refactor',
      start: `${dateStr}T16:00:00`,
      end: `${dateStr}T17:00:00`,
      allDay: false,
      completed: true,
      source: { type: 'lifeos' },
      availability: 'busy',
      color: '#10b981',
      actions: ['view'],
    },
  ]

  const unscheduled: UnscheduledTask[] = [
    { id: 'u-1', title: 'Update dependencies', priority: 'medium', estimatedMinutes: 30 },
    { id: 'u-2', title: 'Write unit tests for auth', priority: 'high', estimatedMinutes: 60 },
    { id: 'u-3', title: 'Review design mockups', priority: 'low', estimatedMinutes: 15 },
  ]

  return {
    date: dateStr,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    generatedAt: new Date().toISOString(),
    sync: { state: 'healthy', lastSuccessfulAt: new Date().toISOString() },
    items,
    unscheduledPriorities: unscheduled,
  }
}

// ── Helpers ────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDateHeader(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatDateSecondary(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function isViewingToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b66da',
}

const KIND_LABELS: Record<string, string> = {
  task: 'Task',
  habit: 'Habit',
  external_event: 'Event',
  focus_session: 'Focus',
}

const KIND_ICONS: Record<string, typeof CheckCircle2> = {
  task: CheckCircle2,
  habit: Flame,
  external_event: Calendar,
  focus_session: Timer,
}

// ── Agenda Item Row ────────────────────────────────────────────

function AgendaItemRow({ item, isNow }: { item: AgendaItem; isNow: boolean }) {
  const Icon = KIND_ICONS[item.kind] || Clock

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.fast }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{
        backgroundColor: isNow ? 'var(--overlay-1)' : 'transparent',
        borderLeft: `3px solid ${item.color}`,
      }}
      onMouseEnter={(e) => { if (!isNow) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
      onMouseLeave={(e) => { if (!isNow) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {/* Time column */}
      <div className="flex flex-col items-end min-w-[72px] pt-0.5">
        {item.start && (
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatTime(item.start)}
          </span>
        )}
        {item.end && (
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {formatTime(item.end)}
          </span>
        )}
        {item.allDay && (
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>All day</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon size={14} strokeWidth={1.5} style={{ color: item.color, flexShrink: 0 }} />
          <span
            className="text-sm font-medium truncate"
            style={{
              color: item.completed ? 'var(--text-faint)' : 'var(--text-primary)',
              textDecoration: item.completed ? 'line-through' : 'none',
            }}
          >
            {item.title}
          </span>
          {isNow && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Now
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {KIND_LABELS[item.kind]}
          </span>
          {item.source.displayName && (
            <>
              <span style={{ color: 'var(--text-faint)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {item.source.displayName}
              </span>
            </>
          )}
          {item.completed && (
            <CheckCircle2 size={12} strokeWidth={2} style={{ color: '#10b981' }} />
          )}
        </div>
      </div>

      {/* Actions */}
      {!item.completed && item.actions.includes('complete') && (
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
          title="Complete"
        >
          <CheckCircle2 size={16} strokeWidth={1.5} />
        </button>
      )}
    </motion.div>
  )
}

// ── Unscheduled Tray ───────────────────────────────────────────

function UnscheduledTray({ tasks }: { tasks: UnscheduledTask[] }) {
  if (tasks.length === 0) return null

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          Unscheduled
        </span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-muted)' }}
        >
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--overlay-1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] || 'var(--text-faint)' }}
            />
            <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
              {task.title}
            </span>
            {task.estimatedMinutes && (
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {task.estimatedMinutes}m
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────

export default function AgendaPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const scrollRef = useRef<HTMLDivElement>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const dateParam = searchParams.get('date') || todayStr
  const [selectedDate, setSelectedDate] = useState(dateParam)

  // Sync URL when date changes
  useEffect(() => {
    if (selectedDate === todayStr) {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ date: selectedDate }, { replace: true })
    }
  }, [selectedDate, todayStr, setSearchParams])

  // Mock data
  const agenda = useMemo(() => generateMockAgenda(selectedDate), [selectedDate])
  const dateObj = useMemo(() => new Date(selectedDate + 'T12:00:00'), [selectedDate])

  // Navigation
  const goToday = useCallback(() => setSelectedDate(todayStr), [todayStr])
  const goPrev = useCallback(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }, [selectedDate])
  const goNext = useCallback(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().split('T')[0])
  }, [selectedDate])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext() }
      if (e.key === 't' || e.key === 'T') { e.preventDefault(); goToday() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [goPrev, goNext, goToday])

  // Now marker
  const nowHour = new Date().getHours()
  const nowMinute = new Date().getMinutes()
  const isViewingToday = selectedDate === todayStr

  // Sort items: all-day first, then by start time
  const sortedItems = useMemo(() => {
    const allDay = agenda.items.filter((i) => i.allDay)
    const timed = agenda.items.filter((i) => !i.allDay).sort((a, b) => {
      if (!a.start || !b.start) return 0
      return new Date(a.start).getTime() - new Date(b.start).getTime()
    })
    return [...allDay, ...timed]
  }, [agenda.items])

  // Find "now" item
  const nowItem = useMemo(() => {
    if (!isViewingToday) return null
    const now = new Date()
    return sortedItems.find((item) => {
      if (!item.start || !item.end) return false
      const start = new Date(item.start)
      const end = new Date(item.end)
      return now >= start && now <= end
    })
  }, [sortedItems, isViewingToday])

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-canvas)' }}>
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {formatDateHeader(dateObj)}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {formatDateSecondary(dateObj)}
            </p>
          </div>
          {!isViewingToday && (
            <button
              onClick={goToday}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--overlay-1)', color: 'var(--accent)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--overlay-2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--overlay-1)'}
            >
              Back to today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            aria-label="Previous day"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={goNext}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            aria-label="Next day"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="ml-2 text-xs px-2 py-1 rounded-lg outline-none"
            style={{
              backgroundColor: 'var(--overlay-1)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Main lane ── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-[560px] mx-auto">
            {/* All-day items */}
            {sortedItems.filter((i) => i.allDay).length > 0 && (
              <div className="mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                  All day
                </span>
                {sortedItems.filter((i) => i.allDay).map((item) => (
                  <AgendaItemRow key={item.id} item={item} isNow={false} />
                ))}
              </div>
            )}

            {/* Timed items */}
            <div className="flex flex-col gap-1">
              {sortedItems.filter((i) => !i.allDay).map((item) => (
                <AgendaItemRow key={item.id} item={item} isNow={item.id === nowItem?.id} />
              ))}
            </div>

            {/* Empty state */}
            {sortedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CalendarDays size={40} strokeWidth={1} style={{ color: 'var(--text-faint)', marginBottom: 16 }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Your day has room
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                  Schedule a priority or create a task to get started
                </p>
                <button
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  <Plus size={16} strokeWidth={2} />
                  Add task
                </button>
              </div>
            )}

            {/* Sync status */}
            <div className="mt-6 text-center">
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {agenda.sync.state === 'healthy' ? 'Calendar synced' : 'Sync delayed'}
                {agenda.sync.lastSuccessfulAt && (
                  <> · {new Date(agenda.sync.lastSuccessfulAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ── Priority tray (desktop only) ── */}
        <div
          className="hidden xl:block w-[280px] flex-shrink-0 overflow-y-auto py-4 pr-6"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <UnscheduledTray tasks={agenda.unscheduledPriorities} />
        </div>
      </div>
    </div>
  )
}
