'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  Plus,
  ChevronDown,
  Clock,
  CalendarDays,
  Printer,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import { playCompletionSound, playCreationSound } from '@/lib/sounds'
import { fadeSlideUp, fadeSlideDown, collapse, ease, buttonPress, taskCompleteExit } from '@/lib/motion'
import { useFocusState } from '@/contexts/FocusContext'
import TaskRow from '@/components/tasks/TaskRow'
import TimeBlockPicker from '@/components/tasks/TimeBlockPicker'
import TaskContextMenu from '@/components/tasks/TaskContextMenu'

// ── Date helpers ──────────────────────────────────────────────

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfTomorrow(): Date {
  const d = startOfToday()
  d.setDate(d.getDate() + 1)
  return d
}

function endOfTomorrow(): Date {
  const d = startOfTomorrow()
  d.setHours(23, 59, 59, 999)
  return d
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < startOfToday()
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  return d >= startOfToday() && d <= endOfToday()
}

function isTomorrow(dateStr: string): boolean {
  const d = new Date(dateStr)
  return d >= startOfTomorrow() && d <= endOfTomorrow()
}

function formatTimeSlot(start: string, end: string): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${fmt(new Date(start))} - ${fmt(new Date(end))}`
}

function formatFocusTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Grouping logic ────────────────────────────────────────────

type GroupByOption = 'none' | 'dueDate' | 'priority' | 'alphabetical' | 'creationDate' | 'list' | 'label'

const GROUP_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'priority', label: 'Priority' },
  { value: 'creationDate', label: 'Creation date' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'list', label: 'List' },
  { value: 'label', label: 'Label' },
]

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#6b66da',
}

interface TaskGroup {
  key: string
  label: string
  tasks: TaskRecord[]
  color?: string
}

function groupTasks(
  tasks: TaskRecord[],
  groupBy: GroupByOption,
  labelMap: Map<string, string>
): TaskGroup[] {
  if (groupBy === 'none') {
    return [{ key: 'all', label: 'All tasks', tasks }]
  }

  if (groupBy === 'dueDate') {
    const overdue = tasks.filter((t) => t.dueDate && isOverdue(t.dueDate))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    const today = tasks.filter((t) => t.dueDate && isToday(t.dueDate))
    const tomorrow = tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate))
    const later = tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate))
    const noDue = tasks.filter((t) => !t.dueDate)

    const groups: TaskGroup[] = []
    if (overdue.length > 0) groups.push({ key: 'overdue', label: 'Overdue', tasks: overdue, color: 'var(--priority-high)' })
    if (today.length > 0) groups.push({ key: 'today', label: 'Today', tasks: today })
    if (tomorrow.length > 0) groups.push({ key: 'tomorrow', label: 'Tomorrow', tasks: tomorrow })
    if (later.length > 0) groups.push({ key: 'later', label: 'Later', tasks: later })
    if (noDue.length > 0) groups.push({ key: 'noDue', label: 'No due date', tasks: noDue })
    return groups
  }

  if (groupBy === 'priority') {
    const high = tasks.filter((t) => t.priority === 'high')
    const medium = tasks.filter((t) => t.priority === 'medium')
    const low = tasks.filter((t) => t.priority === 'low')
    const none = tasks.filter((t) => !t.priority || !['high', 'medium', 'low'].includes(t.priority))
    const groups: TaskGroup[] = []
    if (high.length > 0) groups.push({ key: 'high', label: 'High', tasks: high, color: PRIORITY_COLORS.high })
    if (medium.length > 0) groups.push({ key: 'medium', label: 'Medium', tasks: medium, color: PRIORITY_COLORS.medium })
    if (low.length > 0) groups.push({ key: 'low', label: 'Low', tasks: low, color: PRIORITY_COLORS.low })
    if (none.length > 0) groups.push({ key: 'none', label: 'No priority', tasks: none })
    return groups
  }

  if (groupBy === 'alphabetical') {
    const sorted = [...tasks].sort((a, b) => a.title.localeCompare(b.title))
    const groups = new Map<string, TaskRecord[]>()
    for (const t of sorted) {
      const letter = (t.title[0] || '#').toUpperCase()
      if (!groups.has(letter)) groups.set(letter, [])
      groups.get(letter)!.push(t)
    }
    return Array.from(groups.entries()).map(([letter, items]) => ({
      key: letter,
      label: letter,
      tasks: items,
    }))
  }

  if (groupBy === 'creationDate') {
    const sorted = [...tasks].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )
    return [{ key: 'all', label: 'By creation date', tasks: sorted }]
  }

  if (groupBy === 'list') {
    const groups = new Map<string, TaskRecord[]>()
    for (const t of tasks) {
      const key = t.listId || 'none'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(t)
    }
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      label: key === 'none' ? 'No list' : key,
      tasks: items,
    }))
  }

  if (groupBy === 'label') {
    const groups = new Map<string, TaskRecord[]>()
    const noLabel: TaskRecord[] = []
    for (const t of tasks) {
      if (!t.labelIds || t.labelIds.length === 0) {
        noLabel.push(t)
      } else {
        for (const lid of t.labelIds) {
          if (!groups.has(lid)) groups.set(lid, [])
          groups.get(lid)!.push(t)
        }
      }
    }
    const result: TaskGroup[] = Array.from(groups.entries()).map(([lid, items]) => ({
      key: lid,
      label: labelMap.get(lid) || lid,
      tasks: items,
    }))
    if (noLabel.length > 0) result.push({ key: 'none', label: 'No label', tasks: noLabel })
    return result
  }

  return [{ key: 'all', label: 'All', tasks }]
}

// ── Component ─────────────────────────────────────────────────

export default function TodayPage() {
  const { tasks, isLoading, createTask, toggleComplete, updateTask, deleteTask } = useTasks()
  const { labels } = useLabels()
  const { connected: googleConnected, syncTask } = useGoogleCalendar()
  const { focus } = useFocusState()

  // Grouping
  const [groupBy, setGroupBy] = useState<GroupByOption>('dueDate')
  const [groupMenuOpen, setGroupMenuOpen] = useState(false)
  const groupMenuRef = useRef<HTMLDivElement>(null)

  // More menu
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // New task composer
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Group collapse states
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Detail + schedule
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [timeBlockTaskId, setTimeBlockTaskId] = useState<string | null>(null)

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    task: TaskRecord
    position: { x: number; y: number }
  } | null>(null)

  // Habits
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())

  // Habit data

  // Label map for grouping
  const labelMap = useMemo(
    () => new Map(labels.map((l) => [l._id, l.name])),
    [labels]
  )

  // Filter tasks
  const incompleteTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          ((t.status !== 'done' && t.status !== 'dropped') &&
            (groupBy === 'dueDate' ? !!t.dueDate : true)) ||
          completingIds.has(t._id)
      ),
    [tasks, completingIds, groupBy]
  )

  // Group tasks
  const taskGroups = useMemo(
    () => groupTasks(incompleteTasks, groupBy, labelMap),
    [incompleteTasks, groupBy, labelMap]
  )

  const hasAnyTasks = incompleteTasks.length > 0

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (groupMenuOpen && groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setGroupMenuOpen(false)
      }
      if (moreMenuOpen && moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [groupMenuOpen, moreMenuOpen])

  // Keyboard shortcut: Ctrl+N for new task
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        setNewTaskFocused(true)
        setTimeout(() => inputRef.current?.focus(), 10)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Sub-task counts
  const getSubTaskCount = useCallback(
    (taskId: string) => {
      const subTasks = tasks.filter((t) => t.parentId === taskId)
      if (subTasks.length === 0) return undefined
      return {
        completed: subTasks.filter((t) => t.status === 'done').length,
        total: subTasks.length,
      }
    },
    [tasks]
  )

  // Labels for a task
  const getLabelsForTask = useCallback(
    (task: TaskRecord) => {
      if (!task.labelIds || task.labelIds.length === 0) return []
      return labels.filter((l) => task.labelIds?.includes(l._id))
    },
    [labels]
  )

  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await createTask({
      title,
      priority: 'medium',
      status: 'todo',
      dueDate: endOfToday().toISOString(),
    })
    playCreationSound()
    setNewTaskTitle('')
    inputRef.current?.blur()
  }, [newTaskTitle, createTask])

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return

      if (task.status !== 'done') {
        playCompletionSound()
        setCompletingIds((prev) => new Set(prev).add(taskId))
        await toggleComplete(taskId)
        setTimeout(() => {
          setCompletingIds((prev) => {
            const next = new Set(prev)
            next.delete(taskId)
            return next
          })
        }, 1000)
      } else {
        await toggleComplete(taskId)
      }
    },
    [tasks, toggleComplete]
  )

  const handleOpenDetail = useCallback((taskId: string) => {
    setDetailTaskId(taskId)
  }, [])

  const handleTitleChange = useCallback(
    async (taskId: string, title: string) => {
      await updateTask(taskId, { title })
    },
    [updateTask]
  )

  const handleTimeBlockSave = useCallback(
    async (data: {
      scheduledStart: string
      scheduledEnd: string
      estimatedEffort: number
      syncToGoogle: boolean
    }) => {
      if (!timeBlockTaskId) return
      await updateTask(timeBlockTaskId, {
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd,
        estimatedEffort: data.estimatedEffort,
      })
      if (data.syncToGoogle && googleConnected) {
        await syncTask(timeBlockTaskId)
      }
      setTimeBlockTaskId(null)
    },
    [timeBlockTaskId, updateTask, googleConnected, syncTask]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, task: TaskRecord) => {
      e.preventDefault()
      setContextMenu({ task, position: { x: e.clientX, y: e.clientY } })
    },
    []
  )

  const handleDuplicateTask = useCallback(
    async (task: TaskRecord) => {
      await createTask({
        title: `${task.title} (copy)`,
        priority: task.priority,
        status: 'todo',
        dueDate: task.dueDate,
        labelIds: task.labelIds,
        description: task.description,
        listId: task.listId,
      })
      setContextMenu(null)
    },
    [createTask]
  )

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId)
      setContextMenu(null)
    },
    [deleteTask]
  )

  const toggleGroupCollapse = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // Expose detailTaskId for AppShell
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } })
    )
  }, [detailTaskId])

  // ── Render helpers ────────────────────────────────────────────

  const renderTaskWithSchedule = (task: TaskRecord) => (
    <div key={task._id} className="relative">
      {task.scheduledStart && task.scheduledEnd && (
        <div className="mb-0.5 flex items-center gap-2 pl-12">
          <Clock size={10} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
          <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
            {formatTimeSlot(task.scheduledStart, task.scheduledEnd)}
          </span>
          {task.estimatedEffort && (
            <span
              className="rounded px-1 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}
            >
              Est: {task.estimatedEffort}h
            </span>
          )}
          {task.calendarSynced && (
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: '#34d399' }}
              title="Synced to Google Calendar"
            />
          )}
        </div>
      )}
      <div
        className="flex items-center"
        onContextMenu={(e) => handleContextMenu(e, task)}
      >
        <div className="flex-1">
          <TaskRow
            task={task}
            onToggle={handleToggleTask}
            onOpenDetail={handleOpenDetail}
            onUpdate={updateTask}
            isSelected={false}
            isDetailOpen={detailTaskId === task._id}
            subTaskCount={getSubTaskCount(task._id)}
            labels={getLabelsForTask(task)}
            onTitleChange={handleTitleChange}
            onSchedule={() => setTimeBlockTaskId(task._id)}
            showScheduleIcon
            isCompleting={completingIds.has(task._id)}
          />
        </div>
      </div>
    </div>
  )

  const renderTaskRow = (task: TaskRecord) => (
    <div
      key={task._id}
      onContextMenu={(e) => handleContextMenu(e, task)}
    >
      <TaskRow
        task={task}
        onToggle={handleToggleTask}
        onOpenDetail={handleOpenDetail}
        isSelected={false}
        isDetailOpen={detailTaskId === task._id}
        subTaskCount={getSubTaskCount(task._id)}
        labels={getLabelsForTask(task)}
        onTitleChange={handleTitleChange}
        onSchedule={() => setTimeBlockTaskId(task._id)}
        showScheduleIcon
        isCompleting={completingIds.has(task._id)}
      />
    </div>
  )

  const renderGroup = (group: TaskGroup) => {
    const isOpen = !collapsedGroups.has(group.key)
    const showScheduleInfo = groupBy === 'dueDate'

    return (
      <div key={group.key} style={{ marginBottom: 16 }} role="group" aria-label={`${group.label} — ${group.tasks.length} tasks`}>
        <button
          onClick={() => toggleGroupCollapse(group.key)}
          aria-expanded={isOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 8px',
            marginBottom: 4,
            cursor: 'pointer',
            border: 'none', background: 'none',
            color: group.color || 'var(--text-primary)',
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={ease.fast}
          >
            <ChevronDown size={16} strokeWidth={1.5} />
          </motion.div>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{group.label}</span>
          <span style={{
            fontSize: 12, fontWeight: 500,
            backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
            color: 'var(--text-faint)',
            borderRadius: 999, padding: '2px 8px',
          }}>
            {group.tasks.length}
          </span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              {...collapse}
              transition={ease.normal}
              role="list"
              className="flex flex-col overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                {group.tasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    {...taskCompleteExit}
                    transition={ease.normal}
                  >
                    {showScheduleInfo ? renderTaskWithSchedule(task) : renderTaskRow(task)}
                  </motion.div>
                ))}
              </AnimatePresence>
              {group.tasks.length === 0 && (
                <p className="px-4 py-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  No tasks
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Main render ───────────────────────────────────────────────

  const currentGroupLabel = GROUP_OPTIONS.find((o) => o.value === groupBy)?.label || 'Due date'

  return (
    <div className="flex flex-col h-full overflow-y-auto">
    <div className="mx-auto w-full max-w-[720px] px-6 py-8">
      {/* Top-right toolbar */}
      <div className="flex items-center justify-end gap-2 mb-6">
        {/* Grouping selector — Superlist pill style */}
        <div className="relative" ref={groupMenuRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setGroupMenuOpen(!groupMenuOpen)}
            className="flex h-8 items-center gap-1.5 rounded-full px-3 cursor-pointer transition-sl"
            style={{
              backgroundColor: 'var(--overlay-2, var(--bg-pane-2))',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-3, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-pane-2))' }}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">{currentGroupLabel}</span>
          </motion.button>
          <AnimatePresence>
            {groupMenuOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.fast}
                className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-[var(--radius-lg,16px)] py-1"
                style={{
                  backgroundColor: 'var(--bg-pane)',
                  border: '1px solid var(--overlay-2, var(--border))',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                {GROUP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setGroupBy(opt.value); setGroupMenuOpen(false); setCollapsedGroups(new Set()) }}
                    className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[14px] font-medium transition-sl cursor-pointer"
                    style={{ color: opt.value === groupBy ? 'var(--accent)' : 'var(--text-primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {opt.value === groupBy && <span className="mr-1" style={{ color: 'var(--accent)' }}>&bull;</span>}
                    <span className="flex-1 text-left">{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Three-dot menu */}
        <div className="relative" ref={moreMenuRef}>
          <motion.button
            {...buttonPress}
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer transition-sl"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
          <AnimatePresence>
            {moreMenuOpen && (
              <motion.div
                {...fadeSlideDown}
                transition={ease.fast}
                className="absolute right-0 top-full z-50 mt-1 w-[180px] rounded-[var(--radius-lg,16px)] py-1"
                style={{ backgroundColor: 'var(--bg-pane)', border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)' }}
              >
                <button
                  onClick={() => { window.print(); setMoreMenuOpen(false) }}
                  className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[14px] font-medium transition-sl cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Printer size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                  Print Today
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Title */}
      <h1 style={{ color: 'var(--text-primary)', fontSize: 42, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em', marginBottom: 24 }}>
        {copy.today.title}
      </h1>

      {/* New task */}
      <div style={{ marginBottom: 20 }}>
        <div
          onClick={() => {
            if (!newTaskFocused) {
              setNewTaskFocused(true)
              setTimeout(() => inputRef.current?.focus(), 10)
            }
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.05))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 8px',
            borderRadius: 10,
            cursor: 'text',
            color: 'var(--text-faint)',
            transition: 'background-color 150ms ease',
          }}
        >
          <Plus size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          {newTaskFocused || newTaskTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onFocus={() => setNewTaskFocused(true)}
              onBlur={() => setTimeout(() => { if (!newTaskTitle.trim()) setNewTaskFocused(false) }, 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNewTask()
                if (e.key === 'Escape') { setNewTaskTitle(''); setNewTaskFocused(false) }
              }}
              placeholder="What would you like to do?"
              style={{
                flex: 1, background: 'transparent', outline: 'none', border: 'none',
                fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
                fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
              }}
              autoFocus
            />
          ) : (
            <>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif' }}>New task</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>⌃N</span>
            </>
          )}
        </div>
      </div>

      {/* Task groups */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !hasAnyTasks ? (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <CalendarDays size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
          <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Nothing scheduled for today
          </h3>
          <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
            Add tasks with due dates or drag them from your inbox.
          </p>
        </motion.div>
      ) : (
        taskGroups.map((group) => renderGroup(group))
      )}

      {/* Time Block Picker */}
      {timeBlockTaskId && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setTimeBlockTaskId(null)}
          onKeyDown={(e) => { if (e.key === 'Escape') setTimeBlockTaskId(null) }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Schedule time block"
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <TimeBlockPicker
              open={!!timeBlockTaskId}
              onClose={() => setTimeBlockTaskId(null)}
              onSave={handleTimeBlockSave}
              googleConnected={googleConnected}
            />
          </div>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <TaskContextMenu
          task={contextMenu.task}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEditDueDate={() => {
            // Open detail panel to edit due date
            handleOpenDetail(contextMenu.task._id)
            setContextMenu(null)
          }}
          onRemoveDueDate={() => {
            updateTask(contextMenu.task._id, { dueDate: null })
            setContextMenu(null)
          }}
          onEditPriority={() => {
            handleOpenDetail(contextMenu.task._id)
            setContextMenu(null)
          }}
          onRemovePriority={() => {
            updateTask(contextMenu.task._id, { priority: 'medium' })
            setContextMenu(null)
          }}
          onEditAssignee={() => {
            handleOpenDetail(contextMenu.task._id)
            setContextMenu(null)
          }}
          onRemoveAssignee={() => {
            updateTask(contextMenu.task._id, { assigneeId: null })
            setContextMenu(null)
          }}
          onAddLabels={() => {
            handleOpenDetail(contextMenu.task._id)
            setContextMenu(null)
          }}
          onCopyLink={() => {
            navigator.clipboard?.writeText(`${window.location.origin}/today/tasks/${contextMenu.task._id}`)
            setContextMenu(null)
          }}
          onDuplicate={() => handleDuplicateTask(contextMenu.task)}
          onDelete={() => handleDeleteTask(contextMenu.task._id)}
        />
      )}
    </div>
    </div>
  )
}
