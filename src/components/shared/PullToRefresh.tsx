'use client'
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const PULL_THRESHOLD = 60

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  className?: string
}

export default function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pulling = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return
    startY.current = e.touches[0].clientY
  }, [refreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === null || refreshing) return
    if (scrollRef.current && scrollRef.current.scrollTop > 0) { startY.current = null; return }
    const dy = e.touches[0].clientY - startY.current
    if (dy < 0) return
    pulling.current = true
    setPull(Math.min(100, dy * 0.4))
  }, [refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current || refreshing) { startY.current = null; return }
    if (pull >= PULL_THRESHOLD) {
      setRefreshing(true)
      try { await onRefresh() } finally { setRefreshing(false) }
    }
    setPull(0)
    startY.current = null
    pulling.current = false
  }, [pull, refreshing, onRefresh])

  return (
    <div ref={scrollRef} className={className}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', overflow: 'auto' }}
    >
      {(pull > 0 || refreshing) && (
        <div className="flex items-center justify-center" style={{ height: refreshing ? 40 : pull, transition: refreshing ? 'height 0.2s' : undefined, overflow: 'hidden' }}>
          <motion.div
            animate={{ rotate: refreshing ? 360 : (pull / PULL_THRESHOLD) * 180 }}
            transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
            className="w-5 h-5 rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent', opacity: Math.min(1, pull / PULL_THRESHOLD) }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
