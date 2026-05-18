# Phase 4 — Views & Migration

> **Load with:** `00-overview.md` + `01-design-system.md` + `99-reference.md` + this file.
>
> **Goal:** Finish the surface area. Today/Tasks/AI Chat get the Superlist treatment. Old LAIF features (Habits, Journal, Notes, Memories, Contacts) migrate into List types. Tools section (Pomodoro/Stats/Calendar) gets the visual refresh and moves under `/tools/*`.
>
> **Effort:** ~6 days.
>
> **Depends on:** phases 1, 2, 3 complete.

---

## 1. Today view (`/today`)

A query view, not a List. Center pane only — the right pane stays artwork until a task is opened.

### Layout

- Page header (`copy.today.title` = "Today"). Right side: due-date filter (`SlidersHorizontal`) + overflow (`MoreVertical`).
- Dismissible tip banner: `copy.today.tipBanner` ("See your schedule, track habits, and stay on top of what's due today.") — same visual treatment as the Inbox banner.
- **New task row** — same component as Inbox, but newly-created tasks default `dueAt = endOfToday`.
- **Groups** (collapsible, default expanded):
  - `copy.today.groups.overdue` ("Overdue") — red section header (use `--accent`). Sorted oldest-first.
  - `copy.today.groups.today` ("Today"). Sorted by time of day, undated last.
  - `copy.today.groups.tomorrow` ("Tomorrow"). Only shown if the user has ≥1 task due tomorrow.

Each group is collapsible (`⌄`/`›`). Each row is a `TaskRow` from phase 3 — same component, same anatomy, opens the same detail panel.

### Query

```
SELECT task FROM tasks
WHERE completed = false
  AND dueAt IS NOT NULL
  AND dueAt <= endOfTomorrow
  AND assigneeId IN (currentUser, NULL)
ORDER BY group, dueAt ASC
```

`group` is derived: overdue if `dueAt < startOfToday`, today if same calendar day, tomorrow otherwise.

---

## 2. Tasks view (`/tasks`)

A flat view of every task across all lists.

### Header

- Page heading `copy.tasks.title` ("Tasks") in `--text-page`.
- Right cluster: "Creation date" sort dropdown + `+ New task` button + view-mode switcher (3 icon buttons: List / Board / Matrix).

### Filter tabs

A pill row beneath the header: `copy.tasks.filters.forMe` / `copy.tasks.filters.upcoming` / `copy.tasks.filters.done`.

- `Tasks for me`: assigneeId = current user OR null, completed = false. Default tab.
- `Upcoming`: completed = false AND dueAt is in the future (next 30 days), sorted by date.
- `Done`: completed = true, sorted by completedAt desc, last 30 days.

### View modes

- **List** (default) — flat task rows, sorted by the current sort dropdown.
- **Board** — three Kanban columns: Todo / In Progress / Done. "In Progress" maps to tasks with a label called `in-progress` (special label, auto-created per user). Drag a card between columns to update its state.
- **Matrix** — 2×2 Eisenhower grid:
  - top-left: Urgent + Important (high priority, due ≤ today)
  - top-right: Not Urgent + Important (high priority, due > today)
  - bottom-left: Urgent + Not Important (medium/low priority, due ≤ today)
  - bottom-right: Not Urgent + Not Important (everything else)
  - Each quadrant scrolls independently.

---

## 3. AI Chat view (`/chat`)

LAIF's existing agentic chat **moves to this route**. No behavioral change — keep the same data model, 8-tool agentic loop, message thread, streaming responses, and voice input. Visual reskin only:

- Apply Superlist Light/Dark tokens.
- Use the three-pane shell: sidebar / chat thread / artwork right pane.
- Replace the existing chat-page header with the shared `PageHeader` component, title "AI Chat".
- Reuse existing message-bubble components but restyle with `--bg-pane-2` for assistant messages, `--accent-soft` for user messages.

When AI Chat creates a task as part of an agent action, that task lands in Inbox by default (same as today).

### AI Daily Brief

The Daily Brief (existing feature) renders on the **empty-Inbox state**, not on the Chat page. When `/` has zero open tasks for the user, render the LLM-generated brief in a card below the new-task row instead of the standard "Nothing here. Press ⌘N to add a task." message. This is unchanged from current behavior; just rerender in the new theme.

---

## 4. List type migrations

Old LAIF entities migrate 1:1 into Lists of the matching type. Each starter List is seeded on first login post-migration (or on signup, for new users).

### 4.1 Habit Tracker (`type = "habit"`)

Migrate every existing `Habit` row in MongoDB into a single starter List titled "Habits" (or per-habit Lists if the user prefers — see migration toggle below).

**Type-specific UI:**

- Tasks have a `repeat` field that's always set (daily/weekdays/weekly).
- Below the list title, render a **weekly heatmap strip**: 7 colored squares (one per day of the past week) showing completion ratio. Each square is `--bg-hover` if no tasks completed that day, gradient up to `--accent` if all completed.
- The new-task row defaults `repeat = "daily"`.
- Completing a task on a recurring day creates a `completion_event` and re-opens the task for the next occurrence.

### 4.2 Journal (`type = "journal"`)

Migrate each existing journal entry to a `journal`-type List, titled with the date (e.g. "May 17, 2026"). One List per day.

**Type-specific UI:**

- Title is auto-set to the date and not directly editable; instead, a date picker in the title row changes which List is rendered.
- The right pane (normally artwork) instead shows a **month calendar** with dots indicating days with entries; clicking a date opens that day's List.
- Default body block is a paragraph (not a task). The slash menu still works.
- "AI summarize" button in the list overflow → runs an LLM summary on the body and appends a `task` block to Inbox per detected todo (existing LAIF behavior, just relocated).

### 4.3 Notes (`type = "notes"`)

Migrate existing notes 1:1. Each note becomes a List of type `notes`. The slash menu defaults to "Paragraph" (no task affordance on the empty-state placeholder).

### 4.4 Reading List (`type = "reading"`)

Migrate Memories that contained links. Each becomes a task block with a Link mark applied to the title. Image previews fetched via OpenGraph and inserted as image blocks below.

### 4.5 Contacts (`type = "contacts"`)

Migrate existing contacts. Each contact becomes a task block where:
- Title = contact name
- Body has paragraph blocks for phone, email, last contacted date.
- A custom metadata strip (in addition to the standard one) shows phone + email as clickable chips.

### Migration UX

On first login post-deploy, show a one-time modal: "We've reorganized your stuff into Lists. Take a look." with a "Show me" button that navigates to `/lists/[migrated-getting-started]`. A non-blocking banner on the Inbox lists the old surfaces and their new locations.

For 30 days post-migration, the old routes (`/habits`, `/journal`, `/notes`, etc.) **redirect** to their new Lists with a one-line banner: "Habits is now a List. [Take a quick tour]".

---

## 5. Tools section (`/tools/*`)

LAIF's Focus Timer, Stats, and Calendar move under the sidebar's **Tools** section (collapsible, default closed for new users; existing users keep their saved state).

### 5.1 Focus Timer (`/tools/focus`)

LAIF's existing Pomodoro. No behavioral change. Visual reskin:
- Three-pane shell with `PageHeader` ("Focus Timer", subtitle "Pomodoro").
- Circular timer in `--text-primary` over `--bg-pane`.
- Controls (Play / Pause / Reset / Switch mode) as pill buttons.
- Task picker chip below the timer — links the active session to a task. The chip uses the same metadata-chip style from phase 3.
- Session stats panel + 7-day focus chart restyled with the new colors.

### 5.2 Stats (`/tools/stats`)

LAIF's existing dashboard. Visual reskin only:
- `PageHeader` ("Stats").
- Range toggle pill row: 7d / 30d / 90d.
- 2×4 grid of stat cards on `--bg-pane-2` with 16px radius.
- Two bar charts (Tasks Completed, Focus Minutes) using `--accent` for the bars.

### 5.3 Calendar (`/tools/calendar`)

LAIF's existing calendar. Visual reskin only:
- `PageHeader` ("Calendar").
- View switcher: Month / Week / Day / Agenda.
- Navigation: `‹ Today ›`.
- Events on hover get a small floating popover with title + time + linked list.
- Drag to create events in time slots (existing behavior).

---

## 6. Settings reorganization (`/settings`)

Tabs (in this order):
1. **Appearance** — 8 theme picker grid (Midnight / Daylight / Ocean / Forest / Sunset / Nord / **Superlist Light** / **Superlist Dark**). The two new themes are highlighted as "New".
2. **Sound** — toggle + Minimal/Playful pack picker (existing).
3. **Display** — Compact/Comfortable/Spacious + Reduce motion (existing).
4. **Lists** (renamed from Umbrellas) — manage groups, list templates, default new-list type.

Top right of Settings: Sign out button (existing).

---

## 7. Empty states

### Inbox empty

- If user has no AI Daily Brief generated yet: show centered hint "Nothing here. Press ⌘N to add a task."
- If AI Daily Brief is available (existing LAIF feature): render the brief card below the new-task row.

### Today empty (no overdue, no today, no tomorrow tasks)

- Centered hint: "You're all caught up. Take a break."

### Tasks empty (for the current filter)

- Each filter tab has its own empty copy:
  - For me: "No tasks assigned to you. Pull a few from Inbox?"
  - Upcoming: "Nothing on the horizon."
  - Done: "No completed tasks in the last 30 days."

### List empty (just created)

- One empty task block with the `copy.list.emptyBlockPlaceholder` placeholder. No hint card.

---

## 8. Acceptance criteria for phase 4

1. `/today` renders the Today page with Overdue (red header), Today, Tomorrow groups, each collapsible. New task created here defaults to today's due date.
2. `/tasks` renders with the three filter tabs (Tasks for me / Upcoming / Done) and the three view modes (List / Board / Matrix). Switching modes preserves the active filter.
3. Board mode shows a Kanban with three columns; dragging cards between columns updates task state.
4. Matrix mode renders the 2×2 grid with each quadrant scrolling independently.
5. `/chat` renders the existing LAIF AI Chat with the new tokens; agentic tool calls still work; created tasks land in Inbox.
6. Empty Inbox renders the AI Daily Brief card (when available).
7. Habits / Journal / Notes / Memories / Contacts all migrate. Old routes redirect to the new Lists for 30 days with a one-line banner.
8. Journal List shows a month calendar in the right pane with dots; clicking a date switches the active Journal List.
9. Habit Tracker List shows a 7-square weekly heatmap below the title; daily completion creates the next occurrence.
10. Contacts List shows phone/email as clickable chips in the task metadata strip.
11. Tools section in the sidebar is collapsible; Focus Timer, Stats, Calendar all reskinned with the new tokens.
12. Settings → Appearance shows 8 themes with the 2 new ones marked "New". Switching works end-to-end.
13. Settings → Lists tab replaces the old Umbrellas tab; the underlying data is unchanged.
14. Mobile screens still show the "best on desktop" notice — no responsive collapse attempted.
15. Existing LAIF unique features still work end-to-end: voice-to-task, completion sounds, PWA install, 6 existing themes.

---

**End of phase 4.** That's the full build. Reference docs are `99-reference.md`.
