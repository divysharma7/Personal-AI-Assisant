# Stabilization Sprint — Focus / Task / Auth Production Gaps

Date: 2026-08-13
Status: Ready for execution
Goal: Restore the new-user journey and Focus/Pomodoro in production.

## Executive summary

A production user is hitting three independent failure classes:

1. **Focus/Pomodoro is broken by a half-applied database migration.** The
   migration `20260808_add_focus_records_and_settings` is recorded as applied,
   but the actual tables/columns it should have created do not exist.
2. **Onboarding completion is impossible.** The frontend calls an endpoint that
   the backend does not define.
3. **Task creation fails in the default no-priority path.** The frontend sends
   `priority: "none"`, which the backend rejects.

This sprint is a zero-new-features stabilization pass. No product surface
changes; only correctness, ownership, and error visibility.

## Verified evidence

Production database inspection against `laif-api/.env.production`:

- `focus_records` table: **missing**
- `focus_settings` table: **missing**
- `focus_sessions` columns `mode`, `target_type`, `habit_id`: **missing**
- `FocusMode`, `FocusTargetType`, `FocusRecordSource` enum types: **missing**
- `focus_sessions_one_active_per_user_idx` exists (from a later migration)
- Migration rows `20260808_add_focus_records_and_settings` and
  `20260809_harden_focus_sessions` are present in `_prisma_migrations`

Observed production HTTP failures:

- `GET /api/focus/dashboard` → 500
- `GET /api/focus/records?limit=50` → 500
- `GET /api/focus/settings` → 500
- `GET /api/focus/sessions/active` → 500
- `POST /api/focus/sessions` → 500
- `GET /api/auth/me` → 401 when the JWT/cookie is missing
- `GET /api/ai/brief` → 404 (endpoint not implemented)

## Root cause map

| ID | Symptom | Root cause | Severity |
| --- | --- | --- | --- |
| STAB-001 | Every Focus read/write returns 500 | Migration DDL never materialized; ORM queries missing tables/columns | Critical |
| STAB-002 | New user cannot finish onboarding | `PUT /api/auth/me` is called but not implemented | High |
| STAB-003 | Default task creation fails | `priority: "none"` violates `CreateTaskSchema` enum | High |
| STAB-004 | Auth probe returns 401 | Session token missing/expired; needs production cookie verification | Medium |
| STAB-005 | AI Brief returns 404 | `/api/ai/brief` is not implemented | Medium |

## Work items

### STAB-001 — Repair production Focus schema

**Owner:** Backend / release
**Priority:** P0
**Estimate:** 3 points

**Why:** The application server is querying tables and columns that do not
exist. No application code change can fix this; it is a database state problem.

**Required outcome:**

- Production `focus_records` table exists and matches the Prisma schema.
- Production `focus_settings` table exists and matches the Prisma schema.
- Production `focus_sessions` has `mode`, `target_type`, and `habit_id`.
- `FocusMode`, `FocusTargetType`, and `FocusRecordSource` enum types exist.
- Required foreign keys and indexes exist.
- Migrations remain recorded correctly and can be replayed idempotently.

**Implementation notes:**

- Do **not** blindly re-run `prisma migrate deploy`, because the migration row
  already exists and Prisma will skip the missing DDL.
- Create a corrective migration that is idempotent:
  - `CREATE TYPE ... IF NOT EXISTS` / guarded enum creation.
  - `ALTER TABLE focus_sessions ADD COLUMN IF NOT EXISTS ...`.
  - `CREATE TABLE IF NOT EXISTS focus_records ...`.
  - `CREATE TABLE IF NOT EXISTS focus_settings ...`.
  - `CREATE INDEX IF NOT EXISTS ...`.
  - Add foreign keys only if absent.
- Capture a schema snapshot before and after.
- Verify with the same read-only inspection that failed earlier.

**Acceptance criteria:**

- [ ] `focus_records` exists and `SELECT count(*)` succeeds.
- [ ] `focus_settings` exists and `SELECT count(*)` succeeds.
- [ ] `focus_sessions` contains `mode`, `target_type`, `habit_id`.
- [ ] The three Focus enum types exist.
- [ ] `GET /api/focus/dashboard`, `/records`, `/settings`, `/sessions/active`
      return 200 with an authenticated session.
- [ ] `POST /api/focus/sessions` returns 201 and persists a row.

---

### STAB-002 — Implement onboarding completion endpoint

**Owner:** Backend + Frontend
**Priority:** P0
**Estimate:** 2 points

**Why:** `src/app/onboarding/page.tsx` posts name, `onboarded`, and
`emailsOptIn` to `PUT /api/auth/me`. `laif-api/src/routes/auth.ts` only defines
`GET /me`, so the request 404s and onboarding cannot complete.

**Required outcome:**

- A new user can save onboarding state and leave onboarding.
- The endpoint is authenticated and user-scoped.
- The frontend stops writing unsupported `onboarded`/`emailsOptIn` fields if the
  backend does not persist them, or the schema gains columns to persist them.

**Preferred fix:**

Add `PUT /api/auth/me` (or repoint the frontend to
`PATCH /api/users/me/profile`) to update the authenticated user's name. If the
product needs onboarding state, add explicit `onboarded` and `emailsOptIn`
columns via migration and persist them. Do not silently ignore fields.

**Acceptance criteria:**

- [ ] `PUT /api/auth/me` or the chosen profile route returns 200.
- [ ] The new user can click "Save and open Life OS" without a 404.
- [ ] User B cannot update User A's profile.
- [ ] The frontend no longer calls a non-existent route.

---

### STAB-003 — Normalize no-priority task input

**Owner:** Frontend + Backend
**Priority:** P0
**Estimate:** 1 point

**Why:** `GlobalTaskComposer` and `TaskWorkspace` submit `priority: "none"`,
but `CreateTaskSchema` only accepts `low | medium | high`. A brand-new user's
default task creation returns 422 and the optimistic row rolls back.

**Required outcome:**

- Creating a task without an explicit priority succeeds.
- The API contract and UI behavior agree on what "no priority" means.

**Preferred fix:**

Make the backend accept `"none"` and persist it as `null`, or make the frontend
send `null`/omit the field instead of `"none"`. Pick one and apply it at every
task creation call site.

**Acceptance criteria:**

- [ ] `POST /api/tasks` with `priority: "none"` or omitted priority returns 201.
- [ ] `GlobalTaskComposer` default task creation succeeds.
- [ ] `TaskWorkspace` quick-add succeeds.
- [ ] No remaining frontend task creator sends an invalid priority.
- [ ] Existing valid priorities still work.

---

### STAB-004 — Production auth/cookie verification

**Owner:** Full stack
**Priority:** P0
**Estimate:** 1 point

**Why:** The production console shows `GET /api/auth/me` returning 401. That is
expected when no valid cookie is present, but must be confirmed against a real
login flow so the frontend does not mask a cookie/CORS misconfiguration.

**Required outcome:**

- Signup → login → authenticated request succeeds in production.
- Production cookie attributes (`Secure`, `SameSite=None`, path `/`) are
  correct.
- CORS allows the Vercel origin with credentials.

**Acceptance criteria:**

- [ ] Automated or manual production journey: signup, login, `/api/auth/me`
      returns 200.
- [ ] `Set-Cookie` from production has `Secure` and the correct `SameSite`.
- [ ] Vercel origin passes the Origin/CSRF check for a cookie-authenticated
      write.
- [ ] Missing/expired token returns a clean 401 and the frontend redirects to
      login.

---

### STAB-005 — Implement or explicitly disable AI Brief endpoint

**Owner:** Backend
**Priority:** P1
**Estimate:** 3 points

**Why:** The dashboard calls `GET /api/ai/brief`, but the backend has no `/ai`
router. The widget currently swallows the 404 into an error state, but the
product either needs the endpoint or should stop calling it.

**Required outcome:**

- No 404 in the network tab on dashboard load.
- The AI Brief widget has a defined production behavior.

**Preferred fix:**

Either implement an authenticated `GET /api/ai/brief` using the configured AI
provider and ownership-scoped task/calendar data, or remove/hide the AI Brief
widget and its client call until the feature is real. Do not leave a dead
endpoint call.

**Acceptance criteria:**

- [ ] Dashboard load does not emit `GET /api/ai/brief` 404.
- [ ] If implemented, the response is scoped to the current user and never
      leaks other users' data.
- [ ] If removed, the widget is fully removed from dashboard composition and
      related docs.

---

## Suggested execution order

1. STAB-001 (unblocks Focus entirely)
2. STAB-002 (unblocks onboarding)
3. STAB-003 (unblocks default task creation)
4. STAB-004 (confirms auth/CORS in production)
5. STAB-005 (removes dashboard 404)

STAB-001 and STAB-003 are independent of each other but both are release
blockers. STAB-002 is also independent and can run in parallel with STAB-003.

## Definition of done

- All P0 acceptance criteria pass.
- Production network tab shows no 500 from Focus endpoints and no 404 from
  onboarding or AI Brief.
- A new user can sign up, complete onboarding, create a default task, and run
  Pomodoro end to end.
- Backend tests and frontend typecheck/build pass.
- Database migration state is consistent with `schema.prisma`.

## Out of scope

- New features.
- MongoDB import or legacy data migration.
- Calendar, Agenda, Habits, Chat, or notification redesigns.
- Bundle-size work unless required to unblock a P0.
