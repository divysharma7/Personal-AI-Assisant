# Mistral-Style Hero Animation — What the Coding Agent Did Wrong & How to Fix It

The current implementation has misunderstood the most important part of the Mistral reference.

It built **a slideshow of animation states**.

Mistral uses **one continuous spatial composition that transforms**.

That difference is why the result still feels wrong.

---

## What the Current Build Did Wrong

1. **It fades the entire composition away between states.**  
   The screen becomes almost entirely black between scenes. Mistral does not create these dead transition frames. Elements remain visible while other elements move around them.

2. **It treats every state like a separate hero slide.**  
   The current sequence feels like:

   `hero → fade → centered text → fade → another text → fade → hero`

   The Mistral interaction should feel like:

   `hero → blocks physically compress/reposition → statement emerges → blocks travel/rearrange → original composition reconstructs`

3. **The mosaic is not driving the animation.**  
   In the Mistral reference, the colored grid is one of the main moving objects. It changes size, position, shape, and visual weight. In the current version it mostly appears/disappears.

4. **There is too much opacity animation and not enough geometry animation.**  
   Mistral's character comes from:
   - `x / y`
   - width / height
   - grid position
   - scale
   - clipping
   - layout reflow

   The current implementation is dominated by `opacity: 0 → 1`.

5. **The centered statements feel like separate presentation slides.**  
   Statements such as:
   - `"Your entire day, working as one."`
   - `"Everything connects. Everything flows."`
   - `"One place. Total clarity."`

   occupy isolated full-screen scenes. That is not the reference behavior.

6. **The composition loses continuity.**  
   A user should be able to visually track a panel from position A to position B. Right now this is impossible because components disappear before their replacements appear.

7. **The transition timing is too empty and slow.**  
   There are noticeable periods where nothing meaningful occupies the screen. Mistral maintains visual tension throughout the sequence.

8. **The phase/navigation indicators make it feel like a carousel prototype.**  
   Labels such as:

   `PRODUCT / STATEMENT / MATRIX / STATEMENT FOCUS`

   are implementation states, not UI. Remove them.

9. **The blue/gold grid collapses too far.**  
   It becomes almost a tiny vertical sliver. Even when compressed, the mosaic should remain visually meaningful.

10. **The reset is obvious.**  
    The original hero suddenly returns at the end. The final transition should reconstruct the opening composition naturally so the loop is invisible.

---

# Give the Coding Agent This Exact Correction

## Core Problem

The previous implementation is structurally wrong.

Do **not** polish the existing transitions yet.

You interpreted the reference as several full-screen slides connected by fades. That is not the intended interaction.

The reference is **one persistent spatial composition whose existing objects move, resize, compress, expand, and rearrange**.

Do not build:

```text
Hero
↓
fade to black
↓
Statement
↓
fade
↓
Matrix scene
↓
fade
↓
Statement
↓
reset
```

Build:

```text
Hero composition
↓
same elements transform positions
↓
statement becomes dominant while mosaic remains visible
↓
same mosaic travels/reconfigures
↓
panels reconstruct original hero
```

---

## Critical Requirement: Remove Blank Transition Frames

At no point should the viewport become almost entirely black because the current state exited before the next state entered.

The current implementation visibly does this between scenes.

That is incorrect.

There must always be a meaningful persistent composition on screen during transitions.

Do not use an animation sequence where one scene reaches `opacity: 0` and then the next scene starts.

Instead:

- overlap state transitions
- animate persistent objects continuously
- keep important geometry visible throughout the sequence

---

## Stop Using the Animation Like a Carousel

The current implementation feels like a presentation:

- slide 1: Powerful ideas
- slide 2: Your entire day
- slide 3: Everything connects
- slide 4: One place

This is wrong.

These are not four pages or slides.

They are content configurations inside **one animated hero**.

The spatial system must remain continuous.

---

## Keep DOM Elements Persistent

Do not conditionally mount and unmount the major visual components between phases.

These components should remain mounted for the full animation:

- main headline
- colored mosaic
- right statement panel
- supporting/product panel
- central statement

Their visibility can change slightly, but their DOM identity must survive across states.

This is essential because the user needs to visually see an element move from point A to point B.

If using Motion / Framer Motion:

- keep stable keys
- use shared `layoutId`s
- keep the important nodes mounted

### Do Not Use This Architecture

```tsx
<AnimatePresence mode="wait">
  {phase === "product" && <ProductScene />}
  {phase === "statement" && <StatementScene />}
</AnimatePresence>
```

That architecture creates the slideshow effect.

### Use This Architecture Instead

```tsx
<HeroHeadline phase={phase} />
<HeroStatement phase={phase} />
<ProductMatrix phase={phase} />
<ProductPanel phase={phase} />
```

Each persistent component should transform according to the active phase.

---

# Opacity Should Be Secondary

The existing animation relies too much on fade-in and fade-out.

The reference relies primarily on **spatial motion**.

Use this priority order:

1. translate X / Y
2. width / height
3. grid position
4. scale
5. clipping
6. subtle opacity only where necessary

A user should be able to track the major objects with their eyes throughout the transition.

---

# The Mosaic Must Become a Persistent Actor

The colored blue / gold / white mosaic currently behaves like decoration.

That is wrong.

It should be one of the main animated objects.

During the sequence it must visibly do the following.

## A. Start Large

It begins under the left headline.

## B. Compress

It becomes a smaller rectangular or square block.

## C. Physically Travel

It moves toward the left side while the main statement takes visual dominance.

## D. Rearrange Internally

The individual cells move and change proportions while the whole mosaic remains visible.

## E. Expand Again

It grows and reconnects to its original bottom-left region.

Do not collapse it into a 1–2px vertical line.

Even at its smallest state it should remain recognisable as a mosaic.

---

# Internal Mosaic Cells Must Also Move

The mosaic cannot simply scale as one screenshot.

Keep individual cells.

Some cells should change:

- column position
- row position
- width
- height
- span

during the transitions.

The outer mosaic should move as one unit while its internal geometry subtly changes.

That combination is a major part of the Mistral-style visual behavior.

---

# Required Spatial Choreography

## State A — Full Composition

```text
┌─────────────────────────────────────────────┐
│ MAIN HEADLINE                RIGHT STATEMENT │
│                                             │
│                                             │
├───────────────────────┬─────────────────────┤
│ LARGE MOSAIC          │ PRODUCT / PROOF     │
│                       │ PANEL               │
└───────────────────────┴─────────────────────┘
```

This is the starting composition.

Do not fade it away.

---

## Transition A → B

The large mosaic should physically:

- shrink
- move toward the left
- remain visible

The headline should:

- move out
- compress
- reposition

It should not simply disappear.

The right-side content should transform inward.

While those objects are moving, the central statement should emerge.

There must be meaningful visual overlap between the outgoing and incoming configurations.

---

## State B — Statement Focus

Approximate structure:

```text
┌─────────────────────────────────────────────┐
│                                             │
│  ┌──────┐          MAIN STATEMENT           │
│  │MOSAIC│       centered / dominant         │
│  │      │                                   │
│  └──────┘                                   │
│                                             │
└─────────────────────────────────────────────┘
```

Important:

- the mosaic remains visible
- the viewport is not empty except for text
- black negative space remains deliberate

---

## State C — Secondary Transformation

Keep the statement visible while:

- the mosaic changes proportions
- the mosaic cells rearrange
- supporting information appears around or beneath the statement

Do not create a completely new slide.

---

## Transition Back to State A

Reverse the spatial logic.

The mosaic should:

- expand
- travel back
- reconnect to the original bottom-left position

The right panel should expand from the existing geometry.

The headline should return to its original region.

The central statement should transition back into the normal hero copy.

The viewer should be able to watch the hero rebuild itself.

---

# Remove Visible State Labels

Do not render these labels in production:

```text
PRODUCT
STATEMENT
MATRIX
STATEMENT FOCUS
```

These are developer/debug state labels.

They are not part of the reference UI.

---

# Do Not Let the Page Sit Empty

## Current Incorrect Behavior

```text
content
↓
everything fades
↓
almost completely black viewport
↓
new text appears
```

## Required Behavior

```text
composition A
↓
A physically starts transforming
↓
B becomes visible WHILE A is moving
↓
geometry settles into composition B
```

There should be no black loading frame between scenes.

---

# Animation Timing

Avoid long scene holds followed by fast fades.

Use something closer to:

```ts
const spatialTransition = {
  duration: 0.8,
  ease: [0.76, 0, 0.24, 1],
};
```

Suggested timing:

- main spatial transformation: `700–1000ms`
- short settled state: `1000–1800ms`
- text opacity transition can begin `150–250ms` into the layout movement

This creates choreography instead of:

```text
move
↓
stop
↓
fade
↓
stop
↓
move
```

---

# Do Not Use `AnimatePresence mode="wait"` for Major Hero Scenes

If the current implementation uses this:

```tsx
<AnimatePresence mode="wait">
```

remove it for the major composition.

`mode="wait"` creates exactly the exit-first / blank-screen / enter-next behavior that should be avoided.

Keep major components mounted and animate their properties instead.

`AnimatePresence` can still be used for very small secondary text if necessary, but not to replace the whole hero.

---

# The Loop Must Be Invisible

The current sequence visibly restarts when the original hero suddenly returns.

That should not happen.

The final state must physically reconstruct State A.

Once reconstruction has completed, changing the logical state-machine index back to the beginning should cause **zero visual change**.

In other words:

```text
final visual state === initial visual state
```

before the state-machine index loops.

---

# Do Not Add More Marketing Copy

Do not try to fix the animation by adding:

- more headlines
- more cards
- more statements
- more sections

This is an **animation architecture problem**, not a content problem.

Preserve the existing product language for now.

Fix the spatial choreography first.

---

# Recommended Component Architecture

```text
MistralHero
├── HeroHeadline
├── HeroStatement
├── ProductMatrix
│   └── ProductCell
├── ProductPanel
└── useHeroSequence
```

Example:

```tsx
export default function MistralHero() {
  const phase = useHeroSequence();

  return (
    <section className="hero">
      <HeroHeadline phase={phase} />
      <HeroStatement phase={phase} />
      <ProductMatrix phase={phase} />
      <ProductPanel phase={phase} />
    </section>
  );
}
```

Do not create completely separate full-screen scene components for each state.

---

# Example Persistent Animation Model

The exact numbers need tuning, but the architecture should look closer to this:

```tsx
const mosaicStates = {
  product: {
    x: 0,
    y: 0,
    scale: 1,
  },

  statement: {
    x: "-28vw",
    y: "-10vh",
    scale: 0.42,
  },

  matrix: {
    x: "-24vw",
    y: "4vh",
    scale: 0.52,
  },

  return: {
    x: 0,
    y: 0,
    scale: 1,
  },
};
```

Then:

```tsx
<motion.div
  animate={mosaicStates[phase]}
  transition={{
    duration: 0.8,
    ease: [0.76, 0, 0.24, 1],
  }}
>
  <ProductMatrix />
</motion.div>
```

The important thing is not the exact values.

The important thing is that **the same mosaic survives every state and physically travels between them**.

---

# Definition of Done

The animation is complete only when a recording can be paused at **any frame during a transition** and that frame still looks like an intentional visual composition.

The result should never show:

- an almost empty black screen
- an accidental 1px mosaic
- an obvious slide transition
- all previous content disappearing simultaneously
- an abrupt reset
- visible developer state labels
- a slideshow/carousel feeling

The result should show:

- persistent geometry
- panels physically travelling
- the mosaic shrinking and expanding
- multiple elements moving simultaneously
- overlapping transitions
- strong black negative space
- an invisible loop
- continuous spatial choreography

---

# Important Final Instruction

Do **not** redesign the entire hero.

The opening composition is already much closer to the desired visual language.

Preserve the current opening state.

Rewrite only the **transition architecture and choreography** first.

The core correction is:

> Do not think of this as multiple animated screens. Think of it as one animated layout system whose pieces continuously reorganize themselves.
