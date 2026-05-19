'use client'

import { motion } from 'framer-motion'
import { fadeSlideUp, ease } from '@/lib/motion'

export default function TypingIndicator() {
  return (
    <motion.div
      {...fadeSlideUp}
      transition={ease.normal}
      className="flex items-start gap-2 mb-3"
    >
      {/* Avatar */}
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: 'var(--bg-pane-2)', color: 'var(--text-primary)' }}
      >
        L
      </div>

      {/* Bubble with bouncing dots */}
      <div
        className="flex items-center gap-1 rounded-2xl px-4 py-3"
        style={{ backgroundColor: 'var(--bg-pane-2)' }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              animation: `chat-bounce 1.2s ease-in-out ${i * 150}ms infinite`,
            }}
          />
        ))}

        <style jsx>{`
          @keyframes chat-bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-4px);
            }
          }
        `}</style>
      </div>
    </motion.div>
  )
}
