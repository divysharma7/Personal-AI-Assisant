# PIM — Improvement Plan

## Philosophy
"Brain meditating while working" — the interface recedes, content comes forward.
Calm, focused, alive. Not a task manager. A thinking partner.

---

## 1. Color & Feel

- [x] **1.1** Shift background from violet-black → deep ocean midnight (`#070b14`, `#0c1220`, `#111827`)
- [x] **1.2** Shift accent from aggressive purple `#6929D4` → periwinkle indigo `#6366f1` / `#818cf8`
- [x] **1.3** Shift borders from neutral-grey → blue-tinted (`#1a2744`)
- [x] **1.4** Soften primary text from `#f0eeff` → `#e2e8f0` (less harsh on dark)
- [x] **1.5** Shift secondary text to blue-tinted grey `#7b91ad` (ocean feel)
- [x] **1.6** Update light theme to match — lavender-white base, same indigo accent
- [x] **1.7** Update item type colors to match new palette (event/task/reminder)

---

## 2. Focus Mode (Pomodoro)

- [x] **2.1** When Pomodoro starts, dim the rest of the dashboard (overlay or blur)
- [x] **2.2** Show selected task name in large type in the Pomodoro widget during focus
- [x] **2.3** Add a breathing ring animation around the timer (subtle pulse, ~4s inhale/exhale)
- [x] **2.4** Add a "pick task" selector in Pomodoro widget before starting
- [x] **2.5** Exit focus mode on Pomodoro stop/complete

---

## 3. Habits Strip

- [ ] **3.1** Create `Habit` model (MongoDB) — name, emoji/icon, color, active bool
- [ ] **3.2** Create `/api/habits` CRUD routes
- [ ] **3.3** Create `/api/habits/log` — log a completion for today
- [x] **3.4** Create `HabitsWidget` — row of habit dots, click to toggle today's completion (habits strip in dashboard + sidebar HabitsSection)
- [x] **3.5** Add HabitsWidget to dashboard (habits strip on "/" dashboard page)
- [x] **3.6** Add Habits management to Settings page
- [x] **3.7** Show a small monthly heatmap on hover over each habit dot

---

## 4. ~~Daily Journal~~ — REMOVED (not needed)

---

## 5. Dashboard Layout Refinements

- [x] **5.1** Merge Weather into Clock widget (one small line below the time)
- [x] **5.2** Free the Weather cell — use it for HabitsWidget (habits strip on dashboard)
- [x] **5.3** AI Brief widget with refresh and "last updated" timestamp
- [x] **5.4** Add a "Today at a glance" micro-summary line below the header subtitle

---

## 6. Notes (post-journal, if still needed)

- [x] **6.1** Evaluated — built as complementary to journal (quick notes vs daily entries)
- [x] **6.2** Simple titled notes with Tiptap editor, auto-save, CRUD
- [x] **6.3** Notes list in sidebar, searchable

---

## 7. Polish & UX

- [x] **7.1** Page transitions via CSS animation (safe, no AnimatePresence)
- [x] **7.2** Empty states with helpful prompts instead of blank panels
- [x] **7.3** Keyboard shortcut: `T` → add task, `E` → add event
- [x] **7.4** Collapse sidebar remembers state across sessions (localStorage)
- [x] **7.5** AI Brief shows "last updated at X" timestamp so you know how fresh it is

---

## Order of implementation

```
1.1 → 1.7   Color shift          (do all at once, ~1 hour)
2.1 → 2.5   Focus Mode           (2–3 hours)
3.1 → 3.6   Habits strip         (half day)
5.1 → 5.4   Dashboard tweaks     (alongside above)
7.x         Polish               (sprinkle throughout)
6.x         Notes                (decide after journal)
```
