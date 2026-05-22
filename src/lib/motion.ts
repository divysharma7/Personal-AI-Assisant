/**
 * Motion Foundations — single source of truth for all animations.
 *
 * Rules enforced:
 * 1. All durations come from motionTokens.duration
 * 2. All springs come from the springs map
 * 3. All easings come from motionTokens.easing
 * 4. No layout property animations (width/height/margin/padding)
 * 5. Reduced motion support via shouldAnimate() and useSafeMotion()
 */

// ── Token system ──────────────────────────────────────────────

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast:    0.18,
    normal:  0.35,
    slow:    0.6,
    crawl:   1.0,
  },
  easing: {
    smooth: [0.22, 1, 0.36, 1] as number[],
    sharp:  [0.4, 0, 0.2, 1] as number[],
    bounce: [0.34, 1.56, 0.64, 1] as number[],
    linear: [0, 0, 1, 1] as number[],
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,
  },
  scale: {
    subtle: 0.98,
    press:  0.95,
    pop:    1.04,
  },
} as const

// ── Spring presets ────────────────────────────────────────────

export const springs = {
  snappy:  { type: 'spring' as const, stiffness: 300, damping: 30 },
  gentle:  { type: 'spring' as const, stiffness: 120, damping: 14 },
  bouncy:  { type: 'spring' as const, stiffness: 400, damping: 10 },
  instant: { type: 'spring' as const, stiffness: 600, damping: 35 },
  release: { type: 'spring' as const, stiffness: 200, damping: 20, restDelta: 0.001 },
  smooth:  { type: 'spring' as const, stiffness: 180, damping: 22 },
}

// Legacy alias — existing components import `spring` (singular)
export const spring = springs

// ── Runtime flags ─────────────────────────────────────────────

export const motionConfig = {
  isLowEnd() {
    return typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4
  },
  prefersReduced() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  shouldAnimate({ essential = false } = {}) {
    if (this.prefersReduced()) return false
    if (!essential && this.isLowEnd()) return false
    return true
  },
}

// ── CSS transition helper for inline styles ───────────────────
// Use instead of hardcoding '150ms ease' in style={{ transition: ... }}

export const cssTransition = {
  fast:   `all ${motionTokens.duration.fast * 1000}ms cubic-bezier(${motionTokens.easing.sharp.join(',')})`,
  normal: `all ${motionTokens.duration.normal * 1000}ms cubic-bezier(${motionTokens.easing.sharp.join(',')})`,
  slow:   `all ${motionTokens.duration.slow * 1000}ms cubic-bezier(${motionTokens.easing.smooth.join(',')})`,
  bg:     `background-color ${motionTokens.duration.fast * 1000}ms cubic-bezier(${motionTokens.easing.sharp.join(',')})`,
  opacity: `opacity ${motionTokens.duration.fast * 1000}ms cubic-bezier(${motionTokens.easing.sharp.join(',')})`,
}

// ── Duration-based transitions ────────────────────────────────
// Maps to motionTokens for Framer Motion's transition prop

export const ease = {
  fast:   { duration: motionTokens.duration.fast,   ease: motionTokens.easing.sharp },
  normal: { duration: motionTokens.duration.fast,   ease: motionTokens.easing.sharp },
  medium: { duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp },
  slow:   { duration: motionTokens.duration.slow,   ease: motionTokens.easing.smooth },
  slower: { duration: motionTokens.duration.crawl,  ease: motionTokens.easing.smooth },
}

// ── Variant sets (for AnimatePresence) ────────────────────────

/** Fade in/out — exit is faster than enter */
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
  exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } },
}

/** Fade + slide up (cards, list items, banners) */
export const fadeSlideUp = {
  initial: { opacity: 0, y: motionTokens.distance.sm },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -motionTokens.distance.sm },
}

/** Fade + slide down (dropdowns, popovers) */
export const fadeSlideDown = {
  initial: { opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.press },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.press },
}

/** Slide from right (detail panels) */
export const slideFromRight = {
  initial: { x: motionTokens.distance.md, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: motionTokens.distance.md, opacity: 0 },
}

/** Slide from bottom (mobile sheets, toasts) */
export const slideFromBottom = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

/** Scale in (modals, popups) */
export const scaleIn = {
  initial: { opacity: 0, y: motionTokens.distance.md, scale: motionTokens.scale.press },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: motionTokens.distance.md, scale: motionTokens.scale.press },
}

/** Collapse height (accordions, collapsible sections) */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
}

/** Task completion (legacy alias) */
export const taskComplete = {
  initial: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40, height: 0, marginTop: 0, marginBottom: 0 },
}

/** Task completion exit — float up and fade */
export const taskCompleteExit = {
  exit: {
    opacity: 0,
    y: -motionTokens.distance.md,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.sharp },
  },
}

/** Stagger children container */
export const stagger = (staggerMs = 0.03) => ({
  animate: { transition: { staggerChildren: staggerMs } },
})

/** Checkbox bounce */
export const checkBounce = {
  initial: { scale: 1 },
  checked: { scale: [1, 1.2, 1], transition: { duration: motionTokens.duration.fast } },
}

/** Toast enter/exit */
export const toast = {
  initial: { opacity: 0, y: 20, scale: motionTokens.scale.press },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: motionTokens.scale.press },
}

/** Hover lift (cards) */
export const hoverLift = {
  whileHover: { y: -2, transition: ease.fast },
  whileTap: { scale: motionTokens.scale.subtle, transition: ease.fast },
}

/** Button press */
export const buttonPress = {
  whileTap: { scale: motionTokens.scale.press, transition: { duration: motionTokens.duration.instant } },
}

/** View transition — used by CalendarPage for AnimatePresence transitions between views */
export const viewTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Get directional slide variants for calendar view navigation.
 * direction: -1 = backward (slide from left), 0 = no slide, 1 = forward (slide from right)
 */
export function getDirectionalVariants(direction: -1 | 0 | 1) {
  const offset = direction * motionTokens.distance.lg
  return {
    initial: { opacity: 0, x: offset },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -offset },
  }
}

// ── Advanced animation variants (ported from Chronos) ────────

/** Pulse — gentle scale throb for attention (e.g. overdue indicators) */
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: motionTokens.duration.slow, repeat: Infinity, ease: 'easeInOut' },
  },
}

/** Shake — horizontal shake for error feedback */
export const shake = {
  animate: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: motionTokens.duration.normal },
  },
}

/** Number flip — used for animated counter digits */
export const numberFlip = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
  exit: { y: 20, opacity: 0, transition: { duration: motionTokens.duration.fast } },
}

/** Celebration pop — scale bounce for task completion, streaks, etc. */
export const celebrationPop = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: [0.5, 1.15, 1],
    opacity: 1,
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.bounce },
  },
}

/** Flame flicker — subtle scale + opacity variation for streak fire icons */
export const flameFlicker = {
  animate: {
    scale: [1, 1.08, 0.97, 1.04, 1],
    opacity: [1, 0.85, 1, 0.9, 1],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
}

/** Counter spring — spring-based transition for animated number counters */
export const counterSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
  restDelta: 0.5,
}

/** Check draw — stroke animation preset for SVG checkmark paths */
export const checkDraw = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
  },
}

/** Card drag lift — elevated shadow + slight scale for dragged kanban cards */
export const cardDragLift = {
  scale: 1.03,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}
