'use client'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, GripVertical, X, SlidersHorizontal, MoreVertical,
  BookOpen, Plus, BarChart3, Tag, CornerDownLeft, ArrowRight,
  Calendar as CalIcon,
} from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import {
  isToday as dfIsToday, isPast as dfIsPast, isTomorrow as dfIsTomorrow,
  format, addDays, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, endOfDay,
} from 'date-fns'
import { snappy } from '@/shared/design-system'
import type { AnyItem, Task, TaskPriority } from '@/types'

// ─── Constants ──────────────────────────────────────────────────
const ACCENT_RED = '#FF4D3D'
const ACCENT_AMBER = '#FFB23D'
const ACCENT_BLUE = '#5DA8FF'
const ACCENT_INDIGO = '#8B7DFF'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: ACCENT_RED, medium: ACCENT_AMBER, low: ACCENT_BLUE,
}
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
}

// ─── Completion Sound ───────────────────────────────────────────
const TONES = [
  { f1: 880, f2: 1320 }, { f1: 784, f2: 1175 }, { f1: 660, f2: 990 },
  { f1: 740, f2: 1109 }, { f1: 830, f2: 1245 },
]
function playCompleteSound() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new AudioContext()
    const tone = TONES[Math.floor(Math.random() * TONES.length)]
    const t = ctx.currentTime
    const o1 = ctx.createOscillator(); const o2 = ctx.createOscillator()
    const g = ctx.createGain()
    o1.type = 'sine'; o1.frequency.value = tone.f1
    o2.type = 'sine'; o2.frequency.value = tone.f2
    o1.connect(g); o2.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    o1.start(t); o2.start(t + 0.05); o1.stop(t + 0.4); o2.stop(t + 0.45)
  } catch { /* silent */ }
}

// ─── DatePopover ────────────────────────────────────────────────
function DatePopover({ value, onChange, onClose }: {
  value: Date | null; onChange: (d: Date) => void; onClose: () => void
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

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="popover absolute p-3" style={{ width: 280, top: '100%', left: 0, marginTop: 4 }}>
      <div className="flex flex-col gap-0.5 mb-3">
        {[{ label: 'Today', date: today }, { label: 'Tomorrow', date: addDays(today, 1) }, { label: 'Next week', date: addDays(today, 7) }].map(opt => (
          <button key={opt.label} onClick={() => { onChange(opt.date); onClose() }}
            className="popover-item text-[13px] text-left">
            <CalIcon size={14} style={{ color: 'var(--text-3)' }} /> {opt.label}
          </button>
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '0 -4px 8px' }} />
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{format(viewMonth, 'MMMM yyyy')}</span>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} className="text-[10px] font-medium text-center py-1" style={{ color: 'var(--text-3)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const isSelected = value && isSameDay(day, value)
          const isCurrentMonth = isSameMonth(day, viewMonth)
          const isTodayDay = isSameDay(day, today)
          return (
            <button key={day.toISOString()} onClick={() => { onChange(day); onClose() }}
              className={`w-full aspect-square flex items-center justify-center rounded-full text-[12px] transition-colors ${!isSelected ? 'popover-item' : ''}`}
              style={{
                color: isSelected ? '#fff' : isCurrentMonth ? 'var(--text-1)' : 'var(--text-3)',
                background: isSelected ? ACCENT_INDIGO : undefined,
                fontWeight: isTodayDay ? 700 : 400,
                boxShadow: isTodayDay && !isSelected ? `inset 0 0 0 1.5px ${ACCENT_INDIGO}` : undefined,
              }}>
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── PriorityPopover ────────────────────────────────────────────
function PriorityPopover({ value, onChange, onClose }: {
  value: TaskPriority | null; onChange: (p: TaskPriority) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="popover absolute py-1.5" style={{ width: 160, top: '100%', left: 0, marginTop: 4 }}>
      {([
        { key: 'high' as TaskPriority, label: 'High', color: ACCENT_RED, shortcut: '1' },
        { key: 'medium' as TaskPriority, label: 'Medium', color: ACCENT_AMBER, shortcut: '2' },
        { key: 'low' as TaskPriority, label: 'Low', color: ACCENT_BLUE, shortcut: '3' },
      ]).map(opt => (
        <button key={opt.key} onClick={() => { onChange(opt.key); onClose() }}
          className={`popover-item w-full text-[13px] text-left ${value === opt.key ? 'selected' : ''}`}
          style={{ color: value === opt.key ? opt.color : undefined }}>
          <BarChart3 size={14} style={{ color: opt.color }} />
          <span className="flex-1">{opt.label}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{opt.shortcut}</span>
        </button>
      ))}
    </motion.div>
  )
}

// ─── Task Row ───────────────────────────────────────────────────
function TodayTaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const [justDone, setJustDone] = useState(false)
  const done = task.status === 'done'
  const showStrike = done || justDone

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!done) { setJustDone(true); playCompleteSound(); setTimeout(() => setJustDone(false), 600) }
    onToggle()
  }

  return (
    <div className="row-interactive flex items-center gap-2 py-3 px-4 group" style={{ minHeight: 48 }}>
      <div className="drag-handle w-4 flex items-center justify-center">
        <GripVertical size={14} />
      </div>
      <button onClick={handleClick}
        className={`checkbox-interactive mt-[1px] ${showStrike ? 'checked' : ''} ${justDone ? 'just-checked' : ''}`}>
        {showStrike && (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {task.priority && (
        <BarChart3 size={13} style={{ color: PRIORITY_COLORS[task.priority], flexShrink: 0 }} />
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-[15px] font-medium truncate ${showStrike ? 'strike-through' : ''}`}
          style={{ color: showStrike ? undefined : 'var(--text-1)' }}>
          {task.title}
        </span>
        {(task.dueDate && !showStrike) && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
              <CalIcon size={11} />
              {dfIsToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
            </span>
          </div>
        )}
      </div>
      <div className="hover-reveal flex items-center gap-1">
        <button className="btn-icon w-7 h-7 rounded-full flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Task Group ─────────────────────────────────────────────────
interface TaskGroup { label: string; tasks: Task[] }

// ─── Main Today Page ────────────────────────────────────────────
export default function TodayPage() {
  const { items, loading, silentRefresh, updateItem, addItem } = useItems()
  const [showTip, setShowTip] = useState(true)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [focusedNewTask, setFocusedNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(() => endOfDay(new Date()))
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority | null>(null)
  const [openPopover, setOpenPopover] = useState<'date' | 'priority' | null>(null)
  const newTaskInputRef = useRef<HTMLInputElement>(null)

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label); else next.add(label)
      return next
    })
  }

  // Group tasks by date section
  const groups: TaskGroup[] = useMemo(() => {
    const overdue: Task[] = []
    const today: Task[] = []
    const tomorrow: Task[] = []

    for (const item of items) {
      if (item.type !== 'task') continue
      const t = item as Task
      if (t.status === 'done') continue
      if (!t.dueDate) continue
      const d = new Date(t.dueDate)
      if (dfIsPast(d) && !dfIsToday(d)) overdue.push(t)
      else if (dfIsToday(d)) today.push(t)
      else if (dfIsTomorrow(d)) tomorrow.push(t)
    }

    const result: TaskGroup[] = []
    if (overdue.length) result.push({ label: 'Overdue', tasks: overdue })
    if (today.length) result.push({ label: 'Today', tasks: today })
    if (tomorrow.length) result.push({ label: 'Tomorrow', tasks: tomorrow })
    return result
  }, [items])

  const handleToggle = useCallback(async (task: Task) => {
    if (task.status !== 'done') playCompleteSound()
    await updateItem('task', task._id!, { status: task.status === 'done' ? 'todo' : 'done' } as Partial<AnyItem>)
  }, [updateItem])

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
    } else {
      data.dueDate = endOfDay(new Date()).toISOString()
    }
    await addItem('task', data as Partial<Task>)
    setNewTaskTitle('')
    setNewTaskDate(endOfDay(new Date()))
    setNewTaskPriority(null)
    setOpenPopover(null)
    newTaskInputRef.current?.focus()
  }, [newTaskTitle, newTaskDate, newTaskPriority, addItem])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        newTaskInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="px-8 md:px-10 py-8 md:py-10">

          {/* Header */}
          <div className="flex items-start justify-between">
            <h1 className="text-[32px] font-bold"
              style={{ color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Today
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

          {/* Tip Banner */}
          <AnimatePresence>
            {showTip && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }} className="mt-4">
                <div className="tip-banner">
                  <BookOpen size={16} style={{ color: ACCENT_INDIGO, flexShrink: 0 }} />
                  <span className="flex-1">
                    See your schedule, track habits, and stay on top of what&apos;s due today.
                  </span>
                  <button onClick={() => setShowTip(false)} className="flex-shrink-0 p-1"
                    style={{ color: 'var(--text-3)' }}>
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Task Row */}
          <div className="mt-6 relative">
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
              style={{ background: focusedNewTask ? 'var(--bg-overlay)' : 'transparent' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                style={{ color: focusedNewTask ? 'var(--text-1)' : 'var(--text-3)' }}>
                <Plus size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <input ref={newTaskInputRef} value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onFocus={() => setFocusedNewTask(true)}
                  onBlur={() => { setTimeout(() => { if (!openPopover) setFocusedNewTask(false) }, 150) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCreateTask() }
                    if (e.key === 'Escape') { e.currentTarget.blur(); setFocusedNewTask(false); setOpenPopover(null) }
                  }}
                  placeholder={focusedNewTask ? 'Create a task (defaults to today)' : 'New task'}
                  className="w-full bg-transparent outline-none text-[15px] font-medium"
                  style={{ color: 'var(--text-1)' }} />

                {focusedNewTask && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1 mt-2">
                    <div className="relative">
                      <button onMouseDown={e => e.preventDefault()}
                        onClick={() => setOpenPopover(openPopover === 'date' ? null : 'date')}
                        className="btn-icon w-7 h-7"
                        style={{
                          color: newTaskDate ? ACCENT_INDIGO : undefined,
                          background: newTaskDate ? 'rgba(139,125,255,0.1)' : undefined,
                        }}>
                        <CalIcon size={15} />
                      </button>
                      {newTaskDate && (
                        <span className="text-[11px] ml-1" style={{ color: ACCENT_INDIGO }}>
                          {format(newTaskDate, 'MMM d')}
                        </span>
                      )}
                      <AnimatePresence>
                        {openPopover === 'date' && (
                          <DatePopover value={newTaskDate}
                            onChange={d => { setNewTaskDate(d); setOpenPopover(null) }}
                            onClose={() => setOpenPopover(null)} />
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="relative">
                      <button onMouseDown={e => e.preventDefault()}
                        onClick={() => setOpenPopover(openPopover === 'priority' ? null : 'priority')}
                        className="btn-icon w-7 h-7"
                        style={{
                          color: newTaskPriority ? PRIORITY_COLORS[newTaskPriority] : undefined,
                          background: newTaskPriority ? `${PRIORITY_COLORS[newTaskPriority]}15` : undefined,
                        }}>
                        <BarChart3 size={15} />
                      </button>
                      <AnimatePresence>
                        {openPopover === 'priority' && (
                          <PriorityPopover value={newTaskPriority}
                            onChange={p => { setNewTaskPriority(p); setOpenPopover(null) }}
                            onClose={() => setOpenPopover(null)} />
                        )}
                      </AnimatePresence>
                    </div>
                    <button className="btn-icon w-7 h-7"><Tag size={15} /></button>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center flex-shrink-0 mt-1">
                {focusedNewTask ? (
                  <CornerDownLeft size={16} style={{ color: 'var(--text-3)' }} />
                ) : (
                  <kbd className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{ background: 'var(--bg-overlay)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
                    ^N
                  </kbd>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 mb-1" style={{ height: 1, background: 'var(--border)' }} />

          {/* Task Groups */}
          <div className="mt-2 space-y-1">
            {groups.map(group => {
              const collapsed = collapsedGroups.has(group.label)
              return (
                <div key={group.label}>
                  <button onClick={() => toggleGroup(group.label)}
                    className="flex items-center gap-1.5 py-2 px-1 w-full text-left">
                    <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={snappy}>
                      <ChevronDown size={14} style={{ color: 'var(--text-2)' }} />
                    </motion.div>
                    <span className="text-[14px] font-semibold"
                      style={{ color: group.label === 'Overdue' ? ACCENT_RED : 'var(--text-1)' }}>
                      {group.label}
                    </span>
                    <span className="text-[12px] ml-1" style={{ color: 'var(--text-3)' }}>
                      {group.tasks.length}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                        {group.tasks.map(task => (
                          <TodayTaskRow key={task._id} task={task} onToggle={() => handleToggle(task)} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {!loading && groups.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
                You&apos;re all caught up. Take a break.
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && items.length === 0 && (
            <div className="py-12 text-center"><div className="spinner" /></div>
          )}
        </div>
      </div>
    </div>
  )
}
