# Phase 3 — Tasks & Detail Panels

> **Load with:** `00-overview.md` + `01-design-system.md` + `99-reference.md` + this file.
>
> **Goal:** Tasks become first-class. Full task row anatomy, sub-tasks inline, detail panel with chips, popovers (date/time/priority/label/assignee), nested stacked panels, completion state with strikethrough.
>
> **Effort:** ~5 days.
>
> **Depends on:** phase 2 (block editor exists, task blocks render as basic stubs).

---

## 1. Task block — full anatomy

Used everywhere: Inbox new task row, inside a list body, inside a parent task's body (as a sub-task). Same component, same data model.

### Row anatomy (left to right)

1. **Drag handle** (`GripVertical`, 16px, muted, on hover only) — same as any block.
2. **Sub-task indicator** — a small filled dark circle with a coral check, shown **only when the task has ≥1 sub-task**. Purely decorative — it tells the user this row drills deeper.
3. **Checkbox** — 20px empty coral-bordered circle. Click to complete (see §4).
4. **Priority pip** — a small `BarChart3` icon colored by priority (red/amber/blue). Only shown when priority is set.
5. **Title** — Inter 500, 15px, primary color. Editable inline. Placeholder when empty: `copy.list.inlineNewTaskPlaceholder` ("Add a task, or type '/' to choose a different content type").
6. **Right cluster** — small icons under the title, only when relevant:
   - Sub-task counter pill: `🔘 N/M` where N = completed sub-tasks, M = total. Hidden if no sub-tasks.
   - Due date chip: `📅 in 2 days, 11 AM` or `📅 Tomorrow` or `📅 2 days ago, 9:52 AM`. Hidden if no due date.
   - Label chips: `🏷 interview` for each applied label.

### Right-side action cluster

- **Assignee avatar** (24px) — shown when assignee is set. Click opens assignee popover (§6).
- **Open detail** glyph — `≡` (lines) by default; on hover becomes a circular `→` (`ArrowRight`) button. Click opens the task detail panel in the right pane.

### Row states

- **Hover:** row bg = `--bg-hover`. Drag handle visible. Open-detail glyph becomes the coral arrow button.
- **Selected** (keyboard): row bg = `--bg-selected`. 2px coral border on the right edge of the row (matches the open-detail panel visual link).
- **Completed:** checkbox fills `--accent` with white check; title gets coral strikethrough; metadata sub-row also strikethrough. The row remains visible unless "Hide completed tasks" is on (§Phase 2 §8).

### Inline editing of metadata

The same small icon strip shown on the **new task row** (calendar / priority / label) is also accessible on any task row by focusing it and using the right-cluster's icon-bar. Clicking each opens the corresponding popover.

---

## 2. Task detail panel

Slides into the right pane from the right; replaces the daily artwork. Width 420px.

### Header (sticky)

- **Left:** `×` close button + **Complete pill button**.
  - Pill: 32px tall, full radius, ghost border. Icon `Check` + label `copy.task.completeCta` ("Complete").
  - When completed: pill label becomes `copy.task.completedCta` ("Completed"); icon background fills `--accent` with white check; the title and chip row below get a coral strikethrough.
  - Click toggles between completed/uncompleted.
- **Right:** color swatch (matches the parent list's swatch) + overflow `⋮` button.

### Title row

- Task title in `--text-h1` (28px), weight 700, primary. Editable inline.
- Right of title: assignee avatar (clickable, opens assignee popover).

### Metadata chip strip

A horizontal row of small chips, each with a leading icon:

- 📅 Due date chip: `in 2 days, 11 AM` or `Today, 11 AM` etc. Click opens the date popover.
- 🏷 Labels chip(s): each label as a separate small chip with the tag icon. Click any chip opens the label popover; clicking outside an existing chip opens it in "add label" mode.
- `≡` List chip: shows the list name (e.g. `≡ User Interview Prep`). Click opens a list picker (move this task to another list).

The chips wrap to a second row if needed. When a field is unset, its chip is hidden (the metadata row only shows what's there).

### Body

A full rich-text block editor — same as a List body (`/` works, all block types available). Empty placeholder: `copy.list.emptyBlockPlaceholder` ("Click here to add a task, or type '/' to choose a different content type"). This is where **sub-tasks** live.

### Footer

- Centered, 12px, muted: `copy.task.createdBy(name, when)` → e.g. "Created by Jane • 2 min ago".
- Below: a comment input pill, full-width-minus-padding, with placeholder `copy.task.leaveMessagePlaceholder` ("Leave a message...").
- Comments thread renders above the input in chronological order. Each comment: small avatar + name + relative time + body. No reactions in v1.

### Task overflow menu

Triggered by the `⋮` in the header. Exactly 4 items in this order:

1. `copy.task.overflowMenu.unsubscribe` ("Unsubscribe") with `ArrowRight` icon — stops notifications for this task.
2. `copy.task.overflowMenu.copyLink` ("Copy link") with `Link2` icon — deep link to clipboard.
3. `copy.task.overflowMenu.markAllIncomplete` ("Mark all incomplete") with `CircleCheck` icon — unchecks this task AND all its sub-tasks at once.
4. `copy.task.overflowMenu.deleteTask` ("Delete task") with `Trash2` icon, in `--accent` red. No confirm; 10s undo toast.

---

## 3. Sub-tasks

A sub-task is just a task block inside a parent task's body. Its data model field is `parentTaskId`. The detail-panel body editor renders sub-tasks as regular task rows.

### Inline editing inside the parent task body

Users can add/edit sub-tasks **inline in the detail panel body** without opening each sub-task's own detail. This is the primary editing surface.

### Sub-task counter on parent

The parent task's row metadata shows `🔘 N/M` where N completed and M total. When the parent has zero sub-tasks, hide this chip entirely.

### Opening a sub-task

Clicking a sub-task's `→` arrow opens a **nested detail panel** (§4).

---

## 4. Nested detail panel stacking

This is signature Superlist behavior. Implement it carefully.

When a sub-task is opened from inside a parent task's detail panel:

1. The **parent panel collapses to a narrow vertical strip** (~64px wide) on the left of the right-pane area. The strip shows:
   - A back-arrow icon at the top
   - The parent task's title written **vertically** (rotated 90° clockwise so it reads bottom-to-top), truncated with ellipsis
   - The parent's overflow `⋮` at the bottom
2. The **sub-task's detail panel** slides in to the right of the parent strip at the standard 420px width.
3. The sub-task's panel header shows a **breadcrumb** above its title — the parent task's title as a clickable link. Clicking it pops the stack back.

The shell can hold up to **3 stacked levels visible** (the leftmost-most parent, the middle parent, and the active task). Going deeper pushes the oldest into a stack-summary tab (a single 32px tab that shows a count, e.g. "+2", and expands on hover to show the chain).

Closing any panel with `×` pops the stack. Clicking a parent strip pops back to it (closes anything deeper).

---

## 5. Popovers (full spec)

Date and Priority are introduced in phase 1 (`02-phase-1-foundation.md §6`). Phase 3 adds Label and Assignee, and confirms detail-panel context for all four.

### 5.1 Date popover (recap)

See `02-phase-1-foundation.md §6`. Same component, same behavior. In task detail panel, the chip shows the resolved date; clicking re-opens.

### 5.2 Time sub-popover (recap)

See `02-phase-1-foundation.md §6`. Same.

### 5.3 Priority popover (recap)

See `02-phase-1-foundation.md §6`. Same.

### 5.4 Label popover

Anchored to the tag icon on a task row's edit strip or to the labels chip in the detail panel. Width 240px.

- **Search input** at top: `Search` icon + placeholder `copy.popovers.label.searchPlaceholder` ("Search or create label"). Typing filters.
- **Existing labels** as rows: tag icon (`Tag`) + label name (e.g. "reminder", "Tutorial"). Click toggles application.
- **Multi-select:** an applied label shows a coral check on the right of its row. Clicking an applied label removes it.
- **Inline creation:** if the typed query has no exact match, the topmost row becomes `Create "[query]"` — selecting it creates the label and applies it.
- No explicit footer. Selecting commits; Esc / outside-click closes.

### 5.5 Assignee popover

Anchored to the person icon on a row or to the avatar in the detail panel. Width 260px.

- **Search input**: `Search` icon + placeholder `copy.popovers.assignee.searchPlaceholder` ("Search for name").
- **Result rows**: 32px avatar (or initial badge with a hash-derived color) + display name. For unaccepted invitees, append a right-aligned muted label `copy.popovers.assignee.pendingLabel` ("Pending").
- Selecting a row sets the assignee and closes. The row's right cluster updates: the unassigned `≡` lines glyph is replaced by the assignee avatar.

---

## 6. Task data model (phase 3 slice)

```ts
type Priority = "high" | "medium" | "low" | null;

type Task = {
  id: string;
  listId: string;            // inbox is just another list
  parentTaskId?: string;     // for sub-tasks
  title: string;
  blocks: Block[];           // body — same editor as a List
  completed: boolean;
  completedAt?: Date;
  dueAt?: Date;
  repeat?: "daily" | "weekdays" | "weekly" | "monthly" | "yearly";
  priority: Priority;
  labelIds: string[];
  assigneeId?: string;
  comments: Comment[];
  createdBy: string;
  createdAt: Date;
};

type Label = {
  id: string;
  name: string;
  ownerId: string;           // labels are per-user, not per-list
};

type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: Date;
};
```

Full model in `99-reference.md`.

---

## 7. API routes (phase 3)

```
POST   /api/tasks                            create
GET    /api/tasks/:id                        read
PATCH  /api/tasks/:id                        update title/dueAt/priority/labelIds/assigneeId/completed
DELETE /api/tasks/:id                        soft delete

GET    /api/labels                           user's labels
POST   /api/labels                           create label

GET    /api/tasks/:id/comments               read
POST   /api/tasks/:id/comments               create
```

All optimistic with TanStack Query invalidation. Use the existing LAIF mutation pattern.

---

## 8. Keyboard shortcuts (phase 3 additions)

| Shortcut | Action |
|---|---|
| `↑` / `↓` | Move selection between task rows |
| `Space` | Toggle completion of the selected row |
| `Enter` | Open detail panel for the selected row |
| `1` / `2` / `3` | Set priority (when priority popover is open OR when a row is selected) |
| `Esc` | Close popover, then detail panel (one level at a time) |

Master list in `99-reference.md`.

---

## 9. Completion behavior

- Clicking a checkbox fills it `--accent` with a white check (animate 200ms ease-out scale-in).
- Title and metadata strikethrough animate in 200ms.
- Play the existing LAIF completion sound chime (one of 5 random two-note chimes, Web Audio API).
- Toast at bottom-left: `"Completed: [task title]"` with an "Undo" action.
- If "Hide completed tasks" is on for the parent list, the row fades out 200ms then leaves the layout.
- The Inbox badge count decrements.

---

## 10. Acceptance criteria for phase 3

1. A task block in a list body renders with the full anatomy from §1 — drag handle, sub-task indicator (only when sub-tasks exist), checkbox, priority pip, title, metadata sub-row, right cluster.
2. Clicking the right cluster `→` opens the task detail panel in the right pane, replacing the artwork.
3. The detail panel header shows close button + Complete pill + color swatch + overflow `⋮`. Clicking Complete toggles between "Complete"/"Completed" states with strikethrough.
4. The chip strip shows date, labels, list. Each chip opens its respective popover when clicked.
5. The body is a full block editor with all 10 block types from `copy.slashMenu.items` working.
6. Sub-tasks added inline in the body update the parent's `N/M` counter in real-time.
7. Opening a sub-task's `→` slides in a nested detail panel; the parent collapses to a 64px vertical strip with rotated title.
8. Going 3 levels deep stacks all 3 visible; level 4 collapses level 1 into a "+1" tab.
9. The overflow `⋮` menu shows exactly 4 items: Unsubscribe / Copy link / Mark all incomplete / Delete task. "Delete task" is red, undoable.
10. Date popover, Time sub-popover, Priority popover work exactly as in phase 1.
11. Label popover shows "Search or create label" placeholder; typing a new label shows "Create [query]" as the topmost row; selecting creates and applies. Applied labels show a check; clicking removes.
12. Assignee popover shows "Search for name" placeholder. Pending invitees show a "Pending" badge. Selecting sets the assignee; the row's `≡` glyph swaps to the avatar.
13. Comments thread renders in chronological order above the "Leave a message..." input; pressing Enter posts.
14. Completing a task plays the existing chime, animates strikethrough, decrements Inbox count, and shows an Undo toast.
15. Keyboard shortcuts `↑`/`↓`/`Space`/`Enter`/`1`/`2`/`3`/`Esc` all work as specified.

---

**End of phase 3.** Next: `05-phase-4-views-migration.md` for Today/Tasks/AI Chat views and migrating Habits/Journal/etc to List types.
