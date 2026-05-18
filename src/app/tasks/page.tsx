'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SlidersHorizontal,
  MoreVertical,
  Plus,
  List,
  LayoutGrid,
  Grid3X3,
  Check,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useItems } from '@/hooks/useItems'
import type { Task } from '@/types'
import { formatDate } from '@/lib/utils'
import { fadeSlideUp, buttonPress, stagger, ease } from '@/lib/motion'

type FilterTab = 'forMe' | 'upcoming' | 'done'
type ViewMode = 'List' | 'Board' | 'Matrix'

const VIEW_ICONS = {
  List,
  Board: LayoutGrid,
  Matrix: Grid3X3,
} as const

export default function TasksPage() {
  const { items, addItem, updateItem } = useItems()
  const [activeFilter, setActiveFilter] = useState<FilterTab>('forMe')
  const [viewMode, setViewMode] = useState<ViewMode>('List')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const tasks = items.filter((i): i is Task => i.type === 'task')

  const filteredTasks = (() => {
    switch (activeFilter) {
      case 'forMe':
        return tasks.filter((t) => t.status !== 'done')
      case 'upcoming':
        return tasks.filter((t) => t.status !== 'done' && t.dueDate)
      case 'done':
        return tasks.filter((t) => t.status === 'done')
      default:
        return tasks
    }
  })()

  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await addItem('task', {
      title,
      priority: 'medium',
      status: 'todo',
      color: '#34d399',
    })
    setNewTaskTitle('')
  }, [newTaskTitle, addItem])

  const handleToggle = useCallback(
    async (task: Task) => {
      await updateItem('task', task._id!, {
        status: task.status === 'done' ? 'todo' : 'done',
      })
    },
    [updateItem]
  )

  return (
    <div className="flex flex-col px-6 py-5">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between">
        <div />
        <div className="flex items-center gap-2">
          <button
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
          </button>
          <button
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
          </button>
        </div>
      </div>

      {/* Title + actions */}
      <div className="mb-5 flex items-center justify-between">
        <h1
          className="text-[32px] font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {copy.tasks.title}
        </h1>
        <div className="flex items-center gap-3">
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

          {/* New task button */}
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={14} strokeWidth={2} />
            <span>{copy.newTask.placeholder}</span>
          </button>
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
        ).map((tab) => (
          <motion.button
            key={tab.key}
            {...buttonPress}
            onClick={() => setActiveFilter(tab.key)}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
            style={{
              backgroundColor:
                activeFilter === tab.key ? 'var(--bg-hover)' : 'transparent',
              color:
                activeFilter === tab.key
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </motion.button>
        ))}
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

      {/* Task list */}
      <motion.div className="flex flex-col gap-0.5" {...stagger()}>
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task._id}
              {...fadeSlideUp}
              transition={ease.normal}
              layout
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-150 cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <button
                onClick={() => handleToggle(task)}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
                style={{
                  border:
                    task.status === 'done'
                      ? 'none'
                      : '1.5px solid var(--border)',
                  backgroundColor:
                    task.status === 'done' ? 'var(--accent)' : 'transparent',
                }}
              >
                {task.status === 'done' && (
                  <Check size={12} strokeWidth={2.5} className="text-white" />
                )}
              </button>
              <div className="flex flex-1 flex-col gap-0.5">
                <span
                  className="text-[15px] font-medium"
                  style={{
                    color:
                      task.status === 'done'
                        ? 'var(--text-faint)'
                        : 'var(--text-primary)',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {formatDate(task.dueDate, 'MMM d')}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            No tasks to show
          </p>
        )}
      </motion.div>
    </div>
  )
}
