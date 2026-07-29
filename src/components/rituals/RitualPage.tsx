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
    <div className="flex flex-col h-full overflow-y-auto" role="main">
      <div className="mx-auto w-full max-w-[640px] px-6 py-8">
        {/* Page header */}
        <motion.header
          {...fadeSlideUp}
          transition={ease.normal}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--overlay-2)', color: 'var(--accent)' }}
            >
              {icon}
            </span>
            <div>
              <h1
                className="text-[28px] font-bold tracking-[-0.02em]"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h1>
            </div>
          </div>
          <p className="text-[14px] leading-relaxed ml-[52px]" style={{ color: 'var(--text-muted)' }}>
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
