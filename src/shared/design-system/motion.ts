import type { Transition, Variants } from "framer-motion";

// ─── Spring Presets ─────────────────────────────────────────────
// Use these instead of linear/ease transitions everywhere.
// "No linear easing anywhere" is the rule.

/** Snappy — buttons, taps, toggles, opens */
export const snappy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

/** Smooth — page transitions, drawers, panels */
export const smooth: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

/** Bouncy — celebrations, task completion, star/favorite */
export const bouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};

/** Gentle — tooltips, fades, subtle reveals */
export const gentle: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 20,
};

// ─── Duration-Based (for cases where spring doesn't fit) ────────

/** Quick fade — 150ms with decelerate curve */
export const quickFade: Transition = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1],
};

/** Medium ease — 250ms with decelerate curve */
export const mediumEase: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

// ─── Stagger Children ──────────────────────────────────────────

/** Stagger delay per child in a list */
export const staggerChildren = (delayMs: number = 30) => ({
  transition: {
    staggerChildren: delayMs / 1000,
  },
});

// ─── Common Variant Sets ────────────────────────────────────────

/** Fade in + slide up — for list items, cards */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Scale in — for modals, popovers */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/** Slide from right — for side panels, drawers */
export const slideFromRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

/** Slide from bottom — for bottom sheets */
export const slideFromBottom: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
};

/** Task completion animation system — checkbox, checkmark, strikethrough, row */
export const taskCompletion = {
  /** Checkbox container: punchy scale bounce */
  checkbox: {
    unchecked: { scale: 1 },
    checked: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.25,
        times: [0, 0.5, 1],
        ease: "easeOut",
      },
    },
  } satisfies Variants,

  /** Checkmark icon: fade in with spring after slight delay */
  checkmark: {
    unchecked: { opacity: 0, scale: 0.5 },
    checked: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, type: "spring", stiffness: 500, damping: 30 },
    },
  } satisfies Variants,

  /** Strikethrough line sweeps left-to-right */
  strikethrough: {
    unchecked: { scaleX: 0 },
    checked: {
      scaleX: 1,
      transition: { duration: 0.2, ease: "easeOut", delay: 0.05 },
    },
  } satisfies Variants,

  /** Row dims after completion */
  row: {
    unchecked: { opacity: 1 },
    checked: {
      opacity: 0.4,
      transition: { delay: 0.15, duration: 0.2 },
    },
  } satisfies Variants,
};

/** Task item — for list entry/exit */
export const taskItem: Variants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
  },
  exit: {
    opacity: 0,
    x: -60,
    height: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
};

/** Container with staggered children */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

/** Hover lift — subtle scale for interactive elements */
export const hoverLift = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: snappy,
};

/** Shake — for form validation errors */
export const shake: Variants = {
  idle: { x: 0 },
  error: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};

// ─── Transition Configs for Common Patterns ─────────────────────

/** Default transition for AnimatePresence items */
export const listTransition: Transition = {
  ...snappy,
  opacity: { duration: 0.2 },
  height: { duration: 0.25 },
};

/** Modal/dialog transition */
export const modalTransition: Transition = {
  ...smooth,
  opacity: quickFade,
};

/** Drawer/panel transition */
export const drawerTransition: Transition = {
  ...smooth,
};
