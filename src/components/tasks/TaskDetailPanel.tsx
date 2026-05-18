'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  X, Check, MoreVertical, Calendar, Tag, List as ListIcon,
  ArrowRight, Link2, CircleCheck, Trash2, CornerDownLeft,
  BarChart3,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { smooth, snappy, slideFromRight, taskCompletion } from '@/shared/design-system'
import DatePopover from '@/components/popovers/DatePopover'
import PriorityPopover, { type Priority } from '@/components/popovers/PriorityPopover'
import LabelPopover, { type LabelItem } from '@/components/popovers/LabelPopover'
import AssigneePopover, { type AssigneeUser, UserAvatar } from '@/components/popovers/AssigneePopover'

const RichEditor = dynamic(() => import('@/shared/editor/RichEditor'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskData {
  _id: string
  title: string
  completed: boolean
  completedAt?: string | null
  dueDate?: string | null
  repeat?: string | null
  priority: Priority
  labelIds: string[]
  assigneeId?: string | null
  notes?: object | null
  tags?: string[]
  comments?: CommentData[]
  createdBy?: string
  createdAt?: string
  listName?: string
}

interface CommentData {
  _id?: string
  text: string
  authorName?: string
  authorAvatar?: string
  createdAt?: string
}

interface TaskDetailPanelProps {
  taskId: string
  onClose: () => void
  onOpenSubtask?: (subtaskId: string) => void
  breadcrumb?: { title: string; onClick: () => void } | null
  labels?: LabelItem[]
  users?: AssigneeUser[]
  collapsed?: boolean
  onCollapsedClick?: () => void
}

// ─── Overflow Menu ───────────────────────────────────────────────────────────

function OverflowMenu({
  open,
  onClose,
  onAction,
  anchorRect,
}: {
  open: boolean
  onClose: () => void
  onAction: (action: string) => void
  anchorRect: DOMRect | null
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  const top = anchorRect ? anchorRect.bottom + 4 : 0
  const right = anchorRect ? window.innerWidth - anchorRect.right : 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          className="popover"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={snappy}
          style={{ position: 'fixed', top, right, width: 220, zIndex: 'var(--z-popover)' as unknown as number, padding: 4 }}
        >
          <button className="popover-item" onClick={() => { onAction('unsubscribe'); onClose() }} style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}>
            <ArrowRight size={14} /> <span>Unsubscribe</span>
          </button>
          <button className="popover-item" onClick={() => { onAction('copyLink'); onClose() }} style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}>
            <Link2 size={14} /> <span>Copy link</span>
          </button>
          <button className="popover-item" onClick={() => { onAction('markAllIncomplete'); onClose() }} style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8 }}>
            <CircleCheck size={14} /> <span>Mark all incomplete</span>
          </button>
          <button className="popover-item" onClick={() => { onAction('deleteTask'); onClose() }} style={{ width: '100%', border: 'none', background: 'transparent', borderRadius: 8, color: 'var(--color-danger)' }}>
            <Trash2 size={14} /> <span>Delete task</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TaskDetailPanel({
  taskId,
  onClose,
  onOpenSubtask,
  breadcrumb,
  labels: allLabels = [],
  users = [],
  collapsed = false,
  onCollapsedClick,
}: TaskDetailPanelProps) {
  // Task data
  const [task, setTask] = useState<TaskData | null>(null)
  const [loading, setLoading] = useState(true)

  // Editable fields
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState<object | null>(null)
  const [commentInput, setCommentInput] = useState('')

  // Popovers
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false)
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false)
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [dateAnchor, setDateAnchor] = useState<DOMRect | null>(null)
  const [priorityAnchor, setPriorityAnchor] = useState<DOMRect | null>(null)
  const [labelAnchor, setLabelAnchor] = useState<DOMRect | null>(null)
  const [assigneeAnchor, setAssigneeAnchor] = useState<DOMRect | null>(null)
  const [overflowAnchor, setOverflowAnchor] = useState<DOMRect | null>(null)

  // Refs
  const saveTimeout = useRef<NodeJS.Timeout>()
  const panelRef = useRef<HTMLDivElement>(null)
  const overflowBtnRef = useRef<HTMLButtonElement>(null)

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/tasks/${taskId}`)
        if (res.ok && !cancelled) {
          const data = await res.json()
          const taskData: TaskData = {
            _id: data._id,
            title: data.title || '',
            completed: data.status === 'done',
            completedAt: data.completedAt || null,
            dueDate: data.dueDate || null,
            repeat: data.repeat || null,
            priority: data.priority === 'high' || data.priority === 'medium' || data.priority === 'low' ? data.priority : null,
            labelIds: data.labelIds || [],
            assigneeId: data.assigneeId || null,
            notes: data.notes || null,
            tags: data.tags || [],
            comments: data.comments || [],
            createdBy: data.createdBy || 'You',
            createdAt: data.createdAt,
            listName: data.listName,
          }
          setTask(taskData)
          setTitle(taskData.title)
          setNotes(taskData.notes ?? null)
        }
      } catch (e) {
        console.error('Failed to fetch task', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [taskId])

  // ── Debounced save ───────────────────────────────────────────────────────
  const saveField = useCallback((field: string, value: unknown) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        })
      } catch (e) {
        console.error('Failed to save field', e)
      }
    }, 500)
  }, [taskId])

  useEffect(() => {
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }
  }, [])

  // ── Title ───────────────────────────────────────────────────────────────
  const handleTitleBlur = useCallback(() => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== task?.title) {
      setTask(prev => prev ? { ...prev, title: trimmed } : prev)
      saveField('title', trimmed)
    }
  }, [title, task?.title, saveField])

  // ── Completion ──────────────────────────────────────────────────────────
  const toggleComplete = useCallback(() => {
    if (!task) return
    const newCompleted = !task.completed
    setTask(prev => prev ? { ...prev, completed: newCompleted } : prev)
    saveField('status', newCompleted ? 'done' : 'todo')
  }, [task, saveField])

  // ── Date ───────────────────────────────────────────────────────────────
  const handleDateSelect = useCallback((date: Date | null, repeat?: string | null) => {
    if (!task) return
    const iso = date ? date.toISOString() : undefined
    setTask(prev => prev ? { ...prev, dueDate: iso || null, repeat: repeat || null } : prev)
    saveField('dueDate', iso)
    if (repeat !== undefined) saveField('repeat', repeat)
  }, [task, saveField])

  // ── Priority ────────────────────────────────────────────────────────────
  const handlePrioritySelect = useCallback((priority: Priority) => {
    if (!task) return
    setTask(prev => prev ? { ...prev, priority } : prev)
    saveField('priority', priority || undefined)
  }, [task, saveField])

  // ── Labels ──────────────────────────────────────────────────────────────
  const handleLabelToggle = useCallback((labelId: string) => {
    if (!task) return
    const newIds = task.labelIds.includes(labelId)
      ? task.labelIds.filter(id => id !== labelId)
      : [...task.labelIds, labelId]
    setTask(prev => prev ? { ...prev, labelIds: newIds } : prev)
    saveField('labelIds', newIds)
  }, [task, saveField])

  const handleLabelCreate = useCallback(async (name: string) => {
    try {
      const res = await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ownerId: 'default' }),
      })
      if (res.ok) {
        const label = await res.json()
        handleLabelToggle(label._id)
      }
    } catch (e) {
      console.error('Failed to create label', e)
    }
  }, [handleLabelToggle])

  // ── Assignee ────────────────────────────────────────────────────────────
  const handleAssigneeSelect = useCallback((userId: string) => {
    if (!task) return
    setTask(prev => prev ? { ...prev, assigneeId: userId } : prev)
    saveField('assigneeId', userId)
  }, [task, saveField])

  // ── Notes ───────────────────────────────────────────────────────────────
  const handleNotesUpdate = useCallback((json: object) => {
    setNotes(json)
    saveField('notes', json)
  }, [saveField])

  // ── Comments ────────────────────────────────────────────────────────────
  const handleCommentSubmit = useCallback(async () => {
    if (!commentInput.trim() || !task) return
    const comment = { text: commentInput.trim(), createdAt: new Date().toISOString() }
    setTask(prev => prev ? {
      ...prev,
      comments: [...(prev.comments || []), comment],
    } : prev)
    setCommentInput('')

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: [...(task.comments || []), comment] }),
      })
    } catch (e) {
      console.error('Failed to post comment', e)
    }
  }, [commentInput, task, taskId])

  // ── Overflow actions ────────────────────────────────────────────────────
  const handleOverflowAction = useCallback(async (action: string) => {
    if (action === 'copyLink') {
      await navigator.clipboard?.writeText(`${window.location.origin}/tasks/${taskId}`)
    } else if (action === 'deleteTask') {
      try {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
        onClose()
      } catch (e) {
        console.error('Failed to delete task', e)
      }
    } else if (action === 'markAllIncomplete') {
      if (task) {
        setTask(prev => prev ? { ...prev, completed: false } : prev)
        saveField('status', 'todo')
      }
    }
  }, [taskId, task, saveField, onClose])

  // ── Keyboard: Escape ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Close popovers first, then panel
        if (datePopoverOpen) { setDatePopoverOpen(false); return }
        if (priorityPopoverOpen) { setPriorityPopoverOpen(false); return }
        if (labelPopoverOpen) { setLabelPopoverOpen(false); return }
        if (assigneePopoverOpen) { setAssigneePopoverOpen(false); return }
        if (overflowOpen) { setOverflowOpen(false); return }
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, datePopoverOpen, priorityPopoverOpen, labelPopoverOpen, assigneePopoverOpen, overflowOpen])

  // ── Derived ─────────────────────────────────────────────────────────────
  const assignee = useMemo(() => {
    if (!task?.assigneeId) return null
    return users.find(u => u._id === task.assigneeId) || null
  }, [task?.assigneeId, users])

  const appliedLabels = useMemo(() => {
    if (!task?.labelIds?.length) return []
    return allLabels.filter(l => task.labelIds.includes(l._id))
  }, [task?.labelIds, allLabels])

  const createdTimeAgo = useMemo(() => {
    if (!task?.createdAt) return ''
    try { return formatDistanceToNow(new Date(task.createdAt), { addSuffix: false }) + ' ago' }
    catch { return '' }
  }, [task?.createdAt])

  // ── Collapsed strip ─────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        exit={{ width: 0 }}
        transition={smooth}
        onClick={onCollapsedClick}
        style={{
          width: 64,
          height: '100%',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {/* Back arrow */}
        <button className="btn-icon" style={{ width: 32, height: 32, marginBottom: 8 }}>
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        {/* Rotated title */}
        <div
          style={{
            flex: 1,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxHeight: '100%',
            padding: '0 4px',
          }}
        >
          {task?.title || 'Task'}
        </div>
        {/* Overflow */}
        <button className="btn-icon" style={{ width: 32, height: 32, marginTop: 8 }}>
          <MoreVertical size={16} />
        </button>
      </motion.div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        variants={slideFromRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={smooth}
        style={{
          width: 420,
          height: '100%',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div className="spinner" />
      </motion.div>
    )
  }

  if (!task) {
    return (
      <motion.div
        variants={slideFromRight}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={smooth}
        style={{
          width: 420,
          height: '100%',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Task not found</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={panelRef}
      variants={slideFromRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={smooth}
      style={{
        width: 420,
        height: '100%',
        background: 'var(--bg)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Close */}
          <button className="btn-icon" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>

          {/* Complete pill */}
          <button
            className="pill-interactive"
            onClick={toggleComplete}
            style={{
              background: task.completed ? 'var(--color-danger)' : 'transparent',
              color: task.completed ? '#fff' : 'var(--text-2)',
              borderColor: task.completed ? 'transparent' : 'var(--border)',
              height: 32,
            }}
          >
            <Check size={14} />
            <span>{task.completed ? 'Completed' : 'Complete'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Color swatch */}
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-danger)' }} />

          {/* Overflow */}
          <button
            ref={overflowBtnRef}
            className="btn-icon"
            onClick={() => {
              setOverflowAnchor(overflowBtnRef.current?.getBoundingClientRect() || null)
              setOverflowOpen(!overflowOpen)
            }}
            style={{ width: 32, height: 32 }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Breadcrumb */}
        {breadcrumb && (
          <div style={{ padding: '0 20px 4px' }}>
            <button
              onClick={breadcrumb.onClick}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} />
              {breadcrumb.title}
            </button>
          </div>
        )}

        {/* Title row */}
        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLElement).blur() }}
            className={task.completed ? 'strike-through' : ''}
            style={{
              flex: 1,
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-1)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              lineHeight: 1.2,
              padding: 0,
            }}
            placeholder="Task title..."
          />
          {assignee && (
            <button
              onClick={(e) => {
                setAssigneeAnchor((e.target as HTMLElement).getBoundingClientRect())
                setAssigneePopoverOpen(true)
              }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0, paddingTop: 4 }}
            >
              <UserAvatar user={assignee} size={32} />
            </button>
          )}
        </div>

        {/* Chip strip */}
        <div style={{ padding: '8px 20px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {/* Date chip */}
          <button
            className="chip"
            onClick={(e) => {
              setDateAnchor((e.target as HTMLElement).getBoundingClientRect())
              setDatePopoverOpen(true)
            }}
          >
            <Calendar size={12} />
            <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM d, h:mm a') : 'Add date'}</span>
          </button>

          {/* Priority chip */}
          {task.priority && (
            <button
              className="chip"
              onClick={(e) => {
                setPriorityAnchor((e.target as HTMLElement).getBoundingClientRect())
                setPriorityPopoverOpen(true)
              }}
            >
              <BarChart3 size={12} style={{ color: task.priority === 'high' ? 'var(--priority-high)' : task.priority === 'medium' ? 'var(--priority-medium)' : 'var(--priority-low)' }} />
              <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
            </button>
          )}

          {/* Label chips */}
          {appliedLabels.map((label) => (
            <button
              key={label._id}
              className="chip"
              onClick={(e) => {
                setLabelAnchor((e.target as HTMLElement).getBoundingClientRect())
                setLabelPopoverOpen(true)
              }}
            >
              <Tag size={12} style={{ color: label.color || undefined }} />
              <span>{label.name}</span>
            </button>
          ))}

          {/* Add label chip */}
          <button
            className="chip"
            onClick={(e) => {
              setLabelAnchor((e.target as HTMLElement).getBoundingClientRect())
              setLabelPopoverOpen(true)
            }}
            style={{ borderStyle: 'dashed' }}
          >
            <Tag size={12} />
            <span>Add label</span>
          </button>

          {/* List chip */}
          {task.listName && (
            <button className="chip">
              <ListIcon size={12} />
              <span>{task.listName}</span>
            </button>
          )}
        </div>

        {/* Body editor */}
        <div style={{ padding: '0 20px 16px' }}>
          <RichEditor
            content={notes}
            onUpdate={handleNotesUpdate}
            placeholder="Click here to add a task, or type '/' to choose a different content type"
            autofocus={false}
            editable={true}
          />
        </div>

        {/* Comment thread */}
        {task.comments && task.comments.length > 0 && (
          <div style={{ padding: '0 20px 12px' }}>
            {task.comments.map((comment, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0,
                }}>
                  {(comment.authorName || 'Y')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                      {comment.authorName || 'You'}
                    </span>
                    {comment.createdAt && (
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: false })} ago
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0 0', lineHeight: 1.5 }}>
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '8px 20px 16px', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        {/* Created by */}
        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginBottom: 8 }}>
          Created by {task.createdBy || 'You'} {createdTimeAgo ? `\u2022 ${createdTimeAgo}` : ''}
        </p>

        {/* Comment input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          borderRadius: 9999,
          background: 'var(--input-bg)',
          border: '1px solid var(--border)',
        }}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit() }}
            placeholder="Leave a message..."
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text-1)' }}
          />
          <button
            className="btn-icon"
            onClick={handleCommentSubmit}
            disabled={!commentInput.trim()}
            style={{ width: 28, height: 28, opacity: commentInput.trim() ? 1 : 0.3 }}
          >
            <CornerDownLeft size={14} />
          </button>
        </div>
      </div>

      {/* ── Popovers ──────────────────────────────────────────────────── */}
      <DatePopover
        open={datePopoverOpen}
        onClose={() => setDatePopoverOpen(false)}
        onSelect={handleDateSelect}
        currentDate={task.dueDate ? new Date(task.dueDate) : null}
        currentRepeat={task.repeat as 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | null | undefined}
        anchorRect={dateAnchor}
      />
      <PriorityPopover
        open={priorityPopoverOpen}
        onClose={() => setPriorityPopoverOpen(false)}
        onSelect={handlePrioritySelect}
        currentPriority={task.priority}
        anchorRect={priorityAnchor}
      />
      <LabelPopover
        open={labelPopoverOpen}
        onClose={() => setLabelPopoverOpen(false)}
        labels={allLabels}
        appliedIds={task.labelIds}
        onToggle={handleLabelToggle}
        onCreate={handleLabelCreate}
        anchorRect={labelAnchor}
      />
      <AssigneePopover
        open={assigneePopoverOpen}
        onClose={() => setAssigneePopoverOpen(false)}
        users={users}
        onSelect={handleAssigneeSelect}
        currentAssigneeId={task.assigneeId}
        anchorRect={assigneeAnchor}
      />
      <OverflowMenu
        open={overflowOpen}
        onClose={() => setOverflowOpen(false)}
        onAction={handleOverflowAction}
        anchorRect={overflowAnchor}
      />
    </motion.div>
  )
}
