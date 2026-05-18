'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  List,
  LayoutGrid,
  Grid3X3,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, buttonPress, stagger, ease } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'

type FilterTab = 'forMe' | 'upcoming' | 'done'
type ViewMode = 'List' | 'Board' | 'Matrix'

const VIEW_ICONS = {
  List,
  Board: LayoutGrid,
  Matrix: Grid3X3,
} as const

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export default function TasksPage() {
  const { tasks, createTask, toggleComplete, updateTask, isLoading } = useTasks()
  const { labels } = useLabels()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('forMe')
  const [viewMode, setViewMode] = useState<ViewMode>('List')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter tasks per active filter
  const filteredTasks = (() => {
    switch (activeFilter) {
      case 'forMe':
        return tasks.filter((t) => t.status !== 'done')
      case 'upcoming': {
        const now = new Date()
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        return tasks.filter(
          (t) =>
            t.status !== 'done' &&
            t.dueDate &&
            new Date(t.dueDate) > now &&
            new Date(t.dueDate) <= thirtyDays
        ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      }
      case 'done':
        return tasks
          .filter((t) => t.status === 'done')
          .sort((a, b) => {
            const aDate = a.completedAt || a.updatedAt || a.createdAt || ''
            const bDate = b.completedAt || b.updatedAt || b.createdAt || ''
            return new Date(bDate).getTime() - new Date(aDate).getTime()
          })
      default:
        return tasks
    }
  })()

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
    })
    setNewTaskTitle('')
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

  // Empty state text per filter
  const emptyText = (() => {
    switch (activeFilter) {
      case 'forMe':
        return copy.tasks.emptyStates.forMe
      case 'upcoming':
        return copy.tasks.emptyStates.upcoming
      case 'done':
        return copy.tasks.emptyStates.done
      default:
        return ''
    }
  })()

  // Board columns
  const boardColumns = [
    {
      key: 'todo',
      label: copy.tasks.board.todo,
      tasks: filteredTasks.filter((t) => t.status === 'todo'),
    },
    {
      key: 'in-progress',
      label: copy.tasks.board.inProgress,
      tasks: filteredTasks.filter(
        (t) => t.status === 'in-progress' || (t.labelIds && t.labelIds.some((l) => l === 'in-progress'))
      ),
    },
    {
      key: 'done',
      label: copy.tasks.board.done,
      tasks: filteredTasks.filter((t) => t.status === 'done'),
    },
  ]

  // Matrix quadrants
  const today = startOfToday()
  const matrixQuadrants = [
    {
      key: 'urgent-important',
      label: copy.tasks.matrix.urgentImportant,
      tasks: filteredTasks.filter(
        (t) => t.priority === 'high' && t.dueDate && new Date(t.dueDate) <= today
      ),
    },
    {
      key: 'not-urgent-important',
      label: copy.tasks.matrix.notUrgentImportant,
      tasks: filteredTasks.filter(
        (t) => t.priority === 'high' && (!t.dueDate || new Date(t.dueDate) > today)
      ),
    },
    {
      key: 'urgent-not-important',
      label: copy.tasks.matrix.urgentNotImportant,
      tasks: filteredTasks.filter(
        (t) =>
          t.priority !== 'high' && t.dueDate && new Date(t.dueDate) <= today
      ),
    },
    {
      key: 'neither',
      label: copy.tasks.matrix.neither,
      tasks: filteredTasks.filter(
        (t) =>
          t.priority !== 'high' && (!t.dueDate || new Date(t.dueDate) > today)
      ),
    },
  ]

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1
          className="text-[32px] font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {copy.tasks.title}
        </h1>
        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--bg-pane-2)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {copy.tasks.sortDefault}
          </span>

          {/* New task button */}
          <motion.button
            {...buttonPress}
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={14} strokeWidth={2} />
            <span>{copy.tasks.newTaskCta}</span>
          </motion.button>

          {/* View switcher */}
          <div
            className="flex items-center gap-0.5 rounded-lg p-0.5"
            style={{ backgroundColor: 'var(--bg-pane-2)' }}
          >
            {copy.tasks.viewModes.map((mode) => {
              const Icon = VIEW_ICONS[mode]
              const active = viewMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-faint)',
                  }}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span>{mode}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex items-center gap-1">
        {(
          [
            { key: 'forMe', label: copy.tasks.filters.forMe },
            { key: 'upcoming', label: copy.tasks.filters.upcoming },
            { key: 'done', label: copy.tasks.filters.done },
          ] as const
        ).map((tab) => {
          const active = activeFilter === tab.key
          return (
            <motion.button
              key={tab.key}
              {...buttonPress}
              onClick={() => setActiveFilter(tab.key)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? '#FFFFFF' : 'var(--text-muted)',
                border: active ? 'none' : '1px solid var(--border)',
              }}
            >
              {tab.label}
            </motion.button>
          )
        })}
      </div>

      {/* New task inline */}
      <div
        className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
        }}
      >
        <Plus size={20} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
        <input
          ref={inputRef}
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
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
      </div>

      {/* ─── List view ─── */}
      {viewMode === 'List' && (
        <motion.div className="flex flex-col gap-0.5" {...stagger()}>
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
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
          </AnimatePresence>
          {filteredTasks.length === 0 && !isLoading && (
            <motion.p
              {...fadeSlideUp}
              transition={ease.normal}
              className="py-8 text-center text-sm"
              style={{ color: 'var(--text-faint)' }}
            >
              {emptyText}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* ─── Board view ─── */}
      {viewMode === 'Board' && (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="grid grid-cols-3 gap-4"
        >
          {boardColumns.map((col) => (
            <div
              key={col.key}
              className="flex flex-col rounded-xl p-3"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
                minHeight: 200,
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {col.label}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-faint)',
                  }}
                >
                  {col.tasks.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {col.tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleOpenDetail(task._id)}
                    className="cursor-pointer rounded-lg px-3 py-2 transition-colors duration-150"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-selected)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                    }}
                  >
                    <span
                      className="text-[13px] font-medium"
                      style={{
                        color: task.status === 'done' ? 'var(--text-faint)' : 'var(--text-primary)',
                        textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      }}
                    >
                      {task.title || 'Untitled'}
                    </span>
                  </div>
                ))}
                {col.tasks.length === 0 && (
                  <p className="py-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ─── Matrix view ─── */}
      {viewMode === 'Matrix' && (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="grid grid-cols-2 grid-rows-2 gap-4"
          style={{ minHeight: 400 }}
        >
          {matrixQuadrants.map((q) => (
            <div
              key={q.key}
              className="flex flex-col rounded-xl p-3 overflow-y-auto"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
                maxHeight: 300,
              }}
            >
              <span
                className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {q.label}
              </span>
              <div className="flex flex-col gap-1">
                {q.tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleOpenDetail(task._id)}
                    className="cursor-pointer rounded-lg px-3 py-2 transition-colors duration-150"
                    style={{ backgroundColor: 'var(--bg-hover)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-selected)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                    }}
                  >
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {task.title || 'Untitled'}
                    </span>
                  </div>
                ))}
                {q.tasks.length === 0 && (
                  <p className="py-4 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
