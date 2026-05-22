'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeSlideUp, ease, buttonPress } from '@/lib/motion'
import { getUserMessage } from '@/lib/errors'

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

  // Derive a user-friendly message from the error digest (code) when available
  const userMessage = error.digest
    ? getUserMessage(error.digest)
    : 'An unexpected error occurred. Your data is safe.'

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center"
      style={{ color: 'var(--text-primary)' }}
    >
      <motion.div {...fadeSlideUp} transition={ease.normal} className="flex flex-col items-center">
        <h2 className="mb-2 text-xl font-bold">Something went wrong</h2>
        <p className="mb-6 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
          {userMessage}
        </p>
        <div className="flex gap-3">
          <motion.button
            onClick={reset}
            className="rounded-full px-6 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--accent)' }}
            {...buttonPress}
          >
            Try again
          </motion.button>
          <motion.a
            href="/"
            className="rounded-full border px-6 py-2.5 text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            {...buttonPress}
          >
            Go home
          </motion.a>
        </div>
      </motion.div>
    </div>
  )
}
