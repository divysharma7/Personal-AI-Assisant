'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { slideFromRight, ease, motionTokens } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'
import { useLists } from '@/hooks/useLists'
import type { TaskRecord } from '@/hooks/useTasks'
import type { ListDoc } from '@/hooks/useLists'
import RRuleEditor from './RRuleEditor'

// ── Priority config (laif uses string priorities) ──

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6b66da' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
] as const

// ── Date/time helpers ──

function toDateTimeLocal(isoStr: string | null | undefined): string {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day}T${h}:${mi}`
}

function fromDateTimeLocal(dtLocal: string): string {
  if (!dtLocal) return ''
  return new Date(dtLocal).toISOString()
}

// ── Seed data for creating from QuickAdd ──

export interface TaskEditorSeed {
  title: string
  listId: string | null
  priority: string
  scheduledStart: string
  scheduledEnd: string
  isAllDay: boolean
}

interface TaskEditorSheetProps {
  /** Existing task to edit (null for "seed" creation mode) */
  task: TaskRecord | null
  /** Seed data when opening from QuickAdd */
  seed: TaskEditorSeed | null
  open: boolean
  onClose: () => void
}

// ── Inline style helpers ──

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-faint)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: 4,
}

const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'Inter, system-ui, sans-serif',
  transition: 'border-color 150ms ease',
}

const btnHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))' },
  onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.backgroundColor = 'transparent' },
}

export default function TaskEditorSheet({ task, seed, open, onClose }: TaskEditorSheetProps) {
  const { updateTask, deleteTask, createTask } = useTasks()
  const { lists } = useLists()
  const sheetRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [listId, setListId] = useState<string>('')
  const [priority, setPriority] = useState<string>('medium')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [isAllDay, setIsAllDay] = useState(false)
  const [rrule, setRrule] = useState<string | null>(null)

  // Reset form when task or seed changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setListId(task.listId || '')
      setPriority(task.priority || 'medium')
      setStartAt(toDateTimeLocal(task.scheduledStart))
      setEndAt(toDateTimeLocal(task.scheduledEnd))
      setIsAllDay(false)
      setRrule(task.repeat || null)
    } else if (seed) {
      setTitle(seed.title || '')
      setDescription('')
      setListId(seed.listId || '')
      setPriority(seed.priority || 'medium')
      setStartAt(toDateTimeLocal(seed.scheduledStart))
      setEndAt(toDateTimeLocal(seed.scheduledEnd))
      setIsAllDay(seed.isAllDay)
      setRrule(null)
    }
  }, [task, seed])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      onClose()
      return
    }

    const patch: Partial<TaskRecord> = {
      title: trimmedTitle,
      description: description || undefined,
      listId: listId || null,
      priority,
      scheduledStart: startAt ? fromDateTimeLocal(startAt) : null,
      scheduledEnd: endAt ? fromDateTimeLocal(endAt) : null,
      repeat: rrule || null,
    }

    if (task) {
      await updateTask(task._id, patch)
    } else {
      await createTask({
        ...patch,
        status: 'todo',
        dueDate: startAt ? fromDateTimeLocal(startAt) : null,
      })
    }
    onClose()
  }, [task, title, description, listId, priority, startAt, endAt, rrule, updateTask, createTask, onClose])

  const handleDelete = useCallback(async () => {
    if (!task) return
    await deleteTask(task._id)
    onClose()
  }, [task, deleteTask, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 998,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            {...slideFromRight}
            transition={ease.medium}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 400,
              zIndex: 999,
              backgroundColor: 'var(--bg-pane, #1e1e2e)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '0 0 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {task ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
                  backgroundColor: 'transparent', border: 'none',
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background-color 150ms ease',
                }}
                {...btnHover}
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Title */}
              <div>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task title"
                  autoFocus
                  style={{
                    ...inputBaseStyle,
                    fontSize: 18,
                    fontWeight: 700,
                    padding: '8px 0',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    borderRadius: 0,
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add description..."
                  rows={3}
                  style={{
                    ...inputBaseStyle,
                    fontSize: 13,
                    padding: '8px 12px',
                    resize: 'vertical',
                    minHeight: 60,
                  }}
                />
              </div>

              {/* Separator */}
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

              {/* List selector */}
              <div>
                <div style={labelStyle}>List</div>
                <select
                  value={listId}
                  onChange={e => setListId(e.target.value)}
                  style={{
                    ...inputBaseStyle,
                    height: 34,
                    fontSize: 13,
                    padding: '0 10px',
                    cursor: 'pointer',
                    appearance: 'auto',
                  }}
                >
                  <option value="">No list</option>
                  {(lists as ListDoc[]).map(list => (
                    <option key={list._id} value={list._id}>
                      {list.icon ? `${list.icon} ` : ''}{list.title || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority selector */}
              <div>
                <div style={labelStyle}>Priority</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {PRIORITY_OPTIONS.map(opt => {
                    const active = priority === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: active ? `1px solid ${opt.color}` : '1px solid transparent',
                          backgroundColor: active ? `${opt.color}22` : 'var(--overlay-2, rgba(108,108,158,0.08))',
                          color: active ? opt.color : 'var(--text-muted)',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: opt.color,
                          opacity: active ? 1 : 0.5,
                        }} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Separator */}
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

              {/* All-day toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>All day</span>
                <button
                  onClick={() => setIsAllDay(!isAllDay)}
                  style={{
                    position: 'relative',
                    height: 20,
                    width: 36,
                    borderRadius: 999,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: isAllDay ? 'var(--accent)' : 'var(--overlay-3, #605f6a)',
                    transition: 'background-color 150ms ease',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 2,
                    height: 16,
                    width: 16,
                    borderRadius: 999,
                    backgroundColor: '#fff',
                    transition: 'transform 150ms ease',
                    transform: isAllDay ? 'translateX(18px)' : 'translateX(2px)',
                  }} />
                </button>
              </div>

              {/* Start date/time */}
              <div>
                <div style={labelStyle}>Start</div>
                <input
                  type={isAllDay ? 'date' : 'datetime-local'}
                  value={isAllDay ? startAt.split('T')[0] : startAt}
                  onChange={e => {
                    if (isAllDay) {
                      setStartAt(e.target.value + 'T00:00')
                    } else {
                      setStartAt(e.target.value)
                    }
                  }}
                  style={{
                    ...inputBaseStyle,
                    height: 34,
                    fontSize: 13,
                    padding: '0 10px',
                  }}
                />
              </div>

              {/* End date/time */}
              <div>
                <div style={labelStyle}>End</div>
                <input
                  type={isAllDay ? 'date' : 'datetime-local'}
                  value={isAllDay ? endAt.split('T')[0] : endAt}
                  onChange={e => {
                    if (isAllDay) {
                      setEndAt(e.target.value + 'T23:59')
                    } else {
                      setEndAt(e.target.value)
                    }
                  }}
                  style={{
                    ...inputBaseStyle,
                    height: 34,
                    fontSize: 13,
                    padding: '0 10px',
                  }}
                />
              </div>

              {/* Separator */}
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

              {/* RRULE editor */}
              <RRuleEditor value={rrule} onChange={setRrule} />
            </div>

            {/* Footer: Save + Delete */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {task ? 'Save' : 'Create'}
              </button>
              {task && (
                <button
                  onClick={handleDelete}
                  style={{
                    height: 36,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.3)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background-color 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
