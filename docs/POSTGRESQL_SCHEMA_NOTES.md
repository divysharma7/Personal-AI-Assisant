# PostgreSQL schema decisions

This document records the decisions behind the initial Prisma schema in
`laif-api/prisma/schema.prisma`. An initial migration has been generated at
`laif-api/prisma/migrations/00000000000000_init/migration.sql`, but it has not
been applied to a database.

The schema follows Prisma ORM 7 syntax. It uses the ESM-first `prisma-client`
generator and will generate into `laif-api/src/generated/prisma`. The
datasource block declares only the PostgreSQL provider; `DATABASE_URL` belongs
in `laif-api/prisma.config.ts`, which the backend integration owner will add
alongside the Prisma packages and PostgreSQL driver adapter.

## Scope

The schema covers every active Mongoose model as of the PostgreSQL migration:

- users and authentication/integration settings
- tasks, task hierarchy, habits, comments, reminders, activities, and completions
- lists, list groups, collaborators, workflows, and workflow columns
- calendar events, external calendar events, and reminders
- focus and Pomodoro sessions
- chat sessions and messages
- memories
- notification schedules and push devices/subscriptions
- the legacy global Kanban section endpoint

Contacts, Notes, and Journal are intentionally absent because those features
were removed from the product.

## Identity strategy

All primary keys are PostgreSQL `TEXT`. Existing 24-character MongoDB ObjectId
strings must be copied without modification. New records use `cuid()` defaults.
This avoids a high-risk ID rewrite during the initial cutover and preserves
frontend URLs, JWT user IDs, embedded references, and API response identifiers.

The repository/API layer will continue serializing `id` as `_id` until the
frontend contract is intentionally revised.

## Ownership and deletion

Every user-owned row has a required foreign key to `users.id`. Deleting a user
cascades through owned data. This includes `devices` and
`web_push_subscriptions`, which currently lack ownership in MongoDB; their
routes must require authentication before PostgreSQL cutover.

Parent records cascade to true child/history rows:

- task -> comments, reminders, completions, activities, and child tasks
- event/reminder -> comments
- workflow -> columns
- chat session -> messages
- list -> collaborator memberships

Optional organizational links use `ON DELETE SET NULL`:

- task -> list, workflow, workflow column
- focus/Pomodoro session -> task
- memory -> linked task
- list -> list group

Soft-deleted lists remain represented by `lists.deleted_at`.

## Normalized data

The following MongoDB embedded arrays become relational child tables:

- `Task.comments` -> `task_comments`
- `Task.reminders` -> `task_reminders`
- `Task.completions` -> `habit_completions`
- `Task.activities` -> `task_activities`
- `Event.comments` -> `event_comments`
- `Reminder.comments` -> `reminder_comments`
- `ChatSession.messages` -> `chat_session_messages`
- `Workflow.columns` -> `workflow_columns`
- `List.collaborators` -> `list_collaborators`
- `User.pushDevices` -> `user_push_devices`

Chat messages gain generated IDs and an explicit `position` because their
MongoDB schema disabled subdocument IDs and relied on array ordering.

Habit completions use a PostgreSQL `DATE` and are unique per `(task_id, date)`.
Migration must parse the legacy `YYYY-MM-DD` strings without timezone shifting.

## JSONB and arrays

JSONB is retained where the data is intentionally flexible or document-shaped:

- task rich-text `notes`
- task `habit_frequency`
- list editor `blocks`
- memory `attributes`
- notification `payload`
- user habit, focus, and calendar preferences

Tags remain PostgreSQL `TEXT[]` because there is no shared tag entity or
tag-management behavior in the current product.

## Legacy models

The standalone MongoDB `Habit` collection is not represented as a second table.
Its records should be transformed into `tasks` rows with `is_habit = true`,
then its completion strings should be inserted into `habit_completions`.
The active `/habits` API already reads and writes habits through `Task`.

`kanban_sections` is retained only because `/kanban-sections` is still routed.
Current workflow screens use embedded workflow-column IDs in `Task.sectionId`;
the relational target maps that API field to
`tasks.section_id -> workflow_columns.id`. Before importing, any task
`sectionId` that belongs to the legacy global Kanban collection must either be
mapped to a workflow column or cleared. The legacy endpoint can then be retired
in a later cleanup.

## Enum compatibility

Prisma enum member names cannot contain hyphens. The database values preserve
the legacy strings with `@map`, for example:

- `TaskStatus.in_progress` -> `in-progress`
- `TaskReminderType.before_start` -> `before-start`
- `TaskReminderType.on_day_at` -> `on-day-at`

The API repository/serializer must translate Prisma enum member names back to
the existing wire values so frontend contracts do not change during migration.

## Constraints that require migration SQL

Prisma models the core keys and relations, but the reviewed SQL migration
should add CHECK constraints for invariants that Prisma schema syntax cannot
express:

- event and external-event end time is not before start time
- scheduled task end time is not before start time
- habit reminder and task reminder time strings match `HH:MM`
- habit completion `value` is non-negative
- focus/Pomodoro durations and pause totals are non-negative
- task depth/order and workflow/list ordering values are non-negative
- `workflow_id` and `section_id` agree when both are present
- only one non-deleted inbox list exists per owner (partial unique index)

The reviewed initial SQL migration adds these CHECK constraints, a unique index
on `lower(username)`, and a partial unique index that permits only one active
inbox per owner. The workflow/column agreement check must remain in the import
validator and application repository because a PostgreSQL CHECK constraint
cannot query the referenced workflow-column row.

## Import prerequisites

Before applying foreign keys, the data migration must report and resolve:

- records whose `userId`/`ownerId` does not match a user
- devices and web-push subscriptions that cannot be attributed to a user
- tasks referencing missing parents, lists, workflows, or workflow columns
- list collaborators referencing missing users
- duplicate usernames ignoring case
- duplicate external calendar identities
- duplicate habit completions for the same task/date
- duplicate list-group titles for one owner
- workflow-column order collisions

The production MongoDB database remains the rollback source until count,
ownership, and relationship checks pass for every user.
