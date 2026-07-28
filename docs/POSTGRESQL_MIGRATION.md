# PostgreSQL Migration Plan

## Decision

LAIF will move its persistent application data from MongoDB/Mongoose to
PostgreSQL using Prisma ORM.

As of 2026-07-29, the initial PostgreSQL migration is applied and the
Prisma-backed API is deployed to Prisma Compute. Historical MongoDB data has
not been imported because the configured source URI is a placeholder.

This decision supersedes the older "MongoDB only" invariant in `CLAUDE.md` for
the migration work described here. MongoDB remains the live source of truth
until the verification and cutover gates below are complete.

The first phase is intentionally non-destructive:

- no production database is changed;
- no MongoDB collection is removed;
- no production traffic is switched;
- existing API paths and response shapes remain stable;
- existing MongoDB ObjectId values are preserved as PostgreSQL string IDs.

## Scope

The target schema covers the active backend capabilities:

- users and preferences;
- tasks, including canonical habits;
- lists, list groups, and workflows;
- events and reminders;
- focus and Pomodoro sessions;
- chat sessions and messages;
- memories;
- external calendar events;
- notification schedules;
- device and web-push registrations.

Contacts, notes, and journals are retired features and are not included in the
target schema.

The standalone legacy `Habit` model is deprecated. A habit is represented by a
task with `isHabit = true`; legacy habit records must be transformed into tasks
during data migration.

## Identity and compatibility rules

1. MongoDB ObjectIds are stored unchanged as PostgreSQL `String` primary keys.
   New records may continue using 24-character ObjectId-compatible IDs during
   the compatibility period.
2. Every user-owned record must have a non-null `userId`.
3. Every read, update, and delete must include the authenticated `userId`.
4. Existing JSON responses continue to expose `_id` strings. The repository or
   serializer layer maps Prisma `id` to `_id`; clients do not need to change.
5. Existing endpoint paths, status codes, and validation errors remain stable
   unless an API-contract change is explicitly approved.
6. Dates are stored as PostgreSQL timestamps and returned in the same ISO-8601
   form clients currently receive.

## Target model mapping

| Current MongoDB model/data | PostgreSQL target | Migration notes |
| --- | --- | --- |
| `User` | `User` | Preserve ID and auth identity fields. Keep preference objects as JSON initially to avoid an unrelated API change. |
| `Task` | `Task` | Canonical task and habit record. Preserve flexible scheduling fields as JSON where their shape is not yet stable. |
| Embedded task comments | `TaskComment` | Required task and user foreign keys. |
| Embedded task reminders | `TaskReminder` | Required task and user foreign keys. |
| Embedded habit completions | `HabitCompletion` | One row per completion occurrence; indexed by task and date. |
| Embedded task activity | `TaskActivity` | Append-only task history; retain action metadata as JSON. |
| Legacy `Habit` | `Task` | Transform to `isHabit = true`; do not create a second habit table. |
| `List` | `List` | Preserve list type and flexible block configuration. |
| Embedded list collaborators | `ListCollaborator` | Explicit membership table with user ownership. |
| `ListGroup` | `ListGroup` | Groups belong to a user; lists may reference a group. |
| `Workflow` | `Workflow` | User-owned workflow. |
| Embedded workflow columns | `WorkflowColumn` | Ordered child rows; task `sectionId` references a column where applicable. |
| `KanbanSection` | `KanbanSection` | Retained until its overlap with workflow columns is resolved. |
| `Event` | `Event` | User-owned calendar event. |
| Embedded event comments | `EventComment` | Required event and user foreign keys. |
| `Reminder` | `Reminder` | User-owned reminder. |
| Embedded reminder comments | `ReminderComment` | Required reminder and user foreign keys. |
| `FocusSession` | `FocusSession` | Optional task relation, always required user relation. |
| `PomodoroSession` | `PomodoroSession` | Optional task relation, always required user relation. |
| `ChatSession` | `ChatSession` | User-owned session. |
| Embedded chat messages | `ChatMessage` | Ordered child rows; tool payloads remain JSON. |
| `Memory` | `Memory` | Make currently optional ownership required; attributes remain JSON. |
| `ExternalCalendarEvent` | `ExternalCalendarEvent` | Unique per user, provider/source, and external event ID. |
| `NotificationSchedule` | `NotificationSchedule` | User-owned schedule; provider payload remains JSON. |
| `Device` | `Device` | Add explicit user ownership before cutover. |
| `WebPushSubscription` | `WebPushSubscription` | Add explicit user ownership before cutover. |

## Relationship and deletion policy

- Deleting a user cascades to all user-owned application records.
- Deleting a task cascades to its comments, task reminders, completion history,
  and activity history.
- Deleting a chat session, event, reminder, workflow, list, or list group
  cascades to its true child records.
- Optional organizational links such as task-to-list, task-to-workflow,
  task-to-section, and session-to-task use `SET NULL` so deleting a container
  does not silently delete the user's work.
- Cross-user relationships are rejected in the application layer and checked
  during import.

## Required indexes

Indexes should support the route filters already used by the application:

- every user-owned table: `userId`;
- tasks: `(userId, status)`, `(userId, isHabit)`, `(userId, dueDate)`,
  `(userId, listId)`, and `(userId, workflowId, sectionId)`;
- habit completions: `(taskId, completedAt)`;
- lists and groups: `(userId, position)`;
- workflow columns: `(workflowId, position)`;
- events and reminders: `(userId, startAt)` or `(userId, dueAt)`;
- chat sessions: `(userId, updatedAt)`;
- memories: `(userId, category)` and `(userId, updatedAt)`;
- external calendar events: unique
  `(userId, source, externalId)`;
- device tokens and push endpoints: unique within the owning user.

## Migration phases

### Phase 0 — Freeze the contract

- Record the active endpoint and response contract.
- Add backend integration coverage for authentication, task CRUD, and habit
  behavior.
- Confirm retired contacts, notes, and journal routes are absent.

Exit gate: backend typecheck, tests, and build pass.

### Phase 1 — Add Prisma alongside Mongoose

- Add the Prisma schema and client configuration.
- Add `DATABASE_URL` to the backend environment contract.
- Generate and validate a local initial migration without applying it to
  production.
- Keep existing Mongoose models and live request paths unchanged.

Exit gate: Prisma schema validates and produces deterministic migration SQL.

### Phase 2 — Introduce repository adapters

- Put persistence behind repositories that return the existing API shape.
- Implement PostgreSQL repositories one domain at a time.
- Continue serializing `id` as `_id`.
- Start with users and tasks/habits, then lists/workflows, calendar/reminders,
  sessions, chat/memory, and notifications.

Exit gate: the same integration tests pass against both persistence adapters.

### Phase 3 — Dry-run data migration

- Export MongoDB records from a point-in-time snapshot.
- Transform embedded arrays into relational child rows.
- Convert legacy habits into canonical task rows.
- Reject or quarantine records with missing owners or cross-user references.
- Import into a non-production PostgreSQL database.

Exit gate: no unreviewed rejects and all validation checks pass.

### Phase 4 — Reconciliation

For every entity compare:

- total count and per-user count;
- distinct IDs;
- null counts for required fields;
- orphaned foreign-key count;
- timestamp minimum/maximum;
- task/habit completion totals;
- deterministic hashes of important scalar fields.

Manually sample user journeys for login, task CRUD, habit completion, lists,
calendar, reminders, focus sessions, and chat history.

Exit gate: approved reconciliation report and rollback rehearsal.

### Phase 5 — Production cutover

- Take a final backup.
- Put writes into a short maintenance window or use an approved dual-write
  mechanism.
- Migrate the final delta.
- point the backend at PostgreSQL;
- run smoke tests and reconciliation;
- release traffic gradually.

Exit gate: error rate, latency, and data checks remain healthy through the
observation window.

### Phase 6 — Retire MongoDB

MongoDB is removed only after the rollback window closes and a restorable backup
has been verified. Mongoose code and dependencies are then removed in a separate
cleanup change.

## Rollback

Before cutover, rollback means continuing to use MongoDB. During cutover, keep
MongoDB unchanged and retain the final snapshot. If smoke tests, reconciliation,
or monitoring fail:

1. stop PostgreSQL writes;
2. route the backend back to MongoDB;
3. retain PostgreSQL for diagnosis;
4. reconcile any writes accepted during the cutover window before retrying.

The rollback procedure must be rehearsed against a staging snapshot before a
production migration.

## Security gates

- `PATCH /folders/:id/tasks` must scope both the folder and task operations to
  the authenticated user.
- The Google OAuth callback must verify a signed, single-use state value rather
  than trusting `state` as a user ID.
- `Device` registration must be authenticated or safely associated with the
  authenticated user before PostgreSQL cutover.
- `WebPushSubscription` must gain required `userId` ownership.
- `Memory.userId` must become required.
- Public-route matching must apply consistently to both `/api` and `/api/v1`.
- All PostgreSQL repository update/delete calls must filter by both record ID
  and authenticated user ID.
- Database credentials must be stored as deployment secrets, never committed.
- Migration tooling must use least-privilege database roles and TLS.

## Open decisions before production migration

1. Whether new IDs remain ObjectId-compatible strings or move to UUIDs after
   the compatibility period.
2. Whether flexible task scheduling and list block data should remain JSON or
   be normalized after the first safe cutover.
3. Whether `KanbanSection` is still active or can be merged into
   `WorkflowColumn`.
4. How unauthenticated device registration will be replaced without breaking
   notification onboarding.
5. Whether production cutover uses a brief write freeze or temporary dual
   writes.

None of these decisions blocks the initial schema, tests, or a staging dry run.
