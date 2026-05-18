# LAIF — Revised Build Plan (Post-Audit)

> Updated after hands-on Superlist audit. This overrides earlier phase docs where they conflict.

---

## Scope Decisions (final)

1. **Themes:** Ship all 13 from the live app (System, Light, Dark, Blackout, Ocean, Berry, Forest, Sunset, Blossom, Blue & White, Black & Yellow, Blue & Red, Red & White) with 3-dot color preview per option
2. **AI/Voice:** Keep voice-to-task. Add "Make with AI" and "Talk" as disabled/coming-soon slots in slash menu. Add Sounds toggle in Settings (non-functional v1).
3. **Updates replaces Messages:** Top-level sidebar item is "Updates" with 4 sub-tabs (All / Tasks / Messages / Lists), not a standalone Messages page
4. **Meetings:** Add Meetings section in sidebar + "New meeting note" in quick-add menu. Meeting notes are a list type.
5. **Settings:** 7 tabs (Profile, Features, Subscriptions, Integrations, Notifications, Labels, Collaborators). Features includes theme picker + sounds toggle + Talk language + Meeting notes toggle.
6. **Artwork per context:** Not daily rotation — each list/view gets its own artwork. Task detail replaces artwork (not overlays).

---

## Revised Sidebar Structure

```
[Top — system views]
📥 Inbox          [badge]
📅 Today          [badge]
✅ Tasks
🔔 Updates                  ← was "Messages"

[Favorites]                  ← starred lists pinned here
👋 Getting Started

[Meetings]                   ← NEW section
📅 Meeting: May 17

[Lists    Browse all  + ⊕]
  ⌄ Work
     📅 This Week
     📝 Meeting Notes
  › Personal

[Sticky footer]
[+ FAB]  ────────  [Avatar]

+ FAB menu:
  New task       ⌃N
  New list       ⇧⌘N
  Talk mode      ⌃T          ← disabled v1
  New meeting    ⇧⌘M
```

---

## Revised Block Editor (14 types)

| # | Type | Slash label | Notes |
|---|---|---|---|
| 1 | Task | Task | Checkbox + title + metadata |
| 2 | Sublist | Sublist | Nested list-within-a-list (affects schema) |
| 3 | Paragraph | Paragraph | Default text block |
| 4 | Talk | Talk | Voice block — disabled/coming-soon v1 |
| 5 | Make with AI | Make with AI | AI generation — disabled/coming-soon v1 |
| 6 | Heading 1 | Heading 1 | Inter 700, 28px |
| 7 | Heading 2 | Heading 2 | Inter 700, 22px |
| 8 | Heading 3 | Heading 3 | Inter 700, 18px |
| 9 | Divider | Divider | Horizontal rule |
| 10 | Bullet list | Bullet list | Nestable via Tab |
| 11 | Numbered list | Numbered list | Nestable via Tab |
| 12 | Blockquote | Blockquote | Indented, left border |
| 13 | Image | Image | Upload/Unsplash, hover toolbar |
| 14 | Attachment | Attachment | File pill with size + format |

Block gutter: drag handle + **block-type pill** (click to change type).
List title is part of the editor document (first node), not a separate input.

---

## Revised Phase Plan

### Phase 2 — Lists & Block Editor (~8 days)

Everything from original Phase 2 PLUS:
- **14 block types** (add Sublist, Blockquote, Talk stub, AI stub)
- **Block-type pill** on hover (left gutter, click to change type)
- **List title as editor first node** (not separate input field)
- **Dismissible info banners** as a shared component (used on Inbox, Today, Tasks, Lists, Updates)
- **Sublist block** — nested list-within-a-list, affects List schema (blocks can contain blocks)
- **Sticky list header** — compact title on scroll
- **Artwork per list** — each list stores its own artwork URL, right pane shows that list's image

### Phase 3 — Tasks & Detail Panels (~6 days)

Everything from original Phase 3 PLUS:
- **Tasks page header:** sort chip ("Creation date"), "+ New task" button, **4 sub-tabs** (Tasks for me / Others / Upcoming / Done)
- **Task row hover:** left = drag handle + type pill, right = assignee avatar + arrow button
- **Detail panel replaces artwork** (not overlays) — clear distinction
- **Inline link styling** in editor — distinct underlined style

### Phase 4 — Views, Settings & Polish (~5 days)

Expanded from original 3 days:

**Views:**
- **Updates page** with 4 sub-tabs (All / Tasks / Messages / Lists) — replaces old Messages page
- **Lists directory** with filter chips (All / Shared / Private / Meetings), sort chip, two creation buttons (+ List, + Meeting note), star toggle, hint banner
- **Meetings section** in sidebar + meeting note creation
- **+ Quick-add FAB** in sidebar footer: New task (^N), New list (shift+cmd+N), Talk mode (^T, disabled), New meeting (shift+cmd+M)

**Settings (7 tabs):**
1. Profile — avatar, name, email, delete account
2. Features — 13-theme picker with 3-dot color previews, sounds toggle, Talk language dropdown (disabled), Meeting notes toggle
3. Subscriptions — plan card + upgrade CTA
4. Integrations — 4 free + 4 pro cards
5. Notifications — stub
6. Labels — label management
7. Collaborators — stub

**Polish:**
- All 13 themes with CSS variables
- Artwork per context (not daily rotation)
- Empty states for every view
- Desktop-only notice for <1024px

---

## Execution Order

```
Phase 2 (Lists + Editor):     ~8 days  ← START HERE (next session)
Phase 3 (Tasks + Details):    ~6 days
Phase 4 (Views + Settings):   ~5 days
                              ─────────
Total remaining:              ~19 days
```

---

## What's Done (Phase 1)

- Clean rebuild from scratch (17 frontend files)
- 3-column AppShell layout
- Sidebar with primary nav
- Login/Signup/Onboarding pages
- Inbox/Today/Tasks/Messages pages (basic)
- Settings page (basic)
- copy.ts with UX strings
- ThemeContext (4 themes — will expand to 13 in Phase 4)
- ArtworkPane
- All backend preserved (88 files)
