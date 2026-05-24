# LAIF — Deferred Work Items

> Created 2026-05-24 during foundation audit. These are real work items that need their own sessions.

## 1. Legacy Habit model migration
**Scope**: ~1 day
**What**: Migrate data from legacy `Habit` collection into unified `Task` model with `isHabit: true`. Update `/api/habits` CRUD routes to use `TaskModel`. Update `useHabits` hook to match new shape. Delete `src/lib/models/Habit.ts` after migration.
**Why**: Two habit systems coexist — legacy (simple completions[] array) and new (Task-based with check-ins, streaks, frequencies). The legacy system powers the dashboard, the new system powers AI chat + check-in flow. They need to be one system.
**Risk**: Data loss if migration script is wrong. Write migration with dry-run first.

## 2. AI chat tool function tests
**Scope**: ~half day
**What**: Add Vitest unit tests for all 14 tool functions in `src/app/api/chat/route.ts`: `toolFetchData`, `toolCheckAvailability`, `toolAddEvent`, `toolAddTask`, `toolAddReminder`, `toolUpdateTask`, `toolAddMemory`, `toolLookupContact`, `toolListWorkflows`, `toolCreateWorkflow`, `toolMoveTaskToWorkflow`, `toolGetCalendarSummary`, `toolGetHabitStats`, `toolPostponeTasks`.
**Why**: These functions have mutation side effects (create/update/delete documents) and are currently untested. A bad AI response could corrupt data.

## 3. API route consistency audit — DONE
**Status**: Completed 2026-05-24. See `docs/API_AUDIT.md`.
**Remaining**: 5 missing-auth routes and 10 P0-3 UPDATE routes to fix (tomorrow's session).

## 4. Notification pipeline implementation
**Scope**: ~1 day
**What**: Replace stub `src/lib/posthook.ts` with real PostHook API calls. Configure Firebase credentials properly in `src/lib/firebase-admin.ts`. Verify end-to-end: create event with reminder → PostHook schedules webhook → `posthook_listener` fires → FCM + Web Push delivered.
**Why**: Entire notification pipeline is no-ops. Users set reminders that never fire.

## 5. Production auth verification
**Scope**: ~30 minutes
**What**: Run `NODE_ENV=production npm run dev`, attempt login with real credentials, verify JWT cookie is set and auth works without the `DEV_USER_ID` fallback. Gate before Vercel deploy.
**Why**: Dev mode bypasses auth via hardcoded user ID. Tests passing in dev doesn't prove auth works in production.

## 6. Zod validation for 45 write routes
**Scope**: ~2 days, broken into one entity per session
**What**: Add Zod schemas for all POST/PUT/PATCH bodies across habits, focus, calendar, lists, contacts, notes, memories, folders, kanban-sections, chat sessions, journal, integrations, pomodoro.
**Why**: Currently only 13% of write routes validate input. Mongoose catches some shape errors but silently drops unknown fields and doesn't enforce nested invariants.
**Risk**: Each validation can reveal that the client was sending the wrong shape and silently working. Validate cautiously — log validation failures for a week before turning them into 400 errors.

## 7. House style enforcement
**Scope**: Ongoing
**What**: All new API routes must follow the template in `docs/API_AUDIT.md`. Consider adding an ESLint rule or code-reviewer-agent check that enforces the auth + Zod + handleApiError pattern.
**Why**: 79 routes drifted in 79 directions because there was no canonical pattern. Now there is one — enforce it.
