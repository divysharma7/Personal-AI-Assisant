# Life OS — Mistral-Inspired Animated Hero Implementation Spec

> **Audience:** MiMo v2.5 Pro / coding agent / frontend engineer  
> **Goal:** Rebuild the *motion system and visual grammar* visible in the supplied reference video, but adapt it to **Life OS** rather than copying Mistral branding, text, logos, or character assets.

---

## 0. Read this before touching the codebase

Do **not** treat this as a generic animated landing page.

The reference works because it has a strict separation between:

1. **Stable product communication** — headline and CTA barely move.
2. **Ambient world animation** — geometric blocks and tiny pixel characters animate around the bottom perimeter.
3. **Occasional event animation** — one character jumps into the center, a block/diamond moves, a platform changes, then the scene settles again.
4. **Lots of negative space** — the animation decorates the product message; it does not cover it.

### The main failure to avoid

Do **not** animate the entire hero, move the headline, put a huge colored overlay over the UI, or continuously move every element.

The desired feeling is:

> **calm product hero + playful system at the edges**

For Life OS, the animated world should communicate that many areas of life are active around one calm central operating system.

---

# 1. What is happening in the reference video

The supplied recording is approximately **14.5 seconds** and loops as an ambient hero sequence.

## 1.1 Static layers

These should remain visually stable for almost the entire loop:

- near-black full-screen hero background
- very subtle oversized curved/grid line in the background
- small top-center mark
- large centered headline
- compact CTA/pill below headline

The reference does **not** rely on large text motion to create energy.

## 1.2 Animated layers

Animation is concentrated near the **bottom 20–30% of the viewport**.

There are four recurring motifs:

### A. Edge platform stacks

Left and right edges contain stacks of simple rectangles in a warm palette. Heights and neighboring pieces change over time.

Important characteristics:

- platforms are anchored to the bottom of the viewport
- some extend partly outside the viewport
- the composition is intentionally asymmetric
- changes happen intermittently, not constantly
- blocks feel like game platforms rather than dashboard cards

### B. Rotated square / diamond

A square rotated roughly 45° appears on or near a stack.

Its job is visual punctuation.

It can:

- shift horizontally
- drop/rise slightly
- rotate a few degrees
- disappear/re-enter with the platform state

### C. Tiny pixel characters

Small characters sit on platforms near the edges.

They should be much smaller than the headline and function as ambient detail.

For Life OS these can represent:

- Focus
- Health
- Money
- Work
- Relationships
- AI assistant / system events

Do not literally use Mistral's character artwork.

### D. Center jump event

At specific moments, one small character rises from the bottom-center region to just above the CTA, remains visible briefly, then falls/disappears.

This is important because it creates a memorable event without moving the primary UI.

Approximate observed event windows from the recording:

- first central appearance begins around **2.2–2.7 s**
- character remains active around **3–5.7 s**
- scene is quieter through the middle portion
- another brief central appearance occurs around **12.7–13.2 s**

Do not obsess over matching milliseconds. Match the **rhythm**.

---

# 2. Life OS adaptation

Do not hardcode Mistral copy.

The component must be data/config driven so we can reuse it for Life OS landing-page experiments.

## Suggested content mapping

| Reference role | Life OS role |
|---|---|
| central headline | Life OS core value proposition |
| CTA pill | open workspace / start building your OS |
| platform blocks | areas/modules of a person's life |
| tiny sprites | habits, agents, routines, events |
| jumping center sprite | active assistant / life event / daily action |
| warm color blocks | Life OS product accent palette |

Example copy only — **do not overwrite existing product copy automatically**:

```txt
Your life, finally in one OS.

Plan less. See what matters. Keep moving.

[ Enter Life OS ]
```

If existing landing-page copy is already present, preserve it and only replace the visual shell.

---

# 3. Engineering principles

## 3.1 Build this as an isolated visual system

Create a self-contained hero feature instead of scattering animation logic throughout the page.

Recommended structure:

```txt
src/
  components/
    life-os-hero/
      LifeOSAnimatedHero.tsx
      life-os-hero.css
      scene.ts
      PixelSprite.tsx
      useHeroAnimationState.ts
```

If the project structure differs, follow the existing architecture, but keep the same separation of responsibilities.

## 3.2 Animation priority

Use this order:

1. `transform`
2. `opacity`
3. CSS custom properties
4. only then width/height if absolutely necessary

Do not repeatedly mutate layout-affecting properties on ordinary document-flow elements.

All moving scenery should be `position: absolute` inside an `overflow: hidden` hero.

## 3.3 Do not use a giant canvas unless the app already uses one

This visual can be built cleanly with DOM + CSS.

Benefits:

- responsive layout is easier
- accessible content remains HTML
- product copy remains selectable
- animation can honor `prefers-reduced-motion`
- no canvas scaling blur
- easier for MiMo to debug

## 3.4 Motion must not control business state

The hero animation is decoration.

Do not put application state, routing, task data, calendar data, or Life OS persistence inside the animation component.

---

# 4. Layer model

Use the following z-index model.

```txt
z 0   hero background
z 1   subtle arc/grid decoration
z 2   bottom platforms and diamonds
z 3   pixel sprites
z 4   main headline + CTA
z 5   top-center product mark
```

The central copy must stay readable at all times.

---

# 5. DOM architecture

Target DOM:

```html
<section class="lifeHero">
  <div class="lifeHero__grid" aria-hidden="true"></div>

  <div class="lifeHero__topMark" aria-hidden="true">...</div>

  <div class="lifeHero__content">
    <h1>...</h1>
    <p>...</p>
    <a class="lifeHero__cta">...</a>
  </div>

  <div class="lifeHero__world" aria-hidden="true">
    <div class="lifeHero__leftScene">...</div>
    <div class="lifeHero__centerScene">...</div>
    <div class="lifeHero__rightScene">...</div>
  </div>
</section>
```

Important:

- `lifeHero__content` is **not a child of any animated transform container**.
- Never apply the world transform to the whole section.
- Decorative elements must be `aria-hidden="true"`.

---

# 6. Animation timeline

Use a single loop duration variable:

```css
--hero-loop: 14.5s;
```

The reference's rhythm is not uniform. Build it as a sequence of calm states and short events.

## Suggested timeline

| Time | State |
|---:|---|
| 0.0–1.8 s | edge stacks rearrange once; center stays empty |
| 1.8–2.4 s | right-side sprite/platform event |
| 2.4–3.1 s | center sprite jumps in |
| 3.1–5.4 s | center sprite stays/does tiny idle bounce |
| 5.4–6.0 s | center sprite drops out |
| 6.0–7.2 s | calm state |
| 7.2–8.5 s | right stack grows/swaps; diamond changes position |
| 8.5–10.5 s | quiet asymmetric platform state |
| 10.5–12.2 s | left stack changes and settles |
| 12.2–13.2 s | second brief center sprite event |
| 13.2–14.5 s | restore initial composition smoothly |

The loop must not have a visible hard reset.

---

# 7. Implementation plan for MiMo

Follow these steps in order.

## Step 1 — Inspect the existing landing page

Before coding:

- find the current hero component
- identify the project's styling system
- identify existing design tokens
- identify routing/link component conventions
- check whether `motion`, `framer-motion`, GSAP, or another animation dependency already exists
- do not introduce a new animation dependency unless it materially simplifies the implementation

If no animation library exists, use the CSS implementation below.

## Step 2 — Preserve current product content

Extract current hero content into props/config instead of deleting it.

The animation should be a skin around the current Life OS message.

## Step 3 — Build static layout first

Before adding animation, produce a screenshot where:

- hero is full viewport height
- headline is centered horizontally and vertically around the upper-middle region
- CTA sits below it
- left and right geometric stacks hug the bottom edges
- negative space remains around the text

Only continue after static composition is correct.

## Step 4 — Add edge-world primitives

Create reusable primitives:

- `PlatformBlock`
- `DiamondBlock`
- `PixelSprite`

Do not hand-write 20 unrelated absolutely positioned divs inside the page component.

## Step 5 — Add the 14.5 s scene timeline

Implement named animations for:

- left platform A
- left platform B
- right platform A
- right platform B
- left diamond
- right diamond
- left sprite
- right sprite
- center jumper

Each object gets its own keyframe sequence.

Do **not** animate everything with one shared translate transform.

## Step 6 — Make the animation responsive

Desktop:

- rich edge scene
- both stacks visible
- center jumper enabled

Tablet:

- slightly smaller stacks
- keep center jumper

Mobile:

- reduce scenery density
- keep only one main stack per side
- reduce diamond size
- never let decorative blocks overlap headline/CTA

## Step 7 — Respect reduced motion

When `prefers-reduced-motion: reduce` is enabled:

- freeze stacks in a pleasing static composition
- hide or freeze center jumper
- remove continuous bobbing
- keep all content usable

## Step 8 — Pause work when hero is not visible

Use `IntersectionObserver` and page visibility to pause CSS animation when off-screen.

This is especially important on a product like Life OS where the user may leave the landing page open for a long time.

## Step 9 — Validate using screenshots at time checkpoints

Capture the component at:

- 0 s
- 3 s
- 5 s
- 7.5 s
- 10 s
- 13 s

Compare composition, not exact pixels.

## Step 10 — Run production checks

Verify:

- no console errors
- no hydration warnings
- no horizontal scrollbar
- no content-layout shift
- no overlap at 320 px width
- no animation after component unmount
- reduced motion works
- CTA remains clickable for the full loop

---

# 8. Drop-in React implementation

The following implementation is intentionally dependency-light.

It is a reference implementation. MiMo should adapt imports and tokens to the existing Life OS codebase rather than creating duplicate app foundations.

## `scene.ts`

```ts
export type HeroSceneConfig = {
  eyebrow?: string
  title: string
  description?: string
  ctaLabel: string
  ctaHref: string
  colors: {
    background: string
    foreground: string
    muted: string
    accentA: string
    accentB: string
    accentC: string
    accentD: string
    line: string
  }
}

export const defaultLifeOSHeroScene: HeroSceneConfig = {
  eyebrow: 'LIFE OS',
  title: 'Your life, finally in one OS.',
  description: 'Plan less. See what matters. Keep moving.',
  ctaLabel: 'Enter Life OS',
  ctaHref: '/app',
  colors: {
    background: '#0d0d0f',
    foreground: '#f4f4f2',
    muted: '#a6a6aa',
    accentA: '#ff4b35',
    accentB: '#ff7a16',
    accentC: '#ffb716',
    accentD: '#f33b2f',
    line: 'rgba(255,255,255,0.055)',
  },
}
```

---

## `PixelSprite.tsx`

Do not copy the reference site's pixel artwork. Use a small original Life OS sprite.

```tsx
import React from 'react'

type PixelSpriteProps = {
  className?: string
  variant?: 'assistant' | 'focus' | 'health'
}

export function PixelSprite({
  className = '',
  variant = 'assistant',
}: PixelSpriteProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
    >
      {variant === 'assistant' && (
        <>
          <rect x="8" y="3" width="8" height="3" fill="currentColor" />
          <rect x="5" y="6" width="14" height="10" fill="currentColor" />
          <rect x="3" y="9" width="2" height="5" fill="currentColor" />
          <rect x="19" y="9" width="2" height="5" fill="currentColor" />
          <rect x="7" y="16" width="4" height="4" fill="currentColor" />
          <rect x="13" y="16" width="4" height="4" fill="currentColor" />
          <rect x="8" y="9" width="2" height="2" fill="#0d0d0f" />
          <rect x="14" y="9" width="2" height="2" fill="#0d0d0f" />
          <rect x="10" y="13" width="4" height="1" fill="#0d0d0f" />
        </>
      )}

      {variant === 'focus' && (
        <>
          <rect x="9" y="2" width="6" height="3" fill="currentColor" />
          <rect x="6" y="5" width="12" height="12" fill="currentColor" />
          <rect x="4" y="9" width="2" height="5" fill="currentColor" />
          <rect x="18" y="9" width="2" height="5" fill="currentColor" />
          <rect x="8" y="17" width="3" height="4" fill="currentColor" />
          <rect x="13" y="17" width="3" height="4" fill="currentColor" />
          <rect x="9" y="9" width="2" height="2" fill="#0d0d0f" />
          <rect x="13" y="9" width="2" height="2" fill="#0d0d0f" />
        </>
      )}

      {variant === 'health' && (
        <>
          <rect x="10" y="3" width="4" height="17" fill="currentColor" />
          <rect x="4" y="9" width="16" height="5" fill="currentColor" />
        </>
      )}
    </svg>
  )
}
```

---

## `useHeroAnimationState.ts`

Pause the animation when the hero is off-screen or the browser tab is hidden.

```ts
import { RefObject, useEffect, useState } from 'react'

export function useHeroAnimationState(
  ref: RefObject<HTMLElement | null>,
) {
  const [isInView, setIsInView] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.08,
      },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  useEffect(() => {
    const updateVisibility = () => {
      setIsPageVisible(document.visibilityState === 'visible')
    }

    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)

    return () => {
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  return {
    shouldAnimate: isInView && isPageVisible,
  }
}
```

---

## `LifeOSAnimatedHero.tsx`

```tsx
import React, { CSSProperties, useRef } from 'react'
import { PixelSprite } from './PixelSprite'
import {
  defaultLifeOSHeroScene,
  HeroSceneConfig,
} from './scene'
import { useHeroAnimationState } from './useHeroAnimationState'
import './life-os-hero.css'

type LifeOSAnimatedHeroProps = {
  config?: HeroSceneConfig
}

export function LifeOSAnimatedHero({
  config = defaultLifeOSHeroScene,
}: LifeOSAnimatedHeroProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const { shouldAnimate } = useHeroAnimationState(heroRef)

  const style = {
    '--hero-bg': config.colors.background,
    '--hero-fg': config.colors.foreground,
    '--hero-muted': config.colors.muted,
    '--hero-a': config.colors.accentA,
    '--hero-b': config.colors.accentB,
    '--hero-c': config.colors.accentC,
    '--hero-d': config.colors.accentD,
    '--hero-line': config.colors.line,
  } as CSSProperties

  return (
    <section
      ref={heroRef}
      className="lifeHero"
      style={style}
      data-animation={shouldAnimate ? 'running' : 'paused'}
    >
      <div className="lifeHero__grid" aria-hidden="true" />

      <div className="lifeHero__topMark" aria-hidden="true">
        <span className="lifeHero__topMarkCore" />
      </div>

      <div className="lifeHero__content">
        {config.eyebrow && (
          <p className="lifeHero__eyebrow">{config.eyebrow}</p>
        )}

        <h1 className="lifeHero__title">{config.title}</h1>

        {config.description && (
          <p className="lifeHero__description">{config.description}</p>
        )}

        <a className="lifeHero__cta" href={config.ctaHref}>
          <span className="lifeHero__ctaIcon" aria-hidden="true" />
          <span>{config.ctaLabel}</span>
          <span className="lifeHero__ctaArrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>

      <div className="lifeHero__world" aria-hidden="true">
        {/* LEFT WORLD */}
        <div className="lifeHero__edge lifeHero__edge--left">
          <div className="lifeHero__block lifeHero__block--leftMain" />
          <div className="lifeHero__block lifeHero__block--leftSecond" />
          <div className="lifeHero__block lifeHero__block--leftTiny" />
          <div className="lifeHero__diamond lifeHero__diamond--left" />

          <PixelSprite
            className="lifeHero__sprite lifeHero__sprite--leftTop"
            variant="focus"
          />

          <PixelSprite
            className="lifeHero__sprite lifeHero__sprite--leftFloor"
            variant="assistant"
          />
        </div>

        {/* CENTER EVENT */}
        <div className="lifeHero__centerEvent">
          <PixelSprite
            className="lifeHero__sprite lifeHero__sprite--jumper"
            variant="assistant"
          />
          <span className="lifeHero__jumperShadow" />
        </div>

        {/* RIGHT WORLD */}
        <div className="lifeHero__edge lifeHero__edge--right">
          <div className="lifeHero__block lifeHero__block--rightMain" />
          <div className="lifeHero__block lifeHero__block--rightSecond" />
          <div className="lifeHero__diamond lifeHero__diamond--right" />

          <PixelSprite
            className="lifeHero__sprite lifeHero__sprite--rightFloor"
            variant="health"
          />

          <PixelSprite
            className="lifeHero__sprite lifeHero__sprite--rightTop"
            variant="assistant"
          />
        </div>
      </div>
    </section>
  )
}
```

---

# 9. CSS implementation

## `life-os-hero.css`

```css
.lifeHero {
  --hero-loop: 14.5s;

  position: relative;
  isolation: isolate;
  min-height: 100svh;
  width: 100%;
  overflow: hidden;
  background: var(--hero-bg);
  color: var(--hero-fg);
}

.lifeHero *,
.lifeHero *::before,
.lifeHero *::after {
  box-sizing: border-box;
}

/* ---------------------------------------------------------
   BACKGROUND
   --------------------------------------------------------- */

.lifeHero__grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.9;
}

.lifeHero__grid::before {
  content: '';
  position: absolute;
  width: min(74vw, 1080px);
  aspect-ratio: 1;
  left: -38vw;
  top: -54vw;
  border: 1px solid var(--hero-line);
  border-radius: 50%;
}

.lifeHero__grid::after {
  content: '';
  position: absolute;
  left: clamp(30px, 7vw, 110px);
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--hero-line);
}

/* ---------------------------------------------------------
   TOP MARK
   --------------------------------------------------------- */

.lifeHero__topMark {
  position: absolute;
  z-index: 5;
  top: clamp(18px, 2.4vh, 34px);
  left: 50%;
  width: 20px;
  height: 24px;
  transform: translateX(-50%);
  display: grid;
  place-items: center;
}

.lifeHero__topMarkCore {
  width: 8px;
  height: 8px;
  background: var(--hero-c);
  box-shadow:
    -5px 5px 0 var(--hero-a),
    5px 5px 0 var(--hero-b),
    0 10px 0 var(--hero-fg);
  transform: rotate(45deg);
}

/* ---------------------------------------------------------
   PRIMARY CONTENT
   --------------------------------------------------------- */

.lifeHero__content {
  position: relative;
  z-index: 4;
  width: min(760px, calc(100% - 40px));
  min-height: 100svh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding:
    clamp(82px, 10vh, 120px)
    0
    clamp(170px, 22vh, 250px);
  text-align: center;
}

.lifeHero__eyebrow {
  margin: 0 0 18px;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.18em;
  color: var(--hero-muted);
}

.lifeHero__title {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(44px, 5.6vw, 82px);
  line-height: 0.98;
  letter-spacing: -0.055em;
  font-weight: 600;
  text-wrap: balance;
}

.lifeHero__description {
  max-width: 520px;
  margin: 24px 0 0;
  font-size: clamp(15px, 1.35vw, 20px);
  line-height: 1.5;
  color: var(--hero-muted);
  text-wrap: balance;
}

.lifeHero__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  margin-top: 34px;
  padding: 0 14px;
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 4px;
  background: rgba(255,255,255,0.018);
  color: var(--hero-fg);
  font-size: 12px;
  line-height: 1;
  text-decoration: none;
  backdrop-filter: blur(8px);
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.lifeHero__cta:hover {
  background: rgba(255,255,255,0.045);
  border-color: rgba(255,255,255,0.17);
  transform: translateY(-1px);
}

.lifeHero__cta:focus-visible {
  outline: 2px solid var(--hero-fg);
  outline-offset: 4px;
}

.lifeHero__ctaIcon {
  width: 8px;
  height: 12px;
  display: inline-block;
  background:
    linear-gradient(to bottom,
      var(--hero-a) 0 33%,
      var(--hero-b) 33% 66%,
      var(--hero-c) 66% 100%);
}

.lifeHero__ctaArrow {
  opacity: 0.55;
  transform: translateY(-0.5px);
}

/* ---------------------------------------------------------
   DECORATIVE WORLD
   --------------------------------------------------------- */

.lifeHero__world {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
}

.lifeHero__edge {
  position: absolute;
  bottom: 0;
  width: min(29vw, 450px);
  height: 280px;
}

.lifeHero__edge--left {
  left: 0;
}

.lifeHero__edge--right {
  right: 0;
}

.lifeHero__block,
.lifeHero__diamond,
.lifeHero__sprite,
.lifeHero__jumperShadow {
  animation-play-state: var(--play-state, running);
}

.lifeHero[data-animation='paused'] {
  --play-state: paused;
}

.lifeHero__block {
  position: absolute;
  bottom: 0;
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}

/* Left tall stack: use two colors in one platform */
.lifeHero__block--leftMain {
  left: -2px;
  width: clamp(48px, 4.6vw, 76px);
  height: clamp(110px, 14vw, 190px);
  background:
    linear-gradient(
      to bottom,
      var(--hero-c) 0 48%,
      var(--hero-a) 48% 100%
    );
  animation: leftMain var(--hero-loop) linear infinite;
}

.lifeHero__block--leftSecond {
  left: clamp(56px, 5.8vw, 98px);
  width: clamp(42px, 4.4vw, 70px);
  height: clamp(50px, 7vw, 100px);
  background: var(--hero-a);
  animation: leftSecond var(--hero-loop) linear infinite;
}

.lifeHero__block--leftTiny {
  left: clamp(122px, 11vw, 172px);
  width: clamp(24px, 2.7vw, 44px);
  height: clamp(30px, 4.1vw, 58px);
  background: var(--hero-c);
  animation: leftTiny var(--hero-loop) linear infinite;
}

.lifeHero__block--rightMain {
  right: -2px;
  width: clamp(54px, 4.9vw, 78px);
  height: clamp(130px, 15.5vw, 210px);
  background:
    linear-gradient(
      to bottom,
      var(--hero-c) 0 34%,
      var(--hero-b) 34% 100%
    );
  animation: rightMain var(--hero-loop) linear infinite;
}

.lifeHero__block--rightSecond {
  right: clamp(56px, 5.4vw, 86px);
  width: clamp(52px, 5vw, 82px);
  height: clamp(55px, 7.5vw, 105px);
  background: var(--hero-a);
  animation: rightSecond var(--hero-loop) linear infinite;
}

.lifeHero__diamond {
  position: absolute;
  width: clamp(34px, 3.4vw, 54px);
  aspect-ratio: 1;
  background: var(--hero-a);
  transform: rotate(45deg);
  will-change: transform, opacity;
}

.lifeHero__diamond--left {
  left: clamp(82px, 7.8vw, 124px);
  bottom: clamp(22px, 3vw, 46px);
  animation: leftDiamond var(--hero-loop) linear infinite;
}

.lifeHero__diamond--right {
  right: clamp(32px, 3vw, 48px);
  bottom: clamp(130px, 13vw, 185px);
  animation: rightDiamond var(--hero-loop) linear infinite;
}

/* ---------------------------------------------------------
   PIXEL SPRITES
   --------------------------------------------------------- */

.lifeHero__sprite {
  position: absolute;
  width: clamp(16px, 1.65vw, 26px);
  height: auto;
  color: var(--hero-fg);
  filter: drop-shadow(0 2px 0 rgba(0,0,0,0.35));
  image-rendering: pixelated;
  will-change: transform, opacity;
}

.lifeHero__sprite--leftTop {
  left: clamp(14px, 1.8vw, 30px);
  bottom: clamp(104px, 13.5vw, 183px);
  animation: leftTopSprite var(--hero-loop) linear infinite;
}

.lifeHero__sprite--leftFloor {
  left: clamp(136px, 12vw, 192px);
  bottom: 2px;
  color: var(--hero-b);
  animation: leftFloorSprite var(--hero-loop) linear infinite;
}

.lifeHero__sprite--rightFloor {
  right: clamp(142px, 12.2vw, 196px);
  bottom: 2px;
  color: #5ba9ff;
  animation: rightFloorSprite var(--hero-loop) linear infinite;
}

.lifeHero__sprite--rightTop {
  right: clamp(70px, 6.7vw, 108px);
  bottom: clamp(57px, 7.3vw, 105px);
  color: #5ba9ff;
  animation: rightTopSprite var(--hero-loop) linear infinite;
}

.lifeHero__centerEvent {
  position: absolute;
  left: 50%;
  bottom: clamp(48px, 6.8vh, 88px);
  width: 90px;
  height: 160px;
  transform: translateX(-50%);
}

.lifeHero__sprite--jumper {
  left: 50%;
  bottom: 0;
  width: clamp(24px, 2vw, 34px);
  color: var(--hero-b);
  opacity: 0;
  transform: translate(-50%, 26px) scale(0.94);
  animation: centerJumper var(--hero-loop) linear infinite;
}

.lifeHero__jumperShadow {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 24px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0,0,0,0.42);
  opacity: 0;
  transform: translateX(-50%) scaleX(0.3);
  animation: centerShadow var(--hero-loop) linear infinite;
}

/* ---------------------------------------------------------
   LOOP KEYFRAMES
   Use transforms/opacity to avoid reflow.
   Percentages are mapped to ~14.5 seconds.
   --------------------------------------------------------- */

@keyframes leftMain {
  0%, 9% {
    transform: scaleY(0.78);
  }
  12%, 24% {
    transform: scaleY(1);
  }
  28%, 45% {
    transform: scaleY(0.88);
  }
  50%, 67% {
    transform: scaleY(0.73);
  }
  71%, 84% {
    transform: scaleY(0.56);
  }
  88%, 100% {
    transform: scaleY(0.78);
  }
}

@keyframes leftSecond {
  0%, 7% {
    transform: translateX(0) scaleY(0.45);
    background: var(--hero-b);
  }
  10%, 23% {
    transform: translateX(-6px) scaleY(1.05);
    background: var(--hero-a);
  }
  27%, 49% {
    transform: translateX(2px) scaleY(0.72);
    background: var(--hero-a);
  }
  52%, 72% {
    transform: translateX(-2px) scaleY(0.52);
    background: var(--hero-c);
  }
  76%, 88% {
    transform: translateX(4px) scaleY(0.34);
    background: var(--hero-b);
  }
  92%, 100% {
    transform: translateX(0) scaleY(0.45);
    background: var(--hero-b);
  }
}

@keyframes leftTiny {
  0%, 14% {
    transform: translateY(0) scaleY(0.82);
    opacity: 1;
  }
  18%, 39% {
    transform: translateY(0) scaleY(0.56);
    opacity: 1;
  }
  43%, 62% {
    transform: translateY(0) scaleY(0.18);
    opacity: 0.9;
  }
  66%, 84% {
    transform: translateY(12px) scaleY(0.01);
    opacity: 0;
  }
  90%, 100% {
    transform: translateY(0) scaleY(0.82);
    opacity: 1;
  }
}

@keyframes rightMain {
  0%, 18% {
    transform: scaleY(0.98);
  }
  22%, 43% {
    transform: scaleY(0.82);
  }
  48%, 66% {
    transform: scaleY(0.95);
  }
  70%, 82% {
    transform: scaleY(0.58);
  }
  87%, 100% {
    transform: scaleY(0.98);
  }
}

@keyframes rightSecond {
  0%, 10% {
    transform: translateX(0) scaleY(0.15);
    opacity: 0.9;
  }
  14%, 28% {
    transform: translateX(-5px) scaleY(1);
    opacity: 1;
  }
  33%, 49% {
    transform: translateX(4px) scaleY(0.62);
    opacity: 1;
  }
  53%, 63% {
    transform: translateX(2px) scaleY(0.14);
    opacity: 0.8;
  }
  68%, 79% {
    transform: translateX(-8px) scaleY(1.35);
    opacity: 1;
  }
  84%, 92% {
    transform: translateX(-3px) scaleY(0.76);
    opacity: 1;
  }
  96%, 100% {
    transform: translateX(0) scaleY(0.15);
    opacity: 0.9;
  }
}

@keyframes leftDiamond {
  0%, 10% {
    transform: translate(0, 18px) rotate(45deg) scale(0.86);
    opacity: 0;
  }
  14%, 24% {
    transform: translate(0, 0) rotate(45deg) scale(1);
    opacity: 1;
  }
  28%, 58% {
    transform: translate(-8px, 9px) rotate(48deg) scale(0.9);
    opacity: 0.82;
  }
  62%, 86% {
    transform: translate(-18px, 26px) rotate(52deg) scale(0.74);
    opacity: 0;
  }
  91%, 100% {
    transform: translate(0, 18px) rotate(45deg) scale(0.86);
    opacity: 0;
  }
}

@keyframes rightDiamond {
  0%, 12% {
    transform: translate(0, 0) rotate(45deg) scale(1);
    opacity: 1;
  }
  17%, 33% {
    transform: translate(-4px, 24px) rotate(50deg) scale(0.88);
    opacity: 1;
  }
  38%, 53% {
    transform: translate(-34px, 82px) rotate(56deg) scale(0.85);
    opacity: 0.95;
  }
  58%, 68% {
    transform: translate(-52px, 96px) rotate(58deg) scale(0.7);
    opacity: 0;
  }
  72%, 87% {
    transform: translate(-2px, 8px) rotate(47deg) scale(0.94);
    opacity: 1;
  }
  92%, 100% {
    transform: translate(0, 0) rotate(45deg) scale(1);
    opacity: 1;
  }
}

@keyframes leftTopSprite {
  0%, 8% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(-7px);
  }
  12%, 38% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  42%, 100% {
    transform: translateY(0);
  }
}

@keyframes leftFloorSprite {
  0%, 14% {
    transform: translateX(0);
    opacity: 1;
  }
  18%, 31% {
    transform: translateX(8px);
    opacity: 1;
  }
  34%, 51% {
    transform: translateX(16px);
    opacity: 0.8;
  }
  56%, 80% {
    transform: translateX(6px);
    opacity: 1;
  }
  86%, 100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes rightFloorSprite {
  0%, 36% {
    transform: translateX(0);
    opacity: 1;
  }
  40%, 63% {
    transform: translateX(-8px);
    opacity: 0.95;
  }
  69%, 85% {
    transform: translateX(-2px);
    opacity: 1;
  }
  91%, 100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes rightTopSprite {
  0%, 12% {
    transform: translateY(18px) scale(0.88);
    opacity: 0;
  }
  15%, 29% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  32% {
    transform: translateY(-9px) scale(1);
    opacity: 1;
  }
  35%, 48% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  52%, 70% {
    transform: translateY(20px) scale(0.88);
    opacity: 0;
  }
  74%, 85% {
    transform: translateY(4px) scale(0.96);
    opacity: 1;
  }
  90%, 100% {
    transform: translateY(18px) scale(0.88);
    opacity: 0;
  }
}

@keyframes centerJumper {
  /* Hidden initial state */
  0%, 15% {
    opacity: 0;
    transform: translate(-50%, 28px) scale(0.92);
  }

  /* First jump */
  17% {
    opacity: 1;
    transform: translate(-50%, 18px) scale(0.96);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -62px) scale(1);
  }
  23% {
    opacity: 1;
    transform: translate(-50%, -88px) scale(1.03);
  }
  27% {
    opacity: 1;
    transform: translate(-50%, -72px) scale(1);
  }

  /* Idle around center */
  31% {
    opacity: 1;
    transform: translate(-50%, -78px) scale(1);
  }
  34% {
    opacity: 1;
    transform: translate(-50%, -72px) scale(1);
  }
  37% {
    opacity: 1;
    transform: translate(-50%, -76px) scale(1);
  }

  /* Drop out */
  40% {
    opacity: 1;
    transform: translate(-50%, -42px) scale(0.98);
  }
  43% {
    opacity: 0;
    transform: translate(-50%, 30px) scale(0.9);
  }

  /* Quiet middle */
  44%, 84% {
    opacity: 0;
    transform: translate(-50%, 30px) scale(0.9);
  }

  /* Short second event */
  87% {
    opacity: 1;
    transform: translate(-50%, 8px) scale(0.96);
  }
  89% {
    opacity: 1;
    transform: translate(-50%, -62px) scale(1);
  }
  91% {
    opacity: 1;
    transform: translate(-50%, -75px) scale(1.02);
  }
  93% {
    opacity: 0;
    transform: translate(-50%, 26px) scale(0.92);
  }
  94%, 100% {
    opacity: 0;
    transform: translate(-50%, 28px) scale(0.92);
  }
}

@keyframes centerShadow {
  0%, 15%, 44%, 84%, 94%, 100% {
    opacity: 0;
    transform: translateX(-50%) scaleX(0.25);
  }
  17% {
    opacity: 0.45;
    transform: translateX(-50%) scaleX(0.9);
  }
  23% {
    opacity: 0.14;
    transform: translateX(-50%) scaleX(0.45);
  }
  37% {
    opacity: 0.18;
    transform: translateX(-50%) scaleX(0.5);
  }
  42% {
    opacity: 0.45;
    transform: translateX(-50%) scaleX(1);
  }
  87% {
    opacity: 0.45;
    transform: translateX(-50%) scaleX(0.9);
  }
  91% {
    opacity: 0.15;
    transform: translateX(-50%) scaleX(0.46);
  }
  93% {
    opacity: 0.4;
    transform: translateX(-50%) scaleX(0.96);
  }
}

/* ---------------------------------------------------------
   RESPONSIVE
   --------------------------------------------------------- */

@media (max-width: 900px) {
  .lifeHero__content {
    width: min(650px, calc(100% - 32px));
    padding-bottom: 190px;
  }

  .lifeHero__title {
    max-width: 12ch;
  }

  .lifeHero__edge {
    width: 34vw;
    height: 220px;
  }
}

@media (max-width: 640px) {
  .lifeHero__content {
    justify-content: center;
    padding-top: 74px;
    padding-bottom: 150px;
  }

  .lifeHero__title {
    max-width: 10ch;
    font-size: clamp(42px, 12.5vw, 60px);
  }

  .lifeHero__description {
    width: min(92%, 420px);
    font-size: 15px;
  }

  .lifeHero__edge {
    width: 38vw;
    height: 170px;
  }

  .lifeHero__block--leftSecond,
  .lifeHero__block--leftTiny,
  .lifeHero__block--rightSecond,
  .lifeHero__sprite--leftFloor,
  .lifeHero__sprite--rightTop {
    display: none;
  }

  .lifeHero__diamond {
    width: 30px;
  }

  .lifeHero__centerEvent {
    bottom: 38px;
  }
}

/* ---------------------------------------------------------
   ACCESSIBILITY: REDUCED MOTION
   --------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .lifeHero__block,
  .lifeHero__diamond,
  .lifeHero__sprite,
  .lifeHero__jumperShadow {
    animation: none !important;
  }

  .lifeHero__sprite--jumper,
  .lifeHero__jumperShadow,
  .lifeHero__diamond--left,
  .lifeHero__sprite--rightTop {
    display: none;
  }

  .lifeHero__block--leftMain,
  .lifeHero__block--rightMain,
  .lifeHero__block--leftSecond,
  .lifeHero__block--rightSecond {
    transform: none;
    opacity: 1;
  }
}
```

---

# 10. Integration example

Do not replace application providers/router.

Only mount the hero where the existing landing hero belongs.

Example:

```tsx
import { LifeOSAnimatedHero } from '@/components/life-os-hero/LifeOSAnimatedHero'

export default function LandingPage() {
  return (
    <main>
      <LifeOSAnimatedHero />

      {/* Existing Life OS sections continue below */}
      <ProductOverview />
      <FeatureSections />
    </main>
  )
}
```

If the app uses React Router `Link`, Next `Link`, or another router-specific navigation component, replace the plain anchor with the project's existing link primitive.

---

# 11. Better Life OS customization: make the world data-driven

The first implementation above intentionally prioritizes visual fidelity and simplicity.

After that works, convert block/sprite identity into semantic Life OS configuration.

Example:

```ts
export const lifeDomains = [
  {
    id: 'focus',
    label: 'Focus',
    color: 'var(--domain-focus)',
    sprite: 'focus',
  },
  {
    id: 'health',
    label: 'Health',
    color: 'var(--domain-health)',
    sprite: 'health',
  },
  {
    id: 'money',
    label: 'Money',
    color: 'var(--domain-money)',
    sprite: 'assistant',
  },
]
```

But keep labels visually hidden in the hero unless the design specifically needs them. The reference works because the bottom world remains graphical and uncluttered.

---

# 12. If the project already has Framer Motion / Motion

Do **not** install it just for this hero if CSS is sufficient.

If it is already a dependency, it can be useful for the **center jump only**, while leaving long-running ambient platform sequences in CSS.

Why hybrid is good:

- CSS handles cheap infinite loops
- Motion handles event-like spring/jump animation
- text/content remains independent

Do not put 15 continuously animated `motion.div`s into React state.

---

# 13. Performance requirements

Treat these as acceptance requirements, not optional polish.

## Runtime

- aim for 60 FPS on modern laptop hardware
- hero must remain smooth while scrolling
- no animation loop should call React `setState` at 30/60 FPS
- no `requestAnimationFrame` is needed for the default implementation
- no canvas redraw loop

## CSS

- prefer transforms and opacity
- use `will-change` only on genuinely moving elements
- do not put `will-change` on the whole page

## Assets

If custom pixel sprites are used:

- prefer tiny SVG or WebP/PNG
- use `image-rendering: pixelated` where appropriate
- keep them extremely small in file size
- preload only if visible above the fold and necessary

## Loading

The hero must not delay the first paint of the product title.

The title and CTA should render even if decorative sprite assets fail.

---

# 14. Accessibility requirements

The animated geometry is decorative.

Therefore:

```html
aria-hidden="true"
```

on the decorative world.

The meaningful content remains:

- actual `<h1>`
- actual paragraph
- actual link/button

Also:

- honor reduced motion
- maintain keyboard focus on CTA
- do not flash rapidly
- do not use animation as the sole carrier of meaningful product information

---

# 15. Responsive visual rules

## Desktop ≥ 1200 px

Target composition:

```txt
       small top mark

         BIG HEADLINE
      supporting line
           CTA

█ ▆ ▂  tiny world             tiny world  ▂ ▆ █
```

The center should remain visually open.

## Tablet 641–1199 px

- same hierarchy
- edge stacks narrower
- reduce lateral spread
- title remains untouched

## Mobile ≤ 640 px

Target:

```txt
      mark

   LIFE OS TITLE
    description
       CTA

██                ██
```

Do not try to squeeze the full desktop game world onto mobile.

---

# 16. Visual QA checklist

MiMo should not mark the task complete until all are true.

### Composition

- [ ] headline remains the dominant object
- [ ] CTA is visible in every animation state
- [ ] animation does not pass over main copy
- [ ] edge stacks are cropped by the viewport in a deliberate way
- [ ] left and right scenes are asymmetric
- [ ] page contains large areas of calm negative space

### Motion

- [ ] animation loop is around 14–15 seconds
- [ ] most of the scene is calm at any given moment
- [ ] center character appears only occasionally
- [ ] blocks animate independently
- [ ] diamond motion is subtle
- [ ] loop does not visibly snap at the end
- [ ] headline does not bob/scale/slide continuously

### Engineering

- [ ] no duplicate app root/providers/router
- [ ] no global CSS reset added just for this component
- [ ] existing design tokens reused where available
- [ ] no unnecessary animation library installed
- [ ] animation pauses off-screen
- [ ] reduced-motion mode works
- [ ] no horizontal scrolling
- [ ] component unmounts cleanly

---

# 17. What MiMo must NOT do

These are hard constraints.

## Do not do this

```txt
❌ Put a giant blue/orange layer over the whole hero
❌ Animate the whole page container
❌ Animate the headline continuously
❌ Make every block move at the same time
❌ Use a particle explosion
❌ Use floating glass cards instead of geometric game platforms
❌ Fill the center with decorative objects
❌ Add gradients everywhere because “AI landing page”
❌ Turn the visual into a dashboard screenshot
❌ Copy Mistral logos or proprietary pixel characters
❌ Introduce a new global design system
❌ Rewrite the router/app entry file unless absolutely required
```

## Instead

```txt
✅ Stable product communication
✅ Sparse geometric edge animation
✅ Small playful events
✅ Strong negative space
✅ Warm Life OS accents
✅ Data/config-driven copy
✅ GPU-friendly motion
✅ Accessible fallback
```

---

# 18. Recommended polish pass after base implementation

Only do these after the structure works.

## A. Slight sprite idle motion

A 2–4 px one-time hop is enough.

Avoid constant bouncing.

## B. Better platform transitions

Make stack changes feel like:

- a piece rising from below the viewport
- another retracting into the floor
- a diamond slipping between two states

Duration:

```txt
220–520 ms
```

Typical easing:

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

## C. Life OS semantic event

When the center assistant jumps, optionally change a tiny non-text decorative indicator inside it to suggest an active system event.

Do not display a notification bubble over the headline.

## D. Pointer proximity — optional

Only on desktop, and only after the baseline is correct:

- calculate pointer offset relative to center
- apply max ±3 px parallax to background decoration
- do not move title or CTA

This is optional and should not block launch.

---

# 19. Optional debug mode for MiMo

During implementation add a temporary debug flag:

```ts
const HERO_DEBUG = false
```

When enabled, show:

- center line
- safe content zone
- edge world bounds
- current viewport breakpoint

Example temporary CSS:

```css
.lifeHero[data-debug='true'] .lifeHero__content {
  outline: 1px solid rgba(0, 255, 255, 0.35);
}

.lifeHero[data-debug='true'] .lifeHero__edge {
  outline: 1px solid rgba(255, 0, 255, 0.35);
}
```

Remove/disable the debug state before production.

---

# 20. Automated test ideas

If Playwright exists in the repo, add lightweight checks.

```ts
import { test, expect } from '@playwright/test'

test('Life OS hero keeps primary CTA accessible', async ({ page }) => {
  await page.goto('/')

  const title = page.locator('.lifeHero__title')
  const cta = page.locator('.lifeHero__cta')

  await expect(title).toBeVisible()
  await expect(cta).toBeVisible()
  await expect(cta).toBeEnabled()
})

test('Life OS hero does not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))

  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 1)
})
```

For visual regression, capture screenshots after injecting a temporary animation delay or animation-time debug class. Do not make screenshot testing dependent on real-time sleep if avoidable.

---

# 21. Definition of done

The implementation is complete only when:

1. It feels like a **calm Life OS hero with a living pixel world around it**.
2. The main product message is stable throughout the loop.
3. Edge blocks create changing silhouettes without dominating the page.
4. One small center event creates surprise around the 2–5 s portion of the loop.
5. A second shorter event happens near the end.
6. The loop resets invisibly.
7. Mobile is simpler rather than compressed.
8. Reduced-motion users receive a clean static hero.
9. The existing Life OS app architecture remains intact.
10. No Mistral branding/assets are copied.

---

# 22. Short command for MiMo

Copy this into the coding agent together with this file:

```txt
Implement the attached Life OS animated hero spec against the EXISTING codebase.

First inspect the current landing-page structure, current hero, styling approach, tokens, routing and installed animation packages. Preserve the existing Life OS copy unless I explicitly ask you to change it.

Build the static composition first, then add the independent 14.5s edge-world timeline. Keep the headline and CTA stable. The bottom geometric scenery must animate independently and must never become a full-page colored overlay.

Use existing app architecture. Do not rewrite main.tsx, providers, router, global styles or design-system foundations unless there is a proven technical requirement.

After implementation, self-review at desktop, tablet and mobile sizes. Check reduced motion, off-screen pause behavior, horizontal overflow and CTA clickability. Fix issues before declaring the task complete.
```

---

# 23. Mental model

If any implementation decision is ambiguous, use this test:

> **Would this make the product message calmer or noisier?**

The reference is effective because the center stays calm while small systems are alive around it.

For Life OS, that metaphor is especially appropriate:

> **your life can be busy at the edges while the operating system in the center remains clear.**

That is the feeling the code should preserve.
