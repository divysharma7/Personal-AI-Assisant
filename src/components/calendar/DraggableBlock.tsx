'use client'

import { type ReactNode, useCallback, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { CalendarDragData } from './CalendarDndProvider'

interface DraggableBlockProps {
  /** Unique id for the draggable (usually the task _id) */
  id: string
  /** ISO start time of the scheduled block */
  scheduledStart: string
  /** ISO end time of the scheduled block */
  scheduledEnd: string
  /** Whether the block is read-only (external events, focus sessions) */
  isReadOnly?: boolean
  /** Children: the CalendarBlock rendered by the other agent */
  children: ReactNode
}

export default function DraggableBlock({
  id,
  scheduledStart,
  scheduledEnd,
  isReadOnly = false,
  children,
}: DraggableBlockProps) {
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)

  const dragData: CalendarDragData = {
    taskId: id,
    originalStart: scheduledStart,
    originalEnd: scheduledEnd,
    type: isResizing ? 'resize' : 'move',
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `draggable-${id}`,
    data: dragData,
    disabled: isReadOnly,
  })

  // Separate draggable for the resize handle
  const {
    attributes: resizeAttrs,
    listeners: resizeListeners,
    setNodeRef: setResizeRef,
    isDragging: isResizeDragging,
  } = useDraggable({
    id: `resize-${id}`,
    data: {
      taskId: id,
      originalStart: scheduledStart,
      originalEnd: scheduledEnd,
      type: 'resize' as const,
    } satisfies CalendarDragData,
    disabled: isReadOnly,
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 50,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.4 : 1,
        transition: isDragging ? 'none' : 'box-shadow 150ms ease, transform 150ms ease',
        boxShadow: isDragging
          ? '0 8px 24px rgba(0,0,0,0.15)'
          : 'none',
        transform: isDragging
          ? `${style?.transform ?? ''} scale(1.02)`
          : style?.transform,
        position: 'relative',
      }}
      {...attributes}
      {...listeners}
    >
      {children}

      {/* Resize handle at bottom edge — larger hit area for easier grabbing */}
      {!isReadOnly && (
        <div
          ref={setResizeRef}
          {...resizeAttrs}
          {...resizeListeners}
          className="absolute bottom-0 left-0 right-0 cursor-s-resize group"
          style={{
            height: 12,
            borderBottomLeftRadius: 'inherit',
            borderBottomRightRadius: 'inherit',
          }}
        >
          <div
            className="mx-auto h-[3px] w-10 rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-80"
            style={{
              backgroundColor: '#fff',
              marginTop: 4,
            }}
          />
        </div>
      )}
    </div>
  )
}
