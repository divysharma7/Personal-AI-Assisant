# PostgreSQL schema decisions

This document records the decisions behind the initial Prisma schema in
`laif-api/prisma/schema.prisma`. The initial migration is stored at
`laif-api/prisma/migrations/00000000000000_init/migration.sql` and has been
applied to the project's primary PostgreSQL database.

The schema follows Prisma ORM 7 syntax. It uses the ESM-first `prisma-client`
generator and generates into `laif-api/src/generated/prisma`. The datasource
block declares only the PostgreSQL provider; `DATABASE_URL` is configured in
`laif-api/prisma.config.ts`.

## Scope

The schema covers the active application domains:

- users and authentication/integration settings
- tasks, task hierarchy, habits, comments, reminders, activities, and completions
- lists, list groups, collaborators, workflows, and workflow columns
- calendar events, external calendar events, and reminders
- connected calendar accounts, per-account calendars, and active/passive behavior
- focus and Pomodoro sessions
- chat sessions and messages
- memories
- notification schedules and push devices/subscriptions
- the legacy global Kanban section endpoint

Contacts, Notes, and Journal are intentionally absent because those features
were removed from the product.

## Identity strategy

All primary keys are PostgreSQL `TEXT` and new records use `cuid()` defaults.

The repository/API layer will continue serializing `id` as `_id` until the
frontend contract is intentionally revised.

## Ownership and deletion

Every user-owned row has a required foreign key to `users.id`. Deleting a user
cascades through owned data, including devices and web-push subscriptions.

Calendar accounts and calendars each carry `user_id`. Cached external events
retain their direct `user_id` ownership and additionally reference the account
and calendar that produced them.

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

The following repeatable data is represented by relational child tables:

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

Chat messages use generated IDs and an explicit `position` to preserve order.

Habit completions use a PostgreSQL `DATE` and are unique per `(task_id, date)`.

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

## Compatibility models

Habits are represented only as `tasks` rows with `is_habit = true`; there is no
second habit table.

`kanban_sections` is retained only because `/kanban-sections` is still routed.
Current workflow screens map the API `Task.sectionId` field to
`tasks.section_id -> workflow_columns.id`. The legacy endpoint can be retired
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

The additive calendar-inventory migration also enforces:

- active Agenda calendars must be visible
- availability behavior matches active/passive behavior
- calendar sort order is non-negative
- one non-hidden default write calendar per user

## Data initialization

The product starts with an empty PostgreSQL database and creates records through
the authenticated API. Historical MongoDB data is intentionally not imported.
