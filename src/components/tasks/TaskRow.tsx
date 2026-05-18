'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GripVertical,
  BarChart3,
  Check,
  ArrowRight,
  AlignJustify,
  Calendar,
  Tag,
} from 'lucide-react'
import { copy } from '@/lib/copy'
import { buttonPress, checkBounce, fadeSlideUp, ease } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'

interface TaskRowProps {
  task: TaskRecord
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  isSelected: boolean
  isDetailOpen: boolean
  subTaskCount?: { completed: number; total: number }
  labels?: { _id: string; name: string }[]
  onTitleChange?: (id: string, title: string) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
}

function formatRelativeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days > 1 && days <= 7) return `in ${days} days`
  if (days < -1) return `${Math.abs(days)} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskRow({
  task,
  onToggle,
  onOpenDetail,
  isSelected,
  isDetailOpen,
  subTaskCount,
  labels = [],
  onTitleChange,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const titleRef = useRef<HTMLInputElement>(null)
  const isCompleted = task.status === 'done'
  const dueDateStr = formatRelativeDate(task.dueDate ?? null)

  const handleTitleSubmit = useCallback(() => {
    setIsEditingTitle(false)
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title && onTitleChange) {
      onTitleChange(task._id, trimmed)
    } else {
      setEditTitle(task.title)
    }
  }, [editTitle, task.title, task._id, onTitleChange])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleTitleSubmit()
      }
      if (e.key === 'Escape') {
        setEditTitle(task.title)
        setIsEditingTitle(false)
      }
    },
    [handleTitleSubmit, task.title]
  )

  return (
    <motion.div
      {...fadeSlideUp}
      transition={ease.normal}
      layout
      className="group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors duration-150 cursor-pointer"
      style={{
        backgroundColor: isSelected
          ? 'var(--bg-selected)'
          : isHovered
          ? 'var(--bg-hover)'
          : 'transparent',
        borderRight: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isEditingTitle) onOpenDetail(task._id)
      }}
    >
      {/* Drag handle */}
      <div
        className="flex h-5 w-4 flex-shrink-0 items-center justify-center transition-opacity duration-150"
        style={{
          opacity: isHovered ? 0.5 : 0,
          color: 'var(--text-faint)',
        }}
      >
        <GripVertical size={14} strokeWidth={1.5} />
      </div>

      {/* Sub-task indicator */}
      {subTaskCount && subTaskCount.total > 0 && (
        <div
          className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Check size={10} strokeWidth={2.5} className="text-white" />
        </div>
      )}

      {/* Checkbox */}
      <motion.button
        {...buttonPress}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(task._id)
        }}
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
        style={{
          border: isCompleted ? 'none' : '1.5px solid var(--accent)',
          backgroundColor: isCompleted ? 'var(--accent)' : 'transparent',
        }}
      >
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={checkBounce.initial}
              animate={checkBounce.checked}
            >
              <Check size={12} strokeWidth={2.5} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Priority pip */}
      {task.priority && task.priority !== 'medium' && (
        <div className="flex-shrink-0" style={{ color: PRIORITY_COLORS[task.priority] || 'var(--text-faint)' }}>
          <BarChart3 size={14} strokeWidth={1.5} />
        </div>
      )}

      {/* Title + metadata */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        {isEditingTitle ? (
          <input
            ref={titleRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent text-[15px] font-medium outline-none"
            style={{
              color: isCompleted ? 'var(--text-faint)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: 'var(--accent)',
            }}
            autoFocus
            placeholder={copy.list.inlineNewTaskPlaceholder}
          />
        ) : (
          <span
            className="text-[15px] font-medium truncate"
            style={{
              color: isCompleted ? 'var(--text-faint)' : 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: 'var(--accent)',
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              setIsEditingTitle(true)
              setEditTitle(task.title)
            }}
          >
            {task.title || copy.list.inlineNewTaskPlaceholder}
          </span>
        )}

        {/* Metadata sub-row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-task counter */}
          {subTaskCount && subTaskCount.total > 0 && (
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--text-faint)' }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }}
              />
              {subTaskCount.completed}/{subTaskCount.total}
            </span>
          )}

          {/* Due date chip */}
          {dueDateStr && (
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{
                color: 'var(--text-faint)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                textDecorationColor: 'var(--accent)',
              }}
            >
              <Calendar size={10} strokeWidth={1.5} />
              {dueDateStr}
            </span>
          )}

          {/* Label chips */}
          {labels.map((label) => (
            <span
              key={label._id}
              className="flex items-center gap-1 text-[11px]"
              style={{
                color: 'var(--text-faint)',
                textDecoration: isCompleted ? 'line-through' : 'none',
                textDecorationColor: 'var(--accent)',
              }}
            >
              <Tag size={10} strokeWidth={1.5} />
              {label.name}
            </span>
          ))}
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {/* Assignee avatar placeholder */}
        {task.assigneeId && (
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {task.assigneeId.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Detail arrow */}
        <motion.button
          {...buttonPress}
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetail(task._id)
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md transition-all duration-150 cursor-pointer"
          style={{
            color: isHovered ? 'var(--accent)' : 'var(--text-faint)',
            backgroundColor: isHovered ? 'var(--bg-hover)' : 'transparent',
          }}
        >
          {isHovered || isDetailOpen ? (
            <ArrowRight size={14} strokeWidth={1.5} />
          ) : (
            <AlignJustify size={14} strokeWidth={1.5} />
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
