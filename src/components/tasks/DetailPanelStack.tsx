'use client'

import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import TaskDetailPanel from './TaskDetailPanel'
import type { LabelItem } from '@/components/popovers/LabelPopover'
import type { AssigneeUser } from '@/components/popovers/AssigneePopover'

const MAX_VISIBLE_PANELS = 3

interface PanelEntry {
  taskId: string
  title: string
}

interface DetailPanelStackProps {
  /** Initial task to open (the root) */
  initialTaskId: string | null
  onClose: () => void
  labels?: LabelItem[]
  users?: AssigneeUser[]
}

export default function DetailPanelStack({
  initialTaskId,
  onClose,
  labels = [],
  users = [],
}: DetailPanelStackProps) {
  const [stack, setStack] = useState<PanelEntry[]>(() =>
    initialTaskId ? [{ taskId: initialTaskId, title: '' }] : []
  )

  // Push sub-task onto stack
  const handleOpenSubtask = useCallback((subtaskId: string, parentTitle?: string) => {
    setStack(prev => {
      const newEntry: PanelEntry = { taskId: subtaskId, title: '' }
      // Update the current panel's title for the collapsed strip
      const updated = [...prev]
      if (updated.length > 0 && parentTitle) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], title: parentTitle }
      }
      return [...updated, newEntry]
    })
  }, [])

  // Pop back to a specific level
  const handlePopTo = useCallback((index: number) => {
    setStack(prev => prev.slice(0, index + 1))
  }, [])

  // Close the entire stack
  const handleCloseAll = useCallback(() => {
    setStack([])
    onClose()
  }, [onClose])

  // Close the topmost panel
  const handleCloseTop = useCallback(() => {
    setStack(prev => {
      if (prev.length <= 1) {
        onClose()
        return []
      }
      return prev.slice(0, -1)
    })
  }, [onClose])

  // Determine which panels are visible vs collapsed
  const visiblePanels = useMemo(() => {
    if (stack.length === 0) return []
    if (stack.length <= MAX_VISIBLE_PANELS) {
      return stack.map((entry, idx) => ({
        ...entry,
        index: idx,
        collapsed: idx < stack.length - 1,
        isActive: idx === stack.length - 1,
      }))
    }
    // More than MAX_VISIBLE_PANELS: show last MAX_VISIBLE_PANELS, oldest becomes a "+N" tab
    const overflowCount = stack.length - MAX_VISIBLE_PANELS
    const visible = stack.slice(overflowCount).map((entry, idx) => ({
      ...entry,
      index: overflowCount + idx,
      collapsed: idx < MAX_VISIBLE_PANELS - 1,
      isActive: idx === MAX_VISIBLE_PANELS - 1,
    }))
    return visible
  }, [stack])

  const overflowCount = Math.max(0, stack.length - MAX_VISIBLE_PANELS)

  if (stack.length === 0) return null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Overflow indicator */}
      {overflowCount > 0 && (
        <div
          style={{
            width: 32,
            height: '100%',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={() => handlePopTo(0)}
          title={`+${overflowCount} more`}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>
            +{overflowCount}
          </span>
        </div>
      )}

      {/* Panels */}
      <AnimatePresence mode="sync">
        {visiblePanels.map((panel) => (
          <TaskDetailPanel
            key={panel.taskId}
            taskId={panel.taskId}
            collapsed={panel.collapsed}
            onCollapsedClick={() => handlePopTo(panel.index)}
            onClose={panel.isActive ? handleCloseTop : () => handlePopTo(panel.index)}
            onOpenSubtask={(subtaskId) => handleOpenSubtask(subtaskId, panel.title)}
            breadcrumb={
              panel.index > 0
                ? {
                    title: stack[panel.index - 1]?.title || 'Parent task',
                    onClick: () => handlePopTo(panel.index - 1),
                  }
                : null
            }
            labels={labels}
            users={users}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
