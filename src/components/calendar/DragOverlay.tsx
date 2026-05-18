'use client'

import { DragOverlay as DndKitDragOverlay } from '@dnd-kit/core'
import { useCalendarDnd } from './CalendarDndProvider'
import { useTasks } from '@/hooks/useTasks'
import { formatDuration } from './calendarUtils'

/**
 * Calendar DragOverlay: shows a preview of the block being dragged.
 * Renders at 85% opacity with the task title and a snap indicator.
 */
export default function DragOverlay() {
  const { isDragging, activeData } = useCalendarDnd()
  const { tasks } = useTasks()

  if (!isDragging || !activeData) {
    return <DndKitDragOverlay dropAnimation={null} />
  }

  const task = tasks.find((t) => t._id === activeData.taskId)
  const title = task?.title ?? 'Untitled'
  const color = task?.color ?? 'var(--accent)'

  const origStart = new Date(activeData.originalStart)
  const origEnd = new Date(activeData.originalEnd)
  const duration = formatDuration(origStart, origEnd)

  return (
    <DndKitDragOverlay
      dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="rounded-lg px-3 py-2 shadow-lg pointer-events-none"
        style={{
          opacity: 0.85,
          backgroundColor: color,
          color: '#FFFFFF',
          minWidth: 120,
          maxWidth: 260,
          fontSize: '13px',
          fontWeight: 500,
          border: '2px solid var(--accent)',
        }}
      >
        <div className="truncate">{title}</div>
        <div
          className="mt-0.5 text-[11px]"
          style={{ opacity: 0.8 }}
        >
          {activeData.type === 'resize' ? 'Resizing...' : duration}
        </div>

        {/* Snap indicator line */}
        <div
          className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </div>
    </DndKitDragOverlay>
  )
}
