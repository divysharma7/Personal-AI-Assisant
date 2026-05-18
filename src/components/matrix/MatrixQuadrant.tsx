'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Calendar, Plus } from 'lucide-react'
import { copy } from '@/lib/copy'
import {
  fadeSlideUp,
  taskComplete,
  stagger,
  ease,
  buttonPress,
  checkBounce,
} from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'

interface MatrixQuadrantProps {
  title: string
  subtitle: string
  color: string
  tasks: TaskRecord[]
  onToggleTask: (id: string) => void
  onOpenDetail: (id: string) => void
  onAddTask: (effort: number) => void
}

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return 'Yesterday'
  if (days < -1) return `${Math.abs(days)} days ago`
  if (days > 1 && days <= 7) return `in ${days} days`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MatrixQuadrant({
  title,
  subtitle,
  color,
  tasks,
  onToggleTask,
  onOpenDetail,
  onAddTask,
}: MatrixQuadrantProps) {
  const [showAddInput, setShowAddInput] = useState(false)
  const [effortValue, setEffortValue] = useState('')
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())

  const handleToggle = (id: string) => {
    setCompletingIds((prev) => new Set(prev).add(id))
    onToggleTask(id)
  }

  const handleAddSubmit = () => {
    const hours = parseFloat(effortValue)
    if (!isNaN(hours) && hours > 0) {
      onAddTask(hours)
    }
    setEffortValue('')
    setShowAddInput(false)
  }

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-pane)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <span
          className="flex-shrink-0 h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-[14px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </span>
        <span
          className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          {tasks.length}
        </span>
        <span
          className="ml-auto text-[12px]"
          style={{ color: 'var(--text-faint)' }}
        >
          {subtitle}
        </span>
      </div>

      {/* Task list (scrollable) */}
      <motion.div
        className="flex-1 overflow-y-auto px-2 pb-2"
        variants={stagger(0.03)}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 && (
            <motion.div
              {...fadeSlideUp}
              transition={ease.normal}
              className="flex items-center justify-center py-8"
            >
              <span
                className="text-[13px]"
                style={{ color: 'var(--text-faint)' }}
              >
                {copy.matrix.empty}
              </span>
            </motion.div>
          )}

          {tasks.map((task) => {
            const dateStr = formatDate(task.dueDate ?? null)
            const overdue = isOverdue(task.dueDate ?? null)
            const isCompleting = completingIds.has(task._id)

            return (
              <motion.div
                key={task._id}
                layout
                {...(isCompleting ? taskComplete : fadeSlideUp)}
                transition={ease.normal}
                className="group flex items-center gap-2 rounded-lg px-2 py-2 transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onClick={() => onOpenDetail(task._id)}
              >
                {/* Checkbox */}
                <motion.button
                  {...buttonPress}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggle(task._id)
                  }}
                  className="flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
                  style={{
                    border: `1.5px solid ${color}`,
                    backgroundColor: 'transparent',
                    width: 18,
                    height: 18,
                  }}
                >
                  <AnimatePresence>
                    {task.status === 'done' && (
                      <motion.div
                        initial={checkBounce.initial}
                        animate={checkBounce.checked}
                      >
                        <Check
                          size={10}
                          strokeWidth={2.5}
                          style={{ color }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Title + metadata */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    {dateStr && (
                      <span
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: overdue ? '#FF4D3D' : 'var(--text-faint)' }}
                      >
                        <Calendar size={10} strokeWidth={1.5} />
                        {dateStr}
                      </span>
                    )}
                    {task.estimatedEffort != null && (
                      <span
                        className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px]"
                        style={{
                          backgroundColor: `${color}15`,
                          color,
                        }}
                      >
                        {'\u23F1'} {task.estimatedEffort}h
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Add task */}
      <div className="px-2 pb-2">
        <AnimatePresence>
          {showAddInput && (
            <motion.div
              {...fadeSlideUp}
              transition={ease.fast}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 mb-1"
              style={{ backgroundColor: 'var(--bg-hover)' }}
            >
              <span
                className="text-[12px] flex-shrink-0"
                style={{ color: 'var(--text-faint)' }}
              >
                {copy.matrix.estHoursPlaceholder}:
              </span>
              <input
                autoFocus
                type="number"
                min="0.25"
                step="0.25"
                value={effortValue}
                onChange={(e) => setEffortValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubmit()
                  if (e.key === 'Escape') {
                    setShowAddInput(false)
                    setEffortValue('')
                  }
                }}
                onBlur={() => {
                  if (!effortValue) {
                    setShowAddInput(false)
                  }
                }}
                className="w-16 bg-transparent text-[13px] outline-none"
                style={{ color: 'var(--text-primary)' }}
                placeholder="2"
              />
              <motion.button
                {...buttonPress}
                onClick={handleAddSubmit}
                className="rounded-md px-2 py-0.5 text-[12px] font-medium cursor-pointer"
                style={{ backgroundColor: color, color: '#fff' }}
              >
                Add
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowAddInput(true)}
          className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors duration-150 cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            e.currentTarget.style.color = color
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--text-faint)'
          }}
        >
          <Plus size={14} strokeWidth={1.5} />
          {copy.matrix.addTask}
        </button>
      </div>
    </div>
  )
}
