import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease } from '@/lib/motion'

interface RitualCardProps {
  children: ReactNode
  /** Optional accent color for the left border */
  accent?: string
  /** Additional CSS classes */
  className?: string
  /** ARIA label for the card */
  'aria-label'?: string
}

/**
 * Shared card component for ritual flows (Plan / Shutdown).
 * Uses the same surface styling as the rest of the app.
 */
export default function RitualCard({ children, accent, className = '', ...rest }: RitualCardProps) {
  return (
    <motion.section
      {...fadeSlideUp}
      transition={ease.normal}
      className={`surface-card p-4 ${className}`}
      style={{
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
      {...rest}
    >
      {children}
    </motion.section>
  )
}
