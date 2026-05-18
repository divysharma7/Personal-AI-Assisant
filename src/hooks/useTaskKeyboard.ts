'use client'

import { useEffect, useCallback, useRef } from 'react'

interface UseTaskKeyboardOptions {
  tasks: { _id: string }[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onToggleComplete: (taskId: string) => void
  onOpenDetail: (taskId: string) => void
  onSetPriority: (taskId: string, priority: 'high' | 'medium' | 'low') => void
  onDelete: (taskId: string) => void
  onFocusNewTask: () => void
  onCloseDetail?: () => void
  hasOpenPopover?: boolean
  onClosePopover?: () => void
  enabled?: boolean
}

export function useTaskKeyboard({
  tasks,
  selectedIndex,
  onSelectIndex,
  onToggleComplete,
  onOpenDetail,
  onSetPriority,
  onDelete,
  onFocusNewTask,
  onCloseDetail,
  hasOpenPopover = false,
  onClosePopover,
  enabled = true,
}: UseTaskKeyboardOptions) {
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const selectedIndexRef = useRef(selectedIndex)
  selectedIndexRef.current = selectedIndex

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return
    const current = tasksRef.current
    const idx = selectedIndexRef.current

    // Check if user is in an input/textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Only allow Ctrl+N to work inside inputs
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onFocusNewTask()
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        // Close one level at a time: popover -> detail -> nothing
        if (hasOpenPopover && onClosePopover) {
          onClosePopover()
        } else if (onCloseDetail) {
          onCloseDetail()
        }
        break

      case 'ArrowUp':
        e.preventDefault()
        if (current.length > 0) {
          onSelectIndex(Math.max(0, idx - 1))
        }
        break

      case 'ArrowDown':
        e.preventDefault()
        if (current.length > 0) {
          onSelectIndex(Math.min(current.length - 1, idx + 1))
        }
        break

      case ' ':
        e.preventDefault()
        if (idx >= 0 && idx < current.length) {
          onToggleComplete(current[idx]._id)
        }
        break

      case 'Enter':
        e.preventDefault()
        if (idx >= 0 && idx < current.length) {
          onOpenDetail(current[idx]._id)
        }
        break

      case '1':
        e.preventDefault()
        if (idx >= 0 && idx < current.length) {
          onSetPriority(current[idx]._id, 'high')
        }
        break

      case '2':
        e.preventDefault()
        if (idx >= 0 && idx < current.length) {
          onSetPriority(current[idx]._id, 'medium')
        }
        break

      case '3':
        e.preventDefault()
        if (idx >= 0 && idx < current.length) {
          onSetPriority(current[idx]._id, 'low')
        }
        break

      case 'Delete':
      case 'Backspace':
        if (e.key === 'Delete' || (e.key === 'Backspace' && (e.ctrlKey || e.metaKey))) {
          e.preventDefault()
          if (idx >= 0 && idx < current.length) {
            onDelete(current[idx]._id)
          }
        }
        break

      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          onFocusNewTask()
        }
        break

      default:
        break
    }
  }, [enabled, onSelectIndex, onToggleComplete, onOpenDetail, onSetPriority, onDelete, onFocusNewTask, onCloseDetail, hasOpenPopover, onClosePopover])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
