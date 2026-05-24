# LAIF — Capability Plan

> Generated 2026-05-24. Execute items one by one.
> Note: There is NO Pro subscription. Everything is free.

## P0 — Critical Fixes

### 1. Event + Reminder models lack `userId`
- `src/lib/models/Event.ts` — no `userId` field or index
- `src/lib/models/Reminder.ts` — no `userId` field or index
- Any authenticated user can read/modify any event or reminder
- **Fix**: Add `userId` field + index to both models, update all API routes to filter by userId, migrate existing documents

### 2. TypeScript types diverged from Mongoose schema
- `src/types/index.ts` defines `TaskStatus = 'todo' | 'in-progress' | 'done'` (3 states)
- Mongoose schema + Zod validation allow 5 states: `backlog`, `todo`, `in-progress`, `done`, `dropped`
- **Fix**: Update `src/types/index.ts` to match the actual 5-state model

---

## P1 — Architecture Cleanup

### 3. Remove legacy Habit model
- `src/lib/models/Habit.ts` exists but habits are now unified under Task (`isHabit: true`)
- **Action**: Audit if any routes still import `Habit.ts`. If unused, delete it.

### 4. Remove Pro/billing references from copy.ts
- `settings.subscriptions` references "Personal Free", "5 shared lists", "Upgrade to Pro"
- `settings.integrations.pro` lists Slack/GitHub/Linear/Figma with "Pro" badge
- **Reality**: Everything is free. No billing, no tiers.
- **Fix**: Remove subscription references and Pro badges from `copy.ts` and settings UI

### 5. Collaboration contract — DECIDED
- `List` model has `CollaboratorSchema` with roles and pending states
- ShareModal UI exists and writes to the schema
- **However**: No real-time sync, no WebSocket, no conflict resolution, no shared data access across users
- **Contract**: Collaboration is advertised in the UI but is single-user-only until v2. No multi-user data is currently shared. The schema and UI are scaffolding for a future feature, not a working capability. Do not build on top of collaboration as if it works — it does not.

---

## P2 — Quality Improvements

### 6. AI chat multi-turn context — DOCUMENTED
- Chat sessions are saved to DB but never loaded back into AI context
- Only the latest user message is sent (stateless per-turn)
- **Status**: Intentional design for cost control. Using free Llama 3.3 70B via OpenRouter — multi-turn context would increase token usage significantly.
- **Location**: `src/app/api/chat/route.ts` lines 850-853 (stateless) and 872-889 (save to DB for history UI only)
- **Future**: If switching to a paid model, load last N messages from ChatSession into context

### 7. Notification delivery — AUDIT COMPLETE
- **PostHook**: `src/lib/posthook.ts` is a NO-OP STUB. `scheduleNotification` and `cancelNotification` do nothing.
- **Firebase Admin**: `src/lib/firebase-admin.ts` is a NO-OP STUB. `messaging()` and `rtdb()` return mock objects.
- **PostHook listener**: `src/app/api/posthook_listener/route.ts` is real code but will never fire since nothing schedules hooks.
- **Web Push subscribe**: `src/app/api/push/subscribe/route.ts` works (saves subscriptions to DB) but no notifications are ever sent.
- **Result**: The entire notification pipeline is non-functional. To enable: implement real PostHook API calls in posthook.ts, configure Firebase credentials properly in firebase-admin.ts.
- **No code changes made** — this is an infrastructure/config task, not a code fix.

### 8. Security: dev-mode auth fallback — VERIFIED SAFE
- `src/lib/auth.ts` lines 52-56: `DEV_USER_ID` only returned when `NODE_ENV === 'development'`
- Next.js sets `NODE_ENV=production` automatically for `next build` / Vercel deployments
- **Result**: Safe. The fallback never fires in production. No code changes needed.

### 9. Add tests for AI chat tool functions
- 14 tool functions in `/api/chat/route.ts` have mutation side effects
- Currently untested — add unit tests for each tool

### 10. API route audit
- Verify all 79 routes have consistent: auth check, Zod validation, error handling via apiHelpers
- Some older routes may use legacy patterns

---

## P3 — UI Cleanup

### 11. Remove "Coming soon" placeholders
- Talk mode (sidebar FAB + settings) — either build or remove
- Notification preferences — "coming soon" text
- Collaborators tab — "Manage collaborators from individual lists"

### 12. Calendar preference schema expansion
- User schema allows `day | week | month` for defaultView
- App actually supports 6+ views (3-day, agenda, year)
- **Fix**: Expand the enum in User model

---

## Execution Status (2026-05-24)

```
P0-1  ✅ Event + Reminder userId fix (12 files changed — models, API routes, chat tools)
P0-2  ✅ TypeScript types aligned (TaskStatus 3→5 states, TaskPriority added null)
P1-3  ✅ Legacy Habit model AUDITED — still active, needs migration (not deletion)
P1-4  ✅ Pro/billing removed from copy.ts (subscriptions block, proBadge, upgradeCta)
P1-5  ✅ Collaboration UI kept — wired to real schema, settings tab says "coming soon"
P2-6  ✅ AI chat documented — intentionally stateless for cost control
P2-7  ✅ Notifications AUDITED — entire pipeline is stubs (posthook.ts + firebase-admin.ts)
P2-8  ✅ Dev auth fallback VERIFIED SAFE — gated by NODE_ENV === 'development'
P2-9  ⏳ Chat tool function tests — NOT DONE (deferred, needs dedicated test session)
P2-10 ⏳ API route consistency audit — NOT DONE (deferred, needs dedicated audit)
P3-11 ✅ Coming soon placeholders updated (4 copy.ts entries + 1 component)
P3-12 ✅ Calendar defaultView enum expanded (3→7 values, default changed day→week)
```

## Remaining Work

- **P1-3 migration**: Migrate legacy `Habit` model data into unified `Task` model with `isHabit: true`, then update `/api/habits` routes + `useHabits` hook to use TaskModel
- **P2-9**: Add Vitest tests for the 14 AI chat tool functions in `src/app/api/chat/route.ts`
- **P2-10**: Audit all 79 API routes for consistent auth + Zod validation + error handling
- **Notifications**: Implement real PostHook API calls and configure Firebase credentials
```
