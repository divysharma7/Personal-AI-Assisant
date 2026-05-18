# Paste this into a fresh Claude Code session to continue building

---

Continue building LAIF at `/Users/divysharma/Personal Asistant Manager/laif`

## Context

Phase 1 is done — clean rebuild from scratch. The app renders (login page works, 3-column layout works after login). Backend is fully intact (88 files — all API routes, models, hooks, types).

## Read these files first (in this order)

1. `docs/product-revamp/REVISED-PLAN.md` — the CURRENT plan (overrides everything else)
2. `docs/product-revamp/00-overview.md` — overall IA
3. `docs/product-revamp/01-design-system.md` — tokens, typography, copy constants
4. `docs/product-revamp/99-reference.md` — data model, API routes, keyboard shortcuts

Then for each phase, read its doc:
- Phase 2: `docs/product-revamp/03-phase-2-lists-editor.md`
- Phase 3: `docs/product-revamp/04-phase-3-tasks-details.md`
- Phase 4: `docs/product-revamp/05-phase-4-views-migration.md`

## Critical rules

1. ALL components must use `export default function X` (not named exports) — Next.js 14 Server/Client boundary requires this
2. All UI text comes from `src/lib/copy.ts` — never hardcode strings
3. All colors via CSS variables (--bg-canvas, --bg-pane, --text-primary, --accent, etc.) — never hardcode hex in components
4. Backend is untouched — use existing hooks: `useItems()`, `useLists()`, `useTasks()`, `useLabels()`
5. Run `npx next build` after each phase — must compile with zero errors
6. Commit after each phase with descriptive message

## What exists now (Phase 1 output)

```
src/app/globals.css          — 3 theme blocks (Light/Dark/Blackout)
src/app/layout.tsx           — Inter + Source Serif, ThemeProvider > QueryProvider > AppShell
src/app/page.tsx             — Inbox (basic)
src/app/login/page.tsx       — Dark themed login
src/app/signup/page.tsx      — Signup form
src/app/onboarding/page.tsx  — 3-step onboarding
src/app/today/page.tsx       — Today view (basic)
src/app/tasks/page.tsx       — Tasks view (basic)
src/app/messages/page.tsx    — Messages placeholder
src/app/settings/page.tsx    — Settings (basic)
src/components/layout/AppShell.tsx   — 3-column layout
src/components/layout/Sidebar.tsx    — 260px sidebar
src/components/layout/ArtworkPane.tsx — Right artwork pane
src/contexts/ThemeContext.tsx         — 4 themes (will expand to 13)
src/shared/providers/QueryProvider.tsx
src/lib/copy.ts              — UX strings
```

## Build Phase 2 first

Read REVISED-PLAN.md and `03-phase-2-lists-editor.md`. Build:
- List model + ListGroup model + API routes (already exist in src/app/api/lists/)
- useLists hook (already exists in src/hooks/useLists.ts)
- List page at /lists/[id] with TipTap block editor
- 14 block types in slash menu (Task, Sublist, Paragraph, Talk stub, AI stub, H1/H2/H3, Divider, Bullet, Numbered, Blockquote, Image, Attachment)
- Block gutter: drag handle + block-type pill (click to change type)
- List title as editor first node (not separate input)
- Inline formatting toolbar (Bold/Italic/Strike/Link)
- Customize panel (emoji + cover image)
- Share modal
- List overflow menu
- Dismissible info banners (shared component)
- Sticky list header on scroll

Then build Phase 3, then Phase 4. Commit after each.
