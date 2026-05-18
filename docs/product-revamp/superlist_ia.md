# Superlist Web — Information Architecture & Feature Spec

> **Target platform:** Web (desktop-first). A separate Flutter app will cover all mobile/touch-first use cases. Treat all layouts here as desktop ≥1280px wide. Do **not** spend effort on mobile breakpoints — assume the Flutter app handles narrow viewports.

---

## 1. Global Layout (persistent across all screens)

The app uses a **3-column layout** that is consistent on every screen:

```
┌──────────────┬───────────────────────────────┬──────────────────┐
│              │                               │                  │
│   SIDEBAR    │       MAIN CONTENT            │   RIGHT PANEL    │
│   (nav)      │       (list / inbox / tasks)  │   (image / cust.)│
│              │                               │                  │
│   ~340px     │       flexible                │   ~600px         │
│              │                               │                  │
└──────────────┴───────────────────────────────┴──────────────────┘
```

### 1.1 Left Sidebar (Navigation)
Persistent on every screen. Sections from top to bottom:

- **Top-level nav** (system views)
  - `📥 Inbox`
  - `📅 Today`
  - `✅ Tasks`
  - `💬 Messages`
- **Recent** (section label, currently empty in examples)
- **Lists** (section label)
  - Pinned/recent list (e.g. `🚀 User Interview Prep`) — appears at top of Lists section when recently active. Has a red active indicator bar on the right edge when selected.
  - `👋 Getting Started`
  - `Work` (collapsible group, expanded by default)
    - `🗓️ This Week`
    - `📝 Meeting Notes`
  - `Personal` (collapsible group, collapsed by default — chevron right)
    - When expanded: `🍎 Groceries`, `📚 Reading List`, `🎯 Habits`

- **Bottom-left:** User avatar (clickable for account menu)

The selected nav item shows a **red vertical bar on its right edge** + filled background.

### 1.2 Main Content Area (center)
Contains the active view's content: list document, inbox, today view, tasks, etc. Has a rounded container with light background.

Top of main area always has:
- **Left:** `Share` button + status text (e.g. `This list is private`)  — only on List views
- **Right:** Collaborator avatar stack, star (favorite), three-dot menu — only on List views
- System views (Inbox / Today / Tasks) show only a filter/sort icon on the right.

### 1.3 Right Panel (Background / Customize)
- Default state: shows the **list's cover image** filling the panel as decorative wallpaper.
- When `Customize list` or `Search Unsplash` is invoked, this panel transforms into an editor.
- When closed (`Done`), reverts to showing the chosen image.

### 1.4 Footer Bar
Black footer strip with `Superlist` logo (left) and `curated by Mobbin` (right). This is a Mobbin artifact and should **not** be reproduced — ignore the footer in the build.

---

## 2. Screen-by-Screen Feature Specification

### Screen 1 — Customize List: Emoji + Image picker (default state)

**Context:** User opened `User Interview Prep` list and tapped Customize.

**Main column:** Shows the list document
- Title: `User Interview Prep` with hand-drawn teal underline accent
- Section: `Pre-Interview Preparation` (H2)
- Subsection: `Define Objectives:` (H3)
- Checkbox task: `Outline the goals and objectives of the interview`
  - Metadata row: `1/2` (subtask progress) · `📅 in 2 days, 11 AM` (due date) · `🏷️ interview` (label) · assignee avatar (T) · subtask icon
- Body paragraph: `it's important to have a clear **understanding** of what we hope to achieve by conducting the interview.` (note: `understanding` is bold, `interview` is a hyperlink in teal)
- Checkbox task: `Determine what insights or information you hope to gather from the user.`
- Subsection: `Identify Participants:` (H3) with bullet list (nested bullets supported)
- Subsection: `Schedule Interviews:` (H3) with numbered list
- Subsection: `Prepare Interview Questions:` (H3) with body paragraphs

**Rich editor features visible:**
- H2, H3 headings
- Inline bold + hyperlinks
- Checkbox tasks with metadata (subtask count, due date, label, assignee)
- Bulleted lists (with nested indent)
- Numbered lists
- Body paragraphs

**Right panel — `Customize list`:**
- Header: `Customize list` + `Done` button (top-right, pill-shaped)
- **Emoji** section label
  - Row of 5 emoji options + `+` button: 📝 (selected, shown with circular ring), 🚀, 📝, 🎉, 🛒, `+` (custom picker)
- **Image** section label
  - Grid of preset Unsplash images, 7 columns × 3 rows (~21 thumbnails, rounded squares)
  - First thumbnail (top-left) is selected (has dark ring border)
  - Below grid: `📷 Upload` button (right-aligned) and `🔍 Search Unsplash` button (below)
- Bottom: Live preview of the currently selected image (large, fills bottom of panel)

---

### Screen 2 — Customize List: Emoji changed to 🚀

**Difference from Screen 1:**
- Second emoji (🚀 rocket) now has the circular selection ring
- The sidebar's list entry `User Interview Prep` now shows `🚀` icon instead of the previous notebook icon — **emoji change applies instantly to the sidebar**
- Image selection unchanged (desert/moon still selected)
- Right panel still showing `Customize list` mode

---

### Screen 3 — Search Unsplash: Empty state

**Trigger:** User clicked `Search Unsplash` on the customize panel.

**Right panel transforms to:**
- Header: `Search Unsplash` + `Done` button
- Search input: rounded pill with magnifying-glass icon, cursor visible, empty
- Below input: row of suggested category chips (rounded pills): `Paint`, `Nature`, `Architecture`, `Space`, `Color`
- Below chips: empty content area
- Bottom: current selected image preview still shown (desert/moon)

---

### Screen 4 — Search Unsplash: "Nature" results

**Difference from Screen 3:**
- Search input now shows `Nature` with an `×` clear button
- Suggestion chips are hidden (search has a value)
- Result grid: 2-column masonry layout
  - Top-left: rocky landscape image (selected — has dark ring border) with attribution `by NEOM` below it (underlined link)
  - Top-right: waterfall image
  - Bottom-left: green hills image
  - Bottom-right (partial): more results scrolling
- Bottom: selected image preview still shows desert/moon

**Note:** Attribution text `by [Author Name]` appears under each image. Author name is an underlined hyperlink to the photographer's Unsplash profile.

---

### Screen 5 — Search Unsplash: Loading state

**Trigger:** User is typing — input shows `Archite` (mid-type).

**Right panel:**
- Search input shows `Archite|` (cursor blinking) with `×` clear button
- Result area: **skeleton placeholder rectangles** in 2-column masonry layout (4 grey rounded blocks of varying heights) indicating loading
- Bottom: desert/moon preview still visible

---

### Screen 6 — Search Unsplash: "Architecture" results (first batch)

**Difference from Screen 5:**
- Input now shows full `Architecture`
- Results loaded: 4 architectural images visible in 2-col masonry
  - Top-left: angular dark building — `by Anders Jildén`
  - Top-right: museum/modern building — `by Lance Anderson`
  - Bottom-left: blue curved facade
  - Bottom-right: looking-up at building peak
- Each visible image has attribution underneath

---

### Screen 7 — Search Unsplash: Architecture (scrolled / different result set)

**Difference from Screen 6:**
- Results show a different cluster: skyscraper looking up (by `Marc-Olivier Jodoin`), white modern building (no attribution visible, may be below fold), curved white sculptural building (partial)
- None of the result images have a selection ring yet — user is browsing

---

### Screen 8 — Search Unsplash: Image selected from results

**Difference from Screen 7:**
- The white modern building (top-right) now has a **dark selection ring** around it — user clicked to select
- Bottom preview area is **updated** to show this newly selected image (large preview of white building)

---

### Screen 9 — Customize panel closed, new image applied

**Trigger:** User clicked `Done`.

**Result:**
- Right panel is no longer the Customize/Search panel
- Instead, the **right panel is fully occupied by the selected white architectural building image** as the list's wallpaper — no UI controls, just the image as ambient decoration
- Main content (User Interview Prep doc) is unchanged
- The list-customization session is complete; the image is now part of this list's identity

---

### Screen 10 — Inbox view (default)

**Trigger:** User clicked `Inbox` in the sidebar.

**Main column:**
- Title: `Inbox` (large H1)
- Top-right: filter/sort icon button
- First row: `+ New task` ghost row with keyboard shortcut hint `⌃N` (Ctrl+N)
- Task list (each row = checkbox + title + metadata + assignee avatar + subtask icon):
  1. `Watch Welcome Video` — metadata: `🏷️ Tutorial` · `≡ Getting Started`
  2. `Create your first list` — `≡ Getting Started`
  3. `Create your team` — `📅 2 days ago, 9:52 AM` (red, overdue) · `≡ Getting Started`
  4. `Connect your first integration` — `≡ Getting Started`
  5. `Stay connected across all your devices` — `≡ Getting Started`
  6. `Share your feedback with the Superlist team` — `≡ Getting Started`

**Right panel:** desert/moon wallpaper (Inbox doesn't have its own customizable image — uses default).

**Metadata icons reference:**
- `🏷️` = label
- `≡` = source list
- `📅` = due date (red text when overdue)

---

### Screen 11 — Inbox with help banner & expanded Personal section

**Differences from Screen 10:**
- Below the title there's a **dismissible help banner**:
  - Left: open-book icon in a light-purple rounded square
  - Text (purple): `Manage all new and incoming tasks — create, move, schedule, and more`
  - Right: external-link arrow icon + `×` close icon
- Sidebar's `Personal` group is **expanded** (chevron down):
  - `🍎 Groceries`
  - `📚 Reading List`
  - `🎯 Habits`
- User avatar (bottom-left + on tasks) is now a yellow `J` (different account from previous screens)
- All other content identical to Screen 10

**Implication:** First-run / contextual help banners appear at the top of system views. Dismissible. Per-view (Inbox, Today, Tasks each have their own).

---

### Screen 12 — Inbox: Sort menu open

**Trigger:** User clicked the filter/sort icon (top-right of Inbox).

**Result:** Dropdown menu appears anchored to that icon, options listed:
- `● None` (selected, red dot indicator)
- `Creator`
- `Assignee`
- `Alphabetical`
- `Creation date`
- `Due date`
- `Source`
- `List`
- `Label`

Behind/under the menu, the inbox content is unchanged. Menu has soft drop shadow + rounded corners.

---

### Screen 13 — Inbox: Sorted Alphabetically

**Trigger:** User selected `Alphabetical` in the sort menu.

**Differences:**
- The filter/sort icon at top-right is now replaced with a **pill button** showing the active sort: `≡ Alphabetical` (with sort icon)
- Tasks reordered alphabetically:
  1. `Connect your first integration`
  2. `Create your first list`
  3. `Create your team`
  4. `Share your feedback with the Superlist team`
  5. `Stay connected across all your devices`
  6. `Watch Welcome Video`
- Active sort is communicated by replacing the icon with the labeled pill — clicking it again reopens the menu.

---

### Screen 14 — Today view (default, sorted by Due date)

**Trigger:** User clicked `Today` in sidebar.

**Main column:**
- Title: `Today`
- Top-right: pill button `≡ Due date` (Today defaults to sort by due date)
- **Help banner** (purple, dismissible): `See what's due today and review any overdue tasks`
- `+ New task ⌃N` row
- **Grouped sections** (sections are collapsible — each has a chevron):
  - `▾ Overdue` (expanded)
    - `Create your team` · `📅 2 days ago, 9:52 AM` (red) · `≡ Getting Started`
  - `▾ Today` (expanded)
    - `Do groceries` · `📅 Today`

**Right panel:** desert/moon wallpaper.

---

### Screen 15 — Today view: "Today" section collapsed

**Difference from Screen 14:**
- The `Today` section header has chevron pointing right (`▸ Today`) — collapsed; its contents (`Do groceries`) are hidden
- `Overdue` section remains expanded with `Create your team` visible
- All other elements identical

**Implication:** Each group in Today view is independently collapsible. State should persist per-view.

---

### Screen 16 — Tasks view (default: "Tasks for me")

**Trigger:** User clicked `Tasks` in sidebar.

**Main column:**
- Title: `Tasks`
- Top-right: filter icon (not pill — no active sort)
- Help banner (purple, dismissible): `View, sort, and access all of your tasks in one place`
- **Filter tab row** below banner:
  - `🔍` (search icon, leftmost — opens search input)
  - `Tasks for me` (selected — darker pill)
  - `Others`
  - `Upcoming`
  - `Done`
- Task list (no `+ New task` row in Tasks view — this is a read-only aggregate):
  1. `Do groceries` · `📅 Today`
  2. `Action point 3` · `≡ Meeting Notes`
  3. `Action point 2` · `≡ Meeting Notes`
  4. `Subtask 2` · `≡ Action point 1` (subtask, parent shown as source)
  5. `Subtask 1` · `≡ Action point 1`
  6. `Action point 1` · `👁️ 0/2` (subtask progress) · `≡ Meeting Notes` · subtask-list icon
  7. `...` (untitled task) · `≡ This Week`
  8. `Task 5` · `≡ This Week`
  9. `...` (untitled) · `≡ This Week`
  10. `Task 4` · `≡ This Week`
  11. `...` (untitled) · `≡ This Week`
  12. `Task 3` (partially visible — list scrolls)

**Right panel:** purple/orange surreal sphere image (default for Tasks view).

**Notes:**
- Tasks view aggregates **all** tasks across all lists for the user
- Filter tabs: `Tasks for me` (assigned to current user), `Others` (tasks for other people), `Upcoming` (future-dated), `Done` (completed)
- The "..." titled rows represent tasks created without a title yet — they still render and are clickable.

---

### Screen 17 — Tasks view: Search opened (empty)

**Trigger:** User clicked the search icon in the filter tab row.

**Difference from Screen 16:**
- The filter tabs are **replaced** by a search input that expands to fill the row width
- Search input: left has `←` back arrow (returns to tabs), placeholder text `Search...`
- Task list below remains unchanged (no query yet → shows everything)

---

### Screen 18 — Tasks view: Search with query "task"

**Difference from Screen 17:**
- Search input shows typed value `task|` and a `×` clear button on the right
- Task list filters to only rows whose titles match `task`:
  1. `Subtask 2` · `≡ Action point 1`
  2. `Subtask 1` · `≡ Action point 1`
  3. `Task 5` · `≡ This Week`
  4. `Task 4` · `≡ This Week`
  5. `Task 3` · `≡ This Week`
  6. `Task 2` · `≡ This Week`
  7. `Task 1` · `≡ This Week`

Search is substring / fuzzy match on titles. Live-filters as the user types.

---

### Screen 19 — Tasks view: "Tasks for others" filter (empty state)

**Trigger:** User clicked `Tasks for others` (note: copy changes from `Others` to `Tasks for others` when selected — or this is an alternate label).

**Difference:**
- Filter tabs now read: `🔍` `Me` `Tasks for others` (selected) `Upcoming` `Done`
  - Notice: when `Tasks for others` is active, the first tab is renamed to just `Me` (shorter label to make space)
- Task list area shows an **empty state**: three faint hand-drawn squiggle-lines next to empty checkboxes — a playful "nothing to see here" placeholder
- No actual tasks shown

**Implication:** Empty states use illustrative placeholders, not text-only "No tasks found" messages.

---

### Screen 20 — Tasks view: "Upcoming tasks" filter

**Trigger:** User clicked `Upcoming`.

**Difference:**
- Filter tabs: `🔍` `Me` `Others` `Upcoming tasks` (selected — label expands from `Upcoming` to `Upcoming tasks` when active) `Done`
- Task list shows only future-dated tasks:
  1. `Do groceries` · `📅 Today`

**Pattern noted:** Active filter tab labels expand to a fuller phrase:
- `Tasks for me` (always full when default)
- `Others` → `Tasks for others` when active
- `Upcoming` → `Upcoming tasks` when active
- `Done` stays `Done`
- Inactive tabs use the short form to save space.

---

## 3. Component Inventory

### 3.1 Task Row
Every task row has this anatomy (left to right):
- Checkbox (empty circle when incomplete)
- Title text
- (optional) Metadata row below title, comma-separated icons + text:
  - `📅 [date]` — due date (red if overdue)
  - `🏷️ [label]` — tag
  - `≡ [list/parent]` — source list or parent task
  - `👁️ N/M` — subtask progress
- Right side: assignee avatar + subtask-list icon
- Subtask icon (≡-style) on the far right opens the task detail / subtasks panel

### 3.2 Help Banner
- Light purple background, rounded
- Open-book icon in lighter purple square (left)
- Single-line or two-line purple text
- Right side: external-link arrow + `×` dismiss
- One per system view (Inbox, Today, Tasks each have unique copy)

### 3.3 Filter / Sort Control
- Default: icon-only button (top-right)
- Active: pill with icon + active value label
- Click → dropdown menu

### 3.4 Filter Tab Row (Tasks view)
- Pill-style segmented control with search icon at start
- Active tab has darker background
- Active tab label may expand to a more descriptive phrase

### 3.5 Sidebar List Item
- Emoji + label
- Hover: slight background highlight
- Active: filled background + red right-edge bar
- Group headers (Work, Personal): chevron toggle for expand/collapse

### 3.6 Customize Panel
- Replaces the right-side wallpaper area
- Header with title + `Done` button
- Sections: Emoji picker, Image picker (preset grid → Upload → Search Unsplash)
- Live preview of currently selected image fills bottom

### 3.7 Search Unsplash Panel
- Same shell as Customize panel
- Search input with suggestion chips (when empty)
- Masonry result grid with attribution
- Click image → updates preview + sets as selected
- Skeleton loaders while results stream

---

## 4. Information Architecture Summary

```
Superlist Web
│
├── System Views (always in sidebar top)
│   ├── Inbox          → all unsorted/incoming tasks, sortable
│   ├── Today          → tasks due today + overdue, grouped & collapsible
│   ├── Tasks          → aggregate of all tasks, with Me/Others/Upcoming/Done filters + search
│   └── Messages       → (not shown in screens — out of scope here)
│
├── Recent (section, auto-populated by usage)
│
└── Lists (user-owned, grouped)
    ├── [Pinned/active list]              e.g. 🚀 User Interview Prep
    ├── 👋 Getting Started                 (default onboarding list)
    ├── ▾ Work (group)
    │   ├── 🗓️ This Week
    │   └── 📝 Meeting Notes
    └── ▸ Personal (group, collapsed by default)
        ├── 🍎 Groceries
        ├── 📚 Reading List
        └── 🎯 Habits

Each List has:
├── Rich-text document body (headings, paragraphs, bold, links, bullets, numbered lists)
├── Inline tasks (checkboxes embedded in the document)
├── Customizable emoji icon
├── Customizable cover image (presets / upload / Unsplash search)
├── Share button + privacy state
├── Collaborator avatars
├── Star (favorite) toggle
└── Three-dot menu (more actions)
```

---

## 5. Build Notes for Implementation

1. **Stack suggestion:** Next.js + Tailwind for the web app. A rich-text editor like Tiptap or Lexical for the list document (inline tasks require custom block nodes).
2. **Layout:** CSS Grid for the 3-column shell; sidebar fixed width, right panel fixed width, main flexes.
3. **State management:** Per-view state (sort, filters, banner-dismissed, group-collapsed) should persist in localStorage keyed by view.
4. **Backend assumptions:** Tasks are first-class entities with `due_date`, `assignee_id`, `creator_id`, `source` (list id or parent task id), `labels[]`, `subtasks[]`. The Tasks aggregate view queries across all lists the user has access to.
5. **Unsplash integration:** Use the Unsplash API for the search panel; cache thumbnails; respect attribution (display `by [name]` as a link to photographer's Unsplash profile, with utm params per Unsplash guidelines).
6. **Mobile:** **Do not implement.** All narrow-viewport experience is delegated to the separate Flutter app. The web app should explicitly target ≥1280px and may show a "best viewed on desktop" message below that, or simply not be styled for mobile.
7. **Footer:** The black "Superlist / curated by Mobbin" bar in the screenshots is from the Mobbin curation site — **omit it entirely** from the build.

---

## 6. UX Copy Reference (verbatim from screens)

- Sidebar labels: `Inbox`, `Today`, `Tasks`, `Messages`, `Recent`, `Lists`, `Work`, `Personal`, `Getting Started`, `This Week`, `Meeting Notes`, `Groceries`, `Reading List`, `Habits`, `User Interview Prep`
- Top-right list controls: `Share`, `This list is private`
- New task row: `New task` + shortcut hint `⌃N`
- Customize panel: `Customize list`, `Done`, `Emoji`, `Image`, `Upload`, `Search Unsplash`
- Search Unsplash chips: `Paint`, `Nature`, `Architecture`, `Space`, `Color`
- Search Unsplash attribution prefix: `by `
- Inbox banner: `Manage all new and incoming tasks — create, move, schedule, and more`
- Today banner: `See what's due today and review any overdue tasks`
- Tasks banner: `View, sort, and access all of your tasks in one place`
- Today groups: `Overdue`, `Today`
- Tasks filter tabs: `Tasks for me` / `Me`, `Others` / `Tasks for others`, `Upcoming` / `Upcoming tasks`, `Done`
- Tasks search placeholder: `Search...`
- Sort menu options: `None`, `Creator`, `Assignee`, `Alphabetical`, `Creation date`, `Due date`, `Source`, `List`, `Label`
- Overdue date format: `2 days ago, 9:52 AM` (in red)
- Future date examples: `in 2 days, 11 AM`, `Today`
