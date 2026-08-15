# Overnight stabilization handoff

Date: 2026-08-16  
Scope: Life OS frontend, API, database migrations, release safety, and critical browser journeys

## Executive decision

The integration work is substantially implemented and committed, but production backend deployment remains **STOP-SHIP**.

The production release must not proceed until all of the following are true:

1. Every value that appeared in the tracked backend `.env.production` file is rotated.
2. A production database backup is captured and restore ownership is confirmed.
3. All migrations, including `20260816102000_add_focus_custom_presets`, apply from zero and against a production-like snapshot.
4. The backend integration branch is deployed before the dependent frontend.
5. HTTPS staging proves cookies, credentialed CORS, CSRF/Origin policy, logout, and Google OAuth.

## Current branch and deployment state

| Surface | Branch / commit | State |
| --- | --- | --- |
| Frontend production branch | `main` / `6c10873` | Pushed by a concurrent worker; omits the reviewed task-route, test, lint, handoff, and preset-control follow-ups |
| Frontend reviewed continuation | `codex/full-mobile-frontend-integration` / `afc6cbf` | Local only; includes the task-route regression fix, lint/test hardening, and accessible preset controls |
| Backend integration branch | `codex/full-mobile-api-integration` / local `5032043` | Remote integration branch stops at `ff80544`, but the same local commit was pushed to `main` by a concurrent worker |
| Backend production branch | `origin/main` / `5032043` | Advanced at 03:17 IST by a concurrent process; API health is green, but platform deployment and migration state are not proven |
| Visible production frontend | `https://laif-iota.vercel.app` | At the last read-only check, still served the older `/assets/index-CLtgN50F.js` build |

The production deployment state is therefore not controlled or fully verified. The branch contracts are now nominally compatible, but frontend `main` omits reviewed follow-ups and the backend release crossed the safety gate before secret rotation and migration proof. Pause automatic frontend promotion until backend commit/migration identity is confirmed. If that cannot be done safely, revert the runtime frontend commits after `69bfbbc` with a normal `git revert` commit. Do not rewrite history.

## Completed implementation

### Release safety and QA

- Removed the tracked backend production environment file and added a tracked-secret scanner.
- Added migration verification, a loopback-only E2E safety guard, an isolated schema harness, CI quality gates, and critical Playwright configuration.
- Added a real new-user browser journey covering signup, onboarding, default-priority task persistence, Focus completion, logout, deep-link login, and durable task reload.
- Added an isolated Google OAuth browser contract.

### Identity and onboarding

- New users are always routed through onboarding while the original deep link is preserved.
- Onboarding now persists name, priorities, calendar choice, timezone, email choice, terms version/acceptance, and completion server-side.
- Protected routes enforce `onboardingRequired`.
- Getting Started checklist progress is server-backed with rollback on failed saves and serialized UI writes.

### Tasks, habits, Focus, and daily rituals

- Task create accepts the UI's no-priority value and persists it as `null`.
- Task updates include cached `expectedVersion`, store the server winner, and roll back on conflict/failure.
- Task and habit deletes no longer report optimistic success after an HTTP failure.
- Focus completion is exactly-once in the UI and persists a durable session/record.
- Custom timer mode selection now uses real accessible radio controls and enforces the API duration boundary in component tests.
- Recurrence handles month-end/leap-day clamping; reminders roll forward and use the user's timezone.
- Morning Plan and Shutdown are persisted.
- Close Day is one serializable backend transaction with an idempotent command ID; changed retry payloads receive a new command ID.

### Chat, statistics, sync, and mobile API

- Chat now has one JSON contract; the backend owns session/message persistence and user scoping.
- Statistics overview/task-period endpoints and UI are aligned; ownership, invalid dates, double-counting, and local-date on-time rules are tested.
- Sync uses stable opaque cursors, deterministic paging, and tombstones.
- Attachments enforce ownership, MIME allowlisting, strict base64, a 3 MB cap, and no-sniff responses.
- Mobile matrix fields, reminders, recurring tasks, notification schedules, and Focus presets are represented in the API.
- Custom Focus presets now have a real migration, bounded storage, serializable mutations, invariant validation, and array-valued JSON.

## Verification evidence

### Frontend integration branch

- `npm run lint`: pass, zero warnings.
- `npm run typecheck`: pass.
- `npm test`: 165/165 pass across 14 test files.
- `npm run build`: pass, production Vite build.

### Backend integration branch

- `npm run typecheck`: pass.
- `npm run build`: pass.
- `npx prisma validate`: pass.
- `npm run security:secrets`: pass for tracked files.
- `npm test`: 153/153 pass across 19 test files.

### Database and browser

- At the final read-only production check, `/health` and `/ready` were green and the database reported connected, but those endpoints do not identify the deployed commit or migration level.
- The visible production frontend still served `/assets/index-CLtgN50F.js`, not the newer `main` or reviewed continuation build.
- The first 14 migrations applied successfully from zero to an isolated PostgreSQL schema before the Focus preset migration was added.
- The final preset migration is simple and reviewed, but still requires a full fresh-database run on stable PostgreSQL.
- Playwright environment and authentication-boundary tests passed.
- Google OAuth passed in isolation.
- The new-user journey reached persisted onboarding, task create/reload, and exactly one Focus record in one run.
- A final combined green run was blocked when the local Prisma development database stopped listening; logs showed PostgreSQL connection termination/P1017 rather than a browser assertion defect.

## Remaining work, MECE

### P0 — Owner/security actions

- Rotate database credentials, JWT signing secret, Google client secret, and token-encryption key.
- Invalidate any other credential that was present in the tracked environment file.
- Remove the sensitive file from reachable Git history according to the incident runbook.
- Capture and verify a production database backup before migration.

### P0 — Release coordination

- Confirm which automation or operator pushed backend `5032043` to `main`, whether the platform deployed that exact commit, and whether all 15 migrations ran.
- Pause automatic promotion of frontend `main` while the backend deployment identity and database state are unverified.
- Decide whether to revert frontend `main` to the previously deployed runtime or promote the reviewed frontend continuation only after every backend gate passes.
- Push the local frontend continuation branch after destination approval.
- Apply all migrations to stable ephemeral PostgreSQL, then to staging, before production.
- Run the critical Playwright suite against the built frontend, real API, and stable disposable PostgreSQL.

### P0 — Staging proof

- Verify `Secure; SameSite=None` cookie behavior over HTTPS.
- Verify allowed and disallowed Origins, credentialed writes, CSRF handling, logout cookie clearing, refresh persistence, and expired sessions.
- Complete a provider-sandbox/manual Google OAuth callback test with the registered production redirect URI.

### P1 — Product promise decisions

- Publish real Terms of Use and Privacy Policy destinations; onboarding currently records acceptance but cannot invent legal content.
- Decide whether deterministic local-assistant responses satisfy the Chat promise or whether an external LLM is required.
- Add a real notification delivery worker and provider configuration; stored schedules alone do not deliver notifications.
- Move attachments to object storage before material production scale.
- Keep collaboration, MCP, Alexa, tags/upload/template actions, and other incomplete surfaces hidden or explicitly unavailable until end-to-end contracts exist.

### P1 — Sustainable coverage

- Run 5–7 critical full-stack Playwright journeys on desktop Chromium per PR.
- Keep the larger browser-mocked/responsive suite nightly rather than running every case on every viewport per PR.
- Add staging post-deploy smoke and rollback automation.
- Continue removing conditional/vacuous browser assertions and fixed sleeps from the legacy suite.

## Recommended release order

1. Freeze further automatic promotion and identify the backend `main` push/deployment.
2. Rotate secrets and complete the incident checklist.
3. Back up production data.
4. Run all migrations from zero on stable ephemeral PostgreSQL and confirm production migration state.
5. Deploy or reconcile backend `5032043` in staging, then run API, migration, and critical browser gates.
6. Deploy frontend `afc6cbf` to staging.
7. Prove HTTPS auth/CORS/OAuth behavior.
8. Promote only the already-verified backend/frontend artifacts in order.
9. Run a canary smoke and keep the rollback commit ready.
