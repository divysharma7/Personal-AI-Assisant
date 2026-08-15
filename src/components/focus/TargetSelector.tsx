import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, ChevronDown, Check, Target, X } from 'lucide-react'
import type { TargetType, SelectedTarget } from '@/hooks/useFocusTargets'
import { useTasks, type TaskRecord } from '@/hooks/useTasks'
import { useHabits, type Habit } from '@/hooks/useHabits'
import { format, isToday, isTomorrow, isPast, startOfDay } from 'date-fns'

interface TargetSelectorProps {
  selected: SelectedTarget | null
  onSelect: (target: SelectedTarget) => void
  onClear: () => void
  disabled?: boolean
  variant?: 'card' | 'minimal'
}

/* ── Visual tokens ── */
const POPOVER_W = 430
const POPOVER_MAX_H = 600
const POPOVER_BG = '#252525'
const POPOVER_BORDER = '#444'
const POPOVER_RADIUS = '18px'
const ROW_H = 48
const SEARCH_BG = '#303030'
const SEARCH_RADIUS = '10px'
const MUTED = '#999'
const ROW_HOVER = '#2e2e2e'

/* ── Helpers ── */

const isDone = (s: string) => s === 'done' || s === 'completed'

function formatDueDate(dueDate: string | null | undefined): { label: string; overdue: boolean } | null {
  if (!dueDate) return null
  const d = new Date(dueDate)
  if (isNaN(d.getTime())) return null
  const overdue = isPast(startOfDay(d)) && !isToday(d)
  if (isToday(d)) return { label: 'Today', overdue: false }
  if (isTomorrow(d)) return { label: 'Tomorrow', overdue: false }
  return { label: format(d, 'MMM d'), overdue }
}

/* ── Grouping logic ── */

interface TaskGroup {
  label: string
  tasks: TaskRecord[]
}

function groupTasks(tasks: TaskRecord[]): TaskGroup[] {
  const active = tasks.filter((t) => !t.isHabit && !isDone(t.status) && t.status !== 'dropped')
  const today: TaskRecord[] = []
  const withTags: TaskRecord[] = []
  const noTags: TaskRecord[] = []

  for (const task of active) {
    const due = task.dueDate ? new Date(task.dueDate) : null
    const isDueToday = due ? isToday(due) : false
    const hasTags = task.tags && task.tags.length > 0

    if (isDueToday) {
      today.push(task)
    } else if (hasTags) {
      withTags.push(task)
    } else {
      noTags.push(task)
    }
  }

  // Sort today by priority then title
  const prioWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 }
  today.sort((a, b) => (prioWeight[b.priority] ?? 0) - (prioWeight[a.priority] ?? 0) || a.title.localeCompare(b.title))
  noTags.sort((a, b) => a.title.localeCompare(b.title))
  withTags.sort((a, b) => a.title.localeCompare(b.title))

  const groups: TaskGroup[] = []
  if (today.length > 0) groups.push({ label: 'Today', tasks: today })
  if (withTags.length > 0) groups.push({ label: 'Tagged', tasks: withTags })
  if (noTags.length > 0) groups.push({ label: 'No Tags', tasks: noTags })
  return groups
}

/* ── Priority color ── */

const PRIO_DOT: Record<string, string> = {
  urgent: '#ef4444',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b66da',
}

/* ═══════════════════════════════════════
   Main Component
   ═══════════════════════════════════════ */

export default function TargetSelector({
  selected,
  onSelect,
  onClear,
  disabled = false,
  variant = 'card',
}: TargetSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TargetType>('TASK')
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Fetch real data from existing stores
  const { tasks } = useTasks()
  const { habits } = useHabits()

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 60)
    } else {
      setQuery('')
    }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // ── Task filtering and grouping ──
  const taskGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? tasks.filter((t) => !t.isHabit && t.title.toLowerCase().includes(q))
      : tasks
    return groupTasks(filtered)
  }, [tasks, query])

  // ── Habit filtering ──
  const filteredHabits = useMemo(() => {
    const active = habits.filter((h) => !h.archived)
    const q = query.trim().toLowerCase()
    if (!q) return active
    return active.filter((h) => h.name.toLowerCase().includes(q))
  }, [habits, query])

  const handleSelectTask = useCallback((task: TaskRecord) => {
    onSelect({ type: 'TASK', id: task._id, title: task.title })
    setOpen(false)
  }, [onSelect])

  const handleSelectHabit = useCallback((habit: Habit) => {
    onSelect({ type: 'HABIT', id: habit._id, title: habit.name })
    setOpen(false)
  }, [onSelect])

  const hasSelection = selected && selected.type !== 'NONE'
  const isMinimal = variant === 'minimal'

  return (
    <div ref={containerRef} className={`relative w-full max-w-md ${isMinimal ? 'focus-target-selector' : ''}`}>
      {/* ── Trigger ── */}
      {isMinimal ? (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => !disabled && setOpen((o) => !o)}
            disabled={disabled}
            aria-label="Choose focus target"
            aria-expanded={open}
            className="focus-target-trigger flex max-w-[280px] items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium disabled:cursor-default"
          >
            <span className="truncate">{hasSelection ? selected!.title : 'Focus'}</span>
            <ChevronRight size={13} aria-hidden="true" style={{ opacity: 0.6 }} />
          </button>
          {hasSelection && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear() }}
              aria-label="Clear selection"
              className="focus-target-clear grid h-6 w-6 place-items-center rounded-full"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ) : hasSelection ? (
        <div
          className="flex items-center justify-between gap-2 rounded-xl px-4 py-3"
          style={{ backgroundColor: 'var(--overlay-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Target size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-faint)' }}>
                {selected!.type === 'TASK' ? 'Task' : 'Habit'}
              </p>
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {selected!.title}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={onClear}
              className="flex h-6 w-6 items-center justify-center rounded-full cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}
        >
          <Target size={16} />
          <span>What are you working on?</span>
        </button>
      )}

      {/* ── Popover ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute left-1/2 z-50 mt-2 overflow-hidden flex flex-col"
            style={{
              width: POPOVER_W,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: POPOVER_MAX_H,
              transform: 'translateX(-50%)',
              background: POPOVER_BG,
              border: `1px solid ${POPOVER_BORDER}`,
              borderRadius: POPOVER_RADIUS,
              boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Tabs */}
            <div className="flex items-center gap-1 px-5 pt-5 pb-3">
              {(['TASK', 'HABIT'] as TargetType[]).map((t) => {
                const active = tab === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTab(t); setQuery('') }}
                    className="text-[13px] font-semibold cursor-pointer"
                    style={{
                      height: 38,
                      padding: '0 20px',
                      borderRadius: '999px',
                      background: active ? 'rgba(66,89,164,0.25)' : 'transparent',
                      color: active ? '#7b8cff' : MUTED,
                      border: active ? '1px solid rgba(66,89,164,0.4)' : '1px solid transparent',
                      transition: 'background 150ms, color 150ms, border-color 150ms',
                    }}
                  >
                    {t === 'TASK' ? 'Task' : 'Habit'}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div
                className="flex items-center gap-2.5 w-full"
                style={{
                  height: 52,
                  background: SEARCH_BG,
                  borderRadius: SEARCH_RADIUS,
                  padding: '0 14px',
                }}
              >
                <Search size={16} style={{ color: MUTED, flexShrink: 0 }} />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-[14px] outline-none"
                  style={{ color: '#ddd' }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}>
              {/* ── Task Tab ── */}
              {tab === 'TASK' && (
                <>
                  {taskGroups.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-[13px]" style={{ color: MUTED }}>
                        {query.trim() ? 'No tasks found' : 'No tasks yet'}
                      </p>
                    </div>
                  ) : (
                    taskGroups.map((group) => (
                      <div key={group.label} className="mb-2">
                        {/* Group header */}
                        <div className="flex items-center gap-1 px-2 py-2">
                          <ChevronDown size={12} style={{ color: '#666' }} />
                          <span className="text-[11px] font-semibold" style={{ color: '#666' }}>
                            {group.label}
                          </span>
                        </div>

                        {/* Task rows */}
                        {group.tasks.map((task) => {
                          const done = isDone(task.status)
                          const dueInfo = formatDueDate(task.dueDate)
                          const isSelected = selected?.type === 'TASK' && selected.id === task._id
                          const prioColor = PRIO_DOT[task.priority] || '#555'

                          return (
                            <button
                              key={task._id}
                              type="button"
                              onClick={() => handleSelectTask(task)}
                              className="flex items-center gap-3 w-full text-left cursor-pointer"
                              style={{
                                height: ROW_H,
                                padding: '0 10px',
                                borderRadius: '10px',
                                background: isSelected ? 'rgba(66,89,164,0.15)' : 'transparent',
                                transition: 'background 120ms',
                              }}
                              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = ROW_HOVER }}
                              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                            >
                              {/* Completion circle with priority color */}
                              <div
                                className="flex-shrink-0"
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  border: `2px solid ${prioColor}`,
                                  display: 'grid',
                                  placeItems: 'center',
                                }}
                              >
                                {done && (
                                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: prioColor }} />
                                )}
                              </div>

                              {/* Title + tags */}
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <span
                                  className="text-[13px] font-medium truncate"
                                  style={{ color: done ? '#666' : '#ddd' }}
                                >
                                  {task.title}
                                </span>
                                {task.tags && task.tags.length > 0 && (
                                  <span className="text-[10px] truncate flex-shrink-0" style={{ color: '#666' }}>
                                    #{task.tags[0]}
                                  </span>
                                )}
                              </div>

                              {/* Due date */}
                              {dueInfo && (
                                <span
                                  className="text-[11px] flex-shrink-0"
                                  style={{ color: dueInfo.overdue ? '#ef4444' : '#777' }}
                                >
                                  {dueInfo.label}
                                </span>
                              )}

                              {/* Selected indicator */}
                              {isSelected && (
                                <Check size={14} style={{ color: '#7b8cff', flexShrink: 0 }} />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ── Habit Tab ── */}
              {tab === 'HABIT' && (
                <>
                  {filteredHabits.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-[13px]" style={{ color: MUTED }}>
                        {query.trim() ? 'No habits found' : 'No habits yet'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1 px-2 py-2">
                        <ChevronDown size={12} style={{ color: '#666' }} />
                        <span className="text-[11px] font-semibold" style={{ color: '#666' }}>
                          Habit
                        </span>
                      </div>

                      {filteredHabits.map((habit) => {
                        const isSelected = selected?.type === 'HABIT' && selected.id === habit._id
                        return (
                          <button
                            key={habit._id}
                            type="button"
                            onClick={() => handleSelectHabit(habit)}
                            className="flex items-center gap-3 w-full text-left cursor-pointer"
                            style={{
                              height: ROW_H,
                              padding: '0 10px',
                              borderRadius: '10px',
                              background: isSelected ? 'rgba(66,89,164,0.15)' : 'transparent',
                              transition: 'background 120ms',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = ROW_HOVER }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                          >
                            {/* Habit icon circle */}
                            <div
                              className="flex-shrink-0"
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                border: `2px solid ${habit.color || '#7c83ff'}`,
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 9,
                              }}
                            >
                              {habit.icon || '✦'}
                            </div>

                            {/* Name */}
                            <span className="flex-1 text-[13px] font-medium truncate" style={{ color: '#ddd' }}>
                              {habit.name}
                            </span>

                            {/* Streak */}
                            {habit.currentStreak > 0 && (
                              <span className="text-[10px] flex-shrink-0" style={{ color: '#666' }}>
                                {habit.currentStreak}d streak
                              </span>
                            )}

                            {/* Selected indicator */}
                            {isSelected && (
                              <Check size={14} style={{ color: '#7b8cff', flexShrink: 0 }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
