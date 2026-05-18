'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, buttonPress, ease } from '@/lib/motion'

// TODO: move to copy.ts
const COPY = {
  streakTitle: (days: number) => `${days}-day streak!`,
  keepGoing: 'Keep going',
} as const

const MILESTONES = [7, 14, 30, 60, 100, 365]

interface StreakCelebrationProps {
  streakCount: number
  habitName: string
  celebrationEnabled?: boolean
  onDismiss: () => void
}

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const color = useMemo(() => {
    const colors = ['#FF4D3D', '#FFB23D', '#5DA8FF', '#34D399', '#C084FC', '#F472B6']
    return colors[Math.floor(Math.random() * colors.length)]
  }, [])

  const rotate = useMemo(() => Math.random() * 720 - 360, [])
  const size = useMemo(() => 6 + Math.random() * 8, [])

  return (
    <motion.div
      initial={{
        opacity: 1,
        x: x,
        y: 0,
        rotate: 0,
        scale: 1,
      }}
      animate={{
        opacity: [1, 1, 0],
        x: x + (Math.random() - 0.5) * 200,
        y: [0, -80 - Math.random() * 120, 300 + Math.random() * 100],
        rotate: rotate,
        scale: [1, 1.2, 0.5],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.5,
        delay,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
        top: '50%',
        left: '50%',
      }}
    />
  )
}

export default function StreakCelebration({
  streakCount,
  habitName,
  celebrationEnabled = true,
  onDismiss,
}: StreakCelebrationProps) {
  const [visible, setVisible] = useState(false)

  const isMilestone = MILESTONES.includes(streakCount)

  useEffect(() => {
    if (!celebrationEnabled || !isMilestone) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss()
    }, 3000)
    return () => clearTimeout(timer)
  }, [celebrationEnabled, isMilestone, onDismiss, streakCount])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    onDismiss()
  }, [onDismiss])

  if (!celebrationEnabled || !isMilestone) return null

  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    x: (Math.random() - 0.5) * 100,
  }))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ease.fast}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={handleDismiss}
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiParticles.map((p) => (
              <ConfettiParticle key={p.id} delay={p.delay} x={p.x} />
            ))}
          </div>

          <motion.div
            {...scaleIn}
            transition={ease.normal}
            className="relative flex flex-col items-center gap-4 rounded-2xl px-10 py-8"
            style={{
              backgroundColor: 'var(--bg-pane)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large streak number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...ease.normal, delay: 0.1 }}
              className="text-6xl font-black"
              style={{ color: 'var(--accent)' }}
            >
              {streakCount}
            </motion.div>

            <p
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {COPY.streakTitle(streakCount)}
            </p>

            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              {habitName}
            </p>

            <motion.button
              {...buttonPress}
              onClick={handleDismiss}
              className="mt-2 rounded-full px-6 py-2 text-sm font-semibold text-white transition-opacity duration-150 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              {COPY.keepGoing}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
