'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease, buttonPress } from '@/lib/motion'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('LAIF error boundary caught:', error)
  }, [error])

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center"
      style={{ color: 'var(--text-primary)' }}
    >
      <motion.div {...fadeSlideUp} transition={ease.normal}>
        <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          An unexpected error occurred. Your data is safe.
        </p>
        <motion.button
          onClick={reset}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-white"
          style={{ backgroundColor: 'var(--accent)' }}
          {...buttonPress}
        >
          Try again
        </motion.button>
      </motion.div>
    </div>
  )
}
