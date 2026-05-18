# Superlist Web — New Use Cases (Part 2)

> **This document is a supplement to `superlist_ia.md`.** Read that first for the global 3-column layout, sidebar, navigation, and base components (task row, help banner, customize panel, etc.). This file covers **only the new features** introduced in the second batch of screens.
>
> **Mobile reminder:** As before, desktop ≥1280px only. The Flutter app handles narrow viewports.

---

## New Features Introduced

1. **Done / Marked-as-done tasks state** (strikethrough completed view)
2. **Messages module** (a top-level view dedicated to task conversations)
3. **Task Detail panel** (opens in the right column, replacing the wallpaper)
4. **In-task messaging with @mentions**
5. **Sent-message state & list update**
6. **Lists directory** (browse, search, and star all lists)
7. **Sidebar notification badges** (unread counts on top-level + group labels)

---

## 1. Tasks — "Marked as done" filter (Done state)

**Trigger:** In the `Tasks` system view, user clicks the `Done` filter tab.

**State changes:**
- Active tab label expands from `Done` → `Marked as done`
- Other tabs visible: `🔍`, `Me`, `Others`, `Upcoming`, `Marked as done` (selected)
- Task list shows **only completed tasks**, each with:
  - **Red filled checkbox** with white checkmark inside (instead of empty circle)
  - **Title text struck through** (line-through, slightly muted color)
  - Source list still shown below in normal style

**Example tasks shown (all from Reading List):**
- ~~Travels with Charley by John Steinbeck~~ · `≡ Reading List`
- ~~Start with Why by Simon Sinek~~ · `≡ Reading List`
- ~~Build by Tony Fadell~~ · `≡ Reading List`

**Interaction:** Clicking the red-filled checkbox un-completes the task (moves it back to the active list). Strikethrough is purely visual — title text is still selectable / clickable to open the task detail panel.

---

## 2. Messages — Empty state

**Trigger:** User clicks `Messages` in sidebar (4th top-level item).

**Layout:**
- Sidebar: `Messages` is selected (red right-edge bar)
- Main column:
  - Title: `Messages` (H1)
  - Help banner (purple, dismissible): `View messages from any task you've created, been assigned, or been mentioned`
  - **Empty state illustration:** three faint hand-drawn squiggle-lines beside empty circles (same playful style as the empty state in Tasks `Tasks for others`)
- Right panel: default desert/moon wallpaper

**Purpose:** This is the **unified inbox for task-bound conversations**. Any task that has comment activity involving the current user surfaces here — distinct from the regular Inbox (which is about task triage, not chat).

---

## 3. Messages — With content (unread state)

**State changes from empty:**

**Sidebar:**
- `Lists` section label now reads `Lists  1 new` (purple counter inline next to the label)
- `Messages` row in top nav shows a **small purple dot indicator** on its right edge (unread badge)

**Main column:**
- Above the title: small purple-dot row reading `1 new message` (count of unread items in this view)
- Help banner unchanged
- **Message list:** each row represents a conversation on a task. Anatomy:
  - Left: small purple unread dot (only on unread rows)
  - Avatar (40px circle, colored initial like `T` purple, or photo)
  - Right of avatar: two-line preview
    - Line 1: **Task title** (or `...` if untitled) — bolded if unread
    - Line 2: `[Sender name]: [latest message preview]` — `@mentions` are bolded
  - Far right: relative timestamp (`Now`, `23 min ago`)

**Example rows:**
1. (unread, purple dot) `...` / `Tom: ` **`@Jane Doe`** ` please help work on this!` · `Now`
2. (read, no dot) `Take a 20-min walk every day` / `Jane: Tomorrow @ the park near office` · `23 min ago`

**Implications:**
- Sidebar unread counters (`Lists 1 new`, dot on `Messages`) appear when this view has unread items
- Clicking a row opens the **Task Detail panel** (see §4) in the right column

---

## 4. Task Detail Panel (opens in right column)

**Trigger:** User clicks a message row in Messages (or — implied — clicks any task row anywhere in the app to open its detail).

**Major layout shift:**
- The 3-column proportions change: sidebar stays the same width, **main content column narrows**, and the **right column expands** to become a real working panel (no longer wallpaper)
- Sidebar's `Messages` still selected
- The opened message row in the middle column is **highlighted** (light grey background + slight horizontal offset right, with a vertical purple bar on its right edge)

**Right panel anatomy (top to bottom):**
- **Header strip**
  - Left: `×` close button (returns to wallpaper / closes detail)
  - Next to `×`: `✓ Complete` pill (click to mark task complete)
  - Right: assignee avatar stack + three-dot menu (more actions)
- **Task title row**
  - Large title text (here `...` because the task is untitled)
  - Right: assignee avatar slot (single-user icon)
- **Metadata row** (inline, comma-style):
  - `📅` due date (icon only when no date set)
  - `🏷️` labels
  - `💬 1` comment count
  - `≡ Design Sprint #4` source list (with this list's emoji)
- **Subtask creator row** (faint, placeholder):
  - Empty checkbox + placeholder text: `Click here to add a task, or type '/' to choose a different content type`
  - This is the **rich-text editor entry point** — typing here adds a subtask or other content block; `/` opens the block-type menu (same editor model as a List document)
- **Empty space** (where subtasks / description body would appear)
- **Activity divider** — a horizontal hairline separator
- **Activity log line** (small, muted): `Created by Tom • 1 min ago`
- **Date divider** (centered, small): `Tuesday, March 19`
- **Message bubble**
  - Avatar circle (purple `T`) + sender name `Tom`
  - Bubble content (light grey background, rounded): `@Jane Doe please help work on this!`
  - Timestamp below bubble: `12:07 PM`
- **Message input** (bottom-fixed):
  - Pill-shaped text field with placeholder: `Leave a message...`

**Key concept:** The Task Detail panel is **both a task editor and a chat thread** in one. Subtasks/description live in the editor area at the top; conversation about the task lives below the activity divider. Both render inside the same right-column overlay.

---

## 5. Writing a reply

**State while typing:**
- The `Leave a message...` placeholder is replaced with the typed text — e.g. `will take a look shortly!|`
- The input field now shows a **circular blue send button** on the right (arrow-up icon) — appears when the input has content

The rest of the panel is unchanged.

---

## 6. @mention autocomplete

**Trigger:** User types `@` inside the message input.

**Behavior:**
- A small **popover anchored above the `@` character** appears (popup expands upward so it doesn't get clipped by the bottom edge)
- Popover contains a list of mentionable people (collaborators on this task / list):
  - `🟣 T` `Jane Doe`
  - `🟪 T` `Tom Lee`
- Each row: avatar + display name
- Keyboard arrow keys navigate, Enter/click selects
- After selection, the `@` becomes a styled mention pill in the input

**Selected mention rendering in input:**
- `will take a look shortly! @Tom Lee|` — `@Tom Lee` is rendered in **blue underlined text** distinguishing it from plain text
- Selected mention is treated as a single token (backspace deletes the entire mention, not character by character)

---

## 7. Sent message & list update

**After user hits send:**

**Right panel changes:**
- Input field clears and returns to placeholder `Leave a message...`
- **New sent-message bubble** appears in the conversation:
  - Right-aligned (sender = current user)
  - **Blue background**, white text (contrast with the grey received bubbles)
  - Content: `will take a look shortly! @Tom Lee` (mention rendered inline)
  - Timestamp below: `12:09 PM`
- Activity metadata updates:
  - `💬 2` (comment count incremented from 1 → 2)
  - Activity-line timestamp: `Created by Tom • 2 min ago`

**Middle column (Messages list) changes:**
- The corresponding conversation row updates in place:
  - Preview line now reads `Jane: will take a look shortly! @Tom Lee` (with `@Tom Lee` bolded)
  - Timestamp resets to `Now`
  - Row is no longer marked unread (purple dot gone since the current user just acted on it)
- The other row's timestamp ticks up (`23 min ago` → `24 min ago`)

**Pattern:** Messages list previews use the **format `[Sender first name]: [message body]`** — sender is the last person who wrote in the thread, even if it's the current user.

---

## 8. Lists directory (browse all lists)

**Trigger:** User clicks the `Lists` section header in the sidebar (it's also a navigable destination, not just a label).

**Sidebar state:**
- The `Lists` row itself is now highlighted (red right-edge bar)
- It still shows the `1 new` counter on its right

**Main column:**
- Title: `Lists` (H1)
- Top-right: `+ New list` button (rounded pill, with `+` icon)
- Help banner (purple, dismissible): `View, sort, and star important lists to the sidebar`
- **Search field** (full-width pill, magnifier icon + `Search...` placeholder)
- **Section header:** `New list` (H2) — auto-populated section showing lists added very recently (last X minutes/hours)
  - Row anatomy: `[emoji] [list name]   [👤 creator avatar+name]  •  [created timestamp]   [share icon] [star icon]`
  - Example: `📝 Design Sprint #4   T Tom Lee  •  1 min ago   👥 ⭐`
- **Section header:** `Lists` (H2) — all lists alphabetically (or by user order)
  - Each row: `[emoji] [list name]   [⭐ star toggle on right]`
  - The star is **filled (yellow/gold) when the list is pinned to the sidebar**, outline when not
  - Examples:
    - `👋 Getting Started   ⭐`
    - `🍎 Groceries   ⭐`
    - `🎯 Habits   ⭐`
    - `📝 Meeting Notes   ⭐`
    - `📚 Reading List   ⭐`
    - `🗓️ This Week   ⭐`

**Right panel:** Same purple/orange sphere wallpaper as Tasks view (system views share this background).

**Key concepts:**
- **Lists directory is a system view**, not a list itself. It shows every list the user has access to, regardless of whether it's currently pinned to the sidebar.
- **Star = pin to sidebar.** Unstarring a list removes it from the sidebar but keeps it accessible here.
- **The "New list" section** auto-surfaces newly-created lists (likely lists created or shared with you in the last hour) so they don't get lost.
- **Search** filters this directory by list name (and possibly emoji).
- **`+ New list`** creates a new list and presumably navigates straight into it.
- **Share icon** (next to creator) on a list row indicates the list is collaborative (vs. private).

---

## 9. New Component Inventory (additions to base set)

### 9.1 Done-state task row
- Red filled checkbox with white check
- Title with strikethrough
- All other metadata renders normally (not struck through)

### 9.2 Message-list row (in Messages view)
- Unread dot (purple, left of avatar)
- Avatar
- Task title (bold if unread)
- `Sender: preview` line
- Relative timestamp (right-aligned)

### 9.3 Task Detail panel (right-column overlay)
- Header strip: close, Complete pill, avatars, more menu
- Title + metadata + subtask editor (block-based, supports `/` commands)
- Activity divider
- Chat thread with date dividers
- Bottom message input with `@` autocomplete

### 9.4 Message bubble
- Received: left-aligned, grey background, sender avatar + name above
- Sent: right-aligned, blue background, white text, no sender label
- Timestamp shown below bubble (small, muted)
- `@mention` rendered as inline blue underlined token

### 9.5 @mention popover
- Appears above the input (upward expansion to avoid clipping)
- List of selectable users with avatar + display name
- Keyboard navigable

### 9.6 Sidebar unread counter
- Purple text suffix on group label: `Lists  1 new`
- Small purple dot on top-level nav items (`Messages`)

### 9.7 List directory row
- Emoji + name + (optional creator/timestamp metadata) + share-icon + star-toggle
- Star-toggle controls sidebar pinning

### 9.8 "New list" auto-section
- A surfaced sub-section above the main list inventory
- Shows recently-created/shared lists with extra context (creator, when, share state)

---

## 10. Updated IA Tree

```
Superlist Web
│
├── System Views
│   ├── Inbox
│   ├── Today
│   ├── Tasks         (filters: Me, Others, Upcoming, Marked as done)
│   └── Messages      ← previously placeholder; now fully spec'd
│
├── Recent (auto-populated)
│
├── Lists  [⬅ this label is itself a nav destination opening the Lists directory]
│   │     │       Directory shows: search, + New list, "New list" section, all lists with star toggles
│   ├── [pinned/recent list]
│   ├── 👋 Getting Started
│   ├── ▾ Work (group)
│   │   ├── 🗓️ This Week
│   │   └── 📝 Meeting Notes
│   └── ▸ Personal (group)
│       ├── 🍎 Groceries
│       ├── 📚 Reading List
│       └── 🎯 Habits
│
└── Task Detail panel (overlay in right column, opens from any task row anywhere)
    ├── Header: Close · Complete · Assignee · More
    ├── Title + metadata
    ├── Subtask editor (rich text, `/` commands)
    ├── Activity log
    └── Chat thread + message input with @mentions
```

---

## 11. Build Notes (additions)

1. **Real-time required.** Messages, unread badges, comment counts, and the Messages list previews need realtime updates (WebSocket / SSE / similar). When a teammate sends a message, the badge, list row, and any open Task Detail panel must reflect it without refresh.
2. **Editor reuse.** The list document editor and the Task Detail subtask editor are the same component — both support headings, paragraphs, checkboxes, bold, links, `/` for block menu. Build it once, mount it in both contexts.
3. **Mention data source.** `@` autocomplete should be scoped to people with access to the task's parent list (not the entire workspace). Cache the participant list per list.
4. **Star toggle.** Star state is per-user, not per-list — i.e. starring a list pins it to **my** sidebar only, not everyone's. Persist as `user_list_pins[user_id][list_id] = boolean`.
5. **Done filter semantics.** "Marked as done" should query across all lists the current user has access to, filtered to `completed_at IS NOT NULL`. Sort by `completed_at DESC` so most-recently-completed appears first.
6. **Empty states.** Reuse the three-squiggle illustration anywhere a system view has no items (Messages empty, Tasks-for-others empty, etc.).
7. **Task Detail panel routing.** Each task should have a stable URL (e.g. `/task/[id]`) so it's deep-linkable and the back button works. Opening the panel adds a route segment without losing the underlying system view.

---

## 12. New UX Copy Reference (verbatim from screens)

- Messages help banner: `View messages from any task you've created, been assigned, or been mentioned`
- Lists help banner: `View, sort, and star important lists to the sidebar`
- Messages unread indicator: `1 new message`
- Sidebar group counter format: `1 new`
- Tasks Done tab — active label: `Marked as done`
- Task Detail header pill: `Complete`
- Task Detail subtask placeholder: `Click here to add a task, or type '/' to choose a different content type`
- Message input placeholder: `Leave a message...`
- Lists directory button: `+ New list`
- Lists directory sections: `New list`, `Lists`
- Activity log format: `Created by [name] • [relative time]`
- Date divider format: `Tuesday, March 19`
- Message timestamp format: `12:07 PM` (locale-aware, 12-hour)
- List metadata format in directory: `[creator avatar+name] • [relative time]`
