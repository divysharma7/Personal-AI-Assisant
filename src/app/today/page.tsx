'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, collapse, stagger, ease, buttonPress } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'
import InfoBanner from '@/components/shared/InfoBanner'

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

export default function TodayPage() {
  const { tasks, createTask, toggleComplete, updateTask } = useTasks()
  const { labels } = useLabels()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [overdueOpen, setOverdueOpen] = useState(true)
  const [todayOpen, setTodayOpen] = useState(true)
  const [tomorrowOpen, setTomorrowOpen] = useState(true)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter tasks into groups
  const incompleteTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate)

  const overdueTasks = incompleteTasks
    .filter((t) => isOverdue(t.dueDate!))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const todayTasks = incompleteTasks
    .filter((t) => isToday(t.dueDate!))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const tomorrowTasks = incompleteTasks
    .filter((t) => isTomorrow(t.dueDate!))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const hasAnyTasks = overdueTasks.length > 0 || todayTasks.length > 0 || tomorrowTasks.length > 0

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
    setNewTaskTitle('')
    inputRef.current?.blur()
  }, [newTaskTitle, createTask])

  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      if (task.status !== 'done') playCompletionSound()
      await toggleComplete(taskId)
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

  // Expose detailTaskId for AppShell
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } })
    )
  }, [detailTaskId])

  const renderGroup = (
    label: string,
    groupTasks: TaskRecord[],
    open: boolean,
    setOpen: (v: boolean) => void,
    accentColor?: string
  ) => (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
        style={{ color: accentColor || 'var(--text-muted)' }}
      >
        <motion.div
          animate={{ rotate: open ? 0 : -90 }}
          transition={ease.fast}
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.div>
        <span className="text-sm font-semibold">
          {label}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: accentColor ? `${accentColor}20` : 'var(--bg-hover)',
            color: accentColor || 'var(--text-faint)',
          }}
        >
          {groupTasks.length}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...collapse}
            transition={ease.normal}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            <motion.div {...stagger()}>
              {groupTasks.map((task) => (
                <TaskRow
                  key={task._id}
                  task={task}
                  onToggle={handleToggleTask}
                  onOpenDetail={handleOpenDetail}
                  isSelected={false}
                  isDetailOpen={detailTaskId === task._id}
                  subTaskCount={getSubTaskCount(task._id)}
                  labels={getLabelsForTask(task)}
                  onTitleChange={handleTitleChange}
                />
              ))}
              {groupTasks.length === 0 && (
                <p className="px-4 py-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                  No tasks
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <motion.button
            {...buttonPress}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Title */}
      <h1
        className="mb-5 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.today.title}
      </h1>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={copy.today.tipBanner}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* New task row */}
      <div
        className="mb-6 rounded-xl px-4 py-3 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Plus
            size={20}
            strokeWidth={1.5}
            className="flex-shrink-0 transition-colors duration-150"
            style={{ color: newTaskFocused ? 'var(--text-primary)' : 'var(--text-faint)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onFocus={() => setNewTaskFocused(true)}
            onBlur={() => setNewTaskFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNewTask()
              if (e.key === 'Escape') {
                setNewTaskTitle('')
                inputRef.current?.blur()
              }
            }}
            placeholder={copy.newTask.placeholder}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {!newTaskFocused && !newTaskTitle && (
            <span
              className="rounded px-1.5 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-faint)',
              }}
            >
              {copy.newTask.shortcutHint}
            </span>
          )}
        </div>
      </div>

      {/* Task groups */}
      {!hasAnyTasks ? (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex flex-1 flex-col items-center justify-center py-20"
        >
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>
            {copy.today.emptyState}
          </p>
        </motion.div>
      ) : (
        <>
          {overdueTasks.length > 0 &&
            renderGroup(
              copy.today.groups.overdue,
              overdueTasks,
              overdueOpen,
              setOverdueOpen,
              'var(--priority-high)'
            )}
          {renderGroup(copy.today.groups.today, todayTasks, todayOpen, setTodayOpen)}
          {tomorrowTasks.length > 0 &&
            renderGroup(
              copy.today.groups.tomorrow,
              tomorrowTasks,
              tomorrowOpen,
              setTomorrowOpen
            )}
        </>
      )}
    </div>
  )
}
