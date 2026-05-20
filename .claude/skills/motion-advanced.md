---
name: motion-advanced
description: Advanced motion patterns for React / Next.js — drag & drop, gestures, text animations, SVG path drawing, custom hooks, imperative sequences (useAnimate), loaders, and the full API decision tree. Requires motion-foundations.
version: 1.0
tags: [motion, animation, advanced, gestures, svg]
category: frontend
author: jeff
---

# Motion Advanced

Complex, interactive, and physics-based animation patterns.
Requires `motion-foundations` to be set up first.
Use these when `motion-patterns` is not enough.

## When to Activate

- Building drag-to-dismiss sheets, swipe gestures, or reorderable lists
- Animating text word-by-word, character-by-character, or as a live counter
- Drawing SVG paths, morphing icons, or animating circular progress
- Writing a custom animation hook (`useScrollReveal`, magnetic button, cursor follower)
- Sequencing multi-step animations imperatively with `useAnimate`
- Building spinners, shimmer skeletons, pulse indicators, or loading button states

## Outputs

This skill produces:

- Drag interactions: draggable cards, drag-to-dismiss sheets, `Reorder.Group` lists
- Gesture hooks: swipe detection, long press, pinch outline
- Text animation components: word reveal, character typewriter, number counter
- SVG animation: path draw-on, icon morph, stroke progress ring
- Custom hooks: `useScrollReveal`, `useHoverScale`, `useNavigationDirection`, `useInViewOnce`
- Imperative sequences via `useAnimate` with interrupt-safe `async/await`
- Loader components: spinner, shimmer, pulse dot, progress bar, button loading state

## Principles

- Physics-based motion (`useSpring`, `springs.*`) always feels more natural than duration-based for direct manipulation.
- `useMotionValue` + `useTransform` computes derived values without triggering re-renders.
- `useAnimate` sequences are imperative and interrupt-safe — calling `animate()` mid-flight cancels the previous animation automatically.
- Motion values (`useMotionValue`, `useSpring`) are SSR-safe and do not cause hydration errors.

## Rules

1. **Drag interactions must be tested on touch devices**, not just mouse.
2. **Infinite animations must pause when `document.visibilityState === "hidden"`.**
3. **Swipe threshold must be explicit.** Combine `offset` + `velocity` checks.
4. **`useAnimate` scope ref must be attached to a mounted DOM element.**
5. **Motion values must not be recreated on render.** Use `useMotionValue(0)`.
6. **All token values are imported from `motion-foundations`.** No inline numbers.
7. **Custom hooks must handle cleanup.** Every `addEventListener` needs `removeEventListener`.
8. **SVG morphing requires equal path command counts.**

## Decision Guidance

### Choosing the right advanced API

| Scenario | API |
| ------------------------------ | -------------------------------- |
| Drag with physics on release | `drag` + `dragTransition: springs.release` |
| Ordered drag-to-reorder list | `Reorder.Group` + `Reorder.Item` |
| Dismiss on drag offset | `drag="y"` + `onDragEnd` offset check |
| Swipe left/right | `drag="x"` + `onDragEnd` offset check |
| Long press | `useLongPress` hook |
| Value smoothed over time | `useSpring` |
| Value derived from another | `useTransform` |
| Multi-step sequence | `useAnimate` with `async/await` |
| Text entering word by word | Stagger on `inline-block` spans |
| SVG drawing on | `pathLength` 0 → 1 |
| Circular progress | `strokeDashoffset` tween |

### When to use `useSpring` vs a spring transition

| | `useSpring` | `transition: springs.*` |
| -------------- | ---------------------------------------- | ----------------------- |
| Use for | Cursor follower, pointer-tracked values | Discrete state changes |
| Updates | Continuous, on every frame | Triggered by state change |
| Interrupt | Smooth — physics picks up from velocity | Restarts from current value |

## Core Concepts

### useMotionValue + useTransform

```tsx
const x = useMotionValue(0)
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])
// opacity updates every frame as x changes — no setState, no re-render
```

### useAnimate

```tsx
const [scope, animate] = useAnimate()

async function play() {
  await animate(".step-1", { opacity: 1 }, { duration: 0.3 })
  await animate(".step-2", { x: 0 },       { duration: 0.4 })
        animate(".step-3", { scale: 1 },    { duration: 0.25 })
}

return <div ref={scope}>...</div>
```

## Code Examples

### Draggable card

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.1}
  whileDrag={{ scale: 1.05, boxShadow: "0 16px 40px rgba(0,0,0,0.2)" }}
/>
```

### Drag-to-dismiss sheet

```tsx
export function BottomSheet({ onClose }: { onClose: () => void }) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0 }}
      style={{ y, opacity }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 120 || info.velocity.y > 500) onClose()
      }}
    />
  )
}
```

### Reorderable list

```tsx
export function SortableList() {
  const [items, setItems] = useState(initialItems)
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems}>
      {items.map((item) => (
        <Reorder.Item key={item.id} value={item}>
          {item.label}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

### Swipe detection

```tsx
const OFFSET_THRESHOLD  = 50
const VELOCITY_THRESHOLD = 300

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(_, info) => {
    const swipedRight = info.offset.x > OFFSET_THRESHOLD  || info.velocity.x > VELOCITY_THRESHOLD
    const swipedLeft  = info.offset.x < -OFFSET_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD
    if (swipedRight) onSwipeRight()
    if (swipedLeft)  onSwipeLeft()
  }}
/>
```

### Long press hook

```tsx
export function useLongPress(callback: () => void, ms = 600) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  return {
    onPointerDown:  () => { timerRef.current = setTimeout(callback, ms) },
    onPointerUp:    () => clearTimeout(timerRef.current),
    onPointerLeave: () => clearTimeout(timerRef.current),
  }
}
```

### Word-by-word reveal

```tsx
export function AnimatedText({ text }: { text: string }) {
  return (
    <motion.p
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      initial="hidden"
      animate="visible"
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1"
          variants={{
            hidden:  { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  )
}
```

### Number counter

```tsx
export function Counter({ to }: { to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(0, to, {
      duration: 1.5,
      onUpdate: (v) => {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString()
      },
    })
    return controls.stop
  }, [to])

  return <span ref={nodeRef} />
}
```

### SVG path draw-on

```tsx
<motion.path
  d="M 0 100 Q 50 0 100 100"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 1.2, ease: "easeOut" }}
/>
```

### Stroke progress ring

```tsx
const CIRCUMFERENCE = 2 * Math.PI * 40

export function ProgressRing({ progress }: { progress: number }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <motion.circle
        cx="50" cy="50" r="40"
        fill="none" stroke="#6366f1" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animate={{ strokeDashoffset: CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE }}
        style={{ rotate: -90, transformOrigin: "center" }}
      />
    </svg>
  )
}
```

### useScrollReveal hook

```tsx
export function useScrollReveal() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])
  const y       = useTransform(scrollYProgress, [0, 0.3], [40, 0])
  return { ref, style: { opacity, y } }
}
```

### Cursor follower

```tsx
export function CursorFollower() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 150, damping: 20 })
  const sy = useSpring(y, { stiffness: 150, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full bg-indigo-500
                 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50"
      style={{ x: sx, y: sy }}
    />
  )
}
```

### Shimmer skeleton

```tsx
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  const controls = useAnimation()

  useEffect(() => {
    const play = () =>
      controls.start({
        x: ["-100%", "100%"],
        transition: { repeat: Infinity, duration: 1.5, ease: "linear" },
      })

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") controls.stop()
      else void play()
    }

    void play()
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      controls.stop()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [controls])

  return (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        initial={{ x: "-100%" }}
        animate={controls}
      />
    </div>
  )
}
```

### Button loading state

```tsx
export function LoadingButton({ loading, label, onClick }: {
  loading: boolean; label: string; onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ opacity: loading ? 0.7 : 1 }}
      whileTap={loading ? {} : { scale: 0.97 }}
      disabled={loading}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>…</motion.span>
        ) : (
          <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{label}</motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
```

## Anti-Patterns

| Anti-pattern | Rule | Fix |
| ---------------------------------------------- | --- | ------------------------------------------------ |
| `drag` tested only on desktop | 1 | Test on touch emulator and real device |
| `animate={{ repeat: Infinity }}` with no pause | 2 | Add `visibilitychange` listener |
| `onDragEnd` checking only offset, not velocity | 3 | Check both `info.offset` and `info.velocity` |
| `animate(scope, ...)` before `useEffect` | 4 | Call `animate()` only after mount |
| `const x = new MotionValue(0)` in render | 5 | Use `const x = useMotionValue(0)` |
| Inline duration numbers | 6 | Use token constants |
| `useEffect` without cleanup | 7 | Return `removeEventListener` / `controls.stop` |
| SVG morph between paths with different commands | 8 | Normalize path commands before animating |

## Related Skills

- **`motion-foundations`** — defines all tokens, springs, `useSafeMotion`, and SSR guards.
- **`motion-patterns`** — handles standard UI patterns (button, modal, stagger, page transitions).
