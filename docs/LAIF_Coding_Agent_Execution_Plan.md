# LAIF — Coding Agent Execution Plan

> **⚠️ NOTE:** Contacts, Notes, and Journal features have been **removed from the product**. Tasks referencing these features (TASK 01 notes/contacts/journal scoping, TASK 02 contacts/notes/journal validation, TASK 05 notes/contacts/journal isolation tests, TASK 06 notes CRUD, TASK 17 journal context, TASK 20D notes/journal typing, TASK 26C journal linked tasks, TASK 28 journal/notes core flows) are N/A or should be skipped. The security fixes they targeted are no longer needed since the routes no longer exist.

> **Purpose:** Give a coding agent a safe, dependency-ordered plan to take LAIF from “feature-rich but partially hardened” to production-ready v1.0.
>
> **Repos**
> - Frontend: `Personal-AI-Assisant/`
> - Backend: `laif-api/`
>
> **Target**
> - Frontend: Vite + React 18 + TypeScript + React Router v7 + React Query + Tailwind
> - Backend: Express + Mongoose + MongoDB + JWT/cookie auth + Zod
> - AI: OpenRouter
> - Deployment: Vercel frontend + standalone Node backend

---

# 1. Execution Order

Do not optimize for visible feature progress. Optimize for risk removal.

```text
baseline
→ security fixes
→ backend integration-test harness
→ auth + isolation tests
→ production auth verification
→ finish Vite cleanup
→ service-worker safety
→ OpenRouter foundation
→ text chat
→ AI tool registry
→ read-only tools
→ mutation tools
→ tool-calling loop
→ AI Brief
→ notification architecture
→ notification delivery
→ API typing
→ habit-model decision
→ polish
→ CI
→ production release gate
```

---

# 2. Agent Rules

1. Execute **one numbered task at a time**.
2. Inspect before editing.
3. Reuse existing project patterns.
4. Make the smallest safe diff.
5. Do not refactor unrelated files.
6. Do not introduce a second router, query library, validation library, auth system, or state-management library.
7. Never trust `userId` from request bodies.
8. Never treat 5xx/network failures as authentication failures.
9. Every security bug fixed must get a regression test.
10. Every task must run its validation commands before being marked complete.
11. Stop after the requested task.
12. Preserve product behavior unless the task explicitly changes it.

Every task must finish with:

```text
TASK:
STATUS: PASS | PARTIAL | BLOCKED

Files inspected:
Files changed:
Behavior before:
Behavior after:
Commands run:
Tests:
Build/typecheck:
Risks / follow-up:
Acceptance criteria:
```

---

# 3. v1.0 Release Blockers

The coding agent must treat these as release blockers:

## Security
- ~~Notes user-scoped.~~ N/A — feature removed
- ~~Contacts user-scoped.~~ N/A — feature removed
- ~~Journal entries user-scoped.~~ N/A — feature removed
- Mutable backend inputs validated.
- User A cannot access User B data.
- No production `DEV_USER_ID` bypass.

## Backend confidence
- Integration-test harness exists.
- Auth integration tests exist.
- User-isolation tests exist.
- Core CRUD tests exist.
- AI mutation tools are tested.

## Vite migration
- No active Next.js runtime dependency.
- No stale Next config.
- No service-worker `/_next/` behavior.
- Production deep links work.
- Production auth works from Vite.

## AI
- OpenRouter transport works.
- Tool calls are allowlisted and validated.
- Tool execution is user-scoped.
- Tool loops have limits.
- AI Brief works.

## Production
- Frontend lint/typecheck/tests/build pass.
- Backend build/tests pass.
- Playwright core flows pass.
- No unexpected console/runtime errors.

---

# TASK 00 — Establish Baseline

## Goal

Create a pre-change snapshot so later failures can be classified correctly.

## Agent instruction

```text
Execute TASK 00 only.

Frontend:
1. Record git status, branch, and commit.
2. Inspect package.json scripts.
3. Run lint if configured.
4. Run typecheck.
5. Run unit tests.
6. Run production build.
7. Run current Playwright tests if runnable.

Backend:
1. Record git status, branch, and commit.
2. Inspect package.json scripts.
3. Run typecheck/build.
4. Run configured tests.
5. Confirm actual current backend test count.

Do not fix anything.

Report exact failing tests, commands, build status, and known baseline defects.

Stop after TASK 00.
```

## Acceptance

- [ ] frontend baseline recorded
- [ ] backend baseline recorded
- [ ] pre-existing failures identified
- [ ] zero behavior changes

---

# TASK 01 — Fix Cross-User Data Leakage

## Priority

**P0**

## Scope

Backend:

```text
notes.ts
contacts.ts
journal.ts
```

Every user-owned Mongo query must be scoped by authenticated `req.userId`.

For ID lookups, the safe pattern is conceptually:

```ts
{
  _id: req.params.id,
  userId: req.userId!,
}
```

Do not trust a client-provided `userId`.

## Agent instruction

```text
Execute TASK 01 only.

Goal:
Eliminate cross-user access in notes, contacts, and journal routes.

Steps:
1. Inspect auth middleware and confirm how req.userId is populated.
2. Inspect at least two already-correct user-scoped route modules.
3. Search the three target files for:
   find
   findOne
   findById
   findOneAndUpdate
   findByIdAndUpdate
   updateOne
   deleteOne
   findByIdAndDelete
   findOneAndDelete
   countDocuments
   aggregate
4. Add authenticated user scope to every user-owned read/write/delete.
5. Preserve existing response shapes and product behavior.
6. Do not allow request-body ownership override.
7. Prefer ordinary not-found behavior when another user's resource is addressed.

After editing:
- search again for unscoped operations
- run backend typecheck/build
- run tests if available

Report every query changed.

Stop after TASK 01.
```

## Acceptance

- [ ] notes scoped
- [ ] contacts scoped
- [ ] journal scoped
- [ ] ownership cannot be client-overridden
- [ ] no response-contract regression

---

# TASK 02 — Add Missing Zod Validation

## Goal

Reject malformed input before it reaches Mongoose.

## Scope

Inspect:

```text
memories.ts
users.ts
contacts.ts
notes.ts
journal.ts
src/lib/validation.ts
```

## Agent instruction

```text
Execute TASK 02 only.

Goal:
Bring missing backend validation to the same standard as already-validated LAIF routes.

Requirements:
1. Reuse existing Zod middleware/helpers.
2. Add missing schemas in src/lib/validation.ts when appropriate.
3. Validate body/query/params according to existing project conventions.
4. Never accept ownership fields from clients.
5. Keep PATCH-style inputs partial where intended.
6. Preserve currently valid API requests.
7. Do not redesign endpoint contracts.
8. Remove blind req.body → Mongoose writes in targeted routes.

Run backend typecheck/build and focused tests if available.

Stop after TASK 02.
```

## Acceptance

- [ ] memories validated
- [ ] relevant user preferences validated
- [ ] targeted mutable inputs validated
- [ ] valid existing clients remain compatible

---

# TASK 03 — Build Backend Integration-Test Harness

## Priority

**P0**

## Goal

Make backend routes testable with real Express routing and an isolated database.

## Target shape

```text
Vitest
+ importable Express app
+ HTTP request test client
+ isolated test Mongo database
```

Use Supertest only if it fits the current stack and no equivalent exists.

## Agent instruction

```text
Execute TASK 03 only.

Goal:
Create reusable backend API integration-test infrastructure.

Inspect:
- backend app/server bootstrap
- Mongo connection module
- auth routes
- env loading
- package.json
- Vitest config

Requirements:
1. Make the Express app importable without always binding a port.
2. Preserve normal production startup.
3. Create an isolated test database setup.
4. Prevent test configuration from ever pointing to production Mongo.
5. Add helpers for:
   - create user
   - login user
   - authenticated request
   - reset database
6. Close DB/server handles after tests.
7. Add one smoke test proving the harness works.
8. Do not write the full endpoint suite yet.

Run the test and backend build.

Stop after TASK 03.
```

## Acceptance

- [ ] app testable in-process
- [ ] isolated DB
- [ ] auth cookie/session testable
- [ ] deterministic reset
- [ ] no open-handle leak

---

# TASK 04 — Authentication Integration Tests

## Goal

Prove real auth semantics before more feature work.

## Required flows

```text
signup
login
cookie/token issued
/auth/me succeeds
protected endpoint succeeds
logout
/auth/me rejected
protected endpoint rejected
```

Also test invalid password and missing session.

## Agent instruction

```text
Execute TASK 04 only.

Use the TASK 03 integration harness.

Test:
1. signup
2. valid login
3. session cookie/token issuance
4. /auth/me
5. protected route with session
6. invalid password
7. missing session
8. logout
9. /auth/me after logout
10. production mode cannot silently use DEV_USER_ID

Do not redesign auth unless a test exposes a real bug.

If a bug is found:
- make the smallest fix
- add a regression test

Run focused auth tests and then full backend tests.

Stop after TASK 04.
```

---

# TASK 05 — User-Isolation Security Tests

## Priority

**P0**

## Goal

Make user ownership a permanent invariant.

Create User A and User B.

For notes, contacts, and journal, verify where the endpoint exists:

```text
A creates
A can read
B list excludes A data
B direct read fails
B update fails
B delete fails
A can still update/delete
```

## Agent instruction

```text
Execute TASK 05 only.

Goal:
Create regression tests for horizontal user isolation.

Use two authenticated users.

Test notes, contacts, and journal at the API level.

Do not assert implementation details.
Assert externally observable API behavior.

Run focused isolation tests and full backend tests.

Stop after TASK 05.
```

---

# TASK 06 — Core CRUD Integration Tests

## Scope

High-value entities:

1. tasks
2. habits
3. notes

For each:

```text
create
read/list
update
delete
invalid payload
ownership
```

For tasks/habits also include one domain-specific mutation such as completion or check-in.

## Agent instruction

```text
Execute TASK 06 only.

Goal:
Add high-value integration coverage for tasks, habits, and notes.

Requirements:
1. Test create/read/update/delete.
2. Test one invalid payload per entity.
3. Test authenticated ownership.
4. Test one important task/habit domain mutation.
5. Avoid exhaustive permutations.
6. Avoid snapshot-heavy tests.
7. Prefer route behavior over direct Mongoose tests.

Run the full backend suite.

Stop after TASK 06.
```

---

# TASK 07 — Verify Production Authentication

## Priority

**P0 before deployment**

## Inspect

Backend:

```text
DEV_USER_ID
NODE_ENV
auth middleware
JWT/cookie settings
CORS
```

Frontend:

```text
RequireAuth
API client
VITE_API_URL
credentials: include
```

## Agent instruction

```text
Execute TASK 07 only.

Goal:
Verify real production auth end-to-end.

Requirements:
1. Search for DEV_USER_ID and every dev auth bypass.
2. Confirm bypasses cannot activate in production.
3. Run backend with production-like auth configuration.
4. Run frontend against it.
5. Perform real signup/login.
6. Verify cookie/token.
7. Verify RequireAuth.
8. Verify a protected API request.
9. Verify logout.
10. Verify rejection after logout.
11. Verify no fallback identity is used.

Document actual cookie attributes and CORS behavior.

Do not weaken production security settings to make the test pass.

Stop after TASK 07.
```

---

# TASK 08 — Finish Next.js → Vite Cleanup

## Goal

Remove dead migration artifacts only after production auth/build behavior is proven.

## Search

```text
from 'next
from "next
next/
NEXT_PUBLIC_
process.env
/_next/
next-env
next.config
```

## Expected cleanup

When verified unused:

```text
next
eslint-config-next
next.config.mjs
next-env.d.ts
next lint script
```

Do not combine the 155 `'use client'` removals into this task unless required.

## Agent instruction

```text
Execute TASK 08 only.

Goal:
Remove dead Next.js runtime/configuration dependencies.

Requirements:
1. Search the frontend for remaining Next imports and assumptions.
2. Verify every candidate file is obsolete before deleting.
3. Remove next and eslint-config-next if unused.
4. Remove obsolete Next config/type files.
5. Replace the broken Next lint script with the actual ESLint command.
6. Preserve Vite config/scripts.
7. Do not remove 'use client' directives yet.
8. Update lockfile through the package manager.

Run:
- install
- lint
- typecheck
- unit tests
- production build

Stop after TASK 08.
```

---

# TASK 09 — Service Worker Migration Safety

## Priority

**P0/P1**

The problem is not only:

```text
/_next/static/ → /assets/
```

Already-installed browsers may retain old worker/cache behavior.

## Preferred v1 strategy

Ship a cleanup/migration worker first.

Desired:

```text
known old LAIF Next caches → removed
index.html → not aggressively pinned
hashed Vite assets → cache only if intentional
API → network by default
```

## Agent instruction

```text
Execute TASK 09 only.

Goal:
Make service-worker behavior safe across the Next-to-Vite transition.

Inspect:
- public/sw.js
- SW registration code
- all cache names
- all /_next references
- Vite output paths

Requirements:
1. Identify current caches and strategy.
2. Remove Next-specific asset matching.
3. Keep /sw.js so installed workers can update.
4. Remove known obsolete LAIF Next caches during activate.
5. Do not aggressively cache index.html.
6. Do not invent offline API semantics.
7. Do not delete unrelated origin caches.
8. Ensure new worker can activate/claim clients safely.
9. Verify no /_next/static requests remain.

Browser verification:
- worker update
- cache cleanup
- hard refresh
- nested-route refresh
- post-deploy chunk loading

Run the Vite production build.

Stop after TASK 09.
```

---

# TASK 10 — OpenRouter Service Foundation

## Priority

**P1 core feature**

Create a backend service such as:

```text
src/services/openRouterService.ts
```

The service may own:

- base URL
- auth headers
- model configuration
- timeout/abort
- request serialization
- provider response parsing
- provider error normalization
- streaming transport support

It must not own:

- database mutations
- chat-session persistence
- tool implementation
- route-specific response formatting

Use server-only environment variables:

```text
OPENROUTER_API_KEY
OPENROUTER_MODEL
```

## Agent instruction

```text
Execute TASK 10 only.

Goal:
Create the OpenRouter transport/service abstraction.

Inspect existing env, service, error, and logging conventions.

Requirements:
1. Read API key server-side only.
2. Make model configurable.
3. Never expose API key in frontend or logs.
4. Add timeout/abort support.
5. Normalize provider/network errors.
6. Support normal completion.
7. Design for streaming use by the route.
8. Do not implement tools.
9. Do not modify frontend chat yet.
10. Add focused service tests using mocked provider HTTP.

Stop after TASK 10.
```

---

# TASK 11 — Real Text Chat Before Tools

## Goal

Replace the backend placeholder with real AI generation, but **without tools**.

Required path:

```text
frontend
→ POST /api/chat
→ authenticated backend
→ OpenRouter
→ assistant response
→ chat persistence
```

## Agent instruction

```text
Execute TASK 11 only.

Goal:
Wire real OpenRouter text generation into the existing chat flow without tool calls.

Requirements:
1. Preserve authenticated user scope.
2. Preserve ChatSession ownership.
3. Build model messages from existing conversation safely.
4. Avoid sending unnecessary user data.
5. Call OpenRouter.
6. Return the transport the frontend already expects.
7. Persist assistant output if current history semantics require it.
8. Handle timeout/provider error safely.
9. No tools.
10. Add integration tests using mocked OpenRouter.

Stop after TASK 11.
```

---

# TASK 12 — Design AI Tool Registry

## Priority

**P1**

Before enabling tool calls, create a strict allowlist.

Each tool should conceptually contain:

```text
name
description
Zod input schema
mutates: true/false
execute(args, authenticatedContext)
```

The model must never control:

```text
userId
Mongo operators
collection names
arbitrary URLs
arbitrary code
filesystem paths
```

## Agent instruction

```text
Execute TASK 12 only.

Goal:
Create a typed, validated, allowlisted AI tool registry.

Requirements:
1. Inventory the intended 14 tools.
2. Classify each as read-only or mutating.
3. Add strict Zod input schemas.
4. Inject user identity from authenticated context only.
5. Reuse existing domain/service logic.
6. Reject arbitrary Mongo/query operators.
7. Normalize tool results into compact JSON-safe responses.
8. Normalize tool errors.
9. Test invalid tool input rejection.
10. Test that a supplied userId cannot override authenticated identity.

Do not enable the full model tool loop yet.

Stop after TASK 12.
```

---

# TASK 13 — Read-Only AI Tools

## Strategy

Implement read tools before mutation tools.

Examples may include:

```text
fetch tasks
fetch habits
check calendar availability
read today's schedule
fetch notes/memories
```

Use the actual inventory.

## Agent instruction

```text
Execute TASK 13 only.

Goal:
Implement and test the read-only subset of AI tools.

Requirements:
1. Work only on tools classified read-only.
2. Reuse existing domain/service logic.
3. Scope every read by authenticated user.
4. Validate every input.
5. Limit result size.
6. Return predictable structured data.
7. Avoid returning entire DB documents unnecessarily.
8. Add tests for each read tool.
9. Include at least one cross-user isolation test.
10. Do not implement mutation tools yet.

Stop after TASK 13.
```

---

# TASK 14 — Mutating AI Tools

## Priority

**P1 high risk**

Rules:

- validated
- user-scoped
- deterministic
- constrained
- tested

Never pass model-generated arbitrary update objects into Mongoose.

## Agent instruction

```text
Execute TASK 14 only.

Goal:
Implement the mutating AI tools safely.

Requirements:
1. Use only approved registry tools.
2. Validate every argument with Zod.
3. Inject authenticated userId server-side.
4. Reuse existing domain operations where possible.
5. Reject arbitrary fields/operators.
6. Add clear errors for invalid/not-found operations.
7. Test successful mutation.
8. Test malformed input.
9. Test cross-user denial.
10. Test deletion carefully.
11. Prevent accidental duplicate side effects where idempotency is expected.

Do not wire the model tool loop yet.

Stop after TASK 14.
```

---

# TASK 15 — Enable Model Tool Calling

## Required safeguards

Add:

```text
max tool rounds
max tools per turn
request timeout
tool timeout
unknown-tool rejection
structured logging
```

Do not allow unbounded model→tool loops.

## Agent instruction

```text
Execute TASK 15 only.

Goal:
Wire OpenRouter tool calling to the validated registry.

Requirements:
1. Expose only registered tools.
2. Parse provider tool calls defensively.
3. Validate arguments before execution.
4. Execute with authenticated context.
5. Feed structured results back to the model.
6. Cap tool rounds.
7. Cap total execution time.
8. Reject unknown tool names.
9. Persist final assistant response according to current chat semantics.
10. Log tool name/status/request id without sensitive payloads.

Tests:
- no tool
- one read tool
- one mutation tool
- invalid tool
- invalid args
- tool error
- loop limit reached

Stop after TASK 15.
```

---

# TASK 16 — AI Brief Endpoint

## Goal

Implement dashboard brief only after base AI works.

Use deliberate bounded context such as:

```text
today's tasks
overdue tasks
calendar/events
habits
recent journal context if enabled later
focus context
```

Do not dump the full database into the prompt.

## Agent instruction

```text
Execute TASK 16 only.

Goal:
Implement /api/ai/brief.

Requirements:
1. Reuse OpenRouter service.
2. Build compact user-scoped context.
3. Bound list sizes and text sizes.
4. Send no secrets/unrelated records.
5. Return a stable frontend response shape.
6. Handle no-data state sensibly.
7. Handle timeout/provider errors.
8. Add mocked OpenRouter integration tests.
9. Do not redesign dashboard UI.

Stop after TASK 16.
```

---

# TASK 17 — Journal Context for AI Brief

## Goal

Add recent journal context without sending unbounded history.

Prefer:

```text
recent window only
bounded characters
plain text normalization
```

## Agent instruction

```text
Execute TASK 17 only.

Goal:
Add bounded recent journal context to AI Brief.

Requirements:
1. Use user-scoped journal data.
2. Use a small relevant time window.
3. Enforce text-size limits.
4. Strip non-useful rich-text markup.
5. Preserve no-journal behavior.
6. Test:
   - no journal
   - normal journal
   - oversized journal
   - another user's journal cannot appear

Stop after TASK 17.
```

---

# TASK 18 — Notification Architecture Decision

## Important

Do not implement PostHook simply because stubs already exist.

Compare:

### A. External scheduler/webhook

Pros:
- less worker infrastructure

Cons:
- vendor dependency
- webhook security
- cost/coupling

### B. Self-hosted worker/cron

Pros:
- full control
- fewer vendors

Cons:
- always-on worker/infrastructure
- retries/concurrency/claiming become your responsibility

## Agent instruction

```text
Execute TASK 18 only.

This is a design task.

Inspect:
- notificationService.ts
- notificationDelivery.ts
- posthookListener.ts
- NotificationSchedule model
- push/FCM/Web Push logic
- backend hosting model

Produce a short ADR comparing:
A. external scheduler/webhook
B. self-hosted cron/worker

Evaluate:
- deployment fit
- reliability
- retries
- duplicate delivery
- security
- local development
- cost
- implementation complexity

Recommend one option for v1.

Do not implement delivery yet.

Stop after TASK 18.
```

---

# TASK 19 — Implement Notification Delivery

Execute only after TASK 18.

## Required invariant

A scheduled notification must not deliver twice accidentally.

Use existing model fields or introduce a minimal state machine such as:

```text
pending
processing
delivered
failed
```

only if necessary.

## Agent instruction

```text
Execute TASK 19 only.

Goal:
Implement the notification delivery design chosen in TASK 18.

Requirements:
1. Use existing FCM/Web Push capabilities.
2. Authenticate webhook/internal execution.
3. Prevent duplicate delivery.
4. Distinguish retryable vs permanent failure.
5. Record delivery status/error metadata.
6. Keep user ownership correct.
7. Never log device tokens.
8. Add integration tests.
9. Add one end-to-end flow:
   create reminder
   → schedule
   → trigger delivery
   → push sender called
   → schedule marked delivered

Stop after TASK 19.
```

---

# TASK 20 — Type Frontend API Clients by Domain

## Important

Do not replace `any` across all 14 files in one pass.

Break into:

```text
20A tasks
20B habits
20C calendar/events
20D notes/journal
20E workflows/lists
20F auth/users
20G chat/AI
20H integrations/notifications
```

## Template

```text
Execute TASK 20A only.

Goal:
Remove `any` from the tasks API boundary without changing runtime behavior.

Inspect:
- frontend tasks API client
- task types
- task hooks
- backend task route responses
- Task model if needed

Requirements:
1. Type actual request/response behavior.
2. Reuse existing domain types where accurate.
3. Do not use `as any`.
4. Do not make optional backend fields required without evidence.
5. Preserve runtime behavior.
6. Fix only directly-caused call-site type errors.

Run:
- frontend typecheck
- relevant tests
- production build

Stop after TASK 20A.
```

Repeat for 20B–20H.

---

# TASK 21 — Remove `'use client'`

## Priority

**P3 cleanup**

Keep this as an isolated mechanical commit.

## Agent instruction

```text
Execute TASK 21 only.

Goal:
Remove obsolete top-level 'use client' directives.

Requirements:
1. Search exact directive occurrences.
2. Remove directives only.
3. Do not reformat surrounding files.
4. Do not change imports.
5. Do not change behavior.
6. Report the total count removed.

Run:
- typecheck
- unit tests
- production build

Stop after TASK 21.
```

---

# TASK 22 — Resolve MCP Route Mismatch

## Problem

Frontend appears to use:

```text
/users/me/mcp
```

while backend also exposes:

```text
/mcp
```

Do not add more MCP code until the intended contract is clear.

## Agent instruction

```text
Execute TASK 22 only.

Goal:
Determine and resolve the MCP route mismatch.

Inspect:
- frontend settings API
- MCP UI
- backend users route
- backend mcp route
- auth/ownership semantics

Output:
1. what each endpoint currently does
2. canonical intended endpoint
3. stale side of the contract
4. minimal compatibility change

Preserve existing data.

Add a focused test if backend behavior changes.

Stop after TASK 22.
```

---

# TASK 23 — Notification Frontend Client

Do this only after backend notification delivery is real.

## Scope

Only existing product needs:

```text
list scheduled notifications
cancel/delete if supported
update if supported
```

Do not invent a full notification-center feature.

## Agent instruction

```text
Execute TASK 23 only.

Goal:
Add the minimum typed frontend API client for scheduled notifications.

Inspect real backend route shapes first.

Requirements:
1. Reuse central API client.
2. Preserve auth/credentials behavior.
3. Add accurate request/response types.
4. Add React Query hooks only where consumed.
5. Do not create new UI unless an existing screen requires it.
6. Add focused tests where current patterns support them.

Stop after TASK 23.
```

---

# TASK 24 — Defer Alexa Unless v1 Requires It

Default decision:

```text
Alexa frontend management = post-v1
```

Do not spend launch-critical cycles on it unless it is explicitly part of the promised v1 surface.

---

# TASK 25 — Habit Model ADR

## Problem

The project has both:

```text
legacy Habit model
Task with isHabit: true
```

Do not add more habit features until the canonical model is understood.

## Agent instruction

```text
Execute TASK 25 only.

This is an inventory/design task.

Inspect:
- Habit model
- Task model
- habit routes
- task routes
- frontend habit hooks
- streak service
- dashboard habit strip
- settings habit UI
- migration/TODO comments

Produce:
1. every read/write path using Habit
2. every read/write path using Task.isHabit
3. fields unique to each model
4. whether live data migration is required
5. recommended canonical model
6. safe migration plan if consolidation is needed

Do not perform the migration yet.

Stop after TASK 25.
```

Only after this should new habit polish proceed.

---

# TASK 26 — Frontend Polish

Execute as separate tasks:

```text
26A habits Settings tab
26B monthly habit heatmap hover
26C linked tasks inline in journal
```

Do not bundle these.

They are non-blockers.

---

# TASK 27 — Add CI

## Goal

Protect the hardening work from regression.

## Frontend pipeline

```text
install
lint
typecheck
unit tests
build
```

## Backend pipeline

```text
install
typecheck/build
integration tests
```

Optional:

```text
Playwright smoke
```

## Agent instruction

```text
Execute TASK 27 only.

Goal:
Add GitHub Actions CI.

Requirements:
1. Use existing package manager and lockfiles.
2. Pin a supported Node major.
3. Frontend:
   - install
   - lint
   - typecheck
   - tests
   - build
4. Backend:
   - install
   - typecheck/build
   - tests
5. Use safe test Mongo configuration.
6. Do not expose production secrets.
7. Keep caching simple.
8. Fail on new build/test errors.

Stop after TASK 27.
```

---

# TASK 28 — Final Production Release Gate

## Goal

Produce a GO / NO-GO decision.

## Backend gate

Verify:

```text
production environment
real auth
no DEV_USER_ID bypass
correct CORS
correct cookie/JWT behavior
OpenRouter configured
notification delivery configured if shipped
full tests pass
```

## Frontend gate

Verify:

```text
production Vite build
correct API URL
nested-route refresh
service-worker migration
no Next assets
real login
```

## Core product flows

### Auth
- signup
- login
- protected route
- logout
- rejection after logout

### Tasks
- create
- edit
- complete
- delete

### Habits
- view
- check-in
- streak

### Journal
- write
- autosave
- reload

### Notes
- create
- edit
- search
- autosave
- delete

### Calendar
- view
- create

### Workflow
- open
- create/move task
- persistence

### Focus
- start
- timer
- end/persist

### AI
- normal response
- read tool
- mutation tool
- provider error

### Notifications
If v1 includes them:
- create reminder
- schedule
- delivery

## Agent instruction

```text
Execute TASK 28 only.

Goal:
Produce the final LAIF v1 release-readiness result.

Do not perform broad refactors.

Run frontend:
- lint
- typecheck
- unit tests
- production build
- Playwright core suite

Run backend:
- typecheck/build
- full tests

Verify the defined core flows.

Also verify:
- no DEV_USER_ID production behavior
- no /_next/ network requests
- service-worker update behavior
- browser console errors
- API errors
- OpenRouter failure handling
- cross-user isolation tests
- deployment environment variables

Return exactly one verdict:

GO
GO WITH KNOWN NON-BLOCKERS
NO-GO

List blockers separately from non-blockers.

Stop after TASK 28.
```

---

# 4. Recommended Execution Groups

## Stage A — Security and confidence

```text
00 baseline
01 user scoping
02 validation
03 test harness
04 auth tests
05 isolation tests
06 core CRUD tests
07 production auth
```

## Stage B — Finish migration

```text
08 Next cleanup
09 service worker
```

## Stage C — Make AI real

```text
10 OpenRouter service
11 text chat
12 tool registry
13 read tools
14 mutation tools
15 tool loop
16 AI Brief
17 journal context
```

## Stage D — Notifications

```text
18 notification ADR
19 notification delivery
```

## Stage E — Technical debt

```text
20A–20H API typing
21 remove use client
22 MCP contract
23 notification client
25 habit-model ADR
```

## Stage F — Polish

```text
26A–26C
```

## Stage G — Release

```text
27 CI
28 production gate
```

---

# 5. What Should Not Block v1

Unless explicitly promised:

```text
Alexa frontend management
full Google Calendar sync
MCP expansion
large visual polish
100% frontend component-test coverage
perfect API type coverage
advanced PWA/offline behavior
full Lists→Workflows consolidation
```

Do not sacrifice launch safety for these.

---

# 6. Decisions for the Coding Agent

## Security vs AI

**Security first.**

AI mutation tools expand the write surface. They should not be built before user ownership and test infrastructure are reliable.

## Unit vs integration tests

Backend critical-path priority:

```text
integration tests first
```

because auth, ownership, validation, routing, and Mongo behavior cross several layers.

Use unit tests for:

```text
OpenRouter parsing
notification scheduling math
streak calculations
pure tool argument transformations
```

## Lists vs Workflows

Keep both for v1.

Current mental model:

```text
Lists → flat grouping
Workflows → kanban process
```

Removing one is a separate product migration.

## AI model

Do not hardcode one model in business logic.

Use:

```text
OPENROUTER_MODEL
```

and evaluate quality/cost separately.

## Notifications

Either:

```text
finish real delivery
```

or:

```text
hide/disable reminder UX
```

Do not ship UI that appears functional while delivery remains stubbed.

---

# 7. Suggested `AGENTS.md`

```md
# LAIF Coding Agent Rules

LAIF is a Vite React SPA with a separate Express/Mongo backend.

## Architecture

- React Router owns navigation.
- React Query owns server state.
- Zustand owns existing local/client state.
- Express owns APIs.
- Mongo documents owned by users must always be scoped by authenticated userId.
- Zod validates external input.
- JWT/cookie auth is authoritative.
- OpenRouter may select only allowlisted validated tools.
- AI tool identity always comes from server auth context.

## Engineering Rules

1. Execute one numbered task at a time.
2. Inspect before editing.
3. Make the smallest safe diff.
4. No unrelated refactors.
5. Never weaken security for development convenience.
6. Never trust userId from request bodies.
7. Never trust AI tool arguments without Zod validation.
8. Never allow arbitrary Mongo operators from AI input.
9. Never place OpenRouter keys in frontend VITE variables.
10. 401 and 403 are different.
11. Network/5xx errors are not auth failures.
12. Do not aggressively cache index.html.
13. Add regression tests for every security bug.
14. Run relevant tests/typecheck after every task.
15. Stop after the requested task.

## Completion Report

TASK:
STATUS:

Files inspected:
Files changed:
Behavior before:
Behavior after:
Commands run:
Tests:
Build/typecheck:
Risks:
Acceptance criteria:
```

---

# 8. Final Principle

Do not define “done” by frontend feature percentage.

For LAIF:

```text
production-ready
=
user isolation
+ real auth
+ validated inputs
+ tested dangerous paths
+ stable Vite deployment
+ working AI core
+ honest feature availability
```

Everything else is secondary.
