/**
 * Framer Motion presets — single source of truth for all animations.
 * Import these instead of writing inline transition objects.
 */

// ── Spring presets ──────────────────────────────────────────
export const spring = {
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 15 },
  gentle: { type: 'spring' as const, stiffness: 150, damping: 20 },
}

// ── Duration-based presets ──────────────────────────────────
export const ease = {
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as number[] },
  normal: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as number[] },
  slow: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as number[] },
}

// ── Variant sets (for AnimatePresence) ──────────────────────

/** Fade in/out */
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/** Fade + slide up (cards, list items, banners) */
export const fadeSlideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

/** Fade + slide down (dropdowns, popovers) */
export const fadeSlideDown = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
}

/** Slide from right (detail panels) */
export const slideFromRight = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
}

/** Slide from bottom (mobile sheets, toasts) */
export const slideFromBottom = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
}

/** Scale in (modals, popups) */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/** Collapse height (accordions, collapsible sections) */
export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
}

/** Task completion (strikethrough row exit) */
export const taskComplete = {
  initial: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40, height: 0, marginTop: 0, marginBottom: 0 },
}

/** Stagger children container */
export const stagger = (staggerMs = 0.03) => ({
  animate: { transition: { staggerChildren: staggerMs } },
})

/** Checkbox bounce */
export const checkBounce = {
  initial: { scale: 1 },
  checked: { scale: [1, 1.2, 1], transition: { duration: 0.2 } },
}

/** Toast enter/exit */
export const toast = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.95 },
}

/** Hover lift (cards) */
export const hoverLift = {
  whileHover: { y: -2, transition: ease.fast },
  whileTap: { scale: 0.98, transition: ease.fast },
}

/** Button press */
export const buttonPress = {
  whileTap: { scale: 0.96, transition: { duration: 0.1 } },
}
