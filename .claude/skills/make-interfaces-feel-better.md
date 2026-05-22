---
name: make-interfaces-feel-better
description: Apply concrete design-engineering details that make interfaces feel polished. Use when reviewing or improving UI spacing, typography, borders, shadows, motion, hit areas, icons, text wrapping, and interaction states.
origin: community
---

# Make Interfaces Feel Better

Use this skill for the small design-engineering details that compound into a
more polished interface.

## When to Use

- The user says the UI feels off, flat, generic, cramped, jumpy, or unfinished.
- You are building controls, cards, lists, dashboards, navigation, forms, or toolbars.
- A component needs hover, active, focus, enter, exit, loading, or empty states.
- A frontend review needs specific before/after recommendations.

## Core Principles

### Concentric Radius

For nearby nested rounded surfaces:

```text
outer radius = inner radius + padding
```

If padding is large, treat layers as separate surfaces.

### Optical Alignment

Geometric centering is not always visual centering. Icon buttons, play
triangles, arrows, and asymmetric icons often need a small offset.

### Shadows And Borders

Use borders for separation and focus rings. Use layered shadows when a card,
button, dropdown, or popover needs depth.

### Text Wrapping

- Use `text-wrap: balance` on headings and short titles.
- Use `text-wrap: pretty` on short-to-medium body text and captions.
- Use `font-variant-numeric: tabular-nums` for counters, timers, prices, and tables.

### Font Smoothing

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Image Outlines

```css
img {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}
@media (prefers-color-scheme: dark) {
  img { outline-color: rgba(255, 255, 255, 0.1); }
}
```

### Motion

- Enter: combine opacity, small `translateY`, and optionally blur.
- Exit: shorter and quieter than enter, usually 150ms.
- Press: `scale(0.96)` for tactile buttons.
- Icon swaps: cross-fade with opacity, scale, and blur.

### Transition Scope

Never use `transition: all`. Specify the changed properties:

```css
.button {
  transition-property: transform, background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
```

### Hit Areas

Interactive controls should have at least a 40x40px hit area, ideally 44x44px.

## Checklist

- Nested rounded elements are optically coherent.
- Icons are visually centered.
- Buttons, cards, and popovers use borders or shadows for the right reason.
- Headings and short text avoid awkward wrapping.
- Dynamic numbers use tabular numerals.
- Images have neutral outlines where needed.
- Enter and exit animations are split, subtle, and interruptible.
- Buttons have tactile active states without exaggerated motion.
- `transition: all` and `will-change: all` are absent.
- Small controls still have usable hit areas.
