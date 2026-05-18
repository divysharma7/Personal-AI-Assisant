# LAIF Web — Overview

> **Read this first.** This file plus `01-design-system.md` and `99-reference.md` should always be in Claude Code's context. Phase docs (02–05) are loaded one at a time as you work through the build.

---

## 1. What this is

LAIF Web is a personal productivity app organized around **Lists**. A List is a rich document that holds prose, headings, lists, images, file attachments, tags, and inline task blocks. Tasks have sub-tasks, due dates, priorities, assignees, comments, and nested detail panels.

**Reference:** Superlist (Mar 2024 design), 66 screens reviewed total. The UX copy and component spec are taken verbatim from those screens; only the brand name changes (Superlist → LAIF) and LAIF's unique features (AI Chat, Pomodoro, Stats, Journal, Habits) are folded in as List types or Tools.

**Out of scope:** Mobile. A separate Flutter app covers phones/tablets. On the web, below 1024px viewport, render a "best on desktop" notice rather than a responsive collapse.

---

## 2. Information architecture

### Sidebar (260px, fixed)

```
📥 Inbox          [n]   ← unsorted/incoming tasks
📅 Today          [n]   ← anything due today (cross-list)
✅ Tasks                ← flat view of all open tasks
💬 AI Chat              ← LAIF's agentic chat
                        (replaces Superlist "Messages")

Recent  ›               ← collapsible, auto-populated

──────────────────────
Lists    Browse all  [+] [⌃]
👋 Getting Started
⌄ Work
   📅 This Week
   📝 Meeting Notes
› Personal
   (collapsed)
──────────────────────

Tools  ›                ← collapsible, default closed
   ⏱  Focus Timer
   📊 Stats
   🗓  Calendar

[avatar]                ← Settings / Sign out
```

### Routes

| Route | Purpose |
|---|---|
| `/onboarding` | 3-step themed onboarding (only when no profile exists) |
| `/` | Inbox (default after auth) |
| `/today` | Today view |
| `/tasks` | All tasks (flat, with List/Board/Matrix modes) |
| `/chat` | AI Chat |
| `/lists/[id]` | A single List |
| `/lists/[id]/tasks/[taskId]` | Same list, detail panel open (deep-linkable) |
| `/tools/focus` `/tools/stats` `/tools/calendar` | LAIF tools |
| `/settings` | Settings |

### Three-pane shell (every authenticated page)

| Pane | Width | Content |
|---|---|---|
| Left | 260px | Sidebar (above) |
| Center | flex-1, min 540px | Active view |
| Right | 380–420px | Daily artwork (idle); replaced by detail panel(s) / customize-list panel when invoked |

Up to 3 right-pane panels can stack (parent → task → sub-task). Earlier panels collapse to a vertical strip on the left of the right-pane area.

---

## 3. Core concepts (one-paragraph each)

**List** — a rich document. Has a type (`standard` / `habit` / `journal` / `notes` / `reading` / `contacts`). Body is a block editor; blocks include task, paragraph, heading, bullet/numbered list, divider, tip, image, attachment.

**Task** — a block that's also a top-level entity. Has title, body (its own block editor), due date, priority, labels, assignee, comments, sub-tasks, completion state.

**Inbox** — a special List that can't be deleted/renamed/grouped. Default landing for any task created outside a specific List.

**Today** — a view, not a List. Aggregates tasks due ≤ today, grouped Overdue / Today / Tomorrow.

**Detail panels stack** — opening a sub-task from inside a task's detail panel slides in a new panel; the parent collapses to a vertical strip. Up to 3 stacked panels visible.

**Lists as everything** — Old LAIF's Habits / Journal / Notes / Memories / Contacts become List **types**, not separate pages. Data migrates 1:1 into starter Lists of the matching type.

**Tools is the relegated drawer** — Focus Timer, Stats, Calendar live under a collapsible "Tools" section in the sidebar. Default-closed for new users.

---

## 4. Phases (build order)

| # | File | Scope | Est. effort |
|---|---|---|---|
| 1 | `02-phase-1-foundation.md` | Themes + sidebar + onboarding + Inbox reskin | ~5 days |
| 2 | `03-phase-2-lists-editor.md` | Lists, block editor, share, customize, link/image/attachment | ~7 days |
| 3 | `04-phase-3-tasks-details.md` | Task block, popovers, detail panel, sub-tasks, nesting | ~5 days |
| 4 | `05-phase-4-views-migration.md` | Today / Tasks / AI Chat views + list-type migrations + Tools | ~6 days |

Each phase is independently reviewable. Don't skip phases — they layer.

---

## 5. Strategic decisions (must sign off before phase 1 starts)

These shape multiple phases. Don't start coding until these are settled.

1. **Drop the cream light theme as default?** Yes. **Superlist Light** is new default for new signups. Existing users keep their saved theme. The 6 existing LAIF themes stay in Settings → Appearance.
2. **What replaces the daily artwork in the right pane?** Artwork stays when idle; detail panels and Customize panels replace it on demand. Artwork has its own settings gear (top-right when hovering).
3. **Restructure sidebar IA?** Yes, exactly as §2. Productivity/Workspace sections from old LAIF collapse into the **Tools** group (default-closed for new users; existing users keep theirs expanded once).
4. **Build Meetings & Updates?** Not in this scope. Earlier drafts considered them; the Superlist screens we have don't show them in depth, and they distract from the Lists-first vision. Punt to a later phase.
5. **Rename Umbrellas → Lists?** Yes. Underlying data model identical; only sidebar label and Settings tab change.

---

## 6. How to use these docs with Claude Code

Each phase doc is self-contained except for two always-loaded references:

- `00-overview.md` (this file) — for IA + scope
- `01-design-system.md` — for tokens, typography, copy constants
- `99-reference.md` — for full data model + API routes

When starting phase N, load: `00 + 01 + 99 + 0N-phase-N-*.md`. That's typically 4 files, well under any context budget.

Phase docs have explicit **acceptance criteria** at the end. Use those to verify before moving on.

If a phase doc says "see `01-design-system.md` §X" — that's where the spec lives, not duplicated here.

---

## 7. What we deliberately keep from old LAIF

Don't lose these — they're LAIF's competitive edge over Superlist:

- AI Chat (full agentic chat with 8 tools)
- AI Daily Brief (renders on empty Inbox)
- Voice-to-task capture
- Completion sound chimes (5 random two-note)
- 6 existing themes + reduce-motion + display density
- PWA install + service worker caching
- All settings tabs (Appearance / Sound / Display / Lists)

Phase 1 reskins them with the new tokens; phase 4 finishes the migration.

---

## 8. What we drop or punt

- Multi-user real-time collaboration (live cursors, presence) — out of scope.
- Full offline-edit-and-sync — service worker cache stays, but no CRDT.
- Calendar integrations (Google/Outlook) — separate project.
- Mobile-only gestures and the voice button as primary — Flutter app.
- Meetings & Updates as first-class entities — punt.

---

**End of overview.** Next: `01-design-system.md` for tokens, typography, and copy.
