'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePomodoroContext } from '@/contexts/PomodoroContext'
import { snappy } from '@/shared/design-system'

/**
 * Floating mini-timer pill shown in the bottom-right corner when a Pomodoro
 * is running and the user is NOT on the /pomodoro page.
 * Positioned above the FloatingChat bubble (which is at bottom-6 right-6, z-[400]).
 * This sits at bottom-[88px] right-6, z-[399] to avoid conflict.
 */
export default function FloatingMiniTimer() {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = usePomodoroContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isOnPomodoroPage = pathname === '/pomodoro'
  const shouldShow = state.running && !isOnPomodoroPage

  const mm = String(Math.floor(state.secondsLeft / 60)).padStart(2, '0')
  const ss = String(state.secondsLeft % 60).padStart(2, '0')
  const progress = 1 - state.secondsLeft / state.totalSec
  const color = state.mode === 'work' ? 'var(--accent)' : 'var(--color-task)'

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          key="mini-timer"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={snappy}
          onClick={() => router.push('/pomodoro')}
          className="fixed z-[399] flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer"
          style={{
            bottom: 88,
            right: 24,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
          }}
          title="Go to Pomodoro timer"
        >
          {/* Mini progress ring */}
          <svg width={24} height={24} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
            <circle cx={12} cy={12} r={9} fill="none" stroke="var(--border)" strokeWidth={2.5} />
            <circle
              cx={12} cy={12} r={9} fill="none"
              stroke={color} strokeWidth={2.5} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Timer text */}
          <span
            className="font-bold tabular-nums text-sm"
            style={{ color: 'var(--text-1)', letterSpacing: '-0.5px' }}
          >
            {mm}:{ss}
          </span>

          {/* Mode dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: color, flexShrink: 0 }}
          />
        </motion.button>
      )}
    </AnimatePresence>,
    document.body
  )
}
