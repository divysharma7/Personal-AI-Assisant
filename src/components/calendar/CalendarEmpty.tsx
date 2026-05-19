'use client'

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { fadeSlideUp, ease } from '@/lib/motion'

/**
 * CalendarEmpty — shown when a day has no scheduled tasks.
 * Centered icon with helpful text and breathing animation.
 */
export default function CalendarEmpty() {
  return (
    <motion.div
      {...fadeSlideUp}
      transition={ease.normal}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Calendar size={48} strokeWidth={1} style={{ color: 'var(--text-faint)', opacity: 0.3 }} />
      <h3 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        This day is open
      </h3>
      <p className="mt-1 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>
        Drag a task from the right to plan it.
      </p>
    </motion.div>
  )
}
