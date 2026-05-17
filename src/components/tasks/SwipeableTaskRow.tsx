'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'

const SWIPE_THRESHOLD = 60
const EDGE_ZONE = 30

interface SwipeableTaskRowProps {
  children: React.ReactNode
  onSwipeRight?: () => void
  onSwipeLeft?: () => void
  disabled?: boolean
}

export default function SwipeableTaskRow({ children, onSwipeRight, onSwipeLeft, disabled }: SwipeableTaskRowProps) {
  const x = useMotionValue(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const dirLock = useRef<'h' | 'v' | null>(null)
  const [swiping, setSwiping] = useState(false)

  const rightBg = useTransform(x, [0, SWIPE_THRESHOLD], ['rgba(34,197,94,0)', 'rgba(34,197,94,0.15)'])
  const leftBg = useTransform(x, [-SWIPE_THRESHOLD, 0], ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0)'])
  const rightOp = useTransform(x, [0, SWIPE_THRESHOLD * 0.6, SWIPE_THRESHOLD], [0, 0.3, 1])
  const leftOp = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.6, 0], [1, 0.3, 0])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return
    const t = e.touches[0]
    if (t.clientX < EDGE_ZONE) return
    touchStart.current = { x: t.clientX, y: t.clientY }
    dirLock.current = null
  }, [disabled])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current || disabled) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    if (!dirLock.current) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) dirLock.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      return
    }
    if (dirLock.current !== 'h') return
    setSwiping(true)
    x.set(Math.max(-SWIPE_THRESHOLD * 1.5, Math.min(SWIPE_THRESHOLD * 1.5, dx)))
  }, [x, disabled])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || disabled) return
    const cur = x.get()
    if (cur > SWIPE_THRESHOLD && onSwipeRight) {
      animate(x, SWIPE_THRESHOLD * 2, { duration: 0.15 }).then(() => { onSwipeRight(); animate(x, 0, { duration: 0.2 }) })
    } else if (cur < -SWIPE_THRESHOLD && onSwipeLeft) {
      animate(x, -SWIPE_THRESHOLD * 2, { duration: 0.15 }).then(() => { onSwipeLeft(); animate(x, 0, { duration: 0.2 }) })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
    }
    touchStart.current = null
    dirLock.current = null
    setTimeout(() => setSwiping(false), 200)
  }, [x, onSwipeRight, onSwipeLeft, disabled])

  return (
    <div className="relative overflow-hidden">
      <motion.div className="absolute inset-0 flex items-center px-4" style={{ background: rightBg }}>
        <motion.div style={{ opacity: rightOp }}><Check size={18} className="text-green-500" /></motion.div>
      </motion.div>
      <motion.div className="absolute inset-0 flex items-center justify-end px-4" style={{ background: leftBg }}>
        <motion.div style={{ opacity: leftOp }}><Trash2 size={18} className="text-red-500" /></motion.div>
      </motion.div>
      <motion.div
        style={{ x, position: 'relative', zIndex: 1, touchAction: swiping ? 'none' : 'pan-y' }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      >
        {children}
      </motion.div>
    </div>
  )
}
