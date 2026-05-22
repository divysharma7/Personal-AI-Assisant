'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { CalendarEvent } from '../types'

/** Default visible range (7 AM - 9 PM) when hidden hours are not used */
const FIRST_VISIBLE_ROW = 29
const LAST_VISIBLE_ROW = 84
const VISIBLE_ROW_COUNT = LAST_VISIBLE_ROW - FIRST_VISIBLE_ROW + 1

/**
 * Compute visible row boundaries from hidden hour settings.
 * hiddenHoursStart=7 means hours 0-6 are hidden => first visible row = 7*4+1 = 29
 * hiddenHoursEnd=21 means hours 21-23 are hidden => last visible row = 21*4 = 84
 */
export function computeVisibleRange(hiddenHoursStart: number, hiddenHoursEnd: number): {
  firstVisibleRow: number
  lastVisibleRow: number
  visibleRowCount: number
} {
  const firstVisibleRow = hiddenHoursStart * 4 + 1
  const lastVisibleRow = hiddenHoursEnd * 4
  const visibleRowCount = lastVisibleRow - firstVisibleRow + 1
  return { firstVisibleRow, lastVisibleRow, visibleRowCount }
}

interface DragCreateState {
  colIndex: number
  startRow: number
  currentRow: number
}

interface ResizeState {
  eventId: string
  colIndex: number
  originalEndRow: number
  currentEndRow: number
}

/**
 * Custom hook encapsulating all WeekTimeGrid interaction logic:
 * - Click-to-create
 * - Drag-to-create
 * - Resize events
 * - Auto-scroll to current time
 */
export function useWeekInteractions(
  weekDays: Date[],
  allEvents: CalendarEvent[],
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  visibleRange?: { firstVisibleRow: number; lastVisibleRow: number; visibleRowCount: number },
) {
  const effectiveFirst = visibleRange?.firstVisibleRow ?? FIRST_VISIBLE_ROW
  const effectiveLast = visibleRange?.lastVisibleRow ?? LAST_VISIBLE_ROW
  const effectiveCount = visibleRange?.visibleRowCount ?? VISIBLE_ROW_COUNT
  const [newTaskSlot, setNewTaskSlot] = useState<{ col: number; row: number } | null>(null)
  const [dragCreate, setDragCreate] = useState<DragCreateState | null>(null)
  const [resizingEvent, setResizingEvent] = useState<ResizeState | null>(null)

  const isDragCreating = useRef(false)
  const isResizing = useRef(false)

  /* -- Auto-scroll to current time on mount -- */
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const now = new Date()
    const currentSlot = now.getHours() * 4 + Math.floor(now.getMinutes() / 15) + 1
    const visiblePosition = currentSlot - effectiveFirst

    if (visiblePosition >= 0 && visiblePosition <= effectiveCount) {
      const rowHeight = container.scrollHeight / effectiveCount
      const targetScroll = Math.max(0, visiblePosition * rowHeight - container.clientHeight / 3)
      container.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
  }, [scrollContainerRef, effectiveFirst, effectiveCount])

  /* -- Click-to-create handler -- */
  const handleSlotClick = useCallback((colIndex: number, actualRow: number) => {
    if (isDragCreating.current) return
    setNewTaskSlot({ col: colIndex, row: actualRow })
  }, [])

  const handleNewTaskKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setNewTaskSlot(null)
        return
      }
      if (e.key === 'Enter') {
        const title = (e.target as HTMLInputElement).value.trim()
        if (title && newTaskSlot !== null) {
          const slotIndex = newTaskSlot.row - 1
          const dayISO = weekDays[newTaskSlot.col].toISOString().split('T')[0]
          window.dispatchEvent(
            new CustomEvent('laif:create-calendar-task', {
              detail: { title, slotIndex, dayISO },
            })
          )
        }
        setNewTaskSlot(null)
      }
    },
    [newTaskSlot, weekDays]
  )

  /* -- Drag-to-create: mousedown on empty slot -- */
  const handleGridMouseDown = useCallback((e: React.MouseEvent, colIndex: number, actualRow: number) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('.cal-block') || target.closest('[data-draggable]')) return

    isDragCreating.current = true
    setDragCreate({
      colIndex,
      startRow: actualRow,
      currentRow: actualRow,
    })
    e.preventDefault()
  }, [])

  /* -- Drag-to-create: global mousemove/mouseup -- */
  useEffect(() => {
    if (!dragCreate) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = scrollContainerRef.current
      if (!container) return

      const gridEl = container.querySelector('.cal-grid')
      if (!gridEl) return

      const gridRect = gridEl.getBoundingClientRect()
      const relativeY = e.clientY - gridRect.top + container.scrollTop
      const rowHeight = gridEl.scrollHeight / effectiveCount
      const rowOffset = Math.floor(relativeY / rowHeight)
      const currentRow = Math.max(effectiveFirst, Math.min(effectiveLast, rowOffset + effectiveFirst))

      setDragCreate((prev) => prev ? { ...prev, currentRow } : null)
    }

    const handleMouseUp = () => {
      if (dragCreate) {
        const minRow = Math.min(dragCreate.startRow, dragCreate.currentRow)
        const maxRow = Math.max(dragCreate.startRow, dragCreate.currentRow)
        const span = maxRow - minRow

        if (span >= 1) {
          const dayISO = weekDays[dragCreate.colIndex].toISOString().split('T')[0]
          const startSlotIndex = minRow - 1
          const endSlotIndex = maxRow - 1

          const startHour = Math.floor(startSlotIndex / 4)
          const startMin = (startSlotIndex % 4) * 15
          const endHour = Math.floor(endSlotIndex / 4)
          const endMin = (endSlotIndex % 4) * 15

          window.dispatchEvent(
            new CustomEvent('laif:create-calendar-task', {
              detail: {
                slotIndex: startSlotIndex,
                dayISO,
                startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
                endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
              },
            })
          )
        }
      }
      setDragCreate(null)
      setTimeout(() => { isDragCreating.current = false }, 100)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragCreate, weekDays, scrollContainerRef, effectiveFirst, effectiveLast, effectiveCount])

  /* -- Resize handle: mousedown -- */
  const handleResizeStart = useCallback((e: React.MouseEvent, eventId: string, colIndex: number, endRow: number) => {
    e.preventDefault()
    e.stopPropagation()
    isResizing.current = true
    setResizingEvent({
      eventId,
      colIndex,
      originalEndRow: endRow,
      currentEndRow: endRow,
    })
  }, [])

  /* -- Resize: global mousemove/mouseup -- */
  useEffect(() => {
    if (!resizingEvent) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = scrollContainerRef.current
      if (!container) return

      const gridEl = container.querySelector('.cal-grid')
      if (!gridEl) return

      const gridRect = gridEl.getBoundingClientRect()
      const relativeY = e.clientY - gridRect.top + container.scrollTop
      const rowHeight = gridEl.scrollHeight / effectiveCount
      const rowOffset = Math.floor(relativeY / rowHeight)
      const currentEndRow = Math.max(effectiveFirst, Math.min(effectiveLast, rowOffset + effectiveFirst))

      setResizingEvent((prev) => prev ? { ...prev, currentEndRow } : null)
    }

    const handleMouseUp = () => {
      if (resizingEvent) {
        const ev = allEvents.find((e) => e.id === resizingEvent.eventId)
        if (ev) {
          const newEndSlot = resizingEvent.currentEndRow - 1
          const endHour = Math.floor(newEndSlot / 4)
          const endMin = (newEndSlot % 4) * 15
          const newEnd = new Date(ev.start)
          newEnd.setHours(endHour, endMin, 0, 0)

          if (newEnd.getTime() > new Date(ev.start).getTime()) {
            window.dispatchEvent(
              new CustomEvent('laif:resize-calendar-task', {
                detail: { taskId: resizingEvent.eventId, newEnd: newEnd.toISOString() },
              })
            )
          }
        }
      }
      setResizingEvent(null)
      setTimeout(() => { isResizing.current = false }, 100)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingEvent, allEvents, scrollContainerRef, effectiveFirst, effectiveLast, effectiveCount])

  return {
    newTaskSlot,
    setNewTaskSlot,
    dragCreate,
    resizingEvent,
    handleSlotClick,
    handleNewTaskKeyDown,
    handleGridMouseDown,
    handleResizeStart,
  }
}

export { FIRST_VISIBLE_ROW, LAST_VISIBLE_ROW, VISIBLE_ROW_COUNT }
export type { DragCreateState, ResizeState }
