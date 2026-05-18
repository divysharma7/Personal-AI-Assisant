# Superlist Web — New Use Cases (Part 3)

> **Supplement to `superlist_ia.md` and `superlist_ia_part2.md`.** Read those first. This file documents only features introduced in the third batch of screens.
>
> **Mobile reminder:** desktop ≥1280px only; Flutter app handles narrow.

---

## New Features Introduced

1. **Star-to-sidebar with tooltip** (`Add to sidebar` micro-interaction)
2. **Lists directory — non-pinned state** (no auto "New list" section)
3. **Section/Group management in sidebar** (create, rename, remove via right-click)
4. **Sidebar drag-and-drop** (reorder lists, nest into groups)
5. **Sidebar hover affordances** (`Browse all`, add-list shortcuts, group `+`, collapse toggle)
6. **Sidebar collapsed state** (left column hidden entirely)
7. **Sidebar overlay mode** (peeking when collapsed)
8. **Task descriptions** (tasks can contain full rich-text documents, not just chat)
9. **Account/user menu** (bottom-left avatar popover)
10. **Create team flow** (full-screen "Name your team" view)

---

## 1. Lists directory — `Add to sidebar` tooltip (hover state)

**Trigger:** In the Lists directory, hover over the star icon at the end of any list row.

**State:**
- A small pill tooltip appears directly below the star with the label `Add to sidebar`
- Tooltip has rounded shape, light background, subtle shadow
- Cursor remains a pointer

**Purpose:** Clarifies what the star does for first-time users — confirms that starring pins the list to the sidebar.

---

## 2. Starring action (sidebar update is immediate)

**Trigger:** User clicks the empty star next to `Design Sprint #4` in the Lists directory.

**Immediate results:**
- Star icon fills (becomes solid/yellow)
- **Sidebar updates in real time:** `Design Sprint #4` now appears as a pinned entry directly under the `Lists` header (above `Getting Started`), with the notepad emoji as its icon
- The `Lists 1 new` counter in the sidebar increments / persists (because Design Sprint #4 is still in the recent-additions window)
- The list remains in the directory; its row still shows under the `New list` section but with a filled star

**Pattern:** Starring is the **only way** a list ends up in the sidebar. Unstarring removes it from the sidebar but the list itself isn't deleted — it stays accessible via the directory.

---

## 3. Lists directory — non-pinned / standard state

**Difference from Part 2's spec:**

Previously documented: the directory shows a `New list` auto-section at the top for very-recently-added lists.

**New observation:** once the "newness" window expires (or if there are no recent additions), the `New list` section is **omitted entirely**. The directory then shows a single `Lists` section containing every list in alphabetical order, with `Design Sprint #4` blended into the main inventory (with its creator avatar still shown inline).

**Sidebar counter:** `Lists` header drops the `1 new` suffix when nothing is recent.

**Implication for build:**
- `New list` section is **conditional** — only render if `recent_lists.count > 0` (within the last hour, perhaps).
- The list row layout supports two variants: with creator metadata (recent) and without (settled).

---

## 4. Lists directory — search

(Was already shown in Part 1/2 as `[shown in §8 of part 2 — confirmed here]`.)

**Behavior confirmed:** typing `reading` in the directory search filters to a single result `📚 Reading List`. The `Lists` section header still shows. No "no matches" empty state needed because of the single match — but when there are zero matches, the section is just empty.

---

## 5. Sidebar — Section management

Sections (a.k.a. groups) in the sidebar like `Work` and `Personal` are user-editable. There are three operations available:

### 5.1 Create a new section

**Trigger:** User picks `Create a new section` from a section's right-click menu (see §5.3), or uses some sidebar `+` affordance.

**State change:**
- A new sidebar group appears with placeholder label `New section`
- The label is in **edit mode immediately** (text input cursor inside it, ready to type)
- The new section is positioned just above `Work` in the example shown

### 5.2 Rename section

**Trigger:** User picks `Rename section` from the right-click menu (or double-clicks the section label).

**State:** Same as create — the label enters edit mode in-place. Pressing Enter commits, Escape cancels. The screen shows the section renamed from `New section` → `Chores`.

### 5.3 Right-click context menu on a section

**Trigger:** User right-clicks a section header (e.g. `Getting Started` — though this looks like a top-level list, the menu treats it as a manageable item).

**Menu (anchored to the right of the clicked item):**
- `Create a new section`
- `Rename section`
- `Remove section` (in **red**, indicating destructive)

Standard rounded popover, soft shadow.

### 5.4 Remove section

**Trigger:** `Remove section` clicked.

**Result:** The section disappears from the sidebar. Lists that were inside (if any) appear to be relocated to the top level of `Lists` (in the screen, `Getting Started` is now at top level after the `Chores` removal). **Lists are never deleted as a side effect** — only the group container is removed.

---

## 6. Sidebar drag-and-drop

### 6.1 Reordering and nesting

**Trigger:** User mouse-downs on a sidebar list row and drags.

**Visual feedback:**
- A **floating ghost** of the row follows the cursor (semi-transparent, slightly offset, e.g. `👋 Getting Started`)
- A **teal/aqua horizontal indicator line** appears at the prospective drop position, showing exactly where the item will land
- Indent level of the indicator hints at nesting — if you drag inside a group's bounds (after the group's header), the indicator indents to show "this will become a child of Work"

**Result on drop:**
- Item moves to the indicated position
- If dropped inside a group, the item becomes a member of that group (e.g. `Getting Started` ends up inside `Work` alongside `This Week` and `Meeting Notes`)
- Persists immediately

**Implication for build:** sidebar tree should be a sortable list with drag-handle support; persist per-user order; debounce save.

### 6.2 What can be dragged

- Individual list rows
- Sections themselves can be reordered too (implied — common pattern; not explicitly shown but consistent with the model)
- System views (Inbox/Today/Tasks/Messages) at the top **cannot** be reordered (they're fixed)

---

## 7. Sidebar — Hover affordances & chrome

When the user hovers over the sidebar (or the Lists area), extra controls appear that are normally hidden:

### 7.1 Sidebar collapse toggle
- A small icon at the **top-right of the sidebar** (just inside the sidebar's right edge)
- Icon: two-rectangle / panel-collapse glyph
- Click → sidebar collapses (see §8)

### 7.2 `Browse all` shortcut next to `Lists` header
- The `Lists` section header gains the secondary label `Browse all` to its right (muted text)
- Clicking it navigates to the Lists directory (same as clicking `Lists` itself)

### 7.3 Add icons next to `Lists` header
- Two small icons appear to the right of `Lists Browse all`:
  - One looks like a "list + arrow" — likely **"new list"** shortcut
  - One looks like a "stack + plus" — likely **"new section"** shortcut
- Both icon-only with tooltips on hover (not pictured)

### 7.4 Group-level `+` affordance
- When hovering a group header like `Personal`, a small `+` icon appears at its right edge
- Click → creates a new list inside that group (no extra step — straight into edit mode for the new list's name)

### 7.5 List-level (single list) hover affordances
- Not explicitly shown in these screens, but implied for symmetry (more menu, drag handle on hover).

---

## 8. Sidebar — Collapsed state

**Trigger:** Click the collapse toggle (§7.1) or use a keyboard shortcut.

**Result:**
- Sidebar is **completely hidden** (width collapses to 0 or near-0)
- The main content area expands to fill the freed space (left edge moves all the way to the window edge)
- The right panel (wallpaper or detail) maintains its width on the right
- The Mobbin footer logo still shows on the bottom strip

**Implication:** Power users who want maximum reading width can collapse the sidebar. State should persist across sessions.

---

## 9. Sidebar — Overlay / peek mode

**Trigger:** With the sidebar collapsed, user hovers near the left edge of the window OR clicks an "expand" affordance.

**Result:**
- Sidebar **temporarily overlays** the main content (it appears as a floating panel above the main column, not pushing it)
- Underlying main content is partially visible on the right (slightly dimmed or just overlapped)
- The collapse toggle is visible in the top-right of the floating sidebar
- Moving the cursor away (or clicking the toggle) returns to fully-collapsed

**Use case:** Lets users glance at the sidebar to pick a list without committing to expanding it permanently.

---

## 10. Task descriptions (rich-text body inside tasks)

> **This is a significant correction to what part 2 implied.** The Task Detail panel doesn't just hold subtasks and chat — it holds an entire rich-text document as the task's description.

**Trigger:** User opens the `Create your first list` task from the `Getting Started` list (clicks the task row or its open-icon).

**Right panel content (task description area, between the title and the chat thread):**

A full rich-text document with all the editor primitives:
- Paragraphs with **bold** inline runs (e.g. `Select **New list** — available from the sidebar`)
- Hyperlinks (inline blue underlined): `Check out our SuperTips series on how to use repeating tasks.`, `Learn more about lists in our help center.`
- Inline emojis used as paragraph leaders (🎬, 💡)
- **Hand-drawn SVG underline accents** between paragraphs — yellow-green, teal, and squiggly teal variants. These are **content blocks**, not chrome, and act as decorative section separators inside the description.
- Bulleted lists (e.g. the three uses of Superlist at the bottom)

Below the description: the activity log (`Created by Jane • 7 days ago`) and the message input (`Leave a message...`) as before.

**Implication for build:**
- The task description is **the same rich-text editor** used in list documents — same block types (heading / paragraph / list / checklist / link / image / decorative-divider). Build once, mount in both list documents and task descriptions.
- Decorative dividers (the hand-drawn lines) are a content block type, not styling. They have variants: `subtle-green`, `bold-teal`, `squiggle-teal`, `dotted`, etc. Store as a `divider` block with a `style` enum.
- When a task is opened from a list, the main column shows the parent list with the task row highlighted; the detail panel on the right shows that task's full document + chat. Both panels are independently scrollable.

---

## 11. Account / user menu

**Trigger:** User clicks the avatar at the **bottom-left of the sidebar**.

**Popover anchored above the avatar, expanding upward:**

```
+ New team
⚡ Upgrade to Pro          (highlighted — purple text/accent)
🎁 Invite friends
─────
⚙ Settings
🗄 Integrations
─────
🎧 Get support
📱 Get mobile app
⚡ See what's new
```

The list visually groups in three clusters separated by faint dividers. `Upgrade to Pro` is the only colored item (purple) — clearly the upsell.

**Each item:**
- Small icon on the left
- Plain text label
- Click navigates to the corresponding flow (Settings opens a settings modal/view; Integrations opens an integrations directory; etc.)
- `New team` → opens the Create Team flow (see §12)

---

## 12. Create team flow

**Trigger:** `+ New team` clicked in the account menu.

**Result — full-screen takeover** (main column and right column both transform; sidebar stays visible at left but is essentially backgrounded):

**Main column:**
- Top-left: `Cancel` button (pill)
- Top-right: `Create team` button (pill, **disabled / greyed-out until the name field has text**)
- Center-left: large team avatar placeholder (square with image-placeholder icon, dark grey)
- Beside the avatar: large headline-style input with placeholder `Name your team`
- Rest of column is empty / negative space

**Right column:**
- A new wallpaper image — autumnal desert / red foliage scene with an arch structure (different from the default moon/desert) — likely a randomly-selected onboarding image, or specifically the default for "new team" creation

**Flow:**
1. User clicks the avatar placeholder → opens an image picker (same one used for list customization; emoji + image grid + upload + Unsplash search).
2. User types a name → `Create team` button enables.
3. User clicks `Create team` → team is created, possibly opens member-invite step (not shown), then returns to the app with the new team active.

**Cancel:** Discards everything and returns to the previous view.

---

## 13. New Component Inventory (additions)

### 13.1 Sidebar collapse toggle
- Position: absolute, top-right of sidebar (only shown on hover or always-visible — TBD)
- Icon: panel-collapse glyph
- Action: toggles sidebar between expanded and collapsed states

### 13.2 Section context menu
- Three items: `Create a new section`, `Rename section`, `Remove section` (last is red)
- Trigger: right-click on section header
- Standard popover styling

### 13.3 Sidebar drop indicator
- Teal/aqua horizontal hairline that follows the proposed drop position during a drag
- Indents to indicate nesting depth

### 13.4 Floating drag ghost
- Semi-transparent copy of the dragged row
- Follows cursor, offset slightly down-right

### 13.5 Group hover-add button
- Small `+` icon revealed on group-header hover
- Action: create a new list inside this group, label in edit mode immediately

### 13.6 Sidebar header secondary actions
- Next to `Lists` label: `Browse all` (text link) + two icon buttons (new list / new section)
- Shown on sidebar hover

### 13.7 Account menu
- Popover anchored above the bottom-left avatar
- 9 entries in 3 clusters
- One highlighted item (`Upgrade to Pro`) in purple

### 13.8 "Name your team" full-screen form
- Cancel / Create team header
- Team avatar picker + team name input
- Custom wallpaper in right column

### 13.9 Decorative divider (content block)
- Inline content block inside the rich-text editor
- Styles: subtle-green underline, bold-teal underline, squiggle-teal, etc.
- User can insert via `/` menu (presumed)

---

## 14. Updated IA Tree

```
Superlist Web
│
├── System Views                  (top, fixed order)
│   ├── Inbox
│   ├── Today
│   ├── Tasks
│   └── Messages
│
├── Recent
│
├── Lists  (header acts as both a label AND a nav destination to Lists directory)
│   ├── [pinned/starred lists in top-level]
│   ├── [user-created sections, each containing child lists]
│   │   ├── Section
│   │   │   ├── List
│   │   │   ├── List
│   │   │   └── List
│   │   └── Section
│   └── ...
│
├── [bottom of sidebar]
│   └── Avatar → Account menu
│       ├── + New team        → Create team full-screen flow
│       ├── ⚡ Upgrade to Pro
│       ├── 🎁 Invite friends
│       ├── ⚙ Settings
│       ├── 🗄 Integrations
│       ├── 🎧 Get support
│       ├── 📱 Get mobile app
│       └── ⚡ See what's new
│
└── (right column overlay)
    Task Detail panel
    ├── Header
    ├── Title + metadata
    ├── DESCRIPTION (rich-text doc — same editor as list documents)
    ├── Activity log
    └── Chat thread + input

Sidebar states:
- Expanded (default)
- Collapsed (manual)
- Overlay (collapsed + cursor near left edge → floats over content)
```

---

## 15. Build Notes (additions)

1. **The editor is universal.** Same component renders list documents, task descriptions, and probably any future "page-like" content. Block types include: paragraph, heading-2, heading-3, bullet, numbered, checkbox-task, divider (with style variants), image, link, code (presumed). Build once.

2. **Sidebar persistence.** Persist (per user):
   - Sidebar collapsed/expanded state
   - Group expand/collapse states
   - Custom section names and order
   - Order of lists within each section and at top level
   - Set of starred lists (`user_list_pins`)

3. **Drag-and-drop library.** Use `dnd-kit` (React) or equivalent — supports nested sortable trees with custom drop indicators.

4. **Section "Remove" is non-destructive.** Removing a section moves its children up to the top level of Lists rather than deleting them. Show a brief toast: `Section removed. Lists moved to top level.`

5. **Team creation.** Likely creates a new workspace context. After creation, the sidebar shows the team's lists and the user can switch between teams (a team-switcher control isn't visible in these screens but is presumably accessed via the same avatar menu or a workspace switcher near the top).

6. **Account menu items not yet specified.** `Settings`, `Integrations`, `Get support`, `Get mobile app`, `See what's new` all link to flows / pages that haven't been screenshotted yet. Stub these as routes with placeholder content for now.

7. **`Upgrade to Pro` is the only colored menu item.** Visually privileged for monetization. When clicked, opens a pricing/upgrade modal (out of scope here).

---

## 16. New UX Copy Reference (verbatim from screens)

- Star tooltip: `Add to sidebar`
- Section context menu: `Create a new section` / `Rename section` / `Remove section`
- New section default name: `New section`
- Sidebar secondary action: `Browse all`
- Account menu: `+ New team`, `Upgrade to Pro`, `Invite friends`, `Settings`, `Integrations`, `Get support`, `Get mobile app`, `See what's new`
- Create team header: `Cancel` (left), `Create team` (right, disabled initially)
- Create team input placeholder: `Name your team`
- Getting Started list title: `Getting Started`
- Getting Started description: `With Superlist, you can manage what matters — from daily tasks to project planning with your team — in one place. It gives you the flexibility to organize tasks, notes, images, and attachments however you want. It's not just a list. It's a Superlist.`
- Section header inside list: `✅ Get set up`
- Tip callout format: `💡 To open this task, click on the task row on desktop or swipe left on mobile.`
- Task description hyperlinks: `Check out our SuperTips series on how to use repeating tasks.`, `Learn more about lists in our help center.`
- Help bullets: `Organizing manager 1:1s`, `Tracking monthly marketing tasks`, `Managing weekly leadership priorities`
