'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Archive } from 'lucide-react'
import { collapse, fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import type { CalendarEvent } from './types'

interface UnscheduledPanelProps {
  events: CalendarEvent[]
}

/**
 * UnscheduledPanel — right-side collapsible panel (280px).
 * Lists unscheduled tasks as draggable rows. Includes "Add task" and backlog zone.
 */
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
        style={{
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Unscheduled Today ({events.length})
        </span>
        {collapsed ? (
          <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />
        )}
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            {...collapse}
            transition={ease.normal}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {events.length === 0 ? (
                <p
                  className="text-xs text-center py-6"
                  style={{ color: 'var(--text-faint)' }}
                >
                  No unscheduled tasks
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {events.map((ev) => (
                    <motion.div
                      key={ev.id}
                      {...fadeSlideUp}
                      transition={ease.fast}
                      draggable
                      onDragStart={(e) => {
                        const de = e as unknown as React.DragEvent
                        de.dataTransfer?.setData(
                          'application/x-laif-calendar-event',
                          ev.id
                        )
                        if (de.dataTransfer) de.dataTransfer.effectAllowed = 'move'
                      }}
                      className="flex items-center gap-2 rounded-md px-2 py-2 cursor-grab transition-colors duration-100"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {/* Checkbox placeholder */}
                      <div
                        className="h-4 w-4 rounded-full flex-shrink-0"
                        style={{ border: '1.5px solid var(--accent)' }}
                      />
                      {/* Color dot */}
                      <div
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ev.color }}
                      />
                      <span className="text-xs font-medium truncate flex-1">
                        {ev.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Add task button */}
            <motion.button
              {...buttonPress}
              className="flex items-center gap-2 mx-3 mb-2 px-2 py-2 rounded-md cursor-pointer transition-colors duration-100"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
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

            {/* Backlog zone */}
            <div
              className="flex items-center justify-center gap-1.5 px-3 py-3 mx-3 mb-3 rounded-lg"
              style={{
                border: '1px dashed var(--border)',
                color: 'var(--text-faint)',
              }}
            >
              <Archive size={12} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">
                Drop here to move to backlog
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
