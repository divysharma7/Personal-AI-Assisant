import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease } from '@/lib/motion'

interface RitualPageProps {
  /** Page icon (lucide component) */
  icon: ReactNode
  /** Page title */
  title: string
  /** Subtitle / description */
  subtitle: string
  /** Page body (steps) */
  children: ReactNode
  /** Optional footer actions */
  footer?: ReactNode
}

/**
 * Shared page wrapper for ritual flows (Plan / Shutdown).
 * Provides a focused, centered layout — not a dashboard.
 */
export default function RitualPage({
  icon,
  title,
  subtitle,
  children,
  footer,
}: RitualPageProps) {
  return (
    <div className="workspace-page overflow-y-auto" role="main">
      <div className="mx-auto w-full max-w-[720px] px-5 py-5">
        {/* Page header */}
        <motion.header
          {...fadeSlideUp}
          transition={ease.normal}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]"
              style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--accent)' }}
            >
              {icon}
            </span>
            <div>
              <h1
                className="type-page-title"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h1>
            </div>
          </div>
          <p className="type-meta ml-11" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        </motion.header>

        {/* Steps */}
        <div className="flex flex-col gap-8">
          {children}
        </div>

        {/* Footer actions */}
        {footer && (
          <motion.footer
            {...fadeSlideUp}
            transition={ease.normal}
            className="mt-10 pt-6"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {footer}
          </motion.footer>
        )}
      </div>
    </div>
  )
}
