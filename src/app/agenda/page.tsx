import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  Flame,
  Timer,
  Calendar,
  AlertTriangle,
  Focus,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { motionTokens } from '@/lib/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

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
      id: 'task-3',
      kind: 'task',
      title: 'Prepare sprint retro',
      start: `${dateStr}T14:15:00`,
      end: `${dateStr}T14:45:00`,
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

/** Minutes between two ISO strings. */
function overlapMinutes(aStart: string, aEnd: string, bStart: string, bEnd: string): number {
  const as = new Date(aStart).getTime()
  const ae = new Date(aEnd).getTime()
  const bs = new Date(bStart).getTime()
  const be = new Date(bEnd).getTime()
  const start = Math.max(as, bs)
  const end = Math.min(ae, be)
  return Math.max(0, Math.round((end - start) / 60000))
}

/** Duration in minutes between two ISO timestamps. */
function durationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
}

/** Friendly duration string, e.g. "45m" or "1h 15m". */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
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

// ── Conflict Detection ─────────────────────────────────────────

interface ConflictInfo {
  itemId: string
  otherTitle: string
  overlapMin: number
}

/** Build a map of item id → conflict description (first conflict only). */
function detectConflicts(items: AgendaItem[]): Map<string, ConflictInfo> {
  const map = new Map<string, ConflictInfo>()
  const timed = items.filter((i) => i.start && i.end && !i.allDay)

  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i]
      const b = timed[j]
      const mins = overlapMinutes(a.start!, a.end!, b.start!, b.end!)
      if (mins > 0) {
        if (!map.has(a.id)) {
          map.set(a.id, { itemId: b.id, otherTitle: b.title, overlapMin: mins })
        }
        if (!map.has(b.id)) {
          map.set(b.id, { itemId: a.id, otherTitle: a.title, overlapMin: mins })
        }
      }
    }
  }
  return map
}

// ── Current Time Rule ──────────────────────────────────────────

function CurrentTimeRule() {
  const [, setTick] = useState(0)

  // Re-render every 60 seconds
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  const label = formatTime(now.toISOString())

  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-label={`Current time: ${label}`}>
      <div className="min-w-[72px] flex justify-end">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
          {label}
        </span>
      </div>
      <div className="flex-1 relative h-px" style={{ backgroundColor: 'var(--accent)' }}>
        <div
          className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </div>
    </div>
  )
}

// ── Skeleton Row ───────────────────────────────────────────────

function SkeletonRow({ width = '60%' }: { width?: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl animate-pulse">
      <div className="flex flex-col items-end min-w-[72px] gap-1 pt-0.5">
        <div className="h-3 w-10 rounded" style={{ backgroundColor: 'var(--overlay-2)' }} />
        <div className="h-2.5 w-8 rounded" style={{ backgroundColor: 'var(--overlay-1)' }} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-3.5 rounded" style={{ backgroundColor: 'var(--overlay-2)', width }} />
        <div className="h-2.5 w-20 rounded" style={{ backgroundColor: 'var(--overlay-1)' }} />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-1" role="status" aria-label="Loading agenda">
      <span className="sr-only">Loading agenda…</span>
      <SkeletonRow width="55%" />
      <SkeletonRow width="75%" />
      <SkeletonRow width="40%" />
      <SkeletonRow width="65%" />
      <SkeletonRow width="50%" />
    </div>
  )
}

// ── Agenda Item Row ────────────────────────────────────────────

function AgendaItemRow({
  item,
  isNow,
  conflict,
  isTouchDevice,
}: {
  item: AgendaItem
  isNow: boolean
  conflict?: ConflictInfo
  isTouchDevice: boolean
}) {
  const Icon = KIND_ICONS[item.kind] || Clock
  const prefersReduced = useReducedMotion()
  const [actionsVisible, setActionsVisible] = useState(isTouchDevice)

  const showActions = isTouchDevice || actionsVisible

  const duration = item.start && item.end ? durationMinutes(item.start, item.end) : null

  /** Accessible label for screen readers. */
  const srLabel = [
    KIND_LABELS[item.kind],
    item.title,
    item.completed ? 'completed' : '',
    item.start ? `from ${formatTime(item.start)}` : '',
    item.end ? `to ${formatTime(item.end)}` : '',
    isNow ? 'current item' : '',
    conflict ? `overlaps with ${conflict.otherTitle} by ${conflict.overlapMin} minutes` : '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <motion.div
      layout={!prefersReduced}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.fast }}
      className="group flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{
        backgroundColor: isNow ? 'var(--overlay-1)' : 'transparent',
        borderLeft: `3px solid ${item.color}`,
      }}
      onMouseEnter={(e) => {
        if (!isNow) e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
        if (!isTouchDevice) setActionsVisible(true)
      }}
      onMouseLeave={(e) => {
        if (!isNow) e.currentTarget.style.backgroundColor = 'transparent'
        if (!isTouchDevice) setActionsVisible(false)
      }}
      onFocus={() => setActionsVisible(true)}
      onBlur={() => { if (!isTouchDevice) setActionsVisible(false) }}
      role="listitem"
      aria-label={srLabel}
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

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
            {KIND_LABELS[item.kind]}
          </span>

          {/* External event: show calendar source */}
          {item.kind === 'external_event' && item.source.displayName && (
            <>
              <span style={{ color: 'var(--text-faint)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {item.source.displayName}
              </span>
            </>
          )}

          {/* Focus session: show completed duration */}
          {item.kind === 'focus_session' && item.completed && duration !== null && (
            <>
              <span style={{ color: 'var(--text-faint)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {formatDuration(duration)} completed
              </span>
            </>
          )}

          {item.completed && (
            <CheckCircle2 size={12} strokeWidth={2} style={{ color: '#10b981' }} />
          )}
        </div>

        {/* Conflict marker */}
        {conflict && (
          <div
            className="flex items-center gap-1.5 mt-1.5 text-[11px]"
            role="alert"
            aria-label={`Scheduling conflict: overlaps ${conflict.otherTitle} by ${conflict.overlapMin} minutes`}
          >
            <AlertTriangle size={12} strokeWidth={2} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ color: '#f59e0b' }}>
              Overlaps {conflict.otherTitle} by {conflict.overlapMin} min
            </span>
          </div>
        )}

        {/* External event read-only details */}
        {item.kind === 'external_event' && showActions && (
          <div className="flex items-center gap-2 mt-2">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--overlay-1)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              tabIndex={0}
              aria-label={`View details for ${item.title}`}
            >
              <Eye size={12} strokeWidth={1.5} />
              <span>Details</span>
            </button>
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--text-faint)' }}
            >
              <Calendar size={11} strokeWidth={1.5} />
              {item.source.displayName || item.source.type}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons — revealed on hover/focus (pointer) or always visible (touch) */}
      <div
        className="flex items-center gap-1 flex-shrink-0"
        style={{
          opacity: showActions ? 1 : 0,
          transition: 'opacity 0.15s ease',
          pointerEvents: showActions ? 'auto' : 'none',
        }}
      >
        {/* Task actions */}
        {item.kind === 'task' && !item.completed && item.actions.includes('complete') && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = '#10b981' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            title="Complete task"
            aria-label={`Complete ${item.title}`}
          >
            <CheckCircle2 size={16} strokeWidth={1.5} />
          </button>
        )}
        {item.kind === 'task' && !item.completed && item.actions.includes('focus') && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            title="Start focus session"
            aria-label={`Start focus session for ${item.title}`}
          >
            <Focus size={16} strokeWidth={1.5} />
          </button>
        )}
        {item.kind === 'task' && item.actions.includes('reschedule') && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            title="Open task"
            aria-label={`Open ${item.title}`}
          >
            <ExternalLink size={16} strokeWidth={1.5} />
          </button>
        )}

        {/* Habit actions */}
        {item.kind === 'habit' && !item.completed && item.actions.includes('complete') && (
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)'; e.currentTarget.style.color = '#f59e0b' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            title="Mark habit complete"
            aria-label={`Mark ${item.title} complete`}
          >
            <Flame size={16} strokeWidth={1.5} />
          </button>
        )}

        {/* Focus session: completed icon (non-interactive) */}
        {item.kind === 'focus_session' && item.completed && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ color: '#10b981' }}
            aria-label={`Focus session ${item.title} completed`}
          >
            <CheckCircle2 size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Earlier Toggle ─────────────────────────────────────────────

function EarlierToggle({ count, expanded, onToggle }: { count: number; expanded: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors cursor-pointer text-left"
      style={{ color: 'var(--text-faint)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      aria-expanded={expanded}
      aria-label={expanded ? `Collapse ${count} earlier items` : `Show ${count} earlier items`}
    >
      <motion.div
        animate={{ rotate: expanded ? 0 : -90 }}
        transition={{ duration: motionTokens.duration.fast }}
      >
        <ChevronDown size={14} strokeWidth={1.5} />
      </motion.div>
      <span className="text-xs font-medium">
        Earlier · {count} {count === 1 ? 'item' : 'items'}
      </span>
    </button>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  const todayStr = new Date().toISOString().split('T')[0]
  const dateParam = searchParams.get('date') || todayStr
  const [selectedDate, setSelectedDate] = useState(dateParam)

  // Simulated loading / error state for state-design demo
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Collapsed earlier items
  const [earlierExpanded, setEarlierExpanded] = useState(false)

  // Detect touch device
  const [isTouchDevice] = useState(() =>
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  )

  // Simulate loading on date change
  useEffect(() => {
    setLoading(true)
    setHasError(false)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [selectedDate])

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

  // Now marker — refreshed every minute
  const [nowTick, setNowTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setNowTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const isViewingTodayVal = selectedDate === todayStr

  // Sort items: all-day first, then by start time
  const sortedItems = useMemo(() => {
    const allDay = agenda.items.filter((i) => i.allDay)
    const timed = agenda.items.filter((i) => !i.allDay).sort((a, b) => {
      if (!a.start || !b.start) return 0
      return new Date(a.start).getTime() - new Date(b.start).getTime()
    })
    return [...allDay, ...timed]
  }, [agenda.items])

  // Detect conflicts
  const conflicts = useMemo(() => detectConflicts(sortedItems), [sortedItems])

  // Find "now" item
  const nowItem = useMemo(() => {
    if (!isViewingTodayVal) return null
    const now = new Date()
    return sortedItems.find((item) => {
      if (!item.start || !item.end) return false
      const start = new Date(item.start)
      const end = new Date(item.end)
      return now >= start && now <= end
    })
  }, [sortedItems, isViewingTodayVal, nowTick])

  // Partition timed items into "earlier" (before now) and "upcoming" (at or after now)
  const { earlierItems, upcomingItems } = useMemo(() => {
    if (!isViewingTodayVal) {
      return { earlierItems: [] as AgendaItem[], upcomingItems: sortedItems.filter((i) => !i.allDay) }
    }

    const now = new Date()
    const earlier: AgendaItem[] = []
    const upcoming: AgendaItem[] = []

    sortedItems.filter((i) => !i.allDay).forEach((item) => {
      if (!item.end) {
        upcoming.push(item)
        return
      }
      const end = new Date(item.end)
      if (now > end) {
        earlier.push(item)
      } else {
        upcoming.push(item)
      }
    })

    return { earlierItems: earlier, upcomingItems: upcoming }
  }, [sortedItems, isViewingTodayVal, nowTick])

  // Auto-scroll to now item (respects reduced motion)
  useEffect(() => {
    if (!prefersReduced && nowItem && scrollRef.current && isViewingTodayVal) {
      const el = scrollRef.current.querySelector(`[data-now="true"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [nowItem?.id, prefersReduced, isViewingTodayVal])

  // Current time position for the time rule
  const nowTime = useMemo(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  }, [nowTick])

  /** Find the index where the time rule should be inserted. */
  const timeRuleIndex = useMemo(() => {
    if (!isViewingTodayVal) return -1
    for (let i = 0; i < upcomingItems.length; i++) {
      const item = upcomingItems[i]
      if (!item.start) continue
      const itemStart = new Date(item.start)
      const itemMinutes = itemStart.getHours() * 60 + itemStart.getMinutes()
      if (itemMinutes > nowTime) return i
    }
    return upcomingItems.length
  }, [upcomingItems, nowTime, isViewingTodayVal])

  // ── Render ───────────────────────────────────────────────────

  const allDayItems = sortedItems.filter((i) => i.allDay)

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
          {!isViewingTodayVal && (
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

            {/* Loading state */}
            {loading && <LoadingState />}

            {/* Error with cached data */}
            {hasError && !loading && (
              <div
                className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs"
                style={{ backgroundColor: 'var(--overlay-1)', color: '#f59e0b' }}
                role="alert"
              >
                <AlertTriangle size={14} strokeWidth={2} />
                <span>Could not refresh · showing cached data</span>
              </div>
            )}

            {/* Main content (shown when not loading) */}
            {!loading && (
              <>
                {/* All-day items */}
                {allDayItems.length > 0 && (
                  <div className="mb-4" role="group" aria-label="All-day items">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                      All day
                    </span>
                    {allDayItems.map((item) => (
                      <AgendaItemRow
                        key={item.id}
                        item={item}
                        isNow={false}
                        isTouchDevice={isTouchDevice}
                      />
                    ))}
                  </div>
                )}

                {/* Earlier items (collapsible) */}
                {earlierItems.length > 0 && (
                  <div className="mb-2">
                    <EarlierToggle
                      count={earlierItems.length}
                      expanded={earlierExpanded}
                      onToggle={() => setEarlierExpanded((v) => !v)}
                    />
                    <AnimatePresence>
                      {earlierExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: motionTokens.duration.fast }}
                          className="overflow-hidden"
                          role="group"
                          aria-label="Earlier items"
                        >
                          <div className="flex flex-col gap-1 opacity-70">
                            {earlierItems.map((item) => (
                              <AgendaItemRow
                                key={item.id}
                                item={item}
                                isNow={false}
                                conflict={conflicts.get(item.id)}
                                isTouchDevice={isTouchDevice}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Upcoming / current items */}
                <div
                  className="flex flex-col gap-1"
                  role="list"
                  aria-label={`Agenda items for ${formatDateHeader(dateObj)}`}
                >
                  {upcomingItems.map((item, idx) => {
                    const isNow = item.id === nowItem?.id
                    const showTimeRule = isViewingTodayVal && idx === timeRuleIndex

                    return (
                      <div key={item.id}>
                        {showTimeRule && <CurrentTimeRule />}
                        <div data-now={isNow ? 'true' : undefined}>
                          <AgendaItemRow
                            item={item}
                            isNow={isNow}
                            conflict={conflicts.get(item.id)}
                            isTouchDevice={isTouchDevice}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {/* If now is after all items, show time rule at bottom */}
                  {isViewingTodayVal && timeRuleIndex >= upcomingItems.length && <CurrentTimeRule />}
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
              </>
            )}
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
