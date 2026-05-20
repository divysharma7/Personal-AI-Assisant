'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Archive } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import { collapse, fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import type { CalendarEvent } from './types'
import type { CalendarDragData } from './CalendarDndProvider'

interface UnscheduledPanelProps {
  events: CalendarEvent[]
}

/** Individual draggable task row using dnd-kit */
function DraggableTaskRow({ event }: { event: CalendarEvent }) {
  const dragData: CalendarDragData = {
    taskId: event.id,
    originalStart: event.start || new Date().toISOString(),
    originalEnd: event.end || new Date().toISOString(),
    type: 'move',
  }

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `unscheduled-${event.id}`,
    data: dragData,
  })

  return (
    <motion.div
      ref={setNodeRef}
      {...fadeSlideUp}
      transition={ease.fast}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 rounded-md px-2 py-2 cursor-grab transition-sl"
      style={{
        color: 'var(--text-primary)',
        opacity: isDragging ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <div
        className="h-4 w-4 rounded-full flex-shrink-0"
        style={{ border: '1.5px solid var(--overlay-3, var(--text-faint))' }}
      />
      <div
        className="h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: event.color }}
      />
      <span className="text-xs font-medium truncate flex-1">
        {event.title}
      </span>
    </motion.div>
  )
}

export default function UnscheduledPanel({ events }: UnscheduledPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        width: 280,
        borderLeft: '1px solid var(--border)',
        backgroundColor: 'var(--bg-pane)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          Unscheduled Today ({events.length})
        </span>
        {collapsed ? (
          <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            {...collapse}
            transition={ease.normal}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {events.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-faint)' }}>
                  No unscheduled tasks
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {events.map((ev) => (
                    <DraggableTaskRow key={ev.id} event={ev} />
                  ))}
                </div>
              )}
            </div>

            <motion.button
              {...buttonPress}
              className="flex items-center gap-2 mx-3 mb-2 px-2 py-2 rounded-md cursor-pointer transition-sl"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--overlay-1, var(--bg-hover))'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--text-faint)'
              }}
            >
              <Plus size={14} strokeWidth={1.5} />
              <span className="text-xs font-medium">Add task</span>
            </motion.button>

            <div
              className="flex items-center justify-center gap-1.5 px-3 py-3 mx-3 mb-3 rounded-lg"
              style={{
                border: '1px dashed var(--border)',
                color: 'var(--text-faint)',
              }}
            >
              <Archive size={12} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Drop here to move to backlog</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
