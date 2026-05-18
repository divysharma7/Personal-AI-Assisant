'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { slideFromRight, spring, ease } from '@/lib/motion'
import type { TaskRecord } from '@/hooks/useTasks'
import TaskDetailPanel from './TaskDetailPanel'

interface StackEntry {
  task: TaskRecord
  comments?: { _id?: string; text: string; authorName?: string; authorAvatar?: string; createdAt?: string }[]
}

interface DetailPanelStackProps {
  stack: StackEntry[]
  onPushTask: (taskId: string) => void
  onPopTask: () => void
  onPopToIndex: (index: number) => void
  onClose: () => void
  onUpdate: (id: string, data: Partial<TaskRecord>) => void
  onDelete?: (id: string) => void
  onAddComment?: (taskId: string, text: string) => void
  labels?: { _id: string; name: string }[]
  allLabels?: { _id: string; name: string }[]
  onCreateLabel?: (name: string) => void
}

const MAX_VISIBLE = 3
const STRIP_WIDTH = 64

export default function DetailPanelStack({
  stack,
  onPushTask,
  onPopTask,
  onPopToIndex,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  labels = [],
  allLabels = [],
  onCreateLabel,
}: DetailPanelStackProps) {
  // How many visible strips + the active panel
  const activeIndex = stack.length - 1
  const visibleStart = Math.max(0, stack.length - MAX_VISIBLE)
  const collapsedCount = visibleStart // number of entries collapsed into the "+N" tab
  const strips = stack.slice(visibleStart, activeIndex) // entries shown as strips
  const activeEntry = stack[activeIndex]

  const getLabelsForTask = useCallback(
    (task: TaskRecord) => {
      if (!task.labelIds || task.labelIds.length === 0) return []
      return labels.filter((l) => task.labelIds?.includes(l._id))
    },
    [labels]
  )

  if (!activeEntry) return null

  return (
    <div className="flex h-full">
      {/* Collapsed count tab */}
      {collapsedCount > 0 && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={ease.fast}
          onClick={() => onPopToIndex(0)}
          className="flex h-full w-8 flex-shrink-0 items-center justify-center rounded-l-[16px] cursor-pointer transition-colors duration-150"
          style={{
            backgroundColor: 'var(--bg-pane-2)',
            borderRight: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)'
          }}
        >
          <span className="text-[11px] font-bold">+{collapsedCount}</span>
        </motion.button>
      )}

      {/* Vertical strips for parent tasks */}
      <AnimatePresence>
        {strips.map((entry, i) => {
          const actualIndex = visibleStart + i
          return (
            <motion.button
              key={entry.task._id}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: STRIP_WIDTH, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring.snappy}
              onClick={() => onPopToIndex(actualIndex)}
              className="flex h-full flex-shrink-0 flex-col items-center justify-between overflow-hidden py-4 cursor-pointer transition-colors duration-150"
              style={{
                backgroundColor: 'var(--bg-pane-2)',
                borderRight: '1px solid var(--border)',
                width: STRIP_WIDTH,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-pane-2)'
              }}
            >
              {/* Back arrow */}
              <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} />

              {/* Rotated title */}
              <div
                className="flex-1 flex items-center justify-center overflow-hidden"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                <span
                  className="truncate text-xs font-medium"
                  style={{
                    color: 'var(--text-muted)',
                    maxHeight: '200px',
                  }}
                >
                  {entry.task.title}
                </span>
              </div>

              {/* Overflow */}
              <MoreVertical size={14} style={{ color: 'var(--text-faint)' }} />
            </motion.button>
          )
        })}
      </AnimatePresence>

      {/* Active panel */}
      <TaskDetailPanel
        task={activeEntry.task}
        onClose={stack.length === 1 ? onClose : onPopTask}
        onUpdate={onUpdate}
        onDelete={onDelete}
        comments={activeEntry.comments}
        onAddComment={onAddComment}
        labels={getLabelsForTask(activeEntry.task)}
        allLabels={allLabels}
        onCreateLabel={onCreateLabel}
        breadcrumb={activeIndex > 0 ? stack[activeIndex - 1].task.title : null}
        onBreadcrumbClick={activeIndex > 0 ? onPopTask : undefined}
        onOpenSubTask={onPushTask}
      />
    </div>
  )
}
