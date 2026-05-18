'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SlidersHorizontal,
  MoreVertical,
  BookOpen,
  X,
  Plus,
  Calendar,
  BarChart3,
  Tag,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { useItems } from '@/hooks/useItems'
import type { Task } from '@/types'
import { formatDate } from '@/lib/utils'

/* ── Completion sound ── */
const TONES = [523.25, 587.33, 659.25, 783.99, 880.0]

function playCompletionSound() {
  try {
    const ctx = new AudioContext()
    const freq = TONES[Math.floor(Math.random() * TONES.length)]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.12
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

export default function InboxPage() {
  const { items, addItem, updateItem } = useItems()
  const [tipDismissed, setTipDismissed] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskFocused, setNewTaskFocused] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Tasks only
  const tasks = items.filter((i): i is Task => i.type === 'task')
  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  // ^N shortcut to focus new task row
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
    inputRef.current?.blur()
  }, [newTaskTitle, addItem])

  const handleToggleTask = useCallback(
    async (task: Task) => {
      const newStatus = task.status === 'done' ? 'todo' : 'done'
      if (newStatus === 'done') playCompletionSound()
      await updateItem('task', task._id!, { status: newStatus })
    },
    [updateItem]
  )

  return (
    <div className="flex flex-col px-6 py-5">
      {/* ── Header ── */}
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

      {/* ── Title ── */}
      <h1
        className="mb-5 text-[32px] font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {copy.inbox.title}
      </h1>

      {/* ── Tip banner ── */}
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
            {copy.inbox.tipBanner}
          </p>
          <button
            onClick={() => setTipDismissed(true)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: '#635BFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* ── New task row ── */}
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
            style={{
              color: 'var(--text-primary)',
            }}
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

        {/* Sub-icons row (visible when focused) */}
        {newTaskFocused && (
          <div className="mt-2 flex items-center gap-2 pl-8">
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Calendar size={15} strokeWidth={1.5} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <BarChart3 size={15} strokeWidth={1.5} />
            </button>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-faint)' }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Tag size={15} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* ── Active tasks ── */}
      <div className="flex flex-col gap-0.5">
        {activeTasks.map((task) => (
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
            {/* Checkbox */}
            <button
              onClick={() => handleToggleTask(task)}
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
            {/* Content */}
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
        {activeTasks.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-faint)' }}>
            {copy.list.emptyBlockPlaceholder}
          </p>
        )}
      </div>

      {/* ── Done section ── */}
      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setDoneOpen(!doneOpen)}
            className="mb-2 flex items-center gap-2 px-4 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            {doneOpen ? (
              <ChevronDown size={14} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium">
              {copy.task.completedCta} ({doneTasks.length})
            </span>
          </button>
          {doneOpen && (
            <div className="flex flex-col gap-0.5">
              {doneTasks.map((task) => (
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
                    onClick={() => handleToggleTask(task)}
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--accent)',
                      border: 'none',
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} className="text-white" />
                  </button>
                  <span
                    className="text-[15px] line-through"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
