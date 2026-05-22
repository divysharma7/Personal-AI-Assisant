# LAIF — Project Conventions

## Tech Stack
- Next.js 14 (App Router), React 18, TypeScript (strict mode)
- MongoDB + Mongoose (data), TanStack Query v5 (server state), Zustand v5 (client state)
- framer-motion (animation), Tailwind CSS + CSS variables (styling)
- Tiptap (rich text editor), @dnd-kit (drag & drop)
- date-fns, chrono-node (NLP), jose (JWT), rrule (recurrence)
- Zod v4 (validation), web-push + firebase-admin (notifications)
- Vitest (unit tests), Playwright (e2e)

## Directory Structure
- `src/app/` — Pages + API routes (Next.js App Router)
- `src/components/` — UI by domain (calendar/, tasks/, layout/, habits/, focus/, chat/, lists/, editor/, matrix/, popovers/, shared/)
- `src/hooks/` — TanStack Query data hooks (useTasks, useHabits, useLists, etc.)
- `src/stores/` — Zustand stores (calendarStore, settingsStore, undoStore)
- `src/lib/` — Utilities, Mongoose models (lib/models/), services (lib/services/)
- `src/lib/copy.ts` — All UI copy strings (single source of truth)
- `src/lib/motion.ts` — All animation tokens + variants (single source of truth)
- `src/lib/validation.ts` — Zod schemas for API input validation
- `src/lib/apiHelpers.ts` — Shared API error response helpers
- `src/contexts/` — React contexts (ThemeContext, FocusContext)
- `src/types/` — Shared types

## Conventions
- File naming: camelCase for utilities, PascalCase for components
- All UI copy → `src/lib/copy.ts`
- All animation tokens → `src/lib/motion.ts`
- API routes: `src/app/api/[resource]/route.ts`
- Hooks: `use[Name]` pattern, TanStack Query keys as const arrays
- Stores: `use[Name]Store` exports from `src/stores/`
- Components: `'use client'` only when hooks/state are used
- Path alias: `@/*` maps to `./src/*`
- API validation: use Zod schemas from `src/lib/validation.ts` + `parseBody` helper
- API errors: use helpers from `src/lib/apiHelpers.ts` (apiError, api404, api500)

## Do NOT
- Add inline animation values (use motion.ts tokens)
- Add inline UI strings (use copy.ts)
- Use `console.log` in production code (use console.error for errors only)
- Use `as any` — type properly
- Create files over 500 lines
- Skip tests for new utilities/stores
- Modify test files, calendar view components, hooks, or stores during sweeps
