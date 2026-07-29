import { createContext, type ReactNode, type RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  GripVertical,
  Undo2,
  X,
  CalendarClock,
} from 'lucide-react'
import { motionTokens, fadeSlideDown, ease as motionEase, scaleIn } from '@/lib/motion'
import { useSearchParams } from 'react-router-dom'
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
    { id: 'u-2', title: 'Write unit tests for auth', priority: 'high', estimatedMinutes: 60, dueDate: dateStr },
    { id: 'u-3', title: 'Review design mockups', priority: 'low', estimatedMinutes: 15 },
    { id: 'u-4', title: 'Draft Q2 roadmap', priority: 'high', estimatedMinutes: 90, dueDate: (() => { const d = new Date(dateStr + 'T12:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })() },
    { id: 'u-5', title: 'Fix login redirect bug', priority: 'medium', estimatedMinutes: 45, dueDate: dateStr },
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

// ── Due State Helper ────────────────────────────────────────────

function formatDueState(dueDate?: string): { label: string; color: string; urgent: boolean } | null {
  if (!dueDate) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate + 'T00:00:00'); due.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { label: 'Overdue', color: '#ef4444', urgent: true }
  if (diffDays === 0) return { label: 'Due today', color: '#f59e0b', urgent: true }
  if (diffDays === 1) return { label: 'Due tomorrow', color: 'var(--text-faint)', urgent: false }
  return { label: `Due in ${diffDays}d`, color: 'var(--text-faint)', urgent: false }
}

// ── Scheduling Helpers ──────────────────────────────────────────

function findFreeSlots(
  dateStr: string,
  durationMin: number,
  items: AgendaItem[],
  afterMinutes?: number,
): { hour: number; minute: number; label: string }[] {
  const timed = items
    .filter((i) => i.start && i.end && !i.allDay)
    .sort((a, b) => new Date(a.start!).getTime() - new Date(b.start!).getTime())
  const busy = timed.map((i) => ({
    start: new Date(i.start!).getHours() * 60 + new Date(i.start!).getMinutes(),
    end: new Date(i.end!).getHours() * 60 + new Date(i.end!).getMinutes(),
  }))

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const minStart = dateStr === todayStr
    ? Math.max(afterMinutes ?? 0, now.getHours() * 60 + Math.ceil(now.getMinutes() / 30) * 30)
    : (afterMinutes ?? 480)

  const slots: { hour: number; minute: number; label: string }[] = []

  for (let t = minStart; t + durationMin <= 1440 && slots.length < 6; t += 30) {
    const fits = !busy.some((b) => t < b.end && t + durationMin > b.start)
    if (fits) {
      const h = Math.floor(t / 60)
      const m = t % 60
      const d = new Date(2000, 0, 1, h, m)
      slots.push({ hour: h, minute: m, label: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) })
    }
  }
  return slots
}

function detectScheduleConflict(
  dateStr: string,
  startH: number,
  startM: number,
  durationMin: number,
  items: AgendaItem[],
): { title: string; start: string; end: string } | null {
  const newStart = startH * 60 + startM
  const newEnd = newStart + durationMin
  for (const item of items) {
    if (!item.start || !item.end || item.allDay) continue
    const iStart = new Date(item.start).getHours() * 60 + new Date(item.start).getMinutes()
    const iEnd = new Date(item.end).getHours() * 60 + new Date(item.end).getMinutes()
    if (newStart < iEnd && newEnd > iStart) {
      return { title: item.title, start: item.start, end: item.end }
    }
  }
  return null
}

function toIso(dateStr: string, hour: number, minute: number): string {
  return `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}

interface ScheduleResult {
  success: boolean
  conflict?: { title: string; start: string; end: string }
}

async function mockScheduleTask(
  taskId: string,
  dateStr: string,
  hour: number,
  minute: number,
  durationMin: number,
  _items: AgendaItem[],
): Promise<ScheduleResult> {
  await new Promise((r) => setTimeout(r, 200))
  // ~20% chance of conflict for demo
  const hasConflict = Math.random() < 0.2
  if (hasConflict) {
    const conflictHour = hour + Math.floor(Math.random() * 3)
    return {
      success: false,
      conflict: {
        title: ['Team standup', 'Design review', 'Write migration docs'][Math.floor(Math.random() * 3)],
        start: toIso(dateStr, Math.min(conflictHour, 23), minute),
        end: toIso(dateStr, Math.min(conflictHour + 1, 23), (minute + 30) % 60),
      },
    }
  }
  return { success: true }
}

// ── Toast Context ───────────────────────────────────────────────

interface ToastData { id: string; message: string; action?: { label: string; onClick: () => void } }
type AddToastFn = (message: string, action?: { label: string; onClick: () => void }) => void

const ToastContext = createContext<AddToastFn>(() => {})

function useToast() { return useContext(ToastContext) }

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const prefersReduced = useReducedMotion()

  const addToast = useCallback((message: string, action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, action }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 6000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: motionTokens.duration.fast }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto"
              style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{toast.message}</span>
              {toast.action && (
                <button
                  onClick={() => { toast.action!.onClick(); dismissToast(toast.id) }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  style={{ color: 'var(--accent)', backgroundColor: 'var(--overlay-1)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                >
                  <Undo2 size={12} strokeWidth={2} />
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer"
                style={{ color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                aria-label="Dismiss notification"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ── Scheduling Popover ──────────────────────────────────────────

interface ScheduleTarget { date: string; hour: number; minute: number; durationMin: number }

function SchedulingPopover({
  task,
  agendaItems,
  anchorRef,
  initialTarget,
  onSchedule,
  onClose,
}: {
  task: UnscheduledTask
  agendaItems: AgendaItem[]
  anchorRef: RefObject<HTMLDivElement | null>
  initialTarget?: ScheduleTarget
  onSchedule: (taskId: string, target: ScheduleTarget, force?: boolean) => void
  onClose: () => void
}) {
  const prefersReduced = useReducedMotion()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [isScheduling, setIsScheduling] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]

  const [date, setDate] = useState(initialTarget?.date ?? todayStr)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [duration, setDuration] = useState(initialTarget?.durationMin ?? task.estimatedMinutes ?? 30)

  const freeSlots = useMemo(() => findFreeSlots(date, duration, agendaItems, date === todayStr ? undefined : 480), [date, duration, agendaItems, todayStr])
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; minute: number; label: string } | null>(freeSlots[0] ?? null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (freeSlots.length > 0 && !selectedSlot) setSelectedSlot(freeSlots[0]) }, [freeSlots])

  // Position
  const [position, setPosition] = useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const top = Math.min(rect.bottom + 8, window.innerHeight - 480)
      setPosition({ top: Math.max(8, top), left: Math.min(rect.left, window.innerWidth - 300) })
    }
  }, [anchorRef])

  // Click outside / Esc
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [onClose, anchorRef])

  const handleSubmit = async () => {
    if (!selectedSlot || isScheduling) return
    setIsScheduling(true)
    onSchedule(task.id, { date, hour: selectedSlot.hour, minute: selectedSlot.minute, durationMin: duration })
    setIsScheduling(false)
  }

  return (
    <motion.div
      {...(prefersReduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : fadeSlideDown)}
      transition={motionEase.fast}
      ref={popoverRef}
      className="fixed w-[280px] rounded-xl p-4 z-[100]"
      style={{
        top: position.top, left: position.left,
        backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevated)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
        <button
          onClick={onClose}
          className="ml-auto flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          aria-label="Close"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Quick date */}
      <div className="flex gap-1.5 mb-3">
        {[{ label: 'Today', date: todayStr }, { label: 'Tomorrow', date: tomorrowStr }].map((opt) => (
          <button
            key={opt.label}
            onClick={() => { setDate(opt.date); setSelectedSlot(null) }}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: date === opt.date ? 'var(--accent)' : 'var(--overlay-1)',
              color: date === opt.date ? '#fff' : 'var(--text-primary)',
            }}
            onMouseEnter={(e) => { if (date !== opt.date) e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
            onMouseLeave={(e) => { if (date !== opt.date) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          >
            {opt.label}
          </button>
        ))}
        <div className="relative flex-1">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: date !== todayStr && date !== tomorrowStr ? 'var(--accent)' : 'var(--overlay-1)',
              color: date !== todayStr && date !== tomorrowStr ? '#fff' : 'var(--text-primary)',
            }}
            onMouseEnter={(e) => { if (date === todayStr || date === tomorrowStr) e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
            onMouseLeave={(e) => { if (date === todayStr || date === tomorrowStr) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          >
            {date !== todayStr && date !== tomorrowStr
              ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Custom'
            }
          </button>
          {showDatePicker && (
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setSelectedSlot(null); setShowDatePicker(false) }}
              className="absolute top-full left-0 mt-1 text-xs px-2 py-1 rounded-lg outline-none z-10"
              style={{ backgroundColor: 'var(--bg-pane-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              autoFocus
              onBlur={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Suggested times */}
      <div className="mb-3">
        <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>
          Suggested start times
        </span>
        <div className="flex flex-wrap gap-1.5">
          {freeSlots.length > 0 ? freeSlots.map((slot) => (
            <button
              key={`${slot.hour}:${slot.minute}`}
              onClick={() => setSelectedSlot(slot)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                  ? 'var(--accent)' : 'var(--overlay-1)',
                color: selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                  ? '#fff' : 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!(selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute))
                  e.currentTarget.style.backgroundColor = 'var(--overlay-2)'
              }}
              onMouseLeave={(e) => {
                if (!(selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute))
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1)'
              }}
            >
              {slot.label}
            </button>
          )) : (
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>No open slots</span>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-4">
        <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>
          Duration{task.estimatedMinutes ? ` (est. ${task.estimatedMinutes}m)` : ''}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[15, 30, 45, 60, 90, 120].map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setSelectedSlot(null) }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: duration === d ? 'var(--accent)' : 'var(--overlay-1)',
                color: duration === d ? '#fff' : 'var(--text-primary)',
              }}
              onMouseEnter={(e) => { if (duration !== d) e.currentTarget.style.backgroundColor = 'var(--overlay-2)' }}
              onMouseLeave={(e) => { if (duration !== d) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            >
              {formatDuration(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-3 h-px" style={{ backgroundColor: 'var(--border)' }} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedSlot || isScheduling}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          {isScheduling ? 'Scheduling…' : 'Schedule'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Conflict Popover ────────────────────────────────────────────

function ConflictPopover({
  taskTitle,
  conflict,
  onForceSchedule,
  onChooseAnother,
  onClose,
}: {
  taskTitle: string
  conflict: { title: string; start: string; end: string }
  onForceSchedule: () => void
  onChooseAnother: () => void
  onClose: () => void
}) {
  const prefersReduced = useReducedMotion()
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey) }
  }, [onClose])

  return (
    <motion.div
      {...(prefersReduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : scaleIn)}
      transition={motionEase.fast}
      ref={popoverRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-xl p-5 z-[150]"
      style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
          <AlertTriangle size={18} strokeWidth={2} style={{ color: '#f59e0b' }} />
        </div>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Scheduling conflict</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            "{taskTitle}" overlaps with <strong style={{ color: 'var(--text-primary)' }}>{conflict.title}</strong>
            {' '}({formatTime(conflict.start)} – {formatTime(conflict.end)})
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          Cancel
        </button>
        <button
          onClick={onChooseAnother}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Choose another time
        </button>
        <button
          onClick={onForceSchedule}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          Schedule anyway
        </button>
      </div>
    </motion.div>
  )
}

// ── Drag Preview ────────────────────────────────────────────────

function DragPreview({
  task,
  targetDate,
  mouseX,
  mouseY,
  agendaItems,
}: {
  task: UnscheduledTask
  targetDate: string
  mouseX: number
  mouseY: number
  agendaItems: AgendaItem[]
}) {
  const duration = task.estimatedMinutes || 30
  const scrollContainer = document.querySelector('[data-agenda-scroll]')
  if (!scrollContainer) return null
  const containerRect = scrollContainer.getBoundingClientRect()

  const relY = mouseY - containerRect.top + scrollContainer.scrollTop
  const hourHeight = 56
  const startMinute = Math.round((relY / hourHeight) * 60 / 30) * 30
  const clampedMinute = Math.max(0, Math.min(startMinute, 1440 - duration))
  const startH = Math.floor(clampedMinute / 60)
  const startM = clampedMinute % 60
  const endMinute = clampedMinute + duration
  const endH = Math.floor(endMinute / 60)
  const endM = endMinute % 60
  const conflict = detectScheduleConflict(targetDate, startH, startM, duration, agendaItems)
  const topPx = (clampedMinute / 60) * hourHeight
  const heightPx = (duration / 60) * hourHeight

  return (
    <div
      className="absolute left-[92px] right-4 rounded-lg pointer-events-none z-40 overflow-hidden"
      style={{ top: topPx, height: heightPx }}
    >
      <div
        className="w-full h-full flex items-center gap-2 px-3 rounded-lg"
        style={{
          backgroundColor: conflict ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          border: `2px dashed ${conflict ? '#f59e0b' : 'var(--accent)'}`,
        }}
      >
        <CalendarClock size={14} strokeWidth={1.5} style={{ color: conflict ? '#f59e0b' : 'var(--accent)', flexShrink: 0 }} />
        <span className="text-xs font-medium truncate" style={{ color: conflict ? '#f59e0b' : 'var(--accent)' }}>
          {task.title}
        </span>
        <span className="ml-auto text-[11px] font-medium flex-shrink-0" style={{ color: conflict ? '#f59e0b' : 'var(--accent)' }}>
          {String(startH).padStart(2, '0')}:{String(startM).padStart(2, '0')} – {String(endH).padStart(2, '0')}:{String(endM).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

// ── Enhanced Unscheduled Tray (desktop) ─────────────────────────

function UnscheduledTray({
  tasks,
  agendaItems,
  onScheduleRequest,
  onDragStart,
  onDragEnd,
  schedulingTaskId,
}: {
  tasks: UnscheduledTask[]
  agendaItems: AgendaItem[]
  onScheduleRequest: (task: UnscheduledTask, anchorRef: RefObject<HTMLDivElement | null>) => void
  onDragStart: (task: UnscheduledTask) => void
  onDragEnd: () => void
  schedulingTaskId?: string | null
}) {
  if (tasks.length === 0) return null

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
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

      {/* Task list */}
      <div className="flex flex-col gap-1.5">
        {tasks.map((task) => (
          <TrayTaskRow
            key={task.id}
            task={task}
            isScheduling={schedulingTaskId === task.id}
            onScheduleRequest={onScheduleRequest}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  )
}

// ── Tray Task Row ───────────────────────────────────────────────

function TrayTaskRow({
  task,
  isScheduling,
  onScheduleRequest,
  onDragStart,
  onDragEnd,
}: {
  task: UnscheduledTask
  isScheduling: boolean
  onScheduleRequest: (task: UnscheduledTask, anchorRef: RefObject<HTMLDivElement | null>) => void
  onDragStart: (task: UnscheduledTask) => void
  onDragEnd: () => void
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const dueState = formatDueState(task.dueDate)

  return (
    <div
      ref={anchorRef}
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group/row"
      style={{
        backgroundColor: isScheduling ? 'var(--overlay-1)' : 'transparent',
        opacity: isScheduling ? 0.6 : 1,
      }}
      onClick={() => { if (!isScheduling) onScheduleRequest(task, anchorRef) }}
      onMouseEnter={(e) => { if (!isScheduling) e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
      onMouseLeave={(e) => { if (!isScheduling) e.currentTarget.style.backgroundColor = 'transparent' }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-los-task', JSON.stringify(task))
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task)
      }}
      onDragEnd={onDragEnd}
      role="button"
      aria-label={`Schedule ${task.title}`}
    >
      {/* Drag handle */}
      <GripVertical
        size={12}
        strokeWidth={1.5}
        className="opacity-0 group-hover/row:opacity-40 transition-opacity flex-shrink-0"
        style={{ color: 'var(--text-faint)' }}
      />

      {/* Priority dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PRIORITY_COLORS[task.priority] || 'var(--text-faint)' }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate block" style={{ color: 'var(--text-primary)' }}>
          {task.title}
        </span>
        {dueState && (
          <span
            className="text-[10px] font-medium"
            style={{ color: dueState.color }}
          >
            {dueState.label}
          </span>
        )}
      </div>

      {/* Duration */}
      {task.estimatedMinutes && (
        <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
          {formatDuration(task.estimatedMinutes)}
        </span>
      )}
    </div>
  )
}

// ── Mobile Bottom Sheet Tray ────────────────────────────────────

function BottomSheetTray({
  tasks,
  agendaItems,
  onClose,
  onScheduleConfirm,
}: {
  tasks: UnscheduledTask[]
  agendaItems: AgendaItem[]
  onClose: () => void
  onScheduleConfirm: (taskId: string, target: ScheduleTarget, force?: boolean) => void
}) {
  const prefersReduced = useReducedMotion()
  const [schedulingTask, setSchedulingTask] = useState<UnscheduledTask | null>(null)
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(null)
  const [showConflict, setShowConflict] = useState<{ task: UnscheduledTask; conflict: { title: string; start: string; end: string }; target: ScheduleTarget } | null>(null)

  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]

  const [sheetDate, setSheetDate] = useState(todayStr)
  const [sheetDuration, setSheetDuration] = useState(30)
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    if (schedulingTask) {
      setSheetDuration(schedulingTask.estimatedMinutes || 30)
      setSheetDate(todayStr)
    }
  }, [schedulingTask, todayStr])

  const freeSlots = useMemo(
    () => schedulingTask ? findFreeSlots(sheetDate, sheetDuration, agendaItems, sheetDate === todayStr ? undefined : 480) : [],
    [schedulingTask, sheetDate, sheetDuration, agendaItems, todayStr]
  )

  const handleMobileSchedule = async () => {
    if (!schedulingTask || freeSlots.length === 0 || isScheduling) return
    const slot = freeSlots[0]
    setIsScheduling(true)
    const result = await mockScheduleTask(schedulingTask.id, sheetDate, slot.hour, slot.minute, sheetDuration, agendaItems)
    if (result.success) {
      onScheduleConfirm(schedulingTask.id, { date: sheetDate, hour: slot.hour, minute: slot.minute, durationMin: sheetDuration })
      setSchedulingTask(null)
    } else if (result.conflict) {
      setShowConflict({ task: schedulingTask, conflict: result.conflict, target: { date: sheetDate, hour: slot.hour, minute: slot.minute, durationMin: sheetDuration } })
    }
    setIsScheduling(false)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: motionTokens.duration.fast }}
        className="fixed inset-0 z-[110]"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { y: '100%' }}
        animate={prefersReduced ? { opacity: 1 } : { y: 0 }}
        exit={prefersReduced ? { opacity: 0 } : { y: '100%' }}
        transition={motionEase.medium}
        className="fixed bottom-0 left-0 right-0 z-[115] rounded-t-2xl max-h-[75vh] flex flex-col"
        style={{ backgroundColor: 'var(--bg-pane-2)', border: '1px solid var(--border)' }}
      >
        {/* Handle */}
        <div className="flex items-center justify-center py-2 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--overlay-2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {schedulingTask ? `Schedule: ${schedulingTask.title}` : 'Unscheduled'}
            </span>
            {!schedulingTask && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--text-muted)' }}>
                {tasks.length}
              </span>
            )}
          </div>
          <button
            onClick={schedulingTask ? () => setSchedulingTask(null) : onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            aria-label={schedulingTask ? 'Back' : 'Close'}
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {schedulingTask ? (
            /* Scheduling form */
            <div className="space-y-4">
              {/* Quick date */}
              <div>
                <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>Date</span>
                <div className="flex gap-2">
                  {[{ label: 'Today', date: todayStr }, { label: 'Tomorrow', date: tomorrowStr }].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSheetDate(opt.date)}
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: sheetDate === opt.date ? 'var(--accent)' : 'var(--overlay-1)',
                        color: sheetDate === opt.date ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <input
                    type="date"
                    value={sheetDate}
                    onChange={(e) => setSheetDate(e.target.value)}
                    className="flex-1 text-xs px-2 py-2 rounded-lg outline-none text-center"
                    style={{ backgroundColor: 'var(--overlay-1)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              {/* Start time */}
              <div>
                <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>
                  Suggested start time
                </span>
                <div className="flex flex-wrap gap-2">
                  {freeSlots.length > 0 ? freeSlots.slice(0, 4).map((slot) => (
                    <button
                      key={`${slot.hour}:${slot.minute}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    >
                      {slot.label}
                    </button>
                  )) : (
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>No open slots</span>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <span className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-faint)' }}>Duration</span>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSheetDuration(d)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      style={{
                        backgroundColor: sheetDuration === d ? 'var(--accent)' : 'var(--overlay-1)',
                        color: sheetDuration === d ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      {formatDuration(d)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Task list */
            <div className="flex flex-col gap-1">
              {tasks.map((task) => {
                const dueState = formatDueState(task.dueDate)
                return (
                  <button
                    key={task.id}
                    onClick={() => setSchedulingTask(task)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer text-left"
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: PRIORITY_COLORS[task.priority] || 'var(--text-faint)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm block truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                      {dueState && (
                        <span className="text-[10px] font-medium" style={{ color: dueState.color }}>{dueState.label}</span>
                      )}
                    </div>
                    {task.estimatedMinutes && (
                      <span className="text-[11px] flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{formatDuration(task.estimatedMinutes)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer: schedule button */}
        {schedulingTask && (
          <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleMobileSchedule}
              disabled={freeSlots.length === 0 || isScheduling}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {isScheduling ? 'Scheduling…' : 'Schedule'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Conflict overlay */}
      {showConflict && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowConflict(null)}
          />
          <ConflictPopover
            taskTitle={showConflict.task.title}
            conflict={showConflict.conflict}
            onForceSchedule={() => {
              onScheduleConfirm(showConflict.task.id, showConflict.target, true)
              setShowConflict(null)
              setSchedulingTask(null)
            }}
            onChooseAnother={() => setShowConflict(null)}
            onClose={() => setShowConflict(null)}
          />
        </>
      )}
    </>
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

  // ── Scheduling state (LOS-204) ──────────────────────────────
  const addToast = useToast()
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>([])
  const [schedulingTask, setSchedulingTask] = useState<UnscheduledTask | null>(null)
  const schedulingAnchorRef = useRef<HTMLDivElement | null>(null)
  const [draggedTask, setDraggedTask] = useState<UnscheduledTask | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [showConflict, setShowConflict] = useState<{ task: UnscheduledTask; conflict: { title: string; start: string; end: string }; target: ScheduleTarget } | null>(null)
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState<ScheduleTarget | null>(null)

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

  // Sync unscheduled tasks from mock data
  useEffect(() => {
    setUnscheduledTasks(agenda.unscheduledPriorities)
  }, [agenda])

  // ── Scheduling handlers ────────────────────────────────────
  const handleScheduleRequest = useCallback((task: UnscheduledTask, anchorRef: RefObject<HTMLDivElement | null>) => {
    if (isTouchDevice) {
      setShowMobileSheet(true)
    } else {
      schedulingAnchorRef.current = anchorRef.current
      setSchedulingTask(task)
    }
  }, [isTouchDevice])

  const performSchedule = useCallback((taskId: string, target: ScheduleTarget) => {
    const task = unscheduledTasks.find((t) => t.id === taskId)
    if (!task) return
    const scrollTop = scrollRef.current?.scrollTop

    // Move from tray to agenda items (mock)
    const newAgendaItem: AgendaItem = {
      id: `scheduled-${taskId}`,
      kind: 'task',
      title: task.title,
      start: toIso(target.date, target.hour, target.minute),
      end: toIso(target.date, target.hour + Math.floor((target.minute + target.durationMin) / 60), (target.minute + target.durationMin) % 60),
      allDay: false,
      completed: false,
      source: { type: 'lifeos' },
      availability: 'busy',
      color: '#6366f1',
      actions: ['complete', 'focus', 'reschedule'],
    }
    agenda.items.push(newAgendaItem)
    setUnscheduledTasks((prev) => prev.filter((t) => t.id !== taskId))
    setSchedulingTask(null)
    setScheduleTarget(null)

    // Restore scroll position
    requestAnimationFrame(() => {
      if (scrollRef.current && scrollTop !== undefined) {
        scrollRef.current.scrollTop = scrollTop
      }
    })

    // Show undo toast
    addToast(`Scheduled "${task.title}"`, {
      label: 'Undo',
      onClick: () => {
        setUnscheduledTasks((prev) => [...prev, task])
        const idx = agenda.items.findIndex((i) => i.id === newAgendaItem.id)
        if (idx !== -1) agenda.items.splice(idx, 1)
      },
    })
  }, [unscheduledTasks, agenda, addToast])

  const handleScheduleConfirm = useCallback(async (taskId: string, target: ScheduleTarget, force?: boolean) => {
    if (!force) {
      const task = unscheduledTasks.find((t) => t.id === taskId)
      if (!task) return
      setIsSchedulingApi(true)
      const result = await mockScheduleTask(taskId, target.date, target.hour, target.minute, target.durationMin, agenda.items)
      setIsSchedulingApi(false)
      if (!result.success && result.conflict) {
        setShowConflict({ task, conflict: result.conflict, target })
        setScheduleTarget(target)
        return
      }
    }
    performSchedule(taskId, target)
  }, [unscheduledTasks, agenda.items, performSchedule])

  const [isSchedulingApi, setIsSchedulingApi] = useState(false)

  const handleConflictChooseAnother = useCallback(() => {
    if (showConflict) {
      // Re-open scheduling popover for the same task
      setSchedulingTask(showConflict.task)
      setShowConflict(null)
    }
  }, [showConflict])

  // Drag-drop handlers for agenda lane
  const handleAgendaDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragPosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleAgendaDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/x-los-task')
    if (!data) return
    try {
      const task: UnscheduledTask = JSON.parse(data)
      setDraggedTask(null)

      // Calculate drop position → time
      const scrollContainer = scrollRef.current
      if (!scrollContainer) return
      const containerRect = scrollContainer.getBoundingClientRect()
      const relY = e.clientY - containerRect.top + scrollContainer.scrollTop
      const hourHeight = 56
      const duration = task.estimatedMinutes || 30
      const startMinute = Math.round((relY / hourHeight) * 60 / 30) * 30
      const clampedMinute = Math.max(0, Math.min(startMinute, 1440 - duration))
      const startH = Math.floor(clampedMinute / 60)
      const startM = clampedMinute % 60

      await handleScheduleConfirm(task.id, { date: selectedDate, hour: startH, minute: startM, durationMin: duration })
    } catch {
      setDraggedTask(null)
    }
  }, [selectedDate, handleScheduleConfirm])

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
    <ToastProvider>
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
        <div
          ref={scrollRef}
          data-agenda-scroll="true"
          className="flex-1 overflow-y-auto px-6 py-4 relative"
          onDragOver={handleAgendaDragOver}
          onDrop={handleAgendaDrop}
        >
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

          {/* Drag-to-schedule preview overlay */}
          {draggedTask && !loading && (
            <DragPreview
              task={draggedTask}
              targetDate={selectedDate}
              mouseX={dragPosition.x}
              mouseY={dragPosition.y}
              agendaItems={agenda.items}
            />
          )}
        </div>

        {/* ── Priority tray (desktop only) ── */}
        <div
          className="hidden xl:block w-[280px] flex-shrink-0 overflow-y-auto py-4 pr-6"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <UnscheduledTray
            tasks={unscheduledTasks}
            agendaItems={agenda.items}
            onScheduleRequest={handleScheduleRequest}
            onDragStart={(task: UnscheduledTask) => setDraggedTask(task)}
            onDragEnd={() => setDraggedTask(null)}
            schedulingTaskId={schedulingTask?.id}
          />
        </div>

        {/* ── Mobile tray toggle ── */}
        {isTouchDevice && unscheduledTasks.length > 0 && !showMobileSheet && (
          <button
            onClick={() => setShowMobileSheet(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer xl:hidden"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <CalendarClock size={16} strokeWidth={2} />
            <span className="text-sm font-semibold">Unscheduled</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
              {unscheduledTasks.length}
            </span>
          </button>
        )}
      </div>

      {/* ── Scheduling popover overlay ── */}
      {schedulingTask && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            onClick={() => setSchedulingTask(null)}
          />
          <SchedulingPopover
            task={schedulingTask}
            agendaItems={agenda.items}
            anchorRef={schedulingAnchorRef}
            initialTarget={scheduleTarget ?? undefined}
            onSchedule={handleScheduleConfirm}
            onClose={() => { setSchedulingTask(null); setScheduleTarget(null) }}
          />
        </>
      )}

      {/* ── Conflict popover ── */}
      {showConflict && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140]"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            onClick={() => setShowConflict(null)}
          />
          <ConflictPopover
            taskTitle={showConflict.task.title}
            conflict={showConflict.conflict}
            onForceSchedule={() => {
              performSchedule(showConflict.task.id, showConflict.target)
              setShowConflict(null)
            }}
            onChooseAnother={handleConflictChooseAnother}
            onClose={() => setShowConflict(null)}
          />
        </>
      )}

      {/* ── Mobile bottom sheet ── */}
      <AnimatePresence>
        {showMobileSheet && (
          <BottomSheetTray
            tasks={unscheduledTasks}
            agendaItems={agenda.items}
            onClose={() => setShowMobileSheet(false)}
            onScheduleConfirm={(taskId, target, force) => {
              handleScheduleConfirm(taskId, target, force)
              setShowMobileSheet(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
    </ToastProvider>
  )
}
