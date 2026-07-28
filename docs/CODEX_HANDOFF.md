# Codex Backend Handoff

## Current state

Phases 2–5 of the PostgreSQL backend track are implemented:

- all active Express routes now use Prisma instead of Mongoose;
- the PostgreSQL schema and initial SQL migration are complete;
- the initial migration is applied to the project's primary Prisma Postgres
  database;
- the backend is deployed to Prisma Compute on the production `main` branch;
- live health and PostgreSQL-backed login lookup smoke tests pass.

Live backend:

`https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build`

Health:

`https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build/health`

Prisma resources:

- Project: `proj_cms57bdgy02wx6lf4xyqw7yas`
- App: `cps_dqyymmjqlclmt8jako8x3blz`
- Deployment: `cpv_k49a6o5jwlxb1wbasp59s8z4`
- Region: `ap-southeast-1`
- Branch: `main` (production)

## Backend work completed

- Converted auth, users, tasks, habits, folders, lists, list groups, workflows,
  workflow columns, Kanban sections, calendar, events, reminders, focus,
  Pomodoro, chat sessions, memories, notifications, devices, push
  subscriptions, and Google integration to Prisma.
- Preserved public `_id` response fields and embedded child shapes.
- Added explicit API-to-Prisma enum translation for task status and reminder
  types.
- Preserved fractional task effort and Kanban ordering with PostgreSQL floating
  point columns.
- Added required ownership checks for all mutations and related task/list/
  workflow links.
- Fixed the folder-task cross-user update vulnerability.
- Device and push credentials can no longer be reassigned between users.
- Memory-to-task links must reference a task owned by the same user.
- Workflow column updates now retain matching rows and their task assignments.
- Events with no end date default to their start date; invalid date ranges are
  rejected.
- Google OAuth state is signed, expiring, stored in PostgreSQL, and consumed
  atomically once.
- Production cookies use `Secure` and `SameSite=None`.
- Cookie-authenticated writes enforce the configured frontend Origin.
- `/api` and `/api/v1` share the same public authentication policy.
- Device registration now requires authentication.

## Data migration

The migration runner is:

`npm run migrate:postgres`

It defaults to dry-run mode and provides:

- collection and per-user totals;
- ownership and relationship validation;
- duplicate-user detection;
- legacy Habit-to-Task conversion;
- embedded-child normalization;
- deterministic rejection reporting;
- an explicit `--apply` gate.

The local `MONGODB_URI` currently points to the placeholder
`cluster.mongodb.net`, so no source data could be read or imported. The
PostgreSQL schema is live but starts without migrated MongoDB application data.
Run the dry run again with the real MongoDB URL before importing any historical
data.

## Command Code frontend actions

1. Set:

   `VITE_API_URL=https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build`

2. Make login and signup requests include:

   `credentials: 'include'`

3. Route every protected request through `src/lib/api/client.ts`, or ensure
   every remaining raw `fetch` call also includes `credentials: 'include'`.

4. After the Vercel production URL is known, give that exact origin to Codex so
   `CORS_ORIGINS` can be set in Prisma Compute and the backend can be
   redeployed. Do not use a wildcard with credentialed requests.

5. Run the browser login and core task/habit smoke journey against the deployed
   frontend and backend.

Until step 4, the backend defaults to localhost-only CORS. Its health endpoint
and direct server calls work, but the production browser frontend should not be
considered launch-ready.

## Verification

Latest backend verification:

- Prisma schema validation: passed
- Prisma client generation: passed
- TypeScript: passed
- Backend tests: 51/51 passed
- Backend build: passed
- Prisma Compute local build: passed
- PostgreSQL migration deployment: passed
- Live `/health`: HTTP 200 `{ "status": "ok" }`
- Live unauthenticated task boundary: HTTP 401
- Live PostgreSQL-backed unknown-user login: HTTP 401

## Remaining known compatibility decisions

- The legacy `KanbanSection` API remains separate from workflow columns.
  `Task.sectionId` intentionally references workflow columns.
- Habit archive compatibility maps archived habits to `dropped` and restored
  habits to `todo` because there is no separate habit archive column.
- Task hierarchy deletion now cascades through descendants rather than leaving
  orphaned grandchildren.
- The old Mongoose models remain only for migration reference; runtime routes
  do not import them.
- Production dependency audit still reports advisories through the existing
  Firebase/Mongoose dependency tree. Prisma packages were not the source.

## Repository layout

`laif-api` is a nested Git repository. Commit backend changes from inside
`laif-api`; commit the documentation files from the parent repository. No
commit or push was created by Codex.
