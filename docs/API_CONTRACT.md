# LAIF API contract

This document records the HTTP contract implemented by the Express API before
the PostgreSQL rewrite. The current route handlers, validation schemas, and
frontend API clients are the source of truth.

It is a compatibility specification, not an endorsement of every current
behavior. Items marked **migration correction** are defects or security gaps
that must be fixed rather than preserved.

## Transport and base paths

- Health check: `GET /health`
- Canonical application prefix used by the frontend: `/api`
- Backward-compatible alias mounted by the server: `/api/v1`
- Request and response bodies are JSON unless an endpoint redirects.
- Request bodies are limited to 5 MB.
- Browser requests use credentials (`credentials: include`).
- Production CORS allows configured origins and credentials.
- Supported methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`.
- General rate limit: 100 requests per minute.
- Login and signup additionally allow 10 attempts per minute.

Both `/api/...` and `/api/v1/...` must continue to resolve during the
PostgreSQL transition. New frontend code should keep using `/api/...`.

### Health response

`GET /health` is public and returns HTTP 200:

```json
{ "status": "ok" }
```

## Authentication and ownership

The API accepts a JWT in this order:

1. `pim_token` HTTP-only cookie
2. `Authorization: Bearer <token>`
3. `x-api-key: <token>`

JWTs use HS256, contain `userId`, `username`, and optionally `name`, and expire
after 24 hours. Login and signup also return the token in the JSON response.
In production the authentication cookie is `Secure`, `SameSite=Lax`, path `/`,
and has a 24-hour maximum age.

The following `/api` endpoints are public:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `POST /api/posthook_listener`
- `POST /api/devices/register`
- `POST /api/alexa`

All other endpoints require authentication. In development only,
`DEV_USER_ID` may supply the user identity when no valid token is present.

Every user-owned lookup, mutation, and delete in the PostgreSQL implementation
must include the authenticated user ID. Ownership fields currently named
either `userId` or `ownerId` are both derived from authentication and must
never be accepted from request bodies.

> **Migration correction:** the middleware's public-path list currently
> recognizes `/api/...` but not the equivalent `/api/v1/...` paths. The rewrite
> should apply the same public/protected policy to both prefixes.

## Response conventions

There is no success envelope. Successful endpoints return the resource, an
array, or a small operation result directly.

Current Mongo-backed resources generally include:

- `_id` as a string
- `createdAt` and `updatedAt` as ISO-8601 strings when timestamps are enabled
- embedded arrays and objects in their existing JSON shape
- occasionally Mongo-specific `__v`

The PostgreSQL rewrite must preserve `_id` as the public identifier and keep it
a string. It may stop emitting `__v` after frontend and integration checks
confirm that no consumer uses it. Dates must remain JSON ISO-8601 strings.
JSON field names stay camelCase.

Common operation responses are:

```json
{ "success": true }
```

```json
{ "ok": true }
```

Create endpoints normally return HTTP 201 and the created resource. Login and
signup are exceptions and return HTTP 200.

### Errors

Typed application errors use:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found: <id>"
  }
}
```

Validation errors use HTTP 422 with code `VALIDATION_ERROR`; `details` may be
present. Unhandled errors use HTTP 500 with code `INTERNAL_ERROR`.
Rate-limit errors use HTTP 429 with code `RATE_LIMITED`.

Several handlers currently return legacy string errors:

```json
{ "error": "Unauthorized" }
```

These appear with HTTP 400, 401, 404, 409, or 501 depending on the endpoint.
The frontend accepts both formats and chooses `error.message`, then `error`.
The PostgreSQL rewrite must not change existing status codes or remove support
for either error shape during the initial cutover. A later API version may
standardize errors.

## Payload definitions

Fields not listed below are stripped by Zod on validated endpoints. `optional`
means the field may be omitted; `nullable` means JSON `null` is accepted.

### Task input

- `title`: string, 1-500 characters
- `priority`: optional/nullable `low | medium | high`
- `status`: optional `backlog | todo | in-progress | done | dropped`
- `dueDate`, `scheduledStart`: optional/nullable string
- `scheduledEnd`, `listId`, `description`, `parentId`, `sectionId`,
  `workflowId`: optional/nullable string
- `estimatedEffort`, `kanbanOrder`: optional number
- `tags`: optional string array
- `repeat`: optional/nullable string
- `reminders`: optional array of:
  - `id`: string
  - `type`: `before-start | on-day-at | absolute`
  - `offsetMinutes`: optional number
  - `timeOfDay`, `absoluteTime`: optional/nullable string
  - `sent`: optional boolean

Task update accepts a partial task input.

### Habit input

- Create: `name` (required, 1-200), `description` (max 1000),
  `frequency` (`daily | weekdays | weekly | custom`), `customDays` (integers
  0-6), `color` (max 20), `icon` (max 50), and `order` (number).
- Update: partial create input plus optional `archived`.
- Check-in: `date` (`YYYY-MM-DD`) and
  `status` (`achieved | unachieved | skipped | frozen`) are required;
  `value` is optional and `reason` is optional with a 500-character maximum.

### Focus input

- Create session: optional/nullable `taskId`, optional integer
  `plannedDurationMin` (1-480), and optional integer `plannedBreakMin` (0-120).
- Session action: required `action`
  (`pause | resume | extend | complete | cancel`), optional integer
  `additionalMin` (1-480), optional `endedReason`
  (`timer_ended | user_completed | user_cancelled`), and optional
  `postSessionNote` (max 200).

### Event input

- `title`: required string, 1-500 characters
- `description`, `endDate`, `location`, `recurrence`: optional/nullable string
- `startDate`: required non-empty string
- `allDay`: optional boolean
- `color`: optional string, max 20
- `notifyBefore`: optional/nullable non-negative integer

Event update accepts a partial event input.

### List and folder input

- Create list: optional `title` (max 200), `type` (max 50), `icon` (max 50),
  `coverImageUrl` (max 2000), nullable `groupId`, `isInbox` (boolean), and
  arbitrary JSON `blocks`.
- Update list: optional `title`, `icon`, `coverImageUrl`,
  `pinnedToFavorites`, `hideCompletedTasks`, nullable `groupId`, `isPrivate`,
  `collaborators` (string array), and `type`.
- Update list blocks: required arbitrary JSON `blocks`.
- Create folder: required `title` (1-200), optional `icon`, nullable `groupId`,
  optional `groupTitle`, `coverImageUrl`, and `isPrivate`.
- Update folder: partial create-folder input.

### Workflow and organization input

- Workflow column: required `id`, required `title` (1-100), integer `order`
  >= 0, optional/nullable `color`, optional/nullable integer `wipLimit` >= 1.
- Create workflow: required `name` (1-200), required `templateType`
  (`kanban | sprint | sales | content | matrix | custom`), optional `icon`,
  `color`, `columns`, and `order`.
- Update workflow: partial create input plus optional `archived`.
- Create Kanban section: required `title` (1-200).
- Create list group: required `title` (1-200).
- Update list group: optional `title` (max 200), integer `order`, and
  `collapsed`.

### Reminder and Pomodoro input

- Create reminder: required `title` (1-500), required non-empty
  `reminderDate`, optional/nullable `description`, optional priority
  (`low | medium | high`), and optional string-array `tags`.
- Update reminder: partial create input.
- Snooze reminder: required integer `snoozeMinutes` (1-10080).
- Create Pomodoro session: required `type` (`focus | break`), positive integer
  `duration`, required non-empty `startedAt`, optional/nullable `taskId`, and
  optional `taskTitle` (max 500).
- Update Pomodoro session: optional/nullable `completedAt` and optional
  `completed`.

### Settings and subscription input

- Focus preferences: any subset of `defaultWorkMin` (1-480),
  `defaultShortBreakMin` (0-120), `defaultLongBreakMin` (0-120),
  `longBreakEveryNSessions` (1-20), `theme`
  (`aurora | minimal | liquid`), `soundOnComplete`, `showInSidebar`, and
  `keyboardShortcutsEnabled`.
- Push subscription: required
  `subscription.endpoint`, `subscription.keys.p256dh`, and
  `subscription.keys.auth`; optional `userAgent`.
- Create chat session: optional `title` (max 200).

## Endpoint inventory

Unless marked public, every endpoint below is authenticated and scoped to the
current user.

### Authentication

| Method and path | Request | Success |
| --- | --- | --- |
| `POST /auth/login` | `username` or `email`, plus `password` | 200 `{ ok, token, username, name }`; sets `pim_token` |
| `POST /auth/signup` | `email`, `password` (minimum 6), optional `name`, optional `username` | 200 `{ ok, token, username, name }`; sets `pim_token` |
| `POST /auth/logout` | none | 200 `{ ok: true }`; clears cookie |
| `GET /auth/me` | none | 200 `{ username, name }` |

Login normalizes username/email to lowercase. Signup defaults `username` to
the supplied email and rejects duplicates with HTTP 409.

### Tasks

| Method and path | Request/query | Success |
| --- | --- | --- |
| `GET /tasks` | none | Task array, newest first; each has `type: "task"` |
| `POST /tasks` | Task input | 201 task with a `created` activity |
| `GET /tasks/:id` | none | Task with `type: "task"` |
| `PUT /tasks/:id` | Partial task input | Updated task |
| `PATCH /tasks/:id` | Partial task input | Updated task; status changes append an activity and `done` sets `completedAt` |
| `DELETE /tasks/:id` | none | `{ success: true }`; direct subtasks are also deleted |
| `PATCH /tasks/:id/schedule` | `scheduledStart`, optional/nullable `scheduledEnd` | Updated task |
| `PATCH /tasks/:id/unschedule` | ignored/empty body | Updated task with both scheduling fields null |
| `POST /tasks/:id/comments` | `{ text: string }` | Updated task |
| `POST /tasks/reorder` | `taskId`, `kanbanOrder`, optional/nullable `sectionId`, optional `status`, optional/nullable `dueDate` | Updated task |
| `PATCH /tasks/:id/indent` | ignored/empty body | Task moved under its preceding sibling |
| `PATCH /tasks/:id/outdent` | ignored/empty body | Task moved up one nesting level |
| `PATCH /tasks/:id/reparent` | optional/nullable `parentId` | Reparented task |

Task identity and relationship fields remain string IDs in responses.
`parentId` is nullable. Indent/outdent/reparent must preserve current depth
calculation and user scoping.

### Habits

Habits are currently stored as tasks where `isHabit` is true. The separate
legacy `Habit` model is not read or written by these routes.

| Method and path | Request/query | Success |
| --- | --- | --- |
| `GET /habits` | none | Habit-task array ordered by `order`, then newest |
| `POST /habits` | Habit create input | 201 habit-task |
| `GET /habits/today` | none | Due habit-tasks with computed `streakCurrent` and nullable `todayStatus` |
| `GET /habits/stats` | none | `[{ _id, title, streakCurrent, streakBest, completionRate30d }]` |
| `GET /habits/:id` | none | Habit-task |
| `PUT /habits/:id` | Habit update input | Updated habit-task |
| `DELETE /habits/:id` | none | `{ success: true }` |
| `POST /habits/:id/checkin` | Habit check-in input | Updated habit-task with recomputed streak fields |
| `GET /habits/:id/completions` | none | Completion array |

A check-in replaces any existing entry for the same `date`.

### Focus

| Method and path | Request/query | Success |
| --- | --- | --- |
| `GET /focus/sessions` | optional `taskId`, `from`, `to` | Session array, newest first |
| `POST /focus/sessions` | Focus create input | 201 active session; any previous active session is cancelled |
| `GET /focus/sessions/active` | none | Active session or JSON `null` |
| `PATCH /focus/sessions/:id` | Focus action input | Updated session |
| `GET /focus/stats` | none | `{ today, week, total, avgSessionMin }`; period objects contain `sessions` and `totalMin` |

`from` and `to` filter `startedAt` inclusively. Completing or cancelling
computes `actualDurationMin`.

### Calendar projections

| Method and path | Request/query | Success |
| --- | --- | --- |
| `GET /calendar` | none | Combined event, due-date task, and reminder array with `itemType` |
| `GET /calendar/events` | optional `from`, `to`, comma-separated `include` | Scheduled task, external Google event, and completed focus-session array with `calendarType` |
| `GET /calendar/unscheduled` | none | Non-completed tasks with no scheduled start |
| `GET /calendar/overdue` | none | Non-completed tasks whose scheduled start is before now |
| `GET /calendar/capacity` | optional `from`, `to` | `[{ date, scheduledHours }]` |
| `GET /calendar/heatmap` | none | `[{ date, count }]` for completed tasks |

The default `include` is `tasks,habits,google,focus`. The current code handles
`tasks`, `google`, and `focus`; scheduled habits are included through the task
query and get `calendarType: "habit"`.

### Events

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /events` | none | Event array sorted by `startDate` |
| `POST /events` | Event input | 201 event |
| `PUT /events/:id` | Partial event input | Updated event |
| `DELETE /events/:id` | none | `{ success: true }` |
| `POST /events/:id/comments` | `{ text }` | Updated event |

### Lists, folders, and groups

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /lists` | none | Non-deleted list array, newest first |
| `POST /lists` | List create input | 201 list |
| `GET /lists/:id` | none | Non-deleted list |
| `PATCH /lists/:id` | List update input | Updated list |
| `DELETE /lists/:id` | none | Soft-delete; `{ success: true }`; Inbox cannot be deleted |
| `PATCH /lists/:id/blocks` | `{ blocks: <any JSON> }` | Updated list |
| `POST /folders` | Folder create input | 201 `{ list, group, created: { list, group } }` |
| `PATCH /folders/:id` | Folder update input | Updated list/folder |
| `DELETE /folders/:id` | none | `{ deleted: true, folderId }` |
| `PATCH /folders/:id/tasks` | `{ taskId }` | Updated task moved to the folder |
| `GET /list-groups` | none | Group array ordered by `order` |
| `POST /list-groups` | `{ title }` | 201 group; `order` is appended |
| `PATCH /list-groups/:id` | Group update input | Updated group |
| `DELETE /list-groups/:id` | none | `{ success: true }`; lists in the group get `groupId: null` |

“Folders” are list records of type `standard`; there is no separate folder
resource. Creating/updating by `groupTitle` reuses an owned group with that
title or creates one.

### Workflows and Kanban sections

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /workflows` | none | Non-archived workflow array ordered by `order` |
| `POST /workflows` | Workflow create input | 201 workflow |
| `GET /workflows/:id` | none | Workflow |
| `PUT /workflows/:id` | Workflow update input | Updated workflow |
| `DELETE /workflows/:id` | none | `{ success: true }` |
| `POST /workflows/:id/columns` | Workflow column | Updated workflow |
| `PUT /workflows/:id/columns` | Workflow column array | Updated workflow |
| `GET /kanban-sections` | none | Section array ordered by `order` |
| `POST /kanban-sections` | `{ title }` | 201 section; `order` is appended |
| `PUT /kanban-sections/:id` | Currently unvalidated object | Updated section |
| `DELETE /kanban-sections/:id` | none | `{ success: true }`; tasks in it get `sectionId: null` |

Workflow columns are embedded in the API representation even if normalized
into a PostgreSQL table internally. Column IDs are caller-provided strings.

### Reminders and Pomodoro

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /reminders` | none | Reminder array sorted by `reminderDate` |
| `POST /reminders` | Reminder create input | 201 reminder |
| `PUT /reminders/:id` | Reminder update input | Updated reminder |
| `DELETE /reminders/:id` | none | `{ success: true }` |
| `POST /reminders/:id/snooze` | `{ snoozeMinutes }` | Updated reminder with new date and `notified: false` |
| `POST /reminders/:id/comments` | `{ text }` | Updated reminder |
| `GET /pomodoro` | none | Sessions from the previous seven days, newest first |
| `POST /pomodoro` | Pomodoro create input | 201 session |
| `PATCH /pomodoro/:id` | Pomodoro update input | Updated session |

Pomodoro `duration` is stored and returned in seconds.

### Memories

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /memories` | none | Memory array, newest first |
| `POST /memories` | Currently unvalidated object | 201 memory |
| `PUT /memories/:id` | Currently unvalidated object | Updated memory |
| `DELETE /memories/:id` | none | `{ success: true }` |

Existing memory records can expose `type`, `title`, `description`,
`attributes`, `status`, `priority`, `tags`, and `linkedTaskId`.

### Chat

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /chat/sessions` | none | Session summaries containing `title`, timestamps, and `_id` |
| `POST /chat/sessions` | Optional `{ title }` | 201 session |
| `GET /chat/sessions/:id` | none | Full session including messages |
| `PUT /chat/sessions/:id` | Currently unvalidated object | Updated session |
| `DELETE /chat/sessions/:id` | none | `{ success: true }` |
| `POST /chat` | `{ message, sessionId? }` | `{ reply, sessionId }` |

The current `/chat` implementation is a non-streaming placeholder and does
not persist the message.

### Notifications and push

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /notifications` | none | Up to 50 pending schedules, earliest first |
| `POST /push/subscribe` | Push subscription input | `{ ok: true }` |
| `DELETE /push/subscribe` | `{ endpoint }` expected by server | `{ ok: true }` |

Notification records expose `type`, `scheduledFor`, `payload`, `status`,
`skippedReason`, and `sentAt`.

### User settings

| Method and path | Request | Success |
| --- | --- | --- |
| `GET /users/me/focus-preferences` | none | Focus-preferences object |
| `PATCH /users/me/focus-preferences` | Validated focus-preference subset | Updated focus-preferences object |
| `GET /users/me/calendar-preferences` | none | Calendar-preferences object |
| `PATCH /users/me/calendar-preferences` | Currently unvalidated object | Updated calendar-preferences object |
| `GET /users/me/mcp` | none | `{ mcpEnabled, mcpApiKey }` |
| `PATCH /users/me/mcp` | Currently unvalidated `{ mcpEnabled, mcpApiKey? }` | `{ mcpEnabled, mcpApiKey }` |

Enabling MCP without an explicitly supplied key generates a UUID key.

### Google Calendar integration

| Method and path | Request/query | Success |
| --- | --- | --- |
| `GET /integrations/google/auth` | none | `{ url }`, or 501 if not configured |
| `GET /integrations/google/callback` | query `code`, `state` | Redirect to frontend settings |
| `GET /integrations/google/status` | none | `{ connected, calendarId }` |
| `POST /integrations/google/disconnect` | none | `{ ok: true }` |
| `POST /integrations/google/sync` | Body currently ignored | `{ ok: true, message }` placeholder |
| `POST /integrations/google/unsync` | Body currently ignored | `{ ok: true, message }` placeholder |

### Device registration and placeholders

| Method and path | Auth | Request | Success |
| --- | --- | --- | --- |
| `POST /devices/register` | Public | `{ fcmToken, platform? }` | `{ ok: true }` |
| `POST /posthook_listener` | Public | Body ignored | `{ ok: true }` |
| `POST /alexa` | Public | Body ignored | 200 `{ error: "Alexa integration disabled pending security audit" }` |
| `POST /mcp` | Protected | Body ignored | 200 `{ error: "MCP proxy — implement as needed" }` |

## Removed domains

Contacts, Notes, and Journal are removed features. Their routes, clients,
models, and PostgreSQL tables must not be recreated:

- no `/contacts` endpoints
- no `/notes` endpoints
- no `/journal` endpoints

Historical MongoDB collections for these domains should be excluded from the
application migration and retained only in the rollback backup according to
the data-retention decision.

## PostgreSQL compatibility requirements

The initial PostgreSQL rewrite must:

1. Keep `/api` and `/api/v1` routing, methods, status codes, and direct success
   bodies compatible.
2. Preserve existing string `_id` values during migration and expose `_id`,
   not a newly named `id`, at the HTTP boundary.
3. Preserve camelCase JSON fields, ISO date serialization, nullable fields,
   array ordering, default values, and endpoint sort order.
4. Keep `type: "task"`, `itemType`, and `calendarType` response decorations.
5. Keep habits represented through task-shaped responses and preserve one
   completion per habit/date.
6. Preserve embedded response shapes for task comments, reminders,
   activities, completions, workflow columns, chat messages, collaborators,
   notification payloads, and preferences, even if relational tables back
   them.
7. Derive all ownership from the authenticated identity. Require a non-null
   owner foreign key for every user-owned PostgreSQL row.
8. Make ownership checks and writes atomic; a resource ID alone must never be
   sufficient to mutate user data.
9. Preserve list soft deletion and the Inbox deletion guard.
10. Preserve task subtree behavior, list-group detachment, section detachment,
    focus-session cancellation, snooze calculation, and streak recomputation.
11. Add integration tests for both success and cross-user access before
    switching the database.
12. Keep Contacts, Notes, and Journal absent.

## Contract risks and migration corrections

These behaviors require explicit decisions or fixes during the rewrite:

- **Critical — folder task ownership:** `PATCH /folders/:id/tasks` verifies
  folder ownership but reads and updates the task by ID without checking its
  owner. PostgreSQL must require both task and folder to belong to the current
  user in one transaction.
- **Critical — Google callback identity:** the callback trusts `state` as a
  user ID and does not validate an OAuth state nonce. It is also protected by
  the global auth middleware, which may block a provider redirect without the
  cookie. Use a signed, expiring state value and a deliberate callback auth
  policy.
- **High — push subscriptions are global:** subscriptions have no owner field;
  subscribe/upsert and unsubscribe operate only by endpoint. Add a required
  user foreign key and scope both operations to it.
- **High — public devices are global:** device registration is unauthenticated
  and stores only a globally unique FCM token. Decide whether devices are
  intentionally anonymous; otherwise authenticate and attach them to a user.
- **High — insufficient validation:** Kanban section updates, memory writes,
  chat-session updates, calendar preferences, MCP settings, device
  registration, and several comment/placeholder routes accept unvalidated
  bodies. Add Zod schemas while retaining accepted legitimate fields.
- **High — habit update mismatch:** habit create maps `name` to task `title`,
  but habit update writes `name` directly to a task record. Normalize update
  mapping so the public request remains `name` and the response remains
  task-shaped with `title`.
- **Medium — public alias mismatch:** public `/api/v1/auth/*` and integration
  aliases are currently rejected because public prefixes only list `/api`.
- **Medium — inconsistent missing-resource behavior:** several deletes return
  success even when the resource does not exist, while others return 404.
  Preserve this initially or version a standardized idempotent-delete policy.
- **Medium — inconsistent errors:** service-thrown folder errors become generic
  HTTP 500 responses, while other resources use typed 4xx errors. Map these to
  typed errors.
- **Medium — event schema mismatch:** create validation allows a missing or
  null `endDate`, while the database model currently requires it. Define and
  test the intended default/null behavior.
- **Medium — reminder input mismatch:** validation accepts `priority` and
  `tags`, but the current reminder model does not store them.
- **Medium — calendar include semantics:** `include=habits` alone returns no
  habits; habits are only returned when `tasks` is included. Preserve the
  default combined result, then clarify the filter contract with tests.
- **Medium — completion and date semantics:** habit dates use UTC
  `YYYY-MM-DD`, while focus statistics use server-local day/week boundaries.
  PostgreSQL and Compute deployment must define timezone behavior explicitly.
- **Medium — task hierarchy:** task deletion removes only direct children, and
  reparenting prevents self-parenting but not deeper cycles. Use relational
  constraints/service checks without silently changing visible behavior.
- **Low — frontend unsubscribe mismatch:** the frontend DELETE helper sends no
  body, although the server expects `{ endpoint }`; unsubscribe currently
  returns success without deleting anything.
- **Low — placeholder success codes:** Alexa and MCP return HTTP 200 with an
  `error` string. Keep only if consumers depend on it; otherwise version these
  as explicit unavailable/not-implemented responses.
