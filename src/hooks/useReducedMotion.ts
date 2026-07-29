'use client'

import { useState, useEffect } from 'react'

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
