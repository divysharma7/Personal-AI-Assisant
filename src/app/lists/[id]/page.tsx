'use client'

import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  Plus,
  ChevronDown,
  Clock,
  Star,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useList, useLists } from '@/hooks/useLists'
import { useTasks } from '@/hooks/useTasks'
import { useLabels } from '@/hooks/useLabels'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, collapse, stagger, buttonPress, ease } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'
import InfoBanner from '@/components/shared/InfoBanner'

export default function ListPage() {
  const params = useParams()
  const id = params.id as string
  const { list, isLoading } = useList(id)
  const { updateList } = useLists()
  const { tasks, createTask, toggleComplete, updateTask } = useTasks()
  const { labels } = useLabels()

  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [activeOpen, setActiveOpen] = useState(true)
  const [doneOpen, setDoneOpen] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter tasks belonging to this list
  const listTasks = useMemo(
    () => tasks.filter((t) => t.listId === id),
    [tasks, id]
  )

  const activeTasks = useMemo(
    () => listTasks.filter((t) => t.status !== 'done' && t.status !== 'dropped'),
    [listTasks]
  )

  const doneTasks = useMemo(
    () => listTasks.filter((t) => t.status === 'done'),
    [listTasks]
  )

  // Sub-task counts
  const getSubTaskCount = useCallback(
    (taskId: string) => {
      const subs = tasks.filter((t) => t.parentId === taskId)
      if (subs.length === 0) return undefined
      return {
        completed: subs.filter((t) => t.status === 'done').length,
        total: subs.length,
      }
    },
    [tasks]
  )

  // Labels for a task
  const getLabelsForTask = useCallback(
    (task: typeof tasks[0]) => {
      if (!task.labelIds || task.labelIds.length === 0) return []
      return labels.filter((l) => task.labelIds?.includes(l._id))
    },
    [labels]
  )

  // Create task in this list
  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await createTask({
      title,
      listId: id,
      priority: 'medium',
      status: 'todo',
    })
    setNewTaskTitle('')
    inputRef.current?.focus()
  }, [newTaskTitle, createTask, id])

  // Toggle completion
  const handleToggleTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      if (task.status !== 'done') playCompletionSound()
      await toggleComplete(taskId)
    },
    [tasks, toggleComplete]
  )

  // Open detail panel
  const handleOpenDetail = useCallback((taskId: string) => {
    setDetailTaskId(taskId)
  }, [])

  // Title change
  const handleTitleChange = useCallback(
    async (taskId: string, title: string) => {
      await updateTask(taskId, { title })
    },
    [updateTask]
  )

  // Toggle star
  const handleToggleStar = useCallback(() => {
    if (!list) return
    updateList({ id, pinnedToFavorites: !list.pinnedToFavorites })
  }, [list, updateList, id])

  // Dispatch detail task for AppShell
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } })
    )
  }, [detailTaskId])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const listTitle = list?.title || copy.list.untitled
  const listIcon = list?.icon || '📋'

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header row */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          {/* Star */}
          <motion.button
            {...buttonPress}
            onClick={handleToggleStar}
            aria-label="Toggle favorite"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: list?.pinnedToFavorites ? 'var(--accent)' : 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <Star
              size={18}
              strokeWidth={1.5}
              fill={list?.pinnedToFavorites ? 'var(--accent)' : 'none'}
            />
          </motion.button>
          <motion.button
            {...buttonPress}
            aria-label="Filter"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
          </motion.button>
          <motion.button
            {...buttonPress}
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <MoreVertical size={18} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      {/* Big title — list icon + name */}
      <div className="mb-5 flex items-center gap-3">
        <span className="text-4xl">{listIcon}</span>
        <h1
          className="text-[32px]"
          style={{ color: 'var(--text-primary)' }}
        >
          {isLoading ? '...' : listTitle}
        </h1>
      </div>

      {/* Tip banner */}
      <div className="mb-5">
        <InfoBanner
          message={`Manage tasks in ${listTitle}. Create, schedule, and track progress.`}
          onDismiss={() => setTipDismissed(true)}
          visible={!tipDismissed}
        />
      </div>

      {/* New task row — same as Today */}
      <div
        className="mb-6 rounded-xl px-4 py-3 transition-colors duration-150"
        style={{
          backgroundColor: 'var(--bg-pane-2)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
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
            aria-label="New task title"
            className="flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
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

      {/* Active tasks */}
      <div className="mb-4">
        <button
          onClick={() => setActiveOpen(!activeOpen)}
          className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <motion.div animate={{ rotate: activeOpen ? 0 : -90 }} transition={ease.fast}>
            <ChevronDown size={14} strokeWidth={1.5} />
          </motion.div>
          <span className="text-sm font-semibold">Active</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}
          >
            {activeTasks.length}
          </span>
        </button>
        <AnimatePresence>
          {activeOpen && (
            <motion.div
              {...collapse}
              transition={ease.normal}
              className="flex flex-col gap-0.5 overflow-hidden"
            >
              <motion.div {...stagger()}>
                {activeTasks.map((task) => (
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
                    draggable
                  />
                ))}
                {activeTasks.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
                    No tasks yet. Add one above.
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Done tasks */}
      {doneTasks.length > 0 && (
        <div>
          <button
            onClick={() => setDoneOpen(!doneOpen)}
            className="mb-1 flex items-center gap-2 px-1 py-1 cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
          >
            <motion.div animate={{ rotate: doneOpen ? 0 : -90 }} transition={ease.fast}>
              <ChevronDown size={14} strokeWidth={1.5} />
            </motion.div>
            <span className="text-sm font-semibold">Done</span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-faint)' }}
            >
              {doneTasks.length}
            </span>
          </button>
          <AnimatePresence>
            {doneOpen && (
              <motion.div
                {...collapse}
                transition={ease.normal}
                className="flex flex-col gap-0.5 overflow-hidden"
              >
                {doneTasks.map((task) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
