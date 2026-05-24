# LAIF — Project State (captured May 24, 2026)

Written at the end of a massive build session (~30K lines changed, ~50 parallel agents, 2 days).
This document has a 24-hour half-life. Read it before doing anything else.

---

## What Works

### Core Pages (all load, HTTP 200)
- **Inbox** (`/`) — task creation, completion toggle, badge count. Centered 720px layout.
- **Today** (`/today`) — grouped by time, task creation, completion.
- **Tasks** (`/tasks`) — list view only (Board/Matrix moved to separate routes, then replaced by Workflows).
- **Calendar** (`/calendar`) — 7 views (Day, 3-Day, Week, Month, Year heatmap, Agenda). Drag-to-create partially working. View switching via dropdown.
- **Habits** (`/habits`) — split-view (list + detail), calendar heatmap, streak stats, create dialog.
- **Focus** (`/focus`) — Pomodoro timer with scenes/sounds.
- **Settings** (`/settings`) — Profile (activity heatmap), Features (theme/sounds), Integrations (Alexa/Google/MCP).
- **Chat** (`/chat`) — AI assistant with 14 tools, OpenRouter (Qwen 3.7 Max), persistent sessions in MongoDB.
- **Workflows** (`/workflows/[id]`) — Kanban boards with custom columns, drag-and-drop.

### Backend
- 79 API routes, all with try/catch + handleApiError
- MongoDB (Atlas) via Mongoose
- Auth: dev-mode fallback to hardcoded userId (no real auth in production)
- MCP server: 7 tools, toggleable in Settings
- Alexa endpoint: 12 intents built, NOT tested end-to-end (ngrok issues)
- Chat sessions: persistent in MongoDB with history panel

### Tests
- 313 Vitest unit tests (19 files) — all passing
- 43 Playwright E2E scenarios (8 files) — not run against live server
- 0 TypeScript errors

---

## What's Broken

### Navigation / Hydration
- **AnimatePresence was removed from AppShell** — this fixed the webpack crash but now there are NO page transition animations
- Some pages may still have hydration mismatches from `new Date()` in render (we fixed 10 components but there are 30+ total)
- `useSearchParams` was completely removed to fix webpack — Smart Lists URL-based filtering is gone

### Calendar
- Click-to-create on time slots: `laif:slot-click` event is dispatched but QuickAddPopover may not open reliably
- Calendar view dropdown may not close properly on selection
- Hidden hours drag handle: built but not visually tested
- Resize handle (↕ icon): built but interaction may be buggy

### Alexa
- Backend works (tested via curl), but can't connect from Alexa Console
- Ngrok free tier is unreliable for webhooks
- Need real deployment (Vercel) to test properly

### Workflow Task Creation
- "+" button creates tasks with title "New task" — should prompt for title
- Tasks created from workflow board don't appear in Inbox (by design — filtered by workflowId)
- But this means Inbox count (40 in sidebar) includes tasks from ALL sources

---

## What's Half-Built / Dead Code

### Labels System (REMOVED from UI, still in DB)
- `useLabels.ts` hook — still exists, imported by `LabelPopover.tsx`
- `/api/labels/` routes — still exist
- `labelIds` field on Task model — still in schema
- `LabelsTab.tsx` — still exists as a file (removed from Settings tabs)
- `LabelPopover.tsx` — still exists
- **Decision**: Labels were replaced by Workflows as the categorization layer. A workflow IS a category. Tasks belong via `workflowId`, not `labelIds`.

### Lists System (PARTIALLY REMOVED)
- `useLists.ts` hook — still exists, still used by some components
- `/api/lists/` routes — still exist
- `listId` field on Task model — still in schema
- `/lists/[id]/page.tsx` — page still exists and works
- `List.ts` model — still exists
- Sidebar "Favorites" section — REMOVED, replaced by "Workflows"
- **Decision**: Lists were the original grouping. Workflows replaced them for board views. But `/lists` page still works as a simple list directory. `listId` is still set on tasks created from list pages.

### Smart Lists (REMOVED)
- Entire section removed from sidebar
- `useSearchParams` removed to fix webpack crash
- URL-based filtering (`/today?filter=tomorrow`) — removed
- Smart count computation — simplified to just inbox/today counts
- **Why removed**: `useSearchParams` in Sidebar (a layout-level component) caused Next.js prerendering to fail, corrupting webpack chunk manifest on EVERY route.

### Old Calendar Components
- `ThreeDayView.tsx`, `MultiWeekView.tsx` — built during Chronos port, may or may not be wired up
- `ArrangeTasksPanel.tsx` — exists but may not be functional
- `BatchActionBar.tsx` — exists, wired into calendar page
- `SplitView.tsx` — exists but route was deleted (`/tasks/board`)

### KanbanByTime / KanbanBySection (DELETED)
- These were the old board view modes before Workflows replaced them
- Files deleted: `BoardHeader.tsx`, `KanbanByTime.tsx`, `KanbanBySection.tsx`, `MatrixHeader.tsx`, `MatrixQuadrant.tsx`
- `KanbanBoard.tsx`, `KanbanColumn.tsx`, `SortableTaskCard.tsx` — KEPT (used by Workflows)

### StatusBadge Component
- `src/components/shared/StatusBadge.tsx` — built as a design-system component but then replaced with inline code in TaskDetailPanel
- Still imported by `TaskRow.tsx` for compact mode
- May be over-engineered for current needs

---

## Architecture Decisions Made (and why)

### Labels → Workflows
- **Before**: Tasks had `labelIds[]`, workflows had `labelIds[]`, tasks flowed into workflows via label intersection
- **Problem**: Required creating labels first. Empty `labelIds` = invisible tasks. Extra indirection.
- **After**: Tasks have `workflowId` directly. A workflow IS the category. No labels needed.
- **Confidence**: HIGH — this is simpler and matches the user's mental model.

### Lists → Workflows (in sidebar)
- **Before**: Sidebar had "Favorites" section showing pinned Lists
- **After**: Sidebar has "Workflows" section showing user-created workflow boards
- **But**: Lists still exist as a concept, `/lists` page works, `listId` on tasks works
- **Confidence**: MEDIUM — unclear if Lists should be fully removed or coexist with Workflows.

### AnimatePresence removal from AppShell
- **Before**: `<AnimatePresence key={pathname}>` wrapped `{children}` — fancy page transitions
- **Problem**: Every route change DESTROYED the entire React tree (unmount old + mount new), causing webpack chunk errors, React Query teardown races, and hydration crashes
- **After**: Plain `<div>` wrapper, no transitions
- **Confidence**: HIGH — the framework should handle routing, not framer-motion.

### useSearchParams removal
- **Before**: Sidebar used `useSearchParams()` to derive active smart filter from URL
- **Problem**: Next.js 14 requires Suspense boundary for `useSearchParams`. Even with Suspense, prerendering failed and corrupted webpack.
- **After**: Removed entirely. Smart Lists section also removed.
- **Confidence**: MEDIUM — Smart Lists were useful. Could bring back with `window.location.search` parsing (which we started but then removed the whole section).

### Single-user assumptions
- No real auth — dev fallback to hardcoded `DEV_USER_ID`
- Assignee/avatar removed from TaskRow and TaskDetailPanel
- No multi-user data isolation in production
- **Risk**: If this app ever needs multi-user, every query needs userId scoping (we added it to most routes but not all).

---

## Database Schema Concerns

### Task Model (~50+ fields)
The Task model is a god object. It handles:
- Regular tasks (title, status, priority, dueDate)
- Scheduled events (scheduledStart, scheduledEnd)
- Habits (isHabit, habitGoalType, habitFrequency, completions[], streaks)
- Subtasks (parentId, depth, path, order)
- Workflow items (workflowId, sectionId, kanbanOrder)
- Calendar sync (googleEventId, calendarSynced)
- Activities log (activities[])
- Reminders (reminders[])
- Comments (comments[])

**Concern**: Habits-as-tasks is an elegant unification but makes queries complex (`isHabit: { $ne: true }` everywhere). The schema has fields for 5 different features on one document.

### Fields that may be redundant
- `listId` vs `workflowId` — both exist, unclear which should be used
- `createdBy` vs `userId` — chat route sets both, API route sets only `userId`
- `labelIds` — UI removed but field still in schema
- `type` field (default 'task') — never used for filtering
- `umbrellas` — legacy, never used
- `color` field — defaults to `#34d399`, rarely changed

### Missing indexes
- `workflowId` — has index (we added it)
- `userId` — has index (we added it)
- `sectionId` — NO index (used in workflow column queries)
- `scheduledStart` — NO dedicated index (calendar queries filter by this)

### ChatSession Model
- Simple, clean: `userId`, `title`, `messages[]` inline, timestamps
- Messages inline is correct for MongoDB (always read together)
- No concerns.

### Workflow Model
- Clean: `name`, `icon`, `color`, `ownerId`, `templateType`, `columns[]` inline
- `labelIds` field — still in schema but no longer used (we switched to `workflowId` on tasks)
- Should remove `labelIds` from Workflow model.

---

## What I'm Unsure About

1. **Should Lists coexist with Workflows?** Lists are a flat grouping, Workflows are a board view with columns. The user might want both, or one might be redundant.

2. **Is the habits-as-tasks pattern correct?** It works but adds complexity to every task query. A separate Habit model would be cleaner but means duplicating task-like CRUD.

3. **What's the right auth story?** Currently no real auth. NextAuth was in the original roadmap but never built. Cookie-based simple auth was added for dev but it's not production-ready.

4. **Should we keep the Chronos-ported components?** Many calendar components were ported from the standalone Chronos project. Some work well, others may have integration issues. Haven't tested all of them.

5. **Is the 313 test count meaningful?** Tests exist for utilities, stores, and validation schemas. But there are ZERO integration tests that hit real API routes with real MongoDB. The tests mock everything.

---

## Commit History (this session)

```
0a6e026 feat: Alexa Skill backend
76370c0 fix: update Alexa invocation name
3719f04 fix: integrations — keep only Alexa, Google Calendar, MCP
d12f264 fix: separate workflow name from status
281e423 fix: status chip matches priority chip design
40f7821 feat: StatusBadge design system component
80d1789 refactor: remove profile avatar, show workflow status
01ac2c3 refactor: remove Labels UI, add workflow status
b072c91 feat: persistent chat sessions with history panel
7c5885a fix: workflows use workflowId instead of label intersection
98db9bb remove: Smart Lists section from sidebar
9766823 fix: remove AnimatePresence — root cause of webpack crashes
1410d3b fix: remove useSearchParams — fixes webpack crash for real
dbab0cf fix: revert serverExternalPackages for Next.js 14.2
c3d2853 fix: Next.js deep audit — hydration, API error handling, bundling
9a03758 fix: add forwardRef to TaskRow
194752e fix: 17 micro-interaction bugs from QA test
96162b4 fix: wrap AppShell in Suspense
dcca148 refactor: shared AI utility + fix OpenRouter model
cc5ddbd test: comprehensive task creation tests (313 total)
27fd5f1 fix: set userId on task creation
a1f36ef fix: extract MCP_TOOLS to shared module
042d590 fix: add userId field to Task schema
25a3807 fix: click-path audit bugs + typed error handling
ce4251f test: TDD regression tests + Playwright E2E
da3ffc6 docs: skill audit roadmap
0a24ed2 feat: AI chat rebuild, MCP server, cleanup
5befdc4 fix: design audit — polish, a11y, motion tokens
9f0d7c3 feat: Chronos calendar, Workflows, Kanban, Habits overhaul
```

---

## Next Session: Foundation Audit

Before starting, answer: **Is anyone using this app in production?**
- If YES → audit is surgical: fix only what breaks users, don't refactor schema
- If NO → audit can be deeper: clean the schema, remove dead code, proper auth

### Audit checklist (when ready)
1. Document the ACTUAL data model (not what we think it is — query MongoDB and list real fields)
2. Remove dead schema fields (umbrellas, type, redundant labelIds on Workflow)
3. Add missing indexes (sectionId, scheduledStart)
4. Decide: Lists vs Workflows (keep both or kill one)
5. Decide: habits-as-tasks vs separate model
6. Fix `createdBy` vs `userId` inconsistency
7. Clean dead component files
8. Real auth (even simple JWT — not hardcoded userId)
9. Deploy to Vercel (unblocks Alexa, gives stable URL)
10. Run the full 43 Playwright tests against live app
