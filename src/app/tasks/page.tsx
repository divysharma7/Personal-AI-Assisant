'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { copy } from '@/lib/copy'
import { useTasks } from '@/hooks/useTasks'
import type { TaskRecord } from '@/hooks/useTasks'
import { playCompletionSound } from '@/lib/sounds'
import { fadeSlideUp, buttonPress, stagger, ease } from '@/lib/motion'
import TaskRow from '@/components/tasks/TaskRow'

type FilterTab = 'forMe' | 'upcoming' | 'done'

export default function TasksPage() {
  const { tasks, createTask, toggleComplete, updateTask, isLoading } = useTasks()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('forMe')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [stableNow] = useState(() => new Date())

  // ── Filter tasks per active filter ───────────────────────────────────────
  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'forMe':
        return tasks.filter((t) => t.status !== 'done' && t.status !== 'dropped')
      case 'upcoming': {
        const thirtyDays = new Date(stableNow.getTime() + 30 * 24 * 60 * 60 * 1000)
        return tasks.filter(
          (t) =>
            t.status !== 'done' &&
            t.status !== 'dropped' &&
            t.dueDate &&
            new Date(t.dueDate) > stableNow &&
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
  }, [tasks, activeFilter, stableNow])

  // ── Sub-task counts ──────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await createTask({
      title,
      priority: 'medium',
      status: 'backlog',
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

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('laif:detail-task', { detail: { taskId: detailTaskId } }))
  }, [detailTaskId])

  const emptyText = activeFilter === 'forMe' ? copy.tasks.emptyStates.forMe
    : activeFilter === 'upcoming' ? copy.tasks.emptyStates.upcoming
    : activeFilter === 'done' ? copy.tasks.emptyStates.done : ''

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header area — always centered */}
      <div className="mx-auto w-full max-w-[720px] px-6 pt-8">
        {/* Title */}
        <h1 style={{ color: 'var(--text-primary)', fontSize: 42, fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em', marginBottom: 8 }}>
          {copy.tasks.title}
        </h1>

        {/* Filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
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
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 500,
                  backgroundColor: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-muted)',
                  border: active ? 'none' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background-color 150ms ease, color 150ms ease, transform 150ms ease',
                }}
              >
                {tab.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ─── Content area ─── */}

      {/* List view — centered, with new task row */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[720px] px-6 pb-8">
          {/* New task row */}
          <div style={{ marginBottom: 20 }}>
            <div
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
              onClick={() => inputRef.current?.focus()}
            >
              <Plus size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewTask()
                  if (e.key === 'Escape') { setNewTaskTitle(''); inputRef.current?.blur() }
                }}
                placeholder="New task"
                aria-label="New task title"
                style={{
                  flex: 1, background: 'transparent', outline: 'none', border: 'none',
                  fontSize: 15, fontWeight: 500, color: 'var(--text-primary)',
                  fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-faint)' }}>{'\u2303N'}</span>
            </div>
          </div>

          {/* Task list */}
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
        </div>
      </div>
    </div>
  )
}
