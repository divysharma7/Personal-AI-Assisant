'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  GripVertical, ArrowRight, BarChart3, Check,
  Calendar, Tag, Menu,
} from 'lucide-react'
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from 'date-fns'
import { taskCompletion, snappy } from '@/shared/design-system'
import { UserAvatar, type AssigneeUser } from '@/components/popovers/AssigneePopover'

export interface SuperlistTask {
  _id: string
  title: string
  completed: boolean
  completedAt?: string | null
  dueDate?: string | null
  priority: 'high' | 'medium' | 'low' | null
  labelIds?: string[]
  assigneeId?: string | null
  parentId?: string | null
  subtaskCount?: number
  subtaskCompleted?: number
  tags?: string[]
}

interface SuperlistTaskRowProps {
  task: SuperlistTask
  selected?: boolean
  onSelect?: () => void
  onOpenDetail?: () => void
  onToggleComplete?: (taskId: string) => void
  labels?: { _id: string; name: string; color?: string | null }[]
  assignee?: AssigneeUser | null
  hasSubtasks?: boolean
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
}

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return `Today`
  if (isTomorrow(d)) return `Tomorrow`
  if (isPast(d)) return `${formatDistanceToNow(d)} ago`
  return format(d, 'MMM d')
}

export default function SuperlistTaskRow({
  task,
  selected = false,
  onSelect,
  onOpenDetail,
  onToggleComplete,
  labels = [],
  assignee,
  hasSubtasks = false,
}: SuperlistTaskRowProps) {
  const [justChecked, setJustChecked] = useState(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onToggleComplete) return
    setJustChecked(true)
    onToggleComplete(task._id)
    setTimeout(() => setJustChecked(false), 300)
  }, [onToggleComplete, task._id])

  const handleRowClick = useCallback(() => {
    onSelect?.()
  }, [onSelect])

  const handleOpenDetail = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenDetail?.()
  }, [onOpenDetail])

  const appliedLabels = useMemo(() => {
    if (!task.labelIds?.length || !labels.length) return []
    return labels.filter(l => task.labelIds?.includes(l._id))
  }, [task.labelIds, labels])

  const showSubtaskCount = hasSubtasks && (task.subtaskCount ?? 0) > 0

  return (
    <motion.div
      ref={rowRef}
      className={`row-interactive group ${selected ? 'selected' : ''}`}
      onClick={handleRowClick}
      layout
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--row-gap)',
        padding: 'var(--row-padding-y) var(--row-padding-x)',
        minHeight: 'var(--row-min-height)',
        position: 'relative',
        borderRight: selected ? '2px solid var(--color-danger)' : '2px solid transparent',
      }}
    >
      {/* Drag handle — hover only */}
      <div className="drag-handle" style={{ paddingTop: 2, flexShrink: 0 }}>
        <GripVertical size={16} />
      </div>

      {/* Sub-task indicator */}
      {hasSubtasks && (
        <div style={{ paddingTop: 3, flexShrink: 0 }}>
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--text-1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check size={8} style={{ color: 'var(--color-danger)' }} />
          </div>
        </div>
      )}

      {/* Checkbox */}
      <motion.button
        className={`checkbox-interactive ${task.completed ? 'checked' : ''} ${justChecked ? 'just-checked' : ''}`}
        variants={taskCompletion.checkbox}
        animate={task.completed ? 'checked' : 'unchecked'}
        onClick={handleCheckboxClick}
        style={{ marginTop: 1, flexShrink: 0 }}
        title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed && (
          <motion.div
            variants={taskCompletion.checkmark}
            animate="checked"
          >
            <Check size={12} style={{ color: '#fff' }} />
          </motion.div>
        )}
      </motion.button>

      {/* Priority pip */}
      {task.priority && (
        <div style={{ paddingTop: 3, flexShrink: 0 }}>
          <BarChart3 size={14} style={{ color: PRIORITY_COLORS[task.priority] }} />
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <span
          className={task.completed ? 'strike-through' : ''}
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: task.completed ? 'var(--text-3)' : 'var(--text-1)',
            lineHeight: 1.4,
            display: 'block',
          }}
        >
          {task.title || 'Untitled'}
        </span>

        {/* Metadata sub-row */}
        {(task.dueDate || appliedLabels.length > 0 || showSubtaskCount) && (
          <div
            className={task.completed ? 'strike-through' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Sub-task counter */}
            {showSubtaskCount && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)', display: 'inline-block' }} />
                {task.subtaskCompleted ?? 0}/{task.subtaskCount ?? 0}
              </span>
            )}

            {/* Due date chip */}
            {task.dueDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isPast(new Date(task.dueDate)) && !task.completed ? 'var(--color-danger)' : 'var(--text-2)' }}>
                <Calendar size={11} />
                {formatDueDate(task.dueDate)}
              </span>
            )}

            {/* Label chips */}
            {appliedLabels.map((label) => (
              <span key={label._id} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: label.color || 'var(--text-2)' }}>
                <Tag size={10} />
                {label.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 2 }}>
        {/* Assignee avatar */}
        {assignee && (
          <UserAvatar user={assignee} size={24} />
        )}

        {/* Open detail button — lines glyph that becomes arrow on row hover */}
        <button
          className="hover-reveal btn-icon"
          onClick={handleOpenDetail}
          style={{ width: 28, height: 28, borderRadius: '50%' }}
          title="Open task detail"
        >
          <span className="group-hover:hidden flex items-center justify-center">
            <Menu size={14} />
          </span>
          <span className="hidden group-hover:flex items-center justify-center" style={{ color: 'var(--color-danger)' }}>
            <ArrowRight size={14} />
          </span>
        </button>
      </div>
    </motion.div>
  )
}
