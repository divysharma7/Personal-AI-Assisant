'use client'

import { useState, useEffect } from 'react'
import { motionTokens } from '@/lib/motion'

/**
 * Returns true when the user prefers reduced motion.
 * SSR-safe — defaults to false on server.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

/**
 * Returns safe motion variants that respect prefers-reduced-motion.
 * When reduced: no transforms, only opacity fade ≤ 0.2s.
 * When normal: standard slide + fade.
 */
export function useSafeMotion(fullY: number = motionTokens.distance.md) {
  const reduce = useReducedMotion()
  return {
    initial: { opacity: 0, y: reduce ? 0 : fullY },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: reduce ? 0 : -fullY },
  }
}
