'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { fadeSlideUp, ease } from '@/lib/motion'
import type { ReactNode } from 'react'

interface InfoBannerProps {
  message: string
  icon?: ReactNode
  onDismiss: () => void
  visible?: boolean
}

export default function InfoBanner({
  message,
  icon,
  onDismiss,
  visible = true,
}: InfoBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          {...fadeSlideUp}
          transition={ease.normal}
          className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{
            backgroundColor: 'var(--accent-soft)',
            border: '1px solid var(--border)',
          }}
        >
          <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--info)' }}>
            {icon || <BookOpen size={16} strokeWidth={1.5} />}
          </span>
          <p
            className="flex-1 text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {message}
          </p>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-md p-1 transition-colors duration-150 cursor-pointer"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
