# LAIF Transformation Plan
## Superlist Design x TickTick Architecture x TickTick Features

A focused action plan to evolve LAIF from "functional personal AI" to "the most beautiful and complete personal life OS."

---

## Strategy in One Sentence

**Keep LAIF's unique advantages** (memories, journal, PKMS, health, MCP), **apply Superlist's design language** (motion, polish, beauty), **structure it like TickTick** (modular, stable, feature-rich), and **borrow TickTick's missing power features** (Kanban, Calendar grid, Pomodoro, habits, infinite nesting).

The result: a "Life OS" that looks like Superlist, runs like TickTick, and remembers like nothing else on the market.

---

## Part 1 — The Superlist Design System (Apply to LAIF)

### 1.1 Typography

| Element | Font | Size | Weight | Line height |
|---|---|---|---|---|
| Display (page titles) | Inter / SF Pro Display | 32-40px | 700 | 1.15 |
| Heading 1 (section) | Inter / SF Pro Display | 24px | 700 | 1.25 |
| Heading 2 (subsection) | Inter / SF Pro Display | 18px | 600 | 1.3 |
| Body (task title) | Inter / SF Pro Text | 15px | 500 | 1.5 |
| Body small (metadata) | Inter / SF Pro Text | 13px | 400 | 1.45 |
| Tiny (labels, tags) | Inter / SF Pro Text | 11px | 600 (uppercase) | 1.2 |

**Rules:**
- One font family across the app — `Inter` for web, system font for mobile feel
- Tabular numerals: `font-variant-numeric: tabular-nums`
- Optical sizing: enable variable font features
- Never use bold + italic + underline simultaneously

### 1.2 Color System

```css
/* Core neutrals — warmer than default gray */
--bg-base: #FAFAF9;
--bg-elevated: #FFFFFF;
--bg-overlay: rgba(20, 20, 20, 0.04);
--surface-1: #F5F5F4;
--surface-2: #E7E5E4;

/* Text */
--text-primary: #1C1917;
--text-secondary: #57534E;
--text-tertiary: #A8A29E;
--text-on-accent: #FFFFFF;

/* Accent — ONE signature color */
--accent: #6366F1;
--accent-hover: #4F46E5;
--accent-soft: #EEF2FF;

/* Semantic */
--success: #10B981;
--warning: #F59E0B;
--danger: #EF4444;
--info: #3B82F6;

/* Priority colors */
--priority-high: #EF4444;
--priority-medium: #F59E0B;
--priority-low: #3B82F6;
--priority-none: #A8A29E;
```

**Dark mode:** Warm dark grays (`#1C1917`, `#292524`), reduce saturation by 15%.

### 1.3 Spacing & Layout

8-point grid with 4-point sub-grid.

| Token | Value | Use |
|---|---|---|
| space-1 | 4px | icon-to-text gaps |
| space-2 | 8px | tight inner padding |
| space-3 | 12px | task row vertical padding |
| space-4 | 16px | card padding |
| space-6 | 24px | section spacing |
| space-8 | 32px | major section breaks |
| space-12 | 48px | page top padding |

**Border radius:** 12-16px on cards, 8px on buttons, 6px on tags.

**Shadows:**
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06);
--shadow-md: 0 4px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06);
```

### 1.4 Motion & Animation

**Spring presets:**
```js
const snappy = { type: "spring", stiffness: 500, damping: 30 };
const smooth = { type: "spring", stiffness: 200, damping: 25 };
const bouncy = { type: "spring", stiffness: 300, damping: 15 };
```

**Apply to:**
- Task completion: checkmark scales 0->1.2->1, strikethrough animates L-R (180ms), task fades (300ms) + slides up
- Add task: slides from top with fade + spring
- Delete task: swipes off-screen with slight rotation
- Drawer open: slides with spring
- Modal: scales 0.95->1 with fade
- Page transitions: crossfade + slight slide (10px)
- Hover states: 1.02 scale, 100ms

**Hard rule:** No linear easing. No `transition: all 0.3s`. Springs or cubic-bezier only.

**Stagger lists:** 30ms between items on load.

### 1.5 Micro-interactions

| Action | Micro-interaction |
|---|---|
| Check task | Spring scale + soft tick sound + haptic |
| Complete all | Confetti burst + celebration sound |
| Star/favorite | Star fills with bounce, particle emit |
| Drag task | Lift shadow grows, slight scale (1.03) |
| Drop task | Soft thud sound + haptic |
| Pull-to-refresh | Custom branded loader |
| Empty state | Soft illustration with floating animation |
| Loading skeleton | Shimmer animation |
| Form error | Field shakes (3 cycles, 8px, 300ms) |
| Tooltip | Fade + tiny slide-up, 150ms |
| Toggle switch | Spring slide, color crossfades |

### 1.6 Sound Design (Optional, toggleable)

- `tick.mp3` — task complete (80-120ms)
- `swoosh.mp3` — task added (200ms)
- `pop.mp3` — modal/drawer open
- `chime.mp3` — celebration
- `thud.mp3` — drop/place
- `whisper.mp3` — notification arrival

All sounds: -20dB, mono, mid-frequency.

### 1.7 Iconography

Use Lucide (already installed). Rules:
- Single stroke weight (1.5px or 2px)
- Same visual size container (20x20)
- Never mix outlined and filled in same context

### 1.8 Empty States

| Screen | Empty state |
|---|---|
| Today (no tasks) | "Nothing for today. Enjoy the calm." |
| List (empty) | "This list is fresh. Add something to begin." |
| Calendar (no events) | "Your day is wide open." |
| Search (no results) | "No matches. Try different words." |
| Habits (none yet) | "Build your first habit. Small wins compound." |

---

## Part 2 — TickTick-Style Architecture

### 2.1 Feature-Module Pattern

**Target structure:**
```
/features
  /tasks
    /components
    /hooks
    /api
    /models
    /utils
    index.ts
  /calendar
  /habits
  /pomodoro
  /journal
  /memories
  /pkms
  /health
  /notifications
  /ai-chat
/shared
  /ui              (Button, Modal, Sheet, Toast)
  /hooks           (useDebounce, useMediaQuery)
  /lib             (db, auth, ai-client)
  /design-system   (tokens, motion presets)
```

Each feature is self-contained and deletable without breaking others.

### 2.2 The Three Layers

```
UI Layer (React components)        <- Pure, takes props, fires events
State/Hooks Layer (TanStack Query) <- Manages cache, mutations, sync
Data Layer (API + Mongoose)        <- Single source of truth
```

Rules:
- Components never call fetch directly
- Hooks never know about Mongoose
- API layer is the only place that talks to MongoDB

### 2.3 TanStack Query

Adopt for: optimistic updates, background refetching, cache invalidation, offline queue, loading/error states.

### 2.4 Settings Hierarchy

```
Settings
├── Account
├── Appearance (Theme, Accent, Density, Reduce motion)
├── Tasks (Default list, priority, start of week)
├── Calendar (Default view, first day, show weekends)
├── Notifications (Brief time, quiet hours, sounds, per-channel)
├── AI (Brief style, voice, model)
├── Integrations
├── Sync & Backup
└── About
```

Store in `UserPreferences` model, cached client-side.

### 2.5 Offline-First Strategy

1. Service Worker with Workbox
2. IndexedDB via Dexie.js
3. Mutation queue for failed writes
4. Conflict resolution (last-write-wins)
5. Sync status indicator (green/yellow/red)

---

## Part 3 — Features to Build

### PAIN 1: Task Management is Weak

**Feature 1.1 — Infinite Nested Subtasks**
- Add `parentId`, `depth`, `path` (materialized path) to Task model
- Tab/Shift+Tab to indent/outdent
- Drag to reparent
- Breadcrumb showing ancestors

**Feature 1.2 — Notion-Like Task Pages**
- TipTap with slash commands
- Properties panel (due, priority, tags)
- Auto-save debounced 500ms

**Feature 1.3 — Smart Task Properties**
- Priority (4 levels), tags, multi-reminders
- NLP quick-add with chrono-node

### PAIN 2: Missing Key Views

**Feature 2.1 — Calendar Views** (Y/M/W/D/Agenda)
- Drag tasks onto time slots
- Resize for duration
- Color by list or priority

**Feature 2.2 — Kanban View**
- dnd-kit based
- Columns by: List, Priority, Tag, Custom
- Drag cards between columns

### PAIN 3: Mobile Experience is Rough

**Fix 3.1 — Proper PWA** (manifest, Workbox, iOS meta tags, splash screens)
**Fix 3.2 — Native Gestures** (swipe-to-complete, pull-to-refresh, long-press menus)
**Fix 3.3 — Mobile Layouts** (bottom tab bar, FAB, bottom sheets, safe areas)
**Fix 3.4 — Performance** (virtualization, lazy routes, bundle analysis, TTI < 2s)

### PAIN 4: UI/Animations Feel Basic

Solved by applying Part 1 design system:
1. Build primitives (1 week)
2. Replace screen-by-screen (2 weeks)
3. Add micro-interactions (1 week)

---

## Part 4 — Phased Execution Plan

### Phase 0 — Foundation (Week 1)
- [ ] Design tokens + Framer Motion + motion presets
- [ ] Install TanStack Query, refactor 1 feature as proof
- [ ] Reorganize into `/features` structure
- [ ] Build shared UI primitives (Button, Sheet, Modal, Toast, Card)
- [ ] Set up Dexie.js for IndexedDB

### Phase 1 — Task Management Overhaul (Weeks 2-4)
- [ ] Add parentId/path/depth to Task model + migration
- [ ] Infinite nested subtasks UI
- [ ] Notion-like task pages with TipTap
- [ ] Priority, tags, multi-reminders
- [ ] NLP quick-add with chrono-node
- [ ] Apply design system to task screens

### Phase 2 — Views (Weeks 5-6)
- [ ] Calendar views (Y/M/W/D/Agenda)
- [ ] Kanban view with dnd-kit
- [ ] Sync Events with Tasks for unified calendar
- [ ] Mobile gestures for both views

### Phase 3 — Mobile Polish (Week 7)
- [ ] Proper PWA setup
- [ ] Bottom tab bar + FAB
- [ ] Swipe gestures
- [ ] Pull-to-refresh
- [ ] Bottom sheets replacing modals
- [ ] Performance audit + virtualization

### Phase 4 — Productivity Tools (Weeks 8-10)
- [ ] Pomodoro timer (with task linking, stats)
- [ ] Habit tracker (heatmap + streaks)
- [ ] Eisenhower Matrix view
- [ ] Statistics dashboard
- [ ] Countdown widget

### Phase 5 — AI Depth (Weeks 11-12)
- [ ] Daily AI Brief polish
- [ ] Voice-to-task with transcription
- [ ] AI meeting notes + action extraction
- [ ] Smart suggestions (task breakdown, reschedule)
- [ ] Memory-aware chat

### Phase 6 — Personalization (Week 13)
- [ ] Theme picker (10+ themes)
- [ ] Custom accent color
- [ ] Sound pack toggle
- [ ] Reduce motion accessibility
- [ ] Density toggle

---

## Part 5 — Quick Wins (Do First)

1. **Replace all linear easings with Framer Motion springs** — instant 30% feel improvement
2. **Switch to Inter variable font** + tabular-nums on numbers
3. **Task completion spring animation** — scale + strikethrough + slide
4. **Bottom sheets on mobile** instead of browser modals (use vaul)
5. **CSS accent variable consolidation** — one line to change brand color

---

## Part 6 — What NOT to Build

- Team workspaces / multi-user
- Custom theme builder (presets enough)
- Apple Watch app
- Plugin marketplace
- Public API (MCP is better)
- Gantt with dependencies
- Email-to-task gateway

---

## Part 7 — Success Criteria

1. Friend says "this is beautiful" within 5 seconds
2. Stop using TickTick because LAIF is faster + prettier
3. 4-level subtask nesting feels effortless
4. Mobile indistinguishable from native to casual user
5. AI knows things about your life no other app could
6. Show to 10 people, 3+ ask "where can I get this?"

---

## Part 8 — Tooling to Add

```json
{
  "@tanstack/react-query": "^5",
  "@tanstack/react-virtual": "^3",
  "@dnd-kit/core": "^6",
  "@dnd-kit/sortable": "^8",
  "dexie": "^4",
  "dexie-react-hooks": "^1",
  "chrono-node": "^2",
  "@radix-ui/react-dialog": "^1",
  "@radix-ui/react-dropdown-menu": "^2",
  "@radix-ui/react-popover": "^1",
  "vaul": "^1",
  "sonner": "^1"
}
```

Already installed: framer-motion, @tiptap/react, lucide-react, clsx, tailwind-merge, date-fns

---

## Progress Tracking

### Quick Wins Status
- [ ] QW1: Spring motion presets (replace linear easings)
- [ ] QW2: Inter variable font + tabular-nums
- [ ] QW3: Task completion animation
- [ ] QW4: Bottom sheets on mobile
- [ ] QW5: CSS accent variable consolidation
