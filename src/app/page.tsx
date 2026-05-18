'use client'
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Plus, SlidersHorizontal, MoreVertical, BookOpen, ExternalLink, X,
  Calendar as CalIcon, BarChart3, Tag, CornerDownLeft, GripVertical,
  Check, ArrowRight, ChevronDown, CheckCircle2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useItems } from '@/hooks/useItems'
import { smooth } from '@/shared/design-system'
import { copy } from '@/lib/copy'
import {
  format, isToday as dfIsToday, isTomorrow, addDays, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth,
  formatDistanceToNow,
} from 'date-fns'
import type { AnyItem, Task, TaskPriority } from '@/types'

// ─── Accent Colors ──────────────────────────────────────────────────────────
const ACCENT_RED = '#FF4D3D'
const ACCENT_AMBER = '#FFB23D'
const ACCENT_BLUE = '#5DA8FF'
const ACCENT_INDIGO = '#8B7DFF'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: ACCENT_RED,
  medium: ACCENT_AMBER,
  low: ACCENT_BLUE,
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

// ─── Completion Sound ───────────────────────────────────────────────────────
const COMPLETION_TONES = [
  { freq: 880, freq2: 1320 },
  { freq: 784, freq2: 1175 },
  { freq: 660, freq2: 990 },
  { freq: 740, freq2: 1109 },
  { freq: 830, freq2: 1245 },
]

function playCompletionSound() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const tone = COMPLETION_TONES[Math.floor(Math.random() * COMPLETION_TONES.length)]
    const t = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = tone.freq
    osc2.type = 'sine'
    osc2.frequency.value = tone.freq2
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc1.start(t)
    osc2.start(t + 0.05)
    osc1.stop(t + 0.4)
    osc2.stop(t + 0.45)
  } catch { /* silent */ }
}

// ─── DatePopover ────────────────────────────────────────────────────────────
function DatePopover({
  value,
  onChange,
  onClose,
}: {
  value: Date | null
  onChange: (d: Date) => void
  onClose: () => void
}) {
  const [viewMonth, setViewMonth] = useState(() => value ?? new Date())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const today = new Date()

  const quickOptions = [
    { label: copy.popovers.date.today, date: today },
    { label: copy.popovers.date.tomorrow, date: addDays(today, 1) },
    { label: copy.popovers.date.nextWeek, date: addDays(today, 7) },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="popover absolute p-3"
      style={{
        width: 280,
        top: '100%',
        left: 0,
        marginTop: 4,
      }}
    >
      {/* Quick options */}
      <div className="flex flex-col gap-0.5 mb-3">
        {quickOptions.map(opt => (
          <button
            key={opt.label}
            onClick={() => { onChange(opt.date); onClose() }}
            className="popover-item text-[13px] text-left"
          >
            <CalIcon size={14} style={{ color: 'var(--text-3)' }} />
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '0 -4px 8px' }} />

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="btn-icon w-6 h-6"
            style={{ color: 'var(--text-3)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="btn-icon w-6 h-6"
            style={{ color: 'var(--text-3)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] font-medium text-center py-1" style={{ color: 'var(--text-3)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const isSelected = value && isSameDay(day, value)
          const isCurrentMonth = isSameMonth(day, viewMonth)
          const isTodayDay = isSameDay(day, today)
          return (
            <button
              key={day.toISOString()}
              onClick={() => { onChange(day); onClose() }}
              className={`w-full aspect-square flex items-center justify-center rounded-full text-[12px] transition-colors ${!isSelected ? 'popover-item' : ''}`}
              style={{
                color: isSelected
                  ? '#fff'
                  : isCurrentMonth
                    ? 'var(--text-1)'
                    : 'var(--text-3)',
                background: isSelected ? 'var(--accent)' : undefined,
                fontWeight: isTodayDay ? 700 : 400,
                boxShadow: isTodayDay && !isSelected
                  ? `inset 0 0 0 1.5px var(--accent)`
                  : undefined,
              }}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Time row (stub) */}
      <div style={{ height: 1, background: 'var(--border)', margin: '8px -4px' }} />
      <div className="popover-item text-[13px]" style={{ color: 'var(--text-2)' }}>
        <CalIcon size={14} style={{ color: 'var(--text-3)' }} />
        {copy.popovers.date.time}
      </div>
      {/* Remind me row (disabled) */}
      <div className="popover-item text-[13px] opacity-40 cursor-not-allowed" style={{ color: 'var(--text-3)' }}>
        <CalIcon size={14} />
        {copy.popovers.date.remindMe}
      </div>
      {/* Repeat row (stub) */}
      <div className="popover-item text-[13px]" style={{ color: 'var(--text-2)' }}>
        <CalIcon size={14} style={{ color: 'var(--text-3)' }} />
        {copy.popovers.date.repeat}
      </div>
    </motion.div>
  )
}

// ─── PriorityPopover ────────────────────────────────────────────────────────
function PriorityPopover({
  value,
  onChange,
  onClose,
}: {
  value: TaskPriority | null
  onChange: (p: TaskPriority) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '1') { onChange('high'); onClose() }
      else if (e.key === '2') { onChange('medium'); onClose() }
      else if (e.key === '3') { onChange('low'); onClose() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onChange, onClose])

  const options: { key: TaskPriority; label: string; color: string; shortcut: string }[] = [
    { key: 'high', label: 'High', color: ACCENT_RED, shortcut: '1' },
    { key: 'medium', label: 'Medium', color: ACCENT_AMBER, shortcut: '2' },
    { key: 'low', label: 'Low', color: ACCENT_BLUE, shortcut: '3' },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="popover absolute py-1.5"
      style={{
        width: 160,
        top: '100%',
        left: 0,
        marginTop: 4,
      }}
    >
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => { onChange(opt.key); onClose() }}
          className={`popover-item w-full text-[13px] text-left ${value === opt.key ? 'selected' : ''}`}
          style={{
            color: value === opt.key ? opt.color : undefined,
          }}
        >
          <BarChart3 size={14} style={{ color: opt.color }} />
          <span className="flex-1">{opt.label}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{opt.shortcut}</span>
        </button>
      ))}
    </motion.div>
  )
}

// ─── PageHeader ────────────────────────────────────────────────────────────
function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-start justify-between">
      <h1
        className="font-bold"
        style={{
          color: 'var(--text-1)',
          fontSize: 'var(--text-page, 32px)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-1">
        <button className="btn-icon w-8 h-8">
          <SlidersHorizontal size={16} />
        </button>
        <button className="btn-icon w-8 h-8">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Detail Panel ───────────────────────────────────────────────────────────
interface LocalComment {
  id: string
  text: string
  createdAt: Date
}

function DetailPanel({
  task,
  onClose,
  onUpdate,
  comments,
  onAddComment,
}: {
  task: Task
  onClose: () => void
  onUpdate: (data: Partial<AnyItem>) => void
  comments: LocalComment[]
  onAddComment: (text: string) => void
}) {
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description ?? '')
  const [commentText, setCommentText] = useState('')
  const [showDatePop, setShowDatePop] = useState(false)
  const [showPriorityPop, setShowPriorityPop] = useState(false)
  const [done, setDone] = useState(task.status === 'done')
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    setEditTitle(task.title)
    setEditDesc(task.description ?? '')
    setDone(task.status === 'done')
  }, [task])

  const handleToggle = () => {
    const newDone = !done
    setDone(newDone)
    if (newDone) {
      setJustCompleted(true)
      playCompletionSound()
      setTimeout(() => setJustCompleted(false), 600)
    }
    onUpdate({ status: newDone ? 'done' : 'todo' })
  }

  const handleTitleBlur = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate({ title: editTitle.trim() })
    }
  }

  const handleDescBlur = () => {
    if (editDesc !== (task.description ?? '')) {
      onUpdate({ description: editDesc })
    }
  }

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return
    onAddComment(commentText.trim())
    setCommentText('')
  }

  const showStrike = done || justCompleted

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={smooth}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-pane, var(--card))',
        borderLeft: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose} className="btn-icon w-8 h-8">
          <X size={18} />
        </button>
        <button className="btn-icon w-8 h-8">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-4">
        <div className="flex items-start gap-3 mt-2">
          <button
            onClick={handleToggle}
            className={`checkbox-interactive mt-0.5 ${showStrike ? 'checked' : ''} ${justCompleted ? 'just-checked' : ''}`}
          >
            {showStrike && <Check size={14} color="#fff" strokeWidth={2.5} />}
          </button>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
            className={`flex-1 bg-transparent outline-none text-[24px] font-bold ${showStrike ? 'strike-through' : ''}`}
            style={{
              color: showStrike ? undefined : 'var(--text-1)',
              lineHeight: 1.2,
            }}
          />
        </div>

        <div className="flex items-center gap-2 mt-4 flex-wrap relative">
          <div className="relative">
            <button
              onClick={() => setShowDatePop(!showDatePop)}
              className="chip"
              style={{
                background: task.dueDate ? 'rgba(255,77,61,0.1)' : undefined,
                color: task.dueDate ? ACCENT_RED : undefined,
                borderColor: task.dueDate ? 'rgba(255,77,61,0.2)' : undefined,
              }}
            >
              <CalIcon size={12} />
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Add date'}
            </button>
            <AnimatePresence>
              {showDatePop && (
                <DatePopover
                  value={task.dueDate ? new Date(task.dueDate) : null}
                  onChange={d => {
                    onUpdate({ dueDate: d.toISOString() })
                    setShowDatePop(false)
                  }}
                  onClose={() => setShowDatePop(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowPriorityPop(!showPriorityPop)}
              className="chip"
              style={{
                background: task.priority ? `${PRIORITY_COLORS[task.priority]}15` : undefined,
                color: task.priority ? PRIORITY_COLORS[task.priority] : undefined,
                borderColor: task.priority ? `${PRIORITY_COLORS[task.priority]}30` : undefined,
              }}
            >
              <BarChart3 size={12} />
              {task.priority ? PRIORITY_LABELS[task.priority] : 'Priority'}
            </button>
            <AnimatePresence>
              {showPriorityPop && (
                <PriorityPopover
                  value={task.priority}
                  onChange={p => {
                    onUpdate({ priority: p })
                    setShowPriorityPop(false)
                  }}
                  onClose={() => setShowPriorityPop(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <button className="chip">
            <Tag size={12} />
            Label
          </button>
        </div>

        <textarea
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          onBlur={handleDescBlur}
          placeholder={copy.list.emptyBlockPlaceholder}
          className="w-full mt-5 bg-transparent outline-none resize-none text-[14px] leading-relaxed"
          style={{ color: 'var(--text-1)', minHeight: 120 }}
        />

        <div className="mt-6 text-center">
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            Created by Divy &middot; {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : 'just now'}
          </span>
        </div>

        <div className="mt-6">
          {comments.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {comments.map(c => (
                <div key={c.id} className="px-3 py-2 rounded-lg text-[13px]" style={{ background: 'var(--bg-overlay)', color: 'var(--text-1)' }}>
                  <div>{c.text}</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>
                    {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCommentSubmit() }}
          placeholder={copy.task.leaveMessagePlaceholder}
          className="w-full bg-transparent outline-none text-[13px]"
          style={{ color: 'var(--text-1)' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Task Row ───────────────────────────────────────────────────────────────
function TaskRow({
  task,
  isSelected,
  isDetailOpen,
  onToggle,
  onSelect,
  onOpenDetail,
}: {
  task: Task
  isSelected: boolean
  isDetailOpen: boolean
  onToggle: () => void
  onSelect: () => void
  onOpenDetail: () => void
}) {
  const [justCompleted, setJustCompleted] = useState(false)
  const done = task.status === 'done'
  const showStrike = done || justCompleted

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!done) {
      setJustCompleted(true)
      playCompletionSound()
      setTimeout(() => setJustCompleted(false), 600)
    }
    onToggle()
  }

  return (
    <div
      onClick={onSelect}
      className={`row-interactive flex items-start gap-2 px-4 py-3 group relative ${isSelected ? 'selected' : ''}`}
      style={{
        minHeight: 48,
        borderRight: isDetailOpen ? `3px solid var(--accent)` : '3px solid transparent',
      }}
    >
      <div className="drag-handle flex items-center mt-0.5">
        <GripVertical size={14} />
      </div>

      <button
        onClick={handleToggle}
        className={`checkbox-interactive mt-[1px] ${showStrike ? 'checked' : ''} ${justCompleted ? 'just-checked' : ''}`}
      >
        {showStrike && (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.priority && (
            <BarChart3 size={13} style={{ color: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
          )}
          <span
            className={`text-[15px] font-medium truncate ${showStrike ? 'strike-through' : ''}`}
            style={{ color: showStrike ? undefined : 'var(--text-1)' }}
          >
            {task.title}
          </span>
        </div>

        {(task.dueDate || task.priority) && !showStrike && (
          <div className="flex items-center gap-2 mt-0.5">
            {task.dueDate && (
              <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                <CalIcon size={11} />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
            {task.priority && (
              <span className="text-[12px]" style={{ color: PRIORITY_COLORS[task.priority] }}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={e => { e.stopPropagation(); onOpenDetail() }}
        className="hover-reveal btn-icon w-7 h-7 rounded-full flex-shrink-0 mt-0.5"
        style={{ border: '1px solid var(--border)' }}
      >
        <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ─── Main Inbox Page ────────────────────────────────────────────────────────
export default function InboxPage() {
  const { items, loading, silentRefresh, addItem, updateItem } = useItems()

  const [showTip, setShowTip] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [focusedNewTask, setFocusedNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null)
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority | null>(null)
  const [openPopover, setOpenPopover] = useState<'date' | 'priority' | null>(null)
  const [commentsMap, setCommentsMap] = useState<Map<string, LocalComment[]>>(new Map())

  const newTaskInputRef = useRef<HTMLInputElement>(null)

  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<NodeJS.Timeout>()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const allTasks = useMemo(() => {
    return items.filter((i): i is Task => i.type === 'task')
  }, [items])

  const tasks = useMemo(() => allTasks.filter(t => t.status !== 'done'), [allTasks])
  const doneTasks = useMemo(() => allTasks.filter(t => t.status === 'done'), [allTasks])
  const [showDone, setShowDone] = useState(false)

  const taskIds = useMemo(() => tasks.map(t => t._id!), [tasks])

  const selectedTask = useMemo(
    () => tasks.find(t => t._id === detailTaskId) ?? null,
    [tasks, detailTaskId],
  )

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        newTaskInputRef.current?.focus()
        return
      }

      if (e.key === 'Escape') {
        if (openPopover) {
          setOpenPopover(null)
          return
        }
        if (detailTaskId) {
          setDetailTaskId(null)
          return
        }
        if (focusedNewTask) {
          newTaskInputRef.current?.blur()
          return
        }
      }

      if (focusedNewTask && !openPopover) {
        if (e.key === '1' && !isInput) { e.preventDefault(); setNewTaskPriority('high'); return }
        if (e.key === '2' && !isInput) { e.preventDefault(); setNewTaskPriority('medium'); return }
        if (e.key === '3' && !isInput) { e.preventDefault(); setNewTaskPriority('low'); return }
      }

      if (!isInput && !detailTaskId) {
        if (e.key === ' ' && selectedTaskId) {
          e.preventDefault()
          const t = tasks.find(t => t._id === selectedTaskId)
          if (t) {
            const newStatus = t.status === 'done' ? 'todo' : 'done'
            if (newStatus === 'done') playCompletionSound()
            updateItem('task', t._id!, { status: newStatus } as Partial<AnyItem>)
          }
          return
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          const currentIdx = selectedTaskId ? taskIds.indexOf(selectedTaskId) : -1
          let nextIdx: number
          if (e.key === 'ArrowDown') {
            nextIdx = currentIdx < taskIds.length - 1 ? currentIdx + 1 : 0
          } else {
            nextIdx = currentIdx > 0 ? currentIdx - 1 : taskIds.length - 1
          }
          if (taskIds[nextIdx]) setSelectedTaskId(taskIds[nextIdx])
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openPopover, detailTaskId, focusedNewTask, selectedTaskId, taskIds, tasks, updateItem])

  // ── Handlers ────────────────────────────────────────────────
  const handleCreateTask = useCallback(async () => {
    if (!newTaskTitle.trim()) return
    const data: Record<string, unknown> = {
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority ?? 'medium',
      color: '#34d399',
    }
    if (newTaskDate) {
      data.dueDate = newTaskDate.toISOString()
    }
    await addItem('task', data as Partial<Task>)
    setNewTaskTitle('')
    setNewTaskDate(null)
    setNewTaskPriority(null)
    setOpenPopover(null)
    newTaskInputRef.current?.focus()
  }, [newTaskTitle, newTaskDate, newTaskPriority, addItem])

  const handleToggleTask = useCallback(async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    if (newStatus === 'done') {
      showToast(`"${task.title}" completed`)
    }
    await updateItem('task', task._id!, { status: newStatus } as Partial<AnyItem>)
  }, [updateItem, showToast])

  const handleUpdateTask = useCallback(async (data: Partial<AnyItem>) => {
    if (!detailTaskId) return
    await updateItem('task', detailTaskId, data)
  }, [detailTaskId, updateItem])

  const handleAddComment = useCallback((taskId: string, text: string) => {
    setCommentsMap(prev => {
      const next = new Map(prev)
      const existing = next.get(taskId) ?? []
      next.set(taskId, [...existing, { id: `c-${Date.now()}`, text, createdAt: new Date() }])
      return next
    })
  }, [])

  const getComments = useCallback((taskId: string) => {
    return commentsMap.get(taskId) ?? []
  }, [commentsMap])

  return (
    <div className="flex flex-col flex-1 overflow-hidden relative">
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>

          {/* ── Header ─────────────────────────────────────────── */}
          <PageHeader title={copy.inbox.title} />

          {/* ── Tip Banner ─────────────────────────────────────── */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-4"
              >
                <div className="tip-banner">
                  <BookOpen size={16} style={{ color: ACCENT_INDIGO, flexShrink: 0 }} />
                  <span className="flex-1">
                    {copy.inbox.tipBanner}
                  </span>
                  <button className="flex-shrink-0 p-1" style={{ color: ACCENT_INDIGO }}>
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setShowTip(false)}
                    className="flex-shrink-0 p-1"
                    style={{ color: 'var(--text-3)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── New Task Row ───────────────────────────────────── */}
          <div className="mt-6 relative">
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
              style={{
                background: focusedNewTask ? 'var(--bg-overlay)' : 'transparent',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                style={{
                  color: focusedNewTask ? 'var(--text-1)' : 'var(--text-3)',
                }}
              >
                <Plus size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  ref={newTaskInputRef}
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onFocus={() => setFocusedNewTask(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!openPopover) setFocusedNewTask(false)
                    }, 150)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateTask()
                    }
                    if (e.key === 'Escape') {
                      e.currentTarget.blur()
                      setFocusedNewTask(false)
                      setOpenPopover(null)
                    }
                  }}
                  placeholder={focusedNewTask ? 'Create a task' : copy.list.inlineNewTaskPlaceholder}
                  className="w-full bg-transparent outline-none text-[15px] font-medium"
                  style={{ color: 'var(--text-1)' }}
                />

                {focusedNewTask && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1 mt-2"
                  >
                    <div className="relative">
                      <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setOpenPopover(openPopover === 'date' ? null : 'date')}
                        className="btn-icon w-7 h-7"
                        style={{
                          color: newTaskDate ? 'var(--accent)' : undefined,
                          background: newTaskDate ? 'rgba(255,77,61,0.1)' : undefined,
                        }}
                      >
                        <CalIcon size={15} />
                      </button>
                      {newTaskDate && (
                        <span className="text-[11px] ml-1" style={{ color: 'var(--accent)' }}>
                          {format(newTaskDate, 'MMM d')}
                        </span>
                      )}
                      <AnimatePresence>
                        {openPopover === 'date' && (
                          <DatePopover
                            value={newTaskDate}
                            onChange={d => {
                              setNewTaskDate(d)
                              setOpenPopover(null)
                            }}
                            onClose={() => setOpenPopover(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => setOpenPopover(openPopover === 'priority' ? null : 'priority')}
                        className="btn-icon w-7 h-7"
                        style={{
                          color: newTaskPriority ? PRIORITY_COLORS[newTaskPriority] : undefined,
                          background: newTaskPriority ? `${PRIORITY_COLORS[newTaskPriority]}15` : undefined,
                        }}
                      >
                        <BarChart3 size={15} />
                      </button>
                      <AnimatePresence>
                        {openPopover === 'priority' && (
                          <PriorityPopover
                            value={newTaskPriority}
                            onChange={p => {
                              setNewTaskPriority(p)
                              setOpenPopover(null)
                            }}
                            onClose={() => setOpenPopover(null)}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    <button className="btn-icon w-7 h-7">
                      <Tag size={15} />
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center flex-shrink-0 mt-1">
                {focusedNewTask ? (
                  <CornerDownLeft size={16} style={{ color: 'var(--text-3)' }} />
                ) : (
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
                  >
                    ^N
                  </kbd>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 mb-1" style={{ height: 1, background: 'var(--border)' }} />

          {/* ── Task List ──────────────────────────────────────── */}
          {loading && tasks.length === 0 && (
            <div className="py-12 text-center">
              <div className="spinner" />
            </div>
          )}

          <AnimatePresence initial={false}>
            {tasks.map(task => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <TaskRow
                  task={task}
                  isSelected={selectedTaskId === task._id}
                  isDetailOpen={detailTaskId === task._id}
                  onToggle={() => handleToggleTask(task)}
                  onSelect={() => setSelectedTaskId(task._id!)}
                  onOpenDetail={() => setDetailTaskId(prev => prev === task._id ? null : task._id!)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && tasks.length === 0 && doneTasks.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
                Nothing here. Press <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ background: 'var(--bg-overlay)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>^N</kbd> to add a task.
              </p>
            </div>
          )}

          {/* Done section */}
          {doneTasks.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowDone(s => !s)}
                className="flex items-center gap-2 px-1 py-2 text-[13px] font-medium transition-colors"
                style={{ color: 'var(--text-3)' }}
              >
                <motion.div animate={{ rotate: showDone ? 0 : -90 }} transition={{ duration: 0.15 }}>
                  <ChevronDown size={14} />
                </motion.div>
                Done ({doneTasks.length})
              </button>
              <AnimatePresence initial={false}>
                {showDone && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {doneTasks.map(task => (
                      <TaskRow
                        key={task._id}
                        task={task}
                        isSelected={selectedTaskId === task._id}
                        isDetailOpen={detailTaskId === task._id}
                        onToggle={() => handleToggleTask(task)}
                        onSelect={() => setSelectedTaskId(task._id!)}
                        onOpenDetail={() => setDetailTaskId(prev => prev === task._id ? null : task._id!)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Panel (overlay) ─────────────────────────────── */}
      <AnimatePresence>
        {selectedTask && detailTaskId && (
          <DetailPanel
            key={detailTaskId}
            task={selectedTask}
            onClose={() => setDetailTaskId(null)}
            onUpdate={handleUpdateTask}
            comments={getComments(detailTaskId)}
            onAddComment={text => handleAddComment(detailTaskId, text)}
          />
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="toast"
          >
            <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
