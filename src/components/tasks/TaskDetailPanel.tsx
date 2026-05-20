'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Check,
  MoreVertical,
  Calendar,
  Tag,
  AlignJustify,
  User,
  BarChart3,
  Target,
  Play,
  Plus,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { AnimatePresence } from 'framer-motion'
import { slideFromRight, buttonPress, checkBounce, spring, ease } from '@/lib/motion'
import { playCompletionSound } from '@/lib/sounds'
import type { TaskRecord } from '@/hooks/useTasks'
import BlockEditor from '@/components/editor/BlockEditor'
import DatePopover from '@/components/popovers/DatePopover'
import LabelPopover from '@/components/popovers/LabelPopover'
import PriorityPopover from '@/components/popovers/PriorityPopover'
import AssigneePopover from '@/components/popovers/AssigneePopover'
import TaskOverflowMenu from '@/components/tasks/TaskOverflowMenu'
import type { JSONContent } from '@tiptap/react'

interface TaskComment {
  _id?: string
  text: string
  authorName?: string
  authorAvatar?: string
  createdAt?: string
}

interface TaskDetailPanelProps {
  task: TaskRecord
  onClose: () => void
  onUpdate: (id: string, data: Partial<TaskRecord>) => void
  onDelete?: (id: string) => void
  comments?: TaskComment[]
  onAddComment?: (taskId: string, text: string) => void
  labels?: { _id: string; name: string }[]
  allLabels?: { _id: string; name: string }[]
  onCreateLabel?: (name: string) => void
  breadcrumb?: string | null
  onBreadcrumbClick?: () => void
  onOpenSubTask?: (taskId: string) => void
  allTasks?: TaskRecord[]
  onCreateSubTask?: (data: Partial<TaskRecord>) => void
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'just now'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

// ── Placeholder focus data for a task ──
const PLACEHOLDER_FOCUS_SESSIONS = [
  { date: '2026-05-17', duration: 1500, note: 'Deep work on initial draft' },
  { date: '2026-05-16', duration: 2700, note: 'Research phase' },
  { date: '2026-05-15', duration: 1500, note: '' },
  { date: '2026-05-14', duration: 3600, note: 'Final review and edits' },
  { date: '2026-05-12', duration: 900, note: 'Quick brainstorm' },
]

const PLACEHOLDER_WEEK_BARS = [0, 25, 45, 0, 60, 30, 15] // minutes per day, last 7 days

function FocusSection({ taskId, taskTitle }: { taskId: string; taskTitle: string }) {
  const totalMinutes = PLACEHOLDER_FOCUS_SESSIONS.reduce((s, sess) => s + sess.duration, 0) / 60
  const totalHours = (totalMinutes / 60).toFixed(1)
  const sessionCount = PLACEHOLDER_FOCUS_SESSIONS.length
  const maxBar = Math.max(...PLACEHOLDER_WEEK_BARS, 1)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div
      className="mb-6 rounded-xl p-4"
      style={{
        backgroundColor: 'var(--bg-pane-2)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        <Target size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Focus
        </span>
      </div>

      {/* Total focus time */}
      <p className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        {totalHours} hours across {sessionCount} sessions
      </p>

      {/* Mini bar chart: last 7 days */}
      <div className="mb-4 flex items-end gap-1" style={{ height: 40 }}>
        {PLACEHOLDER_WEEK_BARS.map((minutes, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="relative w-full flex justify-center" style={{ height: 28 }}>
              <div
                className="w-3 rounded-t-sm"
                style={{
                  backgroundColor: minutes > 0 ? 'var(--accent)' : 'var(--bg-hover)',
                  height: `${Math.max((minutes / maxBar) * 100, minutes > 0 ? 10 : 4)}%`,
                  position: 'absolute',
                  bottom: 0,
                  opacity: minutes > 0 ? 0.8 : 0.3,
                }}
              />
            </div>
            <span className="text-[8px]" style={{ color: 'var(--text-faint)' }}>
              {dayLabels[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent('laif:start-focus', {
              detail: { taskId, taskTitle },
            })
          )
        }}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity duration-150 cursor-pointer"
        style={{ backgroundColor: 'var(--accent)' }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
      >
        <Play size={12} strokeWidth={2} />
        Start a focus session
      </motion.button>

      {/* Recent sessions */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
          Recent sessions
        </p>
        {PLACEHOLDER_FOCUS_SESSIONS.map((sess, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                {new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {Math.round(sess.duration / 60)}m
              </span>
            </div>
            {sess.note && (
              <span className="max-w-[180px] truncate text-[10px]" style={{ color: 'var(--text-faint)' }}>
                {sess.note}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Priority bars SVG — filled rectangles */
function PriorityBars({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="10" width="3" height="5" rx="0.8" fill={color} />
      <rect x="6.5" y="6.5" width="3" height="8.5" rx="0.8" fill={color} />
      <rect x="11" y="3" width="3" height="12" rx="0.8" fill={color} />
    </svg>
  )
}

/** Subtask row with same UX as main TaskRow */
function SubTaskRow({ sub, subDone, subDateStr, subOverdue, subPriorityColor, onToggle, onOpen, onUpdate }: {
  sub: TaskRecord; subDone: boolean; subDateStr: string | null; subOverdue: boolean; subPriorityColor: string
  onToggle: () => void; onOpen: () => void
  onUpdate: (id: string, data: Partial<TaskRecord>) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [dateHovered, setDateHovered] = useState(false)
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [priHovered, setPriHovered] = useState(false)
  const [priPopoverOpen, setPriPopoverOpen] = useState(false)
  const priLabel = sub.priority === 'high' ? 'High' : sub.priority === 'low' ? 'Low' : 'Medium'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!datePopoverOpen && !priPopoverOpen) onOpen() }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 8px', cursor: 'pointer',
        borderBottom: '1px solid var(--overlay-1, rgba(108,108,158,0.06))',
        backgroundColor: hovered ? 'var(--overlay-1, rgba(108,108,158,0.05))' : 'transparent',
        transition: 'background-color 150ms ease',
      }}
    >
      {/* Checkbox — rectangle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: 6,
          border: subDone ? 'none' : '2px solid var(--overlay-3, #3a394a)',
          backgroundColor: subDone ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 150ms ease',
        }}
      >
        {subDone && <Check size={13} strokeWidth={2.5} color="#fff" />}
      </button>

      {/* Priority bars */}
      <div style={{ flexShrink: 0, marginTop: 3 }}>
        <PriorityBars color={subPriorityColor} size={16} />
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, lineHeight: 1.4,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: subDone ? 'var(--text-faint)' : 'var(--text-primary)',
          textDecoration: subDone ? 'line-through' : 'none',
          textDecorationColor: 'var(--accent)',
        }}>
          {sub.title}
        </div>

        {(subDateStr || sub.priority) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {/* Date chip — clickable pill hover + tooltip */}
            {subDateStr && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setDateHovered(true)} onMouseLeave={() => setDateHovered(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setDatePopoverOpen(!datePopoverOpen) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: subOverdue ? 'var(--accent)' : 'var(--text-faint)',
                    background: dateHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: dateHovered ? '2px 7px' : '2px 3px',
                    borderRadius: 999, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
                    transition: 'all 150ms ease',
                  }}
                >
                  <Calendar size={12} strokeWidth={1.5} />
                  {subDateStr}
                </button>
                {dateHovered && !datePopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 5, padding: '3px 8px', borderRadius: 6,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)',
                    fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap',
                    fontFamily: 'Inter, system-ui, sans-serif', zIndex: 40,
                  }}>
                    Edit due date
                  </div>
                )}
                {datePopoverOpen && (
                  <div style={{ position: 'absolute', left: 0, top: '100%', zIndex: 50, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                    <DatePopover
                      selected={sub.dueDate ? new Date(sub.dueDate) : null}
                      onSelect={(date) => { onUpdate(sub._id, { dueDate: date ? date.toISOString() : null }); setDatePopoverOpen(false) }}
                      onClose={() => setDatePopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Priority chip — clickable pill hover + tooltip */}
            {sub.priority && (
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setPriHovered(true)} onMouseLeave={() => setPriHovered(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setPriPopoverOpen(!priPopoverOpen) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-faint)',
                    background: priHovered ? 'var(--overlay-2, rgba(108,108,158,0.15))' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: priHovered ? '2px 7px' : '2px 3px',
                    borderRadius: 999, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 500,
                    transition: 'all 150ms ease',
                  }}
                >
                  <PriorityBars color={subPriorityColor} size={11} />
                  {priLabel}
                </button>
                {priHovered && !priPopoverOpen && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)',
                    marginBottom: 5, padding: '3px 8px', borderRadius: 6,
                    backgroundColor: 'var(--bg-pane-2, #2a293b)',
                    border: '1px solid var(--overlay-2, var(--border))', boxShadow: 'var(--shadow-elevated)',
                    fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap',
                    fontFamily: 'Inter, system-ui, sans-serif', zIndex: 40,
                  }}>
                    Edit priority
                  </div>
                )}
                {priPopoverOpen && (
                  <div style={{ position: 'absolute', left: 0, top: '100%', zIndex: 50, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                    <PriorityPopover
                      selected={sub.priority}
                      onSelect={(p) => { onUpdate(sub._id, { priority: p || 'medium' }); setPriPopoverOpen(false) }}
                      onClose={() => setPriPopoverOpen(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: avatar + arrow on hover */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--avatar-bg, #6b7280)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {sub.createdBy ? sub.createdBy.charAt(0).toUpperCase() : 'U'}
        </div>
        {hovered && (
          <div
            onClick={(e) => { e.stopPropagation(); onOpen() }}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'var(--overlay-2, rgba(108,108,158,0.12))',
              color: 'var(--accent)', cursor: 'pointer',
            }}
          >
            <ArrowRight size={14} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function TaskDetailPanel({
  task,
  onClose,
  onUpdate,
  onDelete,
  comments = [],
  onAddComment,
  labels = [],
  allLabels = [],
  onCreateLabel,
  breadcrumb,
  onBreadcrumbClick,
  onOpenSubTask,
  allTasks = [],
  onCreateSubTask,
}: TaskDetailPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [commentText, setCommentText] = useState('')
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [isAddingSubTask, setIsAddingSubTask] = useState(false)
  const subTaskInputRef = useRef<HTMLInputElement>(null)
  const [showDatePopover, setShowDatePopover] = useState(false)
  const [showLabelPopover, setShowLabelPopover] = useState(false)
  const [showPriorityPopover, setShowPriorityPopover] = useState(false)
  const [showAssigneePopover, setShowAssigneePopover] = useState(false)
  const [showOverflow, setShowOverflow] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const dateChipRef = useRef<HTMLButtonElement>(null)
  const labelChipRef = useRef<HTMLButtonElement>(null)
  const priorityChipRef = useRef<HTMLButtonElement>(null)
  const assigneeRef = useRef<HTMLButtonElement>(null)
  const overflowRef = useRef<HTMLButtonElement>(null)

  const isCompleted = task.status === 'done'

  const handleToggleComplete = useCallback(() => {
    const newStatus = isCompleted ? 'todo' : 'done'
    if (newStatus === 'done') playCompletionSound()
    onUpdate(task._id, { status: newStatus })
  }, [isCompleted, onUpdate, task._id])

  const handleTitleSubmit = useCallback(() => {
    setIsEditingTitle(false)
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(task._id, { title: trimmed })
    } else {
      setEditTitle(task.title)
    }
  }, [editTitle, task.title, task._id, onUpdate])

  const handleCommentSubmit = useCallback(() => {
    const text = commentText.trim()
    if (!text || !onAddComment) return
    onAddComment(task._id, text)
    setCommentText('')
  }, [commentText, onAddComment, task._id])

  const handleEditorSave = useCallback(
    (json: JSONContent) => {
      onUpdate(task._id, { notes: json })
    },
    [onUpdate, task._id]
  )

  // Subtask data
  const subTasks = allTasks.filter((t) => t.parentId === task._id)

  const handleToggleSubTask = useCallback(
    (subTaskId: string) => {
      const subTask = allTasks.find((t) => t._id === subTaskId)
      if (!subTask) return
      const newStatus = subTask.status === 'done' ? 'todo' : 'done'
      if (newStatus === 'done') playCompletionSound()
      onUpdate(subTaskId, { status: newStatus })
    },
    [allTasks, onUpdate]
  )

  const handleCreateSubTask = useCallback(async () => {
    const title = newSubTaskTitle.trim()
    if (!title || !onCreateSubTask) return
    await onCreateSubTask({
      title,
      parentId: task._id,
      depth: (task.depth || 0) + 1,
      priority: 'medium',
      status: 'todo',
      dueDate: task.dueDate,
    })
    setNewSubTaskTitle('')
  }, [newSubTaskTitle, onCreateSubTask, task._id, task.depth, task.dueDate])

  const handleDateSelect = useCallback(
    (date: Date | null) => {
      onUpdate(task._id, { dueDate: date ? date.toISOString() : null })
      setShowDatePopover(false)
    },
    [onUpdate, task._id]
  )

  const handleLabelToggle = useCallback(
    (labelId: string) => {
      const current = task.labelIds || []
      const next = current.includes(labelId)
        ? current.filter((id) => id !== labelId)
        : [...current, labelId]
      onUpdate(task._id, { labelIds: next })
    },
    [onUpdate, task._id, task.labelIds]
  )

  const handlePrioritySelect = useCallback(
    (priority: string | null) => {
      onUpdate(task._id, { priority: priority || 'medium' })
      setShowPriorityPopover(false)
    },
    [onUpdate, task._id]
  )

  const handleAssigneeSelect = useCallback(
    (assigneeId: string | null) => {
      onUpdate(task._id, { assigneeId })
      setShowAssigneePopover(false)
    },
    [onUpdate, task._id]
  )

  return (
    <motion.div
      {...slideFromRight}
      transition={spring.snappy}
      className="flex h-full w-full flex-col overflow-hidden rounded-[var(--outer-radius,20px)]"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* ── Header — × left, status dot + ⋮ right ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-3"
        style={{ backgroundColor: 'var(--bg-pane)' }}
      >
        {/* Close × */}
        <motion.button
          {...buttonPress}
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-sl cursor-pointer"
          style={{ color: 'var(--text-muted)', backgroundColor: 'var(--overlay-1, transparent)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, transparent)' }}
        >
          <X size={16} strokeWidth={1.5} />
        </motion.button>

        {/* Right: status dot + overflow */}
        <div className="flex items-center gap-2">
          {/* Color status dot */}
          <div
            className="h-6 w-6 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #f84f39 50%, #8b5cf6 50%)',
            }}
          />

          {/* Three-dot overflow menu */}
          <div className="relative">
            <motion.button
              {...buttonPress}
              ref={overflowRef}
              onClick={() => setShowOverflow(!showOverflow)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-sl cursor-pointer"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--overlay-1, transparent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-2, var(--bg-hover))' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, transparent)' }}
            >
              <MoreVertical size={16} strokeWidth={1.5} />
            </motion.button>
            {showOverflow && (
              <TaskOverflowMenu
                onClose={() => setShowOverflow(false)}
                onDelete={() => {
                  if (onDelete) onDelete(task._id)
                  setShowOverflow(false)
                }}
                onMarkAllIncomplete={() => {
                  onUpdate(task._id, { status: 'todo' })
                  setShowOverflow(false)
                }}
                onStartFocus={() => {
                  window.dispatchEvent(
                    new CustomEvent('laif:start-focus', {
                      detail: { taskId: task._id, taskTitle: task.title },
                    })
                  )
                  setShowOverflow(false)
                }}
                onDuplicate={() => {
                  if (onCreateSubTask) {
                    onCreateSubTask({
                      title: `${task.title} (copy)`,
                      priority: task.priority,
                      status: 'todo',
                      dueDate: task.dueDate,
                      labelIds: task.labelIds,
                    })
                  }
                  setShowOverflow(false)
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Body (scrollable) ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-4">
          {/* Breadcrumb */}
          {breadcrumb && (
            <button
              onClick={onBreadcrumbClick}
              className="mb-2 text-xs font-medium transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              {breadcrumb}
            </button>
          )}

          {/* Title */}
          {isEditingTitle ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleTitleSubmit()
                }
                if (e.key === 'Escape') {
                  setEditTitle(task.title)
                  setIsEditingTitle(false)
                }
              }}
              className="mb-3 w-full bg-transparent text-[28px] font-bold outline-none"
              style={{
                color: 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                textDecorationColor: 'var(--accent)',
              }}
              autoFocus
            />
          ) : (
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2
                className="flex-1 text-[28px] font-bold cursor-text"
                style={{
                  color: 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  textDecorationColor: 'var(--accent)',
                }}
                onClick={() => {
                  setIsEditingTitle(true)
                  setEditTitle(task.title)
                }}
              >
                {task.title}
              </h2>

              {/* Assignee avatar */}
              <div className="relative">
                <motion.button
                  {...buttonPress}
                  ref={assigneeRef}
                  onClick={() => setShowAssigneePopover(!showAssigneePopover)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full cursor-pointer"
                  style={{
                    backgroundColor: task.assigneeId ? 'var(--accent)' : 'var(--bg-hover)',
                    color: task.assigneeId ? '#fff' : 'var(--text-faint)',
                  }}
                >
                  {task.assigneeId ? (
                    <span className="text-xs font-bold">
                      {task.assigneeId.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User size={14} strokeWidth={1.5} />
                  )}
                </motion.button>
                {showAssigneePopover && (
                  <div className="absolute right-0 top-10 z-50">
                    <AssigneePopover
                      selectedId={task.assigneeId || null}
                      onSelect={handleAssigneeSelect}
                      onClose={() => setShowAssigneePopover(false)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Chip strip ── */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {/* Date chip */}
            <div className="relative">
              <motion.button
                {...buttonPress}
                ref={dateChipRef}
                onClick={() => setShowDatePopover(!showDatePopover)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: task.dueDate ? 'var(--text-primary)' : 'var(--text-faint)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  textDecorationColor: 'var(--accent)',
                }}
              >
                <Calendar size={12} strokeWidth={1.5} />
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Date'}
              </motion.button>
              {showDatePopover && (
                <div className="absolute left-0 top-9 z-50">
                  <DatePopover
                    selected={task.dueDate ? new Date(task.dueDate) : null}
                    onSelect={handleDateSelect}
                    onClose={() => setShowDatePopover(false)}
                    repeat={task.repeat || null}
                    onRepeatChange={(repeat) => {
                      onUpdate(task._id, { repeat })
                    }}
                  />
                </div>
              )}
            </div>

            {/* Priority chip */}
            <div className="relative">
              <motion.button
                {...buttonPress}
                ref={priorityChipRef}
                onClick={() => setShowPriorityPopover(!showPriorityPopover)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color:
                    task.priority === 'high'
                      ? 'var(--priority-high, #ef4444)'
                      : task.priority === 'low'
                      ? 'var(--priority-low, #6b66da)'
                      : 'var(--priority-medium, #f59e0b)',
                }}
              >
                <BarChart3 size={12} strokeWidth={1.5} />
                {task.priority
                  ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                  : 'Priority'}
              </motion.button>
              {showPriorityPopover && (
                <div className="absolute left-0 top-9 z-50">
                  <PriorityPopover
                    selected={task.priority || null}
                    onSelect={handlePrioritySelect}
                    onClose={() => setShowPriorityPopover(false)}
                  />
                </div>
              )}
            </div>

            {/* Label chips */}
            {labels.map((label) => (
              <span
                key={label._id}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  textDecorationColor: 'var(--accent)',
                }}
              >
                <Tag size={12} strokeWidth={1.5} />
                {label.name}
              </span>
            ))}

            {/* Add label chip */}
            <div className="relative">
              <motion.button
                {...buttonPress}
                ref={labelChipRef}
                onClick={() => setShowLabelPopover(!showLabelPopover)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-faint)',
                }}
              >
                <Tag size={12} strokeWidth={1.5} />
                Label
              </motion.button>
              {showLabelPopover && (
                <div className="absolute left-0 top-9 z-50">
                  <LabelPopover
                    appliedIds={task.labelIds || []}
                    allLabels={allLabels}
                    onToggle={handleLabelToggle}
                    onCreate={onCreateLabel}
                    onClose={() => setShowLabelPopover(false)}
                  />
                </div>
              )}
            </div>

            {/* List chip */}
            {task.listId && (
              <span
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                }}
              >
                <AlignJustify size={12} strokeWidth={1.5} />
                {task.listId}
              </span>
            )}
          </div>

          {/* ── Subtasks section ── */}
          <div className="mb-4">
            {subTasks.map((sub) => {
              const subDone = sub.status === 'done'
              const subDateStr = sub.dueDate
                ? (() => {
                    const d = new Date(sub.dueDate!)
                    const now = new Date(); now.setHours(0,0,0,0)
                    const t = new Date(d); t.setHours(0,0,0,0)
                    const days = Math.round((t.getTime() - now.getTime()) / 86400000)
                    if (days === 0) return 'Today'
                    if (days === 1) return 'Tomorrow'
                    if (days === -1) return 'Yesterday'
                    if (days < -1) return `${Math.abs(days)} days ago`
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  })()
                : null
              const subOverdue = sub.dueDate ? new Date(sub.dueDate) < new Date(new Date().toDateString()) : false
              const subPriorityColor = sub.priority === 'high' ? '#ef4444' : sub.priority === 'low' ? '#6b66da' : '#f59e0b'
              return (
                <SubTaskRow
                  key={sub._id}
                  sub={sub}
                  subDone={subDone}
                  subDateStr={subDateStr}
                  subOverdue={subOverdue}
                  subPriorityColor={subPriorityColor}
                  onToggle={() => handleToggleSubTask(sub._id)}
                  onOpen={() => onOpenSubTask?.(sub._id)}
                  onUpdate={onUpdate}
                />
              )
            })}

            {/* Add subtask — "New task" bar matching Today page */}
            {isAddingSubTask ? (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  backgroundColor: 'var(--overlay-1, rgba(108,108,158,0.06))',
                  borderBottom: '1px solid var(--overlay-1, rgba(108,108,158,0.06))',
                }}
              >
                <Plus size={16} strokeWidth={1.5} style={{ flexShrink: 0, color: 'var(--text-faint)' }} />
                <input
                  ref={subTaskInputRef}
                  type="text"
                  value={newSubTaskTitle}
                  onChange={(e) => setNewSubTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSubTask()
                    if (e.key === 'Escape') { setNewSubTaskTitle(''); setIsAddingSubTask(false) }
                  }}
                  onBlur={() => { if (!newSubTaskTitle.trim()) setIsAddingSubTask(false) }}
                  placeholder="What would you like to do?"
                  autoFocus
                  style={{
                    flex: 1, background: 'transparent', outline: 'none', border: 'none',
                    fontSize: 14, fontWeight: 500, color: 'var(--text-primary)',
                    fontFamily: 'Inter, system-ui, sans-serif', padding: 0,
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-faint)', flexShrink: 0 }}>⌃N</span>
              </div>
            ) : (
              <div
                onClick={() => { setIsAddingSubTask(true); setTimeout(() => subTaskInputRef.current?.focus(), 50) }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--overlay-1, rgba(108,108,158,0.06))' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  cursor: 'text', color: 'var(--text-faint)',
                  transition: 'background-color 150ms ease',
                  borderBottom: '1px solid var(--overlay-1, rgba(108,108,158,0.06))',
                }}
              >
                <Plus size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif' }}>New task</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>⌃N</span>
              </div>
            )}
          </div>

          {/* ── Habit detail section (when isHabit=true) ── */}
          {(task as TaskRecord & { isHabit?: boolean; habitData?: {
            currentStreak?: number;
            bestStreak?: number;
            frequency?: string;
            reminderTime?: string;
            completions?: string[];
          } }).isHabit && (
            <div
              className="mb-4 rounded-xl p-4"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Streak display */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Streak
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Current: <strong style={{ color: 'var(--accent)' }}>
                      {(task as TaskRecord & { habitData?: { currentStreak?: number } }).habitData?.currentStreak ?? 0}
                    </strong>
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Best: <strong style={{ color: 'var(--text-primary)' }}>
                      {(task as TaskRecord & { habitData?: { bestStreak?: number } }).habitData?.bestStreak ?? 0}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Weekly grid placeholder (last 4 weeks) */}
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                  Last 4 weeks
                </p>
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 4 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex gap-1">
                      {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="h-3 w-3 rounded-[2px]"
                          style={{
                            backgroundColor: 'var(--bg-hover)',
                            opacity: 0.5,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Frequency</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {(task as TaskRecord & { habitData?: { frequency?: string } }).habitData?.frequency ?? 'Daily'}
                </span>
              </div>

              {/* Reminder */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Reminder</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {(task as TaskRecord & { habitData?: { reminderTime?: string } }).habitData?.reminderTime ?? '8:00 PM'}
                  <span className="ml-1 text-[10px]" style={{ color: 'var(--text-faint)' }}>(coming soon)</span>
                </span>
              </div>
            </div>
          )}

          {/* ── Body: Block editor ── */}
          <div className="mb-6 min-h-[200px]">
            <BlockEditor
              content={(task.notes as JSONContent) || null}
              onSave={handleEditorSave}
            />
          </div>

        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="flex-shrink-0 px-5 pb-4 pt-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {/* Created by */}
        <p
          className="mb-3 text-center text-[12px]"
          style={{ color: 'var(--text-faint)' }}
        >
          {copy.task.createdBy(
            task.createdBy || 'You',
            formatRelativeTime(task.createdAt)
          )}
        </p>

        {/* Comments thread */}
        {comments.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {comments.map((comment, i) => (
              <div key={comment._id || i} className="flex gap-2">
                <div
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {(comment.authorName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {comment.authorName || 'User'}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <div
          className="flex items-center rounded-full px-4 py-2"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
          }}
        >
          <input
            ref={commentInputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCommentSubmit()
              }
            }}
            placeholder={copy.task.leaveMessagePlaceholder}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
