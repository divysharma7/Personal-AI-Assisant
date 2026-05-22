'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Calendar, Flag, List, Trash2, ArrowRight } from 'lucide-react'
import { motionTokens } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import type { CalendarEvent } from './types'

interface EventPopoverProps {
  event: CalendarEvent
  anchor: { x: number; y: number }
  onClose: () => void
  onOpenDetail: (taskId: string) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high, #ef4444)',
  medium: 'var(--priority-medium, #f59e0b)',
  low: 'var(--priority-low, #6b66da)',
}

const PRIORITY_CYCLE = ['medium', 'high', 'low'] as const

function formatEventTime(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const today = new Date()
  const isToday = s.getDate() === today.getDate() && s.getMonth() === today.getMonth() && s.getFullYear() === today.getFullYear()
  const dayLabel = isToday ? 'Today' : s.toLocaleDateString('en-US', { weekday: 'short' })
  const dateStr = s.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const startTime = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  const endTime = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${dayLabel}, ${dateStr}, ${startTime} - ${endTime}`
}

const btnHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))' },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent' },
  onFocus: (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))' },
  onBlur: (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent' },
}

export default function EventPopover({ event, anchor, onClose, onOpenDetail }: EventPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { tasks, updateTask, deleteTask } = useTasks()

  const task = tasks.find(t => t._id === event.id)
  const subtasks = tasks.filter(t => t.parentId === event.id)
  const priorityColor = PRIORITY_COLORS[task?.priority || event.priority || 'medium']

  // Close on outside click + Escape
  useEffect(() => {
    const click = (e: MouseEvent) => { if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose() }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc) }
  }, [onClose])

  // Close if task deleted externally
  useEffect(() => {
    if (!tasks.find(t => t._id === event.id)) onClose()
  }, [tasks, event.id, onClose])

  const handleToggle = useCallback(() => {
    if (!task) return
    updateTask(task._id, { status: task.status === 'done' ? 'todo' : 'done' })
  }, [task, updateTask])

  const handleCyclePriority = useCallback(() => {
    if (!task) return
    const current = task.priority || 'medium'
    const idx = PRIORITY_CYCLE.indexOf(current as typeof PRIORITY_CYCLE[number])
    const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
    updateTask(task._id, { priority: next })
  }, [task, updateTask])

  const handleDelete = useCallback(() => {
    if (!task) return
    deleteTask(task._id)
    onClose()
  }, [task, deleteTask, onClose])

  // Smart positioning — flip up if near bottom
  let top = anchor.y + 8
  const popoverHeight = 300
  if (top + popoverHeight > window.innerHeight - 16) {
    top = Math.max(8, anchor.y - popoverHeight - 8)
  }
  const left = Math.min(Math.max(8, anchor.x), window.innerWidth - 400)

  // Error state: task not found
  if (!task) {
    return (
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
        transition={{ duration: motionTokens.duration.fast }}
        style={{
          position: 'fixed', top, left, zIndex: 9999, width: 380, borderRadius: 14,
          backgroundColor: 'var(--bg-pane-2, #2a293b)',
          border: '1px solid var(--overlay-2, var(--border))',
          boxShadow: 'var(--shadow-elevated, 0 12px 40px rgba(0,0,0,0.3))',
          padding: 20, textAlign: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Task not found or has been deleted</p>
      </motion.div>
    )
  }

  const isDone = task.status === 'done'

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      transition={{ duration: motionTokens.duration.fast }}
      style={{
        position: 'fixed', top, left, zIndex: 9999,
        width: 380, borderRadius: 14,
        backgroundColor: 'var(--bg-pane-2, #2a293b)',
        border: '1px solid var(--overlay-2, var(--border))',
        boxShadow: 'var(--shadow-elevated, 0 12px 40px rgba(0,0,0,0.3))',
        fontFamily: 'Inter, system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ── Header: checkbox | time | priority flag ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        {/* Checkbox — 28px hit area */}
        <button
          onClick={handleToggle}
          tabIndex={0}
          style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            border: isDone ? 'none' : `2px solid ${priorityColor}`,
            backgroundColor: isDone ? priorityColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background-color 180ms ease-out, border-color 180ms ease-out',
          }}
        >
          {isDone && <Check size={14} strokeWidth={2.5} color="#fff" />}
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)' }} />

        {/* Time — tabular-nums */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {formatEventTime(event.start, event.end)}
          </span>
        </div>

        {/* Priority flag — clickable, cycles through priorities */}
        <button
          onClick={handleCyclePriority}
          title={`Priority: ${task.priority || 'medium'} (click to change)`}
          tabIndex={0}
          style={{
            flexShrink: 0, background: 'none', border: 'none',
            cursor: 'pointer', padding: 4, borderRadius: 4,
            transition: 'background-color 180ms ease-out',
          }}
          {...btnHover}
        >
          <Flag size={16} strokeWidth={1.5} fill={priorityColor} style={{ color: priorityColor }} />
        </button>
      </div>

      {/* ── Title + subtasks ── */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: subtasks.length > 0 ? 10 : 0 }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0,
            textDecoration: isDone ? 'line-through' : 'none',
            textDecorationColor: priorityColor,
          }}>
            {event.title}
          </h3>
          <button
            onClick={() => onOpenDetail(event.id)}
            tabIndex={0}
            style={{
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none', color: 'var(--text-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out',
            }}
            title="Open full details"
            {...btnHover}
          >
            <List size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Subtasks */}
        {subtasks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subtasks.map(sub => (
              <div key={sub._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => updateTask(sub._id, { status: sub.status === 'done' ? 'todo' : 'done' })}
                  tabIndex={0}
                  style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    border: sub.status === 'done' ? 'none' : '1.5px solid var(--overlay-3, #605f6a)',
                    backgroundColor: sub.status === 'done' ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background-color 180ms ease-out',
                  }}
                >
                  {sub.status === 'done' && <Check size={12} strokeWidth={2.5} color="#fff" />}
                </button>
                <span style={{
                  fontSize: 14, color: sub.status === 'done' ? 'var(--text-faint)' : 'var(--text-primary)',
                  textDecoration: sub.status === 'done' ? 'line-through' : 'none',
                }}>
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer: list + actions ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderTop: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          {event.listName || 'Inbox'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => onOpenDetail(event.id)}
            tabIndex={0}
            title="Open details"
            style={{
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none', color: 'var(--text-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out',
            }}
            {...btnHover}
          >
            <ArrowRight size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleDelete}
            tabIndex={0}
            title="Delete"
            style={{
              width: 32, height: 32, borderRadius: 6, cursor: 'pointer',
              backgroundColor: 'transparent', border: 'none', color: 'var(--text-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 180ms ease-out, color 180ms ease-out',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
            onFocus={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
            onBlur={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-faint)' }}
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
