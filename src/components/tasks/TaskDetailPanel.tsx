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
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { slideFromRight, buttonPress, spring, ease } from '@/lib/motion'
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
}: TaskDetailPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [commentText, setCommentText] = useState('')
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
      className="flex h-full w-[420px] flex-shrink-0 flex-col overflow-hidden rounded-[16px]"
      style={{ backgroundColor: 'var(--bg-pane)' }}
    >
      {/* ── Header (sticky) ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
        style={{
          backgroundColor: 'var(--bg-pane)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Close */}
          <motion.button
            {...buttonPress}
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={16} strokeWidth={1.5} />
          </motion.button>

          {/* Complete pill */}
          <motion.button
            {...buttonPress}
            onClick={handleToggleComplete}
            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors duration-150 cursor-pointer"
            style={{
              border: isCompleted ? 'none' : '1px solid var(--border)',
              backgroundColor: isCompleted ? 'var(--accent)' : 'transparent',
              color: isCompleted ? '#fff' : 'var(--text-primary)',
            }}
          >
            <Check size={14} strokeWidth={2} />
            {isCompleted ? copy.task.completedCta : copy.task.completeCta}
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          {/* Color swatch */}
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: task.color || 'var(--accent)' }}
          />

          {/* Overflow menu */}
          <div className="relative">
            <motion.button
              {...buttonPress}
              ref={overflowRef}
              onClick={() => setShowOverflow(!showOverflow)}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
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
                      ? '#ef4444'
                      : task.priority === 'low'
                      ? '#3b82f6'
                      : 'var(--text-faint)',
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

          {/* ── Focus section ── */}
          <FocusSection taskId={task._id} taskTitle={task.title} />
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
