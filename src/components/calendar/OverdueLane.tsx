'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { fadeSlideDown, ease } from '@/lib/motion'
import type { CalendarEvent } from './types'

interface OverdueLaneProps {
  events: CalendarEvent[]
}

/**
 * OverdueLane — warning banner with draggable overdue task chips.
 * Only shown when overdue tasks exist. Animated entrance: slideDown 250ms.
 */
export default function OverdueLane({ events }: OverdueLaneProps) {
  if (events.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{
            backgroundColor: 'var(--accent-soft)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Warning label */}
          <div
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            <AlertTriangle size={14} strokeWidth={2} />
            <span className="text-xs font-semibold">
              {events.length} overdue
            </span>
          </div>

          {/* Overdue chips */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                {...fadeSlideDown}
                transition={ease.fast}
                draggable
                onDragStart={(e) => {
                  const de = e as unknown as React.DragEvent
                  de.dataTransfer?.setData('application/x-laif-calendar-event', ev.id)
                  if (de.dataTransfer) de.dataTransfer.effectAllowed = 'move'
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 cursor-grab whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--bg-pane-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <span
                  className="text-xs font-medium truncate max-w-[140px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {ev.title}
                </span>
                {ev.daysOverdue !== undefined && ev.daysOverdue > 0 && (
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--accent)' }}
                  >
                    {ev.daysOverdue}d
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
