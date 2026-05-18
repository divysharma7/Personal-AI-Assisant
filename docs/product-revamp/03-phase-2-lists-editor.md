# Phase 2 — Lists & Block Editor

> **Load with:** `00-overview.md` + `01-design-system.md` + `99-reference.md` + this file.
>
> **Goal:** Lists become real documents. The block editor, share modal, and customize-list panel all land here. Tasks-as-blocks are stubbed but full Task behavior (popovers, detail panel, sub-tasks, completion) is phase 3.
>
> **Effort:** ~7 days.
>
> **Depends on:** phase 1 complete (themes, sidebar, page header).

---

## 1. Routes

- `/lists/[id]` — a single list.
- `/lists/[id]/tasks/[taskId]` — same list with a task detail panel pre-opened (deep-linkable; full task panel comes in phase 3).

A new list is created from the sidebar `+` button — generates an Untitled list with a single empty task block and navigates to it.

---

## 2. List header

Top of the center pane, sticky as the body scrolls.

- **Left:** Share pill button + share-state label inline.
  - Pill label: `copy.share.title` ("Share").
  - When the user becomes a Collaborator, the pill's icon becomes their avatar (small) instead of the share icon.
  - Inline label to the right of the pill (muted, 12px):
    - If `list.isPrivate` → `copy.list.privateLabel` ("This list is private")
    - Else → `copy.list.sharedWithLabel(names)` ("Shared with Tom Lee" or "Shared with 3 people")
- **Right cluster:** three ghost icon buttons (32px each, 8px gap):
  1. **Customize swatch** — a gradient multi-color circle that visually represents the list's current cover. Opens the Customize list panel (§7).
  2. **Favorite star** — filled coral when `pinnedToFavorites`, outline otherwise.
  3. **Overflow** (`⋮`) — opens the list overflow menu (§8).

---

## 3. List title block

- **Title** rendered in the serif at `--text-list` (48px, weight 800). Editable inline (contenteditable). Empty value renders the placeholder `copy.list.untitled` ("Untitled") at muted color, plus a coral text-cursor indicator on the left.
- **Decorative line** beneath the title: a thin (~3px) horizontal line, ~70% width, with a slight squiggle. Color = the list's selected cover/accent color. Hidden until the user has customized the list (selected an emoji or image).
- Pressing Enter on the title focuses the first body block.

---

## 4. Block editor

Use **TipTap** (or another ProseMirror-based editor). Each block is a node in the document. Blocks are draggable via a left-gutter handle that appears on hover/focus.

### 4.1 Block types

| Type | Icon | Empty placeholder | Notes |
|---|---|---|---|
| `task` | coral checkmark | `copy.list.inlineNewTaskPlaceholder` | Full behavior in phase 3 |
| `paragraph` | `¶` | `copy.list.emptyParagraphPlaceholder` | Default for plain text |
| `heading` (level 1/2/3) | `H1` / `H2` / `H3` | "Heading 1" / 2 / 3 | Inter 700 |
| `bullet` | `≡` (bullet icon) | "Bullet list" | Nesting via Tab |
| `numbered` | `1²3` | "Numbered list" | Nesting via Tab |
| `divider` | `—` | (renders a horizontal rule, no placeholder) | Non-editable line |
| `image` | image frame | (renders the image) | See §4.4 |
| `attachment` | paperclip | (renders the file pill) | See §4.5 |
| `tip` | 💡 emoji | "Tip" | Single-line, italic-ish |

Inline marks supported: **bold**, *italic*, ~~strike~~, [link](#).

### 4.2 Block gutter (drag handle + insert handle)

On hover or focus of any block, show on the **left gutter** of the block (in this order, left to right):
- **Drag handle** (`GripVertical`, 16px, muted) — drag to reorder blocks. Drop indicator is a 2px coral line spanning the content column.
- **Block type pip** — a small circular badge showing the block's icon. On a task block it's the coral checkmark; on paragraph it's `¶`; on a numbered list it's `1²3` etc. This is purely decorative but it's what makes the editor feel like Superlist.

On an empty line where the cursor sits (and on click-empty-space at the end of the document), also show a `⊕` button at the left edge — clicking it opens the slash menu anchored to that line.

### 4.3 Slash command menu

Triggered by typing `/` at the start of a block (after deletion of the placeholder) **or** by clicking the gutter `⊕`. Width 240px. Items in this exact order:

```
copy.slashMenu.items = [
  "Task",
  "Paragraph",
  "Heading 1",
  "Heading 2",
  "Heading 3",
  "Divider",
  "Bullet list",
  "Numbered list",
  "Image",
  "Attachment",
]
```

- Arrow keys navigate; Enter inserts the highlighted block at the current position; Esc closes.
- Typing while open filters the list (case-insensitive substring match on labels).
- Default highlight is the **first matching item** (so for an empty `/` it's "Task").

### 4.4 Image block

When inserted (via slash menu or paste-image-from-clipboard):
- Renders the image with rounded corners (12px), full width of the content column.
- **On hover**, a floating toolbar appears at the top-right of the image, three icons in a pill:
  1. **Replace** (`RefreshCw`) — opens file picker; replaces the image in place.
  2. **Download** (`Download`) — downloads the image to the user's disk.
  3. **Delete** (`Trash2`) — removes the block. Tooltip: "Delete".
- Image source can be a pasted/uploaded file (stored to your image bucket) or an Unsplash URL when chosen from the Customize panel's Unsplash search.

### 4.5 Attachment block

A horizontal pill, full width of the content column, padded:
- Left: generic file icon (or specific mime icon if known).
- Center-left: filename (single line, truncate with ellipsis).
- Center-right (muted, 12px): file size + bullet + uppercase format. Example: `71 KB • CSV`.
- Click the pill: download the file.
- Right side (on hover): trash icon to delete the block.

### 4.6 Tip block

Single-line block, prefixed with the 💡 emoji, slight italic, muted text. Used for inline help. Insert from slash menu only.

---

## 5. Inline formatting (selection toolbar)

Floats just below any text selection inside a paragraph, heading, list, or task title. Compact horizontal pill, ~150px wide, four icon buttons:

1. **Link** (`Link2`) — opens the Link sub-popover (§5.1).
2. **Bold** (`Bold`)
3. **Italic** (`Italic`)
4. **Strikethrough** (`Strikethrough`)

Active marks show a darker `--bg-hover` background on the button. Toolbar dismisses on outside-click, scroll, or when the selection collapses.

### 5.1 Link sub-popover

Two-step flow inside the same floating pill (replaces the toolbar):

**Step 1 — empty:**
- Left: back arrow (`ChevronLeft`) — returns to the formatting toolbar.
- Center: text input with placeholder `copy.popovers.link.placeholder` ("Enter a URL").
- Right: `copy.popovers.link.done` ("Done") button, primary when input is non-empty.

**Step 2 — typing:**
- Same layout but the input shows the typed URL.
- An `×` clear button appears inside the input.
- Pressing Enter or clicking Done applies the link to the selected text.

After applying, the selected text becomes a blue (`--info`) underlined link. Clicking a link opens it in a new tab; cmd/ctrl-click does the same; clicking inside the link text re-opens the toolbar with the Link button active.

---

## 6. Share modal

Triggered by clicking the **Share** pill in the list header. Modal centered, ~480px wide, `--bg-pane-2` fill, 16px radius, 24px padding. Click outside or `Esc` closes.

### Layout (top to bottom)

1. **Search/invite row**
   - Search input with `Search` icon and placeholder `copy.share.searchPlaceholder` ("Search people, teams, or emails"). Full width minus button.
   - Right-aligned button: `copy.share.inviteCta` ("Invite"). Disabled until a user is selected or a valid email is typed.

2. **Collaborator rows** — one per user with access. Each row:
   - 32px avatar (or initial badge if no photo) + display name (15px) + role label below (12px muted).
   - Roles: `copy.share.roles.creator` ("Creator", the list owner — non-removable, no remove button), `copy.share.roles.collaborator` ("Collaborator").
   - On hover, collaborators get a right-aligned `copy.share.removeCta` ("Remove") button (ghost). Click removes their access immediately, with an undo toast.

3. **Footer row**
   - Left: an account-context dropdown showing `copy.share.accountContext` ("Personal") with a chevron — for users with multiple workspace/team contexts. v1: render as static label only, not a real picker.
   - Right: `copy.share.copyLinkCta` ("Copy link") button with `Link2` icon. On click → copies the deep link to clipboard AND the button text/icon swap to `copy.share.copiedConfirmation` ("Copied") with a check icon for ~1.5s before reverting.

### Search behavior

- Typing filters existing org/team members (autocomplete).
- If the query looks like an email and doesn't match anyone, show a single result row `[email] / Pending` — clicking it sends an invite email. The user appears as a Collaborator row with the "Pending" badge until they accept.

### Share confirmation toast

When a user is added (search → result click → automatically invited, OR Invite button), surface a bottom-left toast:

`copy.share.toastShared(listTitle, name)` → e.g. **"User Interview Prep has been shared with Tom Lee"**

Toast auto-dismisses in 5s.

---

## 7. Customize list panel

Replaces the artwork right-pane when triggered. Width 420px. Closed via "Done" button (top-right of the panel).

### Trigger

Clicking the gradient multi-color circle in the list header opens this panel.

### Layout

**Top bar:** title `copy.customizeList.title` ("Customize list") left, `copy.customizeList.doneCta` ("Done") button right (primary).

**Section: Emoji** (`copy.customizeList.sectionEmoji`)
- Horizontal row of 5 preset emoji buttons in 40px circular tiles: 📝 🚀 📝 🎉 🛒 (these match the Superlist defaults — keep this exact set).
- Plus a 6th `+` tile that opens the system emoji picker for a custom choice.
- Selecting an emoji updates: the list's `icon` field, the sidebar entry's leading emoji, and the title block (no emoji is shown next to the title in the page — the emoji only appears in the sidebar and as an avatar of the list).

**Section: Image** (`copy.customizeList.sectionImage`)
- A grid of preset cover thumbnails (4 columns × 3-4 rows of 80×80 rounded squares). Ship ~12 curated landscape/abstract images as static assets.
- Selected thumbnail shows a 2px coral ring.
- Below the grid, two action buttons (full-width, side-by-side):
  - `copy.customizeList.uploadCta` ("Upload") with image icon — opens file picker.
  - `copy.customizeList.searchUnsplashCta` ("Search Unsplash") — opens a sub-view inside this panel with a search input and a results grid using the Unsplash API.

**Preview area** at the bottom of the panel: a large preview of the currently-selected cover image. When the user selects a new image, this updates immediately.

### Effects

Selecting an emoji or image updates:
- `list.icon` (emoji) or `list.coverImageUrl`.
- The sidebar entry — emoji shows in the prefix slot.
- The list-header gradient swatch button — its colors derive from the selected cover (dominant colors) so the button continues to represent the list.
- The decorative line under the list title — its hue updates.

---

## 8. List overflow menu

Triggered by the `⋮` button in the list header. Three items:

1. `copy.list.overflowMenu.hideCompleted` ("Hide completed tasks") — toggles list-scoped preference. When ON, completed task blocks are hidden from the body; the menu item label flips to `copy.list.overflowMenu.showCompleted` ("Show completed tasks").
2. `copy.list.overflowMenu.markAllIncomplete` ("Mark all incomplete") — unchecks every completed task in the list. Undoable via toast.
3. `copy.list.overflowMenu.deleteList` ("Delete list") — destructive, rendered in `--accent` (red). No confirm dialog; soft-deletes with an undo toast (10s grace).

The Inbox List does NOT show "Delete list" (Inbox can't be deleted).

---

## 9. List data model (slice)

Full model in `99-reference.md`. The phase 2 slice:

```ts
type List = {
  id: string;
  type: ListType;            // see 99-reference
  title: string;             // editable
  icon?: string;              // emoji
  coverImageUrl?: string;     // selected cover
  groupId?: string;           // for sidebar nesting
  ownerId: string;
  isPrivate: boolean;         // false when ≥1 collaborator
  collaborators: { userId: string; role: "creator" | "collaborator"; pending?: boolean }[];
  pinnedToFavorites?: boolean;
  hideCompletedTasks?: boolean;
  blocks: Block[];            // editor document
  createdAt: Date;
};
```

`Block` types: see `99-reference.md §2`.

---

## 10. Mutations (phase 2)

```
POST   /api/lists                              create
GET    /api/lists/:id                          read
PATCH  /api/lists/:id                          update title/icon/coverImageUrl/pinnedToFavorites/hideCompletedTasks
DELETE /api/lists/:id                          soft delete
PATCH  /api/lists/:id/blocks                   replace block document (Tiptap JSON)

POST   /api/lists/:id/collaborators            invite (body: email or userId, role)
DELETE /api/lists/:id/collaborators/:userId    remove
POST   /api/lists/:id/share-link               generate/rotate share link
GET    /api/lists/:id/share-link               read current link
```

All mutations follow the existing LAIF pattern: optimistic update → API → TanStack Query invalidation.

---

## 11. Acceptance criteria for phase 2

1. Clicking `+` in the sidebar Lists section creates an Untitled list and navigates to it. The title is empty with the placeholder and cursor focused.
2. Typing in the title saves on blur; the sidebar entry updates live as the user types.
3. The slash menu opens on `/` with the exact 10 items in the exact order from `copy.slashMenu.items`. Arrow keys + Enter + Esc all work.
4. Each block type renders per §4.1. Headings use Inter 700, paragraphs use Inter 400. Bullet and numbered lists indent on Tab.
5. The block gutter shows a drag handle + type pip on hover; dragging reorders blocks; the empty-line `⊕` opens the slash menu.
6. Selecting text in any block reveals the selection toolbar with exactly 4 actions: Link / Bold / Italic / Strikethrough.
7. The Link action opens a 2-step inline popover with `ChevronLeft` back arrow + "Enter a URL" input + "Done" button. Pressing Enter applies; the selection becomes a blue underlined link.
8. Image blocks show a hover toolbar at top-right with Replace / Download / Delete (with "Delete" tooltip on the trash). All three actions work.
9. Attachment blocks render as horizontal pills with filename + size + format; clicking downloads.
10. The list header Share pill opens the Share modal with the exact layout from §6.
11. Searching "tom" in the modal returns matching org members; typing an email shows a "Pending" invite row.
12. Selecting a user adds them as Collaborator with the "Collaborator" role label; a bottom-left toast shows `"[ListTitle] has been shared with [Name]"`.
13. Hovering a collaborator row reveals the "Remove" button; clicking removes them.
14. The "Copy link" button copies a deep link to the clipboard and shows "✓ Copied" for ~1.5s.
15. Clicking the gradient swatch in the list header opens the Customize list panel in the right pane, replacing the artwork.
16. Selecting an emoji updates the sidebar entry's emoji immediately; selecting a cover image updates the title-line color and the swatch button.
17. The list overflow `⋮` menu shows exactly 3 items: Hide completed tasks / Mark all incomplete / Delete list. "Delete list" is coral red and soft-deletes with a 10s undo toast.
18. "Hide completed tasks" toggles the menu label between Hide/Show and persists per list.
19. The Inbox list does NOT show "Delete list" in its overflow.
20. All editor state persists across reload (block document round-trips through `/api/lists/:id/blocks`).

---

**End of phase 2.** Next: `04-phase-3-tasks-details.md` for the full task block, popovers, detail panel, sub-tasks, and nested panels.
