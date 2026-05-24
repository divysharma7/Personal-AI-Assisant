# LAIF API Route Audit

> Date: 2026-05-24
> Scope: All 79 API routes audited for auth, validation, error handling, status codes, response shape
> Status: AUDIT ONLY — no fixes applied

## Legend

- ✓ = passes the check
- ✗ = fails / missing
- ~ = partial (present but inconsistent)
- — = not applicable (e.g. GET doesn't need body validation)

## Full Route Table

| Route | Methods | Auth | Zod | Errors | Codes | Shape | Notes |
|-------|---------|------|-----|--------|-------|-------|-------|
| `/auth/login` | POST | — | ✗ | ✓ handleApiError | ✓ | `{ ok, username, name }` | Public route. Manual validation only. |
| `/auth/signup` | POST | — | ✗ | ✓ handleApiError | ✓ | `{ ok, username, name }` | Public. Min 6 char password only. |
| `/auth/logout` | POST | — | ✗ | ✓ handleApiError | ✓ | `{ ok: true }` | Public. |
| `/auth/me` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw fields | — |
| `/tasks` | GET, POST | ✓ | ✓ POST | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/tasks/[id]` | GET, PUT, PATCH, DEL | ✓ | ✓ PUT/PATCH | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/tasks/reorder` | POST | ✓ | ✗ | ~ legacy api500/apiError | ✓ | Raw data | **LEGACY error helpers** |
| `/tasks/[id]/schedule` | PATCH | ✓ | ✗ | ~ bare try/catch | ~ | Raw data | No handleApiError wrapper |
| `/tasks/[id]/unschedule` | PATCH | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/tasks/[id]/indent` | POST | ✗ | ✗ | ✓ handleApiError | ~ 500 wrong | Raw data | **NO AUTH. Returns 500 for update failures.** |
| `/tasks/[id]/outdent` | POST | ✗ | ✗ | ✓ handleApiError | ✓ | Raw data | **NO AUTH** |
| `/tasks/[id]/reparent` | POST | ✗ | ✗ | ✓ handleApiError | ✓ | Raw data | **NO AUTH** |
| `/tasks/[id]/comments` | POST | ✗ | ✗ | ✓ handleApiError | ✓ | Raw data | **No ownership check** — delegates to addComment |
| `/habits` | GET, POST | ✗ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | **NO AUTH on either method** |
| `/habits/[id]` | GET, PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Auth added this session. Legacy model lacks userId. |
| `/habits/today` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/habits/[id]/checkin` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses findByIdAndUpdate (P0-3) |
| `/habits/[id]/completions` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/habits/stats` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/focus/sessions` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201/409 | Raw data | 409 for duplicate active session (correct) |
| `/focus/sessions/[id]` | PATCH | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses findByIdAndUpdate (P0-3) |
| `/focus/sessions/active` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/focus/stats` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/calendar` | GET | ✓ | — | ✓ handleApiError | ✓ | Unified items | Fixed in this session |
| `/calendar/events` | GET | ✓ | — | ✓ handleApiError | ✓ | CalendarEvent[] | — |
| `/calendar/capacity` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/calendar/heatmap` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/calendar/overdue` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/calendar/unscheduled` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/calendar/sync-google` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/events` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | Fixed in this session |
| `/events/[id]` | PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/events/[id]/remind` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | `{ ok, fireAt }` | Fixed in this session |
| `/events/[id]/comments` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/reminders` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | Fixed in this session |
| `/reminders/[id]` | PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/reminders/[id]/snooze` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/reminders/[id]/comments` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/lists` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/lists/[id]` | GET, PATCH, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses ownerId (correct) |
| `/lists/[id]/blocks` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/folders` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/folders/[id]` | PATCH, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/folders/[id]/tasks` | PATCH | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/workflows` | GET, POST | ✓ | ✓ | ✓ handleApiError | ✓ 201 | Raw data | Zod validated |
| `/workflows/[id]` | GET, PATCH, DEL | ✓ | ✓ | ✓ handleApiError | ✓ | Raw data | Zod validated |
| `/workflows/[id]/columns` | POST | ✓ | ✓ | ✓ handleApiError | ✓ | Raw data | Zod validated |
| `/kanban-sections` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/kanban-sections/[id]` | PATCH, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/contacts` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/contacts/[id]` | PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/memories` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/memories/[id]` | PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/notes` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/notes/[id]` | PUT, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Fixed in this session |
| `/chat` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | NDJSON stream | Streaming response |
| `/chat/sessions` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/chat/sessions/[id]` | GET, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses userId filter |
| `/list-groups` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | — |
| `/list-groups/[id]` | PATCH, DEL | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses ownerId |
| `/journal` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/journal/summarize` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/notifications` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/push/subscribe` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/devices/register` | POST | — | ✗ | ✓ handleApiError | ✓ | Raw data | Public route |
| `/users/me/focus-preferences` | GET, PATCH | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/users/me/calendar-preferences` | GET, PATCH | ✓ | ~ manual | ✓ handleApiError | ✓ | Raw data | Manual whitelist validation |
| `/users/me/mcp` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/integrations/google/auth` | GET | ✓ | — | ✓ handleApiError | ✓ | Redirect | OAuth flow |
| `/integrations/google/callback` | GET | — | — | ✓ handleApiError | ✓ | Redirect | OAuth callback |
| `/integrations/google/sync` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/integrations/google/unsync` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/integrations/google/disconnect` | POST | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | — |
| `/integrations/google/status` | GET | ✓ | — | ✓ handleApiError | ✓ | Raw data | — |
| `/mcp` | GET, POST | ~/✓ | ✗ | ~ legacy api500 | ✓ | Raw data | GET is public (info disclosure). POST uses mcpApiKey. |
| `/alexa` | GET, POST | — | — | — | ✓ | `{ error }` | **DISABLED** (returns 404) |
| `/posthook_listener` | POST | — | ✗ | ✓ handleApiError | ✓ | Raw data | Public webhook. |
| `/pomodoro` | GET, POST | ✓ | ✗ | ✓ handleApiError | ✓ 201 | Raw data | Legacy route |
| `/pomodoro/[id]` | PATCH | ✓ | ✗ | ✓ handleApiError | ✓ | Raw data | Uses findByIdAndUpdate (P0-3) |

## Summary Statistics

| Dimension | Pass | Fail | Rate |
|-----------|------|------|------|
| Auth (on non-public routes) | 70 | 5 | 93% |
| Zod validation (on write routes) | 7 | ~45 | 13% |
| Error handling (handleApiError) | 74 | 5 | 94% |
| Status codes | 76 | 3 | 96% |
| Response shape (consistent) | — | — | No standard envelope |

## Three Most Common Patterns

1. **Auth + handleApiError + raw data** (~65 routes) — the de facto house style. Route calls `getAuthUserId()`, does work, catches with `handleApiError`, returns raw MongoDB documents with `_id` stringified.

2. **Public webhook/auth routes** (~8 routes) — no auth, manual validation, returns `{ ok: true }` or `{ error: "..." }`.

3. **Zod-validated routes** (7 routes) — tasks POST/PUT/PATCH and workflows use `parseBody(Schema, body)`. Best pattern but only 13% coverage.

## Outlier Routes

| Route | Issue | Priority |
|-------|-------|----------|
| `/habits` GET/POST | No auth check at all | HIGH |
| `/tasks/[id]/indent` | No auth, returns 500 for failures | HIGH |
| `/tasks/[id]/outdent` | No auth | HIGH |
| `/tasks/[id]/reparent` | No auth | HIGH |
| `/tasks/[id]/comments` | No ownership check | MEDIUM |
| `/tasks/reorder` | Legacy error helpers (apiError/api500) | LOW |
| `/mcp` GET | Exposes tool schema without auth | LOW |

## Recommended House Style

Every non-public API route should follow this pattern:

```typescript
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getAuthUserId } from '@/lib/auth'
import { SomeSchema, parseBody } from '@/lib/validation'
import { handleApiError } from '@/lib/apiHelpers'

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = parseBody(SomeSchema, body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

    await connectDB()
    const doc = await Model.create({ ...parsed.data, userId })

    return NextResponse.json({ ...doc.toObject(), _id: String(doc._id) }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
```

Rules:
1. **Auth first** — `getAuthUserId()` + 401 on null for every non-public route
2. **Zod validate** — `parseBody(Schema, body)` for all POST/PUT/PATCH bodies
3. **userId filter** — all queries include `{ userId }` or `{ ownerId }`
4. **handleApiError** — single error handler, never legacy helpers
5. **Status codes** — 201 for creates, 400 for validation, 401 for auth, 404 for not found
6. **Raw data response** — return document with `_id` as string, no envelope needed

## Fix Priority

```
1. HIGH — Add auth to /habits GET/POST, /tasks/[id]/indent, /outdent, /reparent
2. HIGH — Add Zod schemas for habit, focus, calendar, list, contact, note, memory writes
3. LOW  — Migrate /tasks/reorder to handleApiError
4. LOW  — Remove public GET from /mcp (or require auth)
```
