'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag, Inbox } from 'lucide-react'
import { springs } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import { useLists } from '@/hooks/useLists'
import type { ListDoc } from '@/hooks/useLists'

// ── Priority options ──

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6b66da' },
  { value: 'medium', label: 'Med', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
] as const

// ── Types ──

export interface QuickAddData {
  scheduledStart: string
  scheduledEnd: string
  isAllDay: boolean
  anchor: { x: number; y: number }
}

interface QuickAddPopoverProps {
  data: QuickAddData | null
  onClose: () => void
  onOpenEditor: (taskData: {
    title: string
    listId: string | null
    priority: string
    scheduledStart: string
    scheduledEnd: string
    isAllDay: boolean
  }) => void
}

/**
 * Format a date for the popover header: "01/08/2026"
 */
function formatPopoverDate(isoStr: string): string {
  const d = new Date(isoStr)
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const dd = d.getDate().toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}

/**
 * Compute days until a date from today.
 */
function daysUntil(isoStr: string): number {
  const target = new Date(isoStr)
  target.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function QuickAddPopover({ data, onClose, onOpenEditor }: QuickAddPopoverProps) {
  const [title, setTitle] = useState('')
  const [listId, setListId] = useState<string>('')
  const [priority, setPriority] = useState<string>('medium')
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const { createTask } = useTasks()
  const { lists } = useLists()

  // Reset state when popover opens
  useEffect(() => {
    if (data) {
      setTitle('')
      setListId('')
      setPriority('medium')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [data])

  // Outside click
  useEffect(() => {
    if (!data) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [data, onClose])

  const handleSave = useCallback(async () => {
    if (!data) return
    const trimmed = title.trim()
    if (!trimmed) {
      onClose()
      return
    }

    await createTask({
      title: trimmed,
      listId: listId || null,
      priority,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      dueDate: data.scheduledStart,
      status: 'todo',
    })
    onClose()
  }, [data, title, listId, priority, createTask, onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [handleSave, onClose]
  )

  const handleMoreOptions = useCallback(() => {
    if (!data) return
    onOpenEditor({
      title: title.trim(),
      listId: listId || null,
      priority,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      isAllDay: data.isAllDay,
    })
    onClose()
  }, [data, title, listId, priority, onOpenEditor, onClose])

  if (!data) return null

  // Smart positioning
  const popoverWidth = 300
  const popoverHeight = 200
  let top = data.anchor.y
  let left = data.anchor.x + 8

  if (left + popoverWidth > window.innerWidth - 16) {
    left = data.anchor.x - popoverWidth - 8
  }
  if (top + popoverHeight > window.innerHeight - 16) {
    top = Math.max(8, window.innerHeight - popoverHeight - 16)
  }

  const dateStr = formatPopoverDate(data.scheduledStart)
  const days = daysUntil(data.scheduledStart)
  const daysLabel = days === 0 ? 'today' : days === 1 ? '1d left' : days > 0 ? `${days}d left` : `${Math.abs(days)}d ago`

  // Selected list info
  const selectedList = listId
    ? (lists as ListDoc[]).find((l) => l._id === listId)
    : null

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={springs.gentle}
          style={{
            position: 'fixed',
            top,
            left,
            width: popoverWidth,
            zIndex: 9999,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: 'var(--bg-pane)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Header: date + days left + priority flag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {dateStr}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-faint)',
                  fontWeight: 400,
                }}
              >
                {daysLabel}
              </span>
            </div>

            {/* Priority flag toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {PRIORITY_OPTIONS.map((opt) => {
                const active = priority === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    title={opt.label}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: active ? `${opt.color}18` : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'background-color 120ms ease',
                    }}
                  >
                    <Flag
                      size={14}
                      strokeWidth={1.5}
                      style={{
                        color: opt.color,
                        opacity: active ? 1 : 0.3,
                        transition: 'opacity 150ms ease',
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main input area */}
          <div style={{ padding: '12px 14px 8px 14px' }}>
            <input
              ref={inputRef}
              placeholder="What would you like to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--text-primary)',
                padding: 0,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />
          </div>

          {/* Footer: list selector + actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 14px 10px 14px',
              borderTop: '1px solid var(--border)',
            }}
          >
            {/* List selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Inbox size={14} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
              <select
                value={listId}
                onChange={(e) => setListId(e.target.value)}
                style={{
                  height: 24,
                  fontSize: 12,
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: selectedList ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 500,
                  padding: 0,
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <option value="">Inbox</option>
                {(lists as ListDoc[]).map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.icon ? `${list.icon} ` : ''}{list.title || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handleMoreOptions}
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'color 120ms ease, background-color 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)'
                  e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                More
              </button>
              <button
                onClick={handleSave}
                style={{
                  height: 26,
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  transition: 'opacity 150ms ease',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
