'use client'

import { type ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useCalendarDnd } from './CalendarDndProvider'

interface DroppableSlotProps {
  /** Slot id: "slot-{dayISO}-{slotIndex}" */
  id: string
  /** The 0-indexed row (0..95 for 96 15-min slots) */
  slotIndex: number
  /** ISO date string for the day column */
  day: string
  /** Any existing children in this slot */
  children?: ReactNode
  /** List of existing event ids occupying this slot (for overlap detection) */
  occupiedBy?: string[]
}

export default function DroppableSlot({
  id,
  slotIndex,
  day,
  children,
  occupiedBy = [],
}: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id })
  const { isDragging, activeData } = useCalendarDnd()

  // Determine visual state
  const isDropTarget = isDragging && isOver
  const hasOverlap = isDropTarget && occupiedBy.length > 0 && activeData?.taskId
    ? occupiedBy.some((eid) => eid !== activeData.taskId)
    : false

  // Compute time label for accessibility
  const hours = Math.floor(slotIndex / 4)
  const minutes = (slotIndex % 4) * 15
  const timeLabel = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  return (
    <div
      ref={setNodeRef}
      data-slot-id={id}
      data-slot-index={slotIndex}
      data-day={day}
      aria-label={`Time slot ${timeLabel}`}
      className="relative transition-colors duration-100"
      style={{
        minHeight: '16px',
        backgroundColor: isDropTarget
          ? hasOverlap
            ? 'rgba(239, 68, 68, 0.08)' // red tint for overlap
            : 'var(--accent-soft, rgba(99, 91, 255, 0.08))'
          : 'transparent',
        borderBottom: slotIndex % 4 === 3
          ? '1px solid var(--border)'
          : '1px solid transparent',
      }}
    >
      {/* Snap indicator line when hovered during drag */}
      {isDropTarget && !hasOverlap && (
        <div
          className="absolute left-0 right-0 top-0 z-10 h-[2px]"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}

      {/* Overlap warning indicator */}
      {isDropTarget && hasOverlap && (
        <div
          className="absolute left-0 right-0 top-0 z-10 h-[2px]"
          style={{ backgroundColor: '#ef4444' }}
        />
      )}

      {children}
    </div>
  )
}
