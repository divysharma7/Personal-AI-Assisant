'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragCancelEvent,
  type DragOverEvent,
  closestCenter,
  type CollisionDetection,
  type DroppableContainer,
  pointerWithin,
} from '@dnd-kit/core'
import { useTasks } from '@/hooks/useTasks'

/* ── Drag data interface ── */
export interface CalendarDragData {
  taskId: string
  originalStart: string
  originalEnd: string
  type: 'move' | 'resize'
}

/* ── Context for drag state ── */
interface CalendarDndState {
  isDragging: boolean
  activeId: string | null
  activeData: CalendarDragData | null
  overId: string | null
}

const CalendarDndContext = createContext<CalendarDndState>({
  isDragging: false,
  activeId: null,
  activeData: null,
  overId: null,
})

export function useCalendarDnd() {
  return useContext(CalendarDndContext)
}

/* ── Custom collision detection ──
 * Uses pointerWithin for broad hit testing against time-slot droppables,
 * then falls back to closestCenter for fine-grained snapping.
 */
const timeGridCollision: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) return pointerCollisions

  return closestCenter(args)
}

/* ── Provider component ── */
interface CalendarDndProviderProps {
  children: ReactNode
}

export default function CalendarDndProvider({ children }: CalendarDndProviderProps) {
  const { updateTask } = useTasks()

  const [state, setState] = useState<CalendarDndState>({
    isDragging: false,
    activeId: null,
    activeData: null,
    overId: null,
  })

  /* Pointer sensor: 5px activation distance to distinguish click from drag */
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })

  /* Keyboard sensor for accessibility */
  const keyboardSensor = useSensor(KeyboardSensor)

  const sensors = useSensors(pointerSensor, keyboardSensor)

  /* ── Drag lifecycle handlers ── */

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as CalendarDragData | undefined
    setState({
      isDragging: true,
      activeId: String(event.active.id),
      activeData: data ?? null,
      overId: null,
    })
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setState((prev) => ({
      ...prev,
      overId: event.over ? String(event.over.id) : null,
    }))
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      const data = active.data.current as CalendarDragData | undefined

      setState({
        isDragging: false,
        activeId: null,
        activeData: null,
        overId: null,
      })

      if (!over || !data) return

      // Parse the drop slot id: format "slot-{dayISO}-{slotIndex}"
      const slotId = String(over.id)
      const match = slotId.match(/^slot-(.+)-(\d+)$/)
      if (!match) return

      const dayStr = match[1]
      const slotIndex = parseInt(match[2], 10)

      // Compute new start time from slot position: each slot = 15 min
      const dayDate = new Date(dayStr)
      const hours = Math.floor(slotIndex / 4)
      const minutes = (slotIndex % 4) * 15
      dayDate.setHours(hours, minutes, 0, 0)

      const newStart = dayDate.toISOString()

      if (data.type === 'resize') {
        // Resize: only update scheduledEnd
        const resizeEnd = new Date(dayDate)
        resizeEnd.setMinutes(resizeEnd.getMinutes() + 15) // minimum 15-min
        await updateTask(data.taskId, {
          scheduledEnd: resizeEnd.toISOString(),
        })
      } else {
        // Move: compute duration from original, apply to new position
        const origStart = new Date(data.originalStart)
        const origEnd = new Date(data.originalEnd)
        const durationMs = origEnd.getTime() - origStart.getTime()

        const newEnd = new Date(dayDate.getTime() + durationMs)

        // Optimistic update: API call follows
        await updateTask(data.taskId, {
          scheduledStart: newStart,
          scheduledEnd: newEnd.toISOString(),
        })
      }
    },
    [updateTask]
  )

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setState({
      isDragging: false,
      activeId: null,
      activeData: null,
      overId: null,
    })
  }, [])

  const contextValue = useMemo(() => state, [state])

  return (
    <CalendarDndContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={timeGridCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </CalendarDndContext.Provider>
  )
}
