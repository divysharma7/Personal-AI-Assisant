'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pencil,
  Copy,
  ArrowRight,
  CalendarX2,
  Archive,
} from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'
import { useTasks } from '@/hooks/useTasks'

export interface BlockContextMenuData {
  taskId: string
  x: number
  y: number
}

interface BlockContextMenuProps {
  data: BlockContextMenuData | null
  onClose: () => void
  onEditTask: (taskId: string) => void
}

export default function BlockContextMenu({
  data,
  onClose,
  onEditTask,
}: BlockContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { tasks, updateTask, createTask } = useTasks()

  // Close on outside click
  useEffect(() => {
    if (!data) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [data, onClose])

  // Close on Esc
  useEffect(() => {
    if (!data) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [data, onClose])

  const task = data ? tasks.find((t) => t._id === data.taskId) : null

  const handleEdit = useCallback(() => {
    if (!data) return
    onEditTask(data.taskId)
    onClose()
  }, [data, onEditTask, onClose])

  const handleDuplicate = useCallback(async () => {
    if (!task) return
    await createTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      scheduledStart: task.scheduledStart,
      scheduledEnd: task.scheduledEnd,
      estimatedEffort: task.estimatedEffort,
      labelIds: task.labelIds,
      listId: task.listId,
    })
    onClose()
  }, [task, createTask, onClose])

  const handlePostpone = useCallback(async () => {
    if (!task) return
    const newStart = task.scheduledStart
      ? new Date(new Date(task.scheduledStart).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null
    const newEnd = task.scheduledEnd
      ? new Date(new Date(task.scheduledEnd).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null
    const newDueDate = task.dueDate
      ? new Date(new Date(task.dueDate).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : undefined

    await updateTask(task._id, {
      scheduledStart: newStart,
      scheduledEnd: newEnd,
      ...(newDueDate ? { dueDate: newDueDate } : {}),
    })
    onClose()
  }, [task, updateTask, onClose])

  const handleRemoveSchedule = useCallback(async () => {
    if (!task) return
    await updateTask(task._id, {
      scheduledStart: null,
      scheduledEnd: null,
    })
    onClose()
  }, [task, updateTask, onClose])

  const handleMoveToBacklog = useCallback(async () => {
    if (!task) return
    await updateTask(task._id, {
      status: 'backlog',
      scheduledStart: null,
      scheduledEnd: null,
    })
    onClose()
  }, [task, updateTask, onClose])

  const MENU_ITEMS = [
    { label: 'Edit', icon: Pencil, onClick: handleEdit, danger: false },
    { label: 'Duplicate', icon: Copy, onClick: handleDuplicate, danger: false },
    { label: 'Postpone 1 day', icon: ArrowRight, onClick: handlePostpone, danger: false },
    { type: 'divider' as const },
    { label: 'Remove schedule', icon: CalendarX2, onClick: handleRemoveSchedule, danger: false },
    { label: 'Move to backlog', icon: Archive, onClick: handleMoveToBacklog, danger: true },
  ] as const

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          ref={menuRef}
          {...fadeSlideDown}
          transition={ease.fast}
          className="fixed z-[100] w-52 rounded-xl p-1.5"
          style={{
            left: data.x,
            top: data.y,
            backgroundColor: 'var(--bg-pane-2)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {MENU_ITEMS.map((item, i) => {
            if ('type' in item && item.type === 'divider') {
              return (
                <div
                  key={`divider-${i}`}
                  className="my-1 h-px"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              )
            }

            if (!('label' in item)) return null

            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 cursor-pointer"
                style={{
                  color: item.danger ? '#ef4444' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = item.danger
                    ? 'rgba(239,68,68,0.08)'
                    : 'var(--bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={14} strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
