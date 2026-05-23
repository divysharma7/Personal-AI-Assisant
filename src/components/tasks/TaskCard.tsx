'use client'

import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Repeat, MessageCircle } from 'lucide-react'
import { checkBounce } from '@/lib/motion'
import { cardDragLift } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'
import {
  PRIORITY_COLORS,
  SubtaskRing,
  formatRelativeDate,
} from './taskCardUtils'

// ── Types ────────────────────────────────────────────────────

interface TaskCardProps {
  task: TaskRecord
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  labels?: { _id: string; name: string; color?: string }[]
  subTaskCount?: { completed: number; total: number }
  isDragging?: boolean
  isOverlay?: boolean
}

// ── Component ────────────────────────────────────────────────

export default memo(function TaskCard({
  task,
  onToggle,
  onOpenDetail,
  labels = [],
  subTaskCount,
  isDragging = false,
  isOverlay = false,
}: TaskCardProps) {
  const [stableNow] = useState(() => new Date())
  const done = task.status === 'done'
  const dateStr = formatRelativeDate(task.dueDate ?? null, stableNow)
  const overdue = useMemo(() =>
    task.dueDate != null &&
    new Date(task.dueDate) < new Date(stableNow.toDateString()), [task.dueDate, stableNow])
  const hasSubs = subTaskCount != null && subTaskCount.total > 0
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low

  // Drag / overlay transforms
  const overlayStyle: React.CSSProperties = isOverlay
    ? {
        transform: `scale(${cardDragLift.scale})`,
        boxShadow: cardDragLift.boxShadow,
        pointerEvents: 'none' as const,
        zIndex: 999,
      }
    : {}

  const draggingStyle: React.CSSProperties = isDragging
    ? { opacity: 0.4, transform: 'scale(0.97)' }
    : {}

  return (
    <div
      data-task-id={task._id}
      onClick={() => onOpenDetail(task._id)}
      style={{
        backgroundColor: 'var(--bg-pane)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'box-shadow 180ms ease-out, transform 180ms ease-out, opacity 180ms ease-out',
        fontFamily: 'Inter, system-ui, sans-serif',
        ...overlayStyle,
        ...draggingStyle,
      }}
      onMouseEnter={(e) => {
        if (!isOverlay && !isDragging) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isOverlay && !isDragging) {
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {/* ── Top section: checkbox + title ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {/* Colored circle checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task._id)
          }}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          style={{
            flexShrink: 0,
            width: 16,
            height: 16,
            marginTop: 2,
            borderRadius: '50%',
            border: done ? 'none' : `2px solid ${priorityColor}`,
            backgroundColor: done ? priorityColor : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 150ms ease, border-color 150ms ease',
            padding: 0,
          }}
        >
          <AnimatePresence>
            {done && (
              <motion.div initial={checkBounce.initial} animate={checkBounce.checked}>
                <Check size={10} strokeWidth={2.5} color="#fff" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Title */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.4,
            color: done ? 'var(--text-faint)' : 'var(--text-primary)',
            textDecoration: done ? 'line-through' : 'none',
            opacity: done ? 0.5 : 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            flex: 1,
            minWidth: 0,
          }}
        >
          {task.title || 'Untitled'}
        </span>
      </div>

      {/* ── Labels row ── */}
      {labels.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            marginTop: 8,
          }}
        >
          {labels.map((label) => (
            <span
              key={label._id}
              style={{
                fontSize: 10,
                fontWeight: 500,
                lineHeight: 1,
                padding: '3px 6px',
                borderRadius: 999,
                backgroundColor: label.color
                  ? `${label.color}22`
                  : 'var(--overlay-2, rgba(108,108,158,0.12))',
                color: label.color || 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Bottom meta row ── */}
      {(dateStr || hasSubs || task.repeat) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 8,
            flexWrap: 'wrap',
          }}
        >
          {/* Due date */}
          {dateStr && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: overdue ? 'var(--priority-high, #ef4444)' : 'var(--text-muted)',
              }}
            >
              {dateStr}
            </span>
          )}

          {/* Subtask progress */}
          {hasSubs && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: 'var(--text-faint)',
              }}
            >
              <SubtaskRing
                completed={subTaskCount!.completed}
                total={subTaskCount!.total}
                size={12}
              />
              {subTaskCount!.completed}/{subTaskCount!.total}
            </span>
          )}

          {/* Recurrence icon */}
          {task.repeat && (
            <Repeat
              size={12}
              strokeWidth={1.5}
              style={{ color: 'var(--text-faint)' }}
            />
          )}

          {/* Comment placeholder icon */}
          {task.comments && task.comments.length > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 2,
                fontSize: 11,
                color: 'var(--text-faint)',
              }}
            >
              <MessageCircle size={12} strokeWidth={1.5} />
              {task.comments.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
})
