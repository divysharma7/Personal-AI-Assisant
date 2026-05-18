'use client'

import { useCallback, useRef, useState } from 'react'
import {
  SlidersHorizontal,
  MoreVertical,
  BookOpen,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useItems } from '@/hooks/useItems'
import type { Task } from '@/types'
import { formatDate } from '@/lib/utils'
import { isToday, isTomorrow, isBefore, startOfToday } from 'date-fns'

export default function TodayPage() {
  const { items, addItem, updateItem } = useItems()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [overdueOpen, setOverdueOpen] = useState(true)
  const [todayOpen, setTodayOpen] = useState(true)
  const [tomorrowOpen, setTomorrowOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const tasks = items.filter((i): i is Task => i.type === 'task' && i.status !== 'done')

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), startOfToday())
  )
  const todayTasks = tasks.filter(
    (t) => t.dueDate && isToday(new Date(t.dueDate))
  )
  const tomorrowTasks = tasks.filter(
    (t) => t.dueDate && isTomorrow(new Date(t.dueDate))
  )

  const handleNewTask = useCallback(async () => {
    const title = newTaskTitle.trim()
    if (!title) return
    await addItem('task', {
      title,
      priority: 'medium',
      status: 'todo',
      dueDate: new Date().toISOString(),
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

  const renderGroup = (
    label: string,
    tasks: Task[],
    open: boolean,
    setOpen: (v: boolean) => void,
    color?: string
  ) => (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="mb-1 flex items-center gap-2 px-4 py-1 cursor-pointer"
        style={{ color: color || 'var(--text-muted)' }}
      >
        {open ? (
          <ChevronDown size={14} strokeWidth={1.5} />
        ) : (
          <ChevronRight size={14} strokeWidth={1.5} />
        )}
        <span className="text-sm font-semibold">
          {label} ({tasks.length})
        </span>
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {tasks.map((task) => (
            <div
              key={task._id}
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
                  border: '1.5px solid var(--border)',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {formatDate(task.dueDate, 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="px-4 py-2 text-xs" style={{ color: 'var(--text-faint)' }}>
              No tasks
            </p>
          )}
        </div>
      )}
    </div>
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

      {/* Title */}
      <h1
        className="mb-5 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.today.title}
      </h1>

      {/* Tip banner */}
      {!tipDismissed && (
        <div
          className="mb-5 flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'rgba(99, 91, 255, 0.08)',
            border: '1px solid rgba(99, 91, 255, 0.3)',
          }}
        >
          <BookOpen size={18} className="flex-shrink-0" style={{ color: '#635BFF' }} />
          <p className="flex-1 text-sm" style={{ color: '#635BFF' }}>
            {copy.today.tipBanner}
          </p>
          <button
            onClick={() => setTipDismissed(true)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: '#635BFF' }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* New task row */}
      <div
        className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
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

      {/* Groups */}
      {overdueTasks.length > 0 &&
        renderGroup(
          copy.today.groups.overdue,
          overdueTasks,
          overdueOpen,
          setOverdueOpen,
          'var(--priority-high)'
        )}
      {renderGroup(copy.today.groups.today, todayTasks, todayOpen, setTodayOpen)}
      {renderGroup(copy.today.groups.tomorrow, tomorrowTasks, tomorrowOpen, setTomorrowOpen)}
    </div>
  )
}
