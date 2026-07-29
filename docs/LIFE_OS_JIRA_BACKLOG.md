# Life OS — execution-ready product backlog

This document turns the Life OS product direction into Jira-style epics and
stories. It is written to be executable by two coding agents without requiring
them to reinterpret the product intent.

## Product contract

Life OS helps a person complete one daily loop:

> See reality → choose what matters → protect time → close the loop.

The Agenda is the primary execution surface. Calendar is the planning surface.
Focus is the protected-work surface. Settings explains and controls how all
three behave.

### Fixed product decisions

- The product name is **Life OS**. Do not reintroduce LAIF in user-visible copy.
- Contacts, Notes, and Journal are removed from the product and database scope.
- PostgreSQL is the only production database. Do not build a MongoDB import.
- Google Calendar is the only calendar integration in this release.
- A connected account and a visible calendar are different concepts.
- **Active calendars** appear in Agenda and affect availability.
- **Passive calendars** may appear in Calendar but never make the user busy.
- AI may propose a schedule, but it must never silently move a user's work.
- All calendar times are stored as UTC instants with their source time zone
  retained where needed for display and recurrence calculations.

## Release goal and success measures

The first complete release should let a new user:

1. Create an account and understand Life OS in under two minutes.
2. Connect or explicitly skip Google Calendar.
3. Open Agenda and understand today's real commitments.
4. Schedule one priority task.
5. Start and complete a Focus session from that task.
6. Close the day by deciding what happens to unfinished work.

North-star metric:

**Days per week in which a user completes Plan → Focus → Complete.**

Release guardrails:

- No cross-user access in any API route.
- No duplicate external calendar event for the same account, calendar, and
  provider event ID.
- Calendar sync success rate is measurable.
- Agenda becomes interactive in under one second on a warm application load for
  a normal day (up to 100 returned items).
- Every destructive action requires confirmation and has understandable copy.
- Desktop and mobile flows meet keyboard, screen-reader, contrast, and reduced
  motion requirements.

## Definition of done for every story

A story is done only when:

- Its acceptance criteria pass.
- Loading, empty, success, recoverable error, and unrecoverable error states are
  implemented where applicable.
- Backend reads and writes are scoped by the authenticated `userId`.
- Request bodies and query parameters are validated.
- Unit or integration tests cover the critical behavior and ownership boundary.
- UI changes work at 375 px, 768 px, 1280 px, and 1440 px widths.
- Interactive controls are keyboard reachable and have an accessible name.
- Product analytics never include event titles, task titles, notes, OAuth
  tokens, or other user content.
- Documentation and API contracts are updated when behavior changes.

## Delivery map

| Epic | Priority | Outcome | Depends on |
| --- | --- | --- | --- |
| LOS-100 — Foundation release | P0 | Existing Life OS foundation is production-safe | PostgreSQL deployment |
| LOS-200 — Daily Agenda | P1 | Today becomes an actionable execution plan | LOS-300, LOS-400 contract |
| LOS-300 — Calendar control center | P1 | Users control what is visible, busy, and writable | PostgreSQL schema |
| LOS-400 — Google Calendar reliability | P0/P1 | Sync is real, secure, observable, and predictable | LOS-301 |
| LOS-500 — Daily rituals | P2 | Users deliberately open and close the day | LOS-200 |
| LOS-600 — Quality and rollout | P0/P1 | Release is fast, measurable, and reversible | All release stories |

## Recommended two-agent split

### Stream A — Product experience

Owns LOS-201, LOS-203 through LOS-206, LOS-302 through LOS-306, and LOS-501
through LOS-503. This stream should consume documented API contracts and use
mocked responses until backend endpoints are ready.

### Stream B — Data and integration

Owns LOS-202, LOS-301, and LOS-401 through LOS-405. This stream should publish
request/response examples before implementation changes so Stream A can work
without waiting.

### Shared integration gates

LOS-101, LOS-601, LOS-602, and LOS-603 are shared release gates. Only one stream
should edit a shared file at a time. Changes to `schema.prisma`, API response
types, or shared calendar types must be announced before merging.

---

# EPIC LOS-100 — Foundation release

## LOS-101 — Production hardening and first deployment

**Type:** Story  
**Priority:** P0  
**Owner:** Full stack / release  
**Estimate:** 5 points  
**Status:** Ready

### User story

As a user, I want authentication, onboarding, Focus, and Calendar connection to
work in production so that my first experience is trustworthy.

### Context

The Life OS rebrand, redesigned onboarding, Settings navigation, and Focus
Protocol have a first implementation. PostgreSQL schema and route conversion
exist locally. This ticket is the release gate, not a redesign ticket.

### Scope

- Configure the production backend with `DATABASE_URL`, CORS origins, Google
  OAuth credentials, callback URL, cookie security, and frontend URL.
- Apply reviewed Prisma migrations to the new empty PostgreSQL database.
- Deploy the backend to the main production branch.
- Point the Vercel frontend at the deployed API.
- Run authenticated smoke tests for signup, login, onboarding, task CRUD,
  Calendar read, Google OAuth initiation, Focus start/pause/resume/complete, and
  logout.
- Confirm Contacts, Notes, Journal, and MongoDB are absent from the deployed
  runtime.

### UI behavior

- Deployment or network failure must never show a blank screen.
- Authentication failure returns the user to Login with: “Your session ended.
  Sign in to continue.”
- A backend health failure shows a non-destructive retry state and preserves
  locally entered form fields.
- OAuth cancellation returns to Settings → Integrations with neutral copy:
  “Google Calendar was not connected. Nothing changed.”

### Acceptance criteria

- [ ] Given an empty production PostgreSQL database, when migrations run, then
      every required table, index, foreign key, and enum is created successfully.
- [ ] Given the deployed frontend origin, when it sends credentialed requests,
      then CORS permits that origin and rejects unlisted origins.
- [ ] Given a new user, when they complete signup and onboarding, then their
      account and preferences persist after logout and login.
- [ ] Given an authenticated user, when they complete a Focus session, then the
      session is present after refresh and in the user's daily total.
- [ ] Given User A and User B, when either requests the other's resource ID, then
      the API returns not found or forbidden without exposing the resource.
- [ ] Given a deployment health check, when the API is healthy, then `/health`
      responds without requiring authentication.
- [ ] No deployed code attempts a Mongoose connection or requires a MongoDB
      environment variable.

### QA evidence

- Deployment URL and version.
- Migration output.
- Smoke-test result with timestamps.
- Sanitized screenshots of Login, Agenda, Settings → Integrations, and Focus.

---

## LOS-102 — Preserve the implemented Life OS identity

**Type:** Story  
**Priority:** P0  
**Owner:** Frontend  
**Estimate:** 2 points  
**Status:** Implemented; regression coverage required

### Required behavior

- Use the Life OS mark, wordmark, warm neutral palette, and editorial typography
  consistently on auth, onboarding, application shell, and metadata.
- Login communicates the Plan → Focus → Reset promise before asking for input.
- Onboarding has three clear steps: identity, desired outcome, optional Google
  connection.
- Google connection has an equally visible “Do this later” path.
- Focus uses intent-first language and the 25/5, 50/10, and 90/15 protocols.

### Acceptance criteria

- [ ] “LAIF” does not appear in user-visible application copy, page titles,
      metadata, or onboarding.
- [ ] The user can finish onboarding without connecting Google.
- [ ] Browser refresh during an active Focus session restores the correct timer
      state.
- [ ] No stock focus image, fabricated quote, or synthetic ambient-audio control
      appears.
- [ ] Auth and onboarding remain usable at 200% zoom and 375 px width.

---

# EPIC LOS-200 — Daily Agenda

## LOS-201 — Agenda day frame and navigation

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 5 points  
**Status:** Ready

### User story

As a user, I want a calm view of one day so that I can immediately understand
what is happening now and what comes next.

### UI specification

Desktop layout:

- A compact header contains “Today” or the formatted date, previous/next day
  controls, a date picker, and “Back to today” when viewing another date.
- A narrow central lane contains the chronological Agenda. It should not look
  like a compressed week grid.
- An optional priority tray sits to the right at widths of 1100 px or greater.
- The header remains visible while the lane scrolls.
- Empty space is intentional; do not fill it with productivity charts.

Mobile layout:

- Date navigation is a single sticky row below the app header.
- The priority tray becomes a bottom sheet opened by “Unscheduled”.
- Agenda items use the full content width and maintain at least 44 px touch
  targets.

Interaction:

- Keyboard shortcuts: left/right arrow change day when focus is not in a text
  input; `T` returns to today.
- The selected date is encoded in the URL so refresh and browser navigation
  preserve it.
- Returning to Today scrolls to the current-time marker after data loads.

### Acceptance criteria

- [ ] Given today is selected, the header says “Today” and includes the full date
      in secondary text or an accessible label.
- [ ] Given another date is selected, “Back to today” is visible and works.
- [ ] Browser back and forward restore the previously viewed date.
- [ ] On mobile, no horizontal page scrolling is introduced.
- [ ] Date controls are usable by keyboard and announce their destination.
- [ ] Reduced-motion users do not receive animated auto-scroll.

### Dependencies

- Can begin against mocked LOS-202 responses.

---

## LOS-202 — Unified Agenda API and item contract

**Type:** Story  
**Priority:** P0  
**Owner:** Backend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As the Agenda client, I need one predictable day response so that tasks, habits,
external events, and completed Focus sessions can be rendered in one sequence.

### API requirements

Add or formalize:

`GET /api/calendar/agenda?date=YYYY-MM-DD&timeZone=Area/City`

Response:

```json
{
  "date": "2026-07-29",
  "timeZone": "Asia/Calcutta",
  "generatedAt": "2026-07-29T06:00:00.000Z",
  "sync": {
    "state": "healthy",
    "lastSuccessfulAt": "2026-07-29T05:58:00.000Z"
  },
  "items": [],
  "unscheduledPriorities": []
}
```

Every `items` entry must have:

- `id`
- `kind`: `external_event | task | habit | focus_session`
- `title`
- `start`
- `end`
- `allDay`
- `completed`
- `source` with source type, account ID, calendar ID, and display name when
  applicable
- `availability`: `busy | free`
- `color`
- `actions` describing permitted client actions

Rules:

- Only events from active calendars enter `items`.
- Passive calendars do not enter Agenda and do not affect busy calculations.
- All-day items form a separate top group.
- Cross-midnight items appear on every intersected local day with the original
  start and end retained.
- Unscheduled priorities are incomplete, non-archived tasks ordered by explicit
  priority, due date, then creation date.
- Focus records are read-only and only completed sessions appear.

### Acceptance criteria

- [ ] Given a day in the requested time zone, only items intersecting that local
      day are returned.
- [ ] Given an event from a passive calendar, it is absent from Agenda.
- [ ] Given identical event IDs in two different source calendars, both may
      exist without collision.
- [ ] Given malformed date or time-zone input, the API returns HTTP 400 with a
      field-level validation error.
- [ ] Given User A, no record owned by User B can enter the response.
- [ ] Items have deterministic ordering: all-day first, then start time, end
      time, kind, and ID.
- [ ] The response contract is documented and has integration tests for an
      empty day, mixed item types, DST transition, and ownership isolation.

---

## LOS-203 — Agenda item presentation and temporal states

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As a user, I want every row to explain what it is, when it occurs, and what I can
do with it without opening a detail screen.

### UI specification

Each item row contains:

- A time column with local start and end.
- A source-colored rail or dot, never color alone as the type indicator.
- Title, type label, source calendar name where relevant, and compact metadata.
- A primary contextual action revealed on hover/focus and always visible on
  touch devices.

Item behavior:

- Task: complete, start Focus, or open task.
- Habit: mark complete or open habit details.
- External event: open read-only details; show source calendar and account.
- Focus session: show completed duration and open session summary.
- All-day items appear in a compact section above the timed lane.
- Current item receives a restrained “Now” treatment.
- A current-time rule crosses the timeline and updates at least once per minute.
- Overlapping busy items receive a conflict marker with plain-language detail,
  for example: “Overlaps Design review by 20 minutes.”
- Completed and past items collapse behind “Earlier · N items” once they are no
  longer relevant; users can expand them without losing scroll position.

### State design

- Loading: use stable skeleton rows matching final geometry.
- Empty: show “Your day has room” with actions to schedule a priority or create a
  task. Do not show analytics.
- Delayed sync: display a quiet status line above the lane; keep cached data.
- Error with cached data: show cached data plus “Could not refresh.”
- Error without data: show one retry action and a route to Calendar settings.

### Acceptance criteria

- [ ] Every row exposes its kind and source without relying on color.
- [ ] The now marker is visible only for Today and reflects the user's selected
      time zone.
- [ ] Completing a task updates its row optimistically and rolls back with an
      inline error if the request fails.
- [ ] Expanding/collapsing Earlier does not change the selected date.
- [ ] Conflicts identify the two affected items and overlap duration.
- [ ] Screen readers receive a chronological list with meaningful item labels.
- [ ] External event details never expose raw provider payloads or tokens.

---

## LOS-204 — Unscheduled priority tray and scheduling

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend + Backend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As a user, I want to place important unscheduled work into open time so that my
task list becomes a realistic plan.

### UI specification

- The tray title is “Unscheduled” with a count.
- Each task shows title, priority, estimated duration, due state, and list.
- Primary click opens a quick scheduling popover with:
  - Today/tomorrow/custom date.
  - Suggested start times.
  - Duration, defaulting to the estimate or 30 minutes.
  - “Schedule” as the explicit commit action.
- Dragging a task over the Agenda shows a time preview and occupied-time warning.
- Dropping into a conflict does not silently commit. It opens a confirmation
  popover explaining the overlap with “Choose another time” as the primary
  action.
- Successful scheduling moves the item into the lane and provides an Undo toast.
- Mobile uses tap-to-schedule; drag is optional and must not be the only path.

### API requirements

Use an ownership-scoped task update with:

```json
{
  "scheduledStart": "2026-07-29T08:30:00.000Z",
  "scheduledEnd": "2026-07-29T09:00:00.000Z",
  "timeZone": "Asia/Calcutta"
}
```

The server validates end after start, a maximum reasonable duration, task
ownership, and current task status.

### Acceptance criteria

- [ ] A task can be scheduled by mouse, keyboard, and touch.
- [ ] A 30-minute task dropped at 10:00 receives a 10:00–10:30 preview in local
      time.
- [ ] A conflicting drop requires an explicit confirmation.
- [ ] Undo restores the previous schedule in both UI and database.
- [ ] Completed, dropped, archived, or foreign-user tasks cannot be scheduled.
- [ ] A failed update returns the task to the tray and preserves the user's
      previous scroll position.

---

## LOS-205 — Start Focus from Agenda

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend + Backend  
**Estimate:** 5 points  
**Status:** Ready

### User story

As a user, I want to start Focus from the work in front of me so that I do not
lose context while switching modes.

### UI behavior

- Current and upcoming task/habit rows expose “Start Focus”.
- Clicking opens a lightweight protocol chooser in context:
  - Selected item's title is prefilled as the intent.
  - 25/5, 50/10, and 90/15 are available.
  - If the scheduled block is shorter than the chosen protocol, show a warning,
    not an automatic change.
- Confirming transitions to the full-screen Focus Protocol.
- The Back action from Focus returns to the same Agenda date and approximate
  scroll position.
- If another active Focus session exists, the user is offered “Resume session”
  or “End it and start this one.” Never create two active sessions.

### Acceptance criteria

- [ ] The created Focus session stores task ID and title snapshot.
- [ ] Refresh during Focus restores the linked task and remaining time.
- [ ] Completing Focus adds a read-only record to Agenda without duplicating the
      linked task.
- [ ] Cancelling the chooser creates no session.
- [ ] An already-completed or foreign-user task cannot start a new linked
      session.

---

## LOS-206 — Agenda resilience, accessibility, and instrumentation

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend / QA  
**Estimate:** 5 points  
**Status:** Ready

### Requirements

- Cache the most recent successfully loaded day per user and date.
- Retry transient failures with bounded exponential backoff.
- Do not retry authentication, validation, or permission failures.
- Announce scheduling, completion, sync delay, and errors through an `aria-live`
  region without moving focus.
- Preserve logical focus after rows are completed, scheduled, or removed.
- Instrument only structural events:
  - `agenda_viewed`
  - `agenda_date_changed`
  - `agenda_item_opened`
  - `agenda_task_scheduled`
  - `agenda_focus_started`
  - `agenda_empty_action_selected`

### Acceptance criteria

- [ ] Cached data remains visible during a recoverable refresh failure.
- [ ] No analytics event contains user-entered titles or descriptions.
- [ ] Agenda is operable using only keyboard.
- [ ] Axe or equivalent automated checks report no serious or critical issue.
- [ ] The page remains usable with reduced motion and at 200% zoom.

---

# EPIC LOS-300 — Calendar control center

## LOS-301 — Calendar account and calendar inventory model

**Type:** Story  
**Priority:** P0  
**Owner:** Backend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As Life OS, I need to represent connected accounts and each calendar separately
so that visibility, availability, write target, and sync health are predictable.

### Data requirements

Introduce an account-level model and a calendar-level model rather than keeping
tokens and one `googleCalendarId` directly on the user.

Account fields include:

- ID, `userId`, provider, provider account ID, display email/name.
- Encrypted access and refresh token material.
- Granted scopes, token expiry, connection status.
- Last sync attempt, last successful sync, last error code, and reconnect flag.
- Created, updated, and disconnected timestamps.

Calendar fields include:

- ID, account ID, provider calendar ID, name, provider color and user override.
- `isVisibleInCalendar`.
- `isActiveInAgenda`.
- `affectsAvailability`.
- `isDefaultWriteCalendar`.
- `isPrimary`, `readOnly`, time zone, sort order, deleted/hidden state.
- Sync token and last sync timestamp when tokens are calendar-specific.

Constraints:

- Provider calendar ID is unique within an account.
- Exactly zero or one writable default exists per user.
- `isActiveInAgenda=true` requires `isVisibleInCalendar=true`.
- A passive calendar always has `affectsAvailability=false`.
- External events reference the internal calendar record as well as provider ID.

### Acceptance criteria

- [ ] A user can own multiple Google accounts and multiple calendars per account.
- [ ] Calendar inventory upsert is idempotent.
- [ ] Disconnecting an account cannot delete another user's account or calendars.
- [ ] Tokens are never returned by API serializers or written to logs.
- [ ] Schema migration works on a new empty PostgreSQL database.
- [ ] The migration does not include or depend on MongoDB data import.
- [ ] Model constraints and ownership isolation have integration tests.

---

## LOS-302 — Connected account cards and sync health

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 5 points  
**Status:** Ready

### User story

As a user, I want to see which account is connected and whether it is healthy so
that I can trust the data shown in Life OS.

### UI specification

Location: Settings → Integrations → Google Calendar.

Each account card displays:

- Google icon, account email/name, and connection state.
- Human-readable last sync, for example “Synced 3 minutes ago.”
- Status:
  - Healthy — neutral/positive treatment.
  - Syncing — small progress indicator with stable layout.
  - Delayed — amber treatment with retry action.
  - Needs attention — red treatment with reconnect action.
- “Manage calendars”, “Sync now”, and overflow menu.
- Disconnect is in the overflow menu and opens a confirmation dialog.

Confirmation copy explains that imported cached events will be removed from Life
OS, while nothing is deleted from Google.

### Acceptance criteria

- [ ] A healthy account shows its last successful sync.
- [ ] A reconnect-required account has one clear primary action.
- [ ] Disconnect confirmation names the account being removed.
- [ ] Disconnecting removes that account's events from Agenda after success.
- [ ] Failure keeps the card and explains that nothing changed.
- [ ] Status uses text/icon as well as color.

---

## LOS-303 — Active and passive calendar controls

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend + Backend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As a user, I want birthdays and reference calendars available without allowing
them to crowd my daily plan or consume availability.

### UI specification

Location: Settings → Calendar.

- An explainer at the top defines:
  - Active: “Shown in Agenda and treated as busy.”
  - Passive: “Available in Calendar, hidden from Agenda, and treated as free.”
- Calendars are grouped under Active and Passive headings.
- Each row shows color, calendar name, account identity, read-only badge where
  applicable, visibility control, and drag handle.
- Moving a row between groups updates active/passive behavior immediately.
- Visibility within Calendar is a separate control.
- Reordering is supported by drag and by accessible Move up/Move down actions.
- Optimistic updates show “Saving…” and roll back with an inline error.

### Acceptance criteria

- [ ] Moving a calendar to Passive removes its events from Agenda without
      disconnecting the account.
- [ ] Passive events remain available in the full Calendar when visibility is on.
- [ ] Passive events never affect conflict or capacity calculations.
- [ ] Hiding a calendar from Calendar does not disconnect or delete it.
- [ ] Active/passive and visibility changes persist across devices.
- [ ] Calendar ordering is deterministic and scoped to the current user.
- [ ] The entire interaction is usable without drag-and-drop.

---

## LOS-304 — Default write calendar

**Type:** Story  
**Priority:** P1  
**Owner:** Full stack  
**Estimate:** 5 points  
**Status:** Ready

### User story

As a user, I want to know where new external events are created so that Life OS
never writes to an unexpected calendar.

### UI specification

- Settings → Calendar includes “New event destination.”
- The selector contains only writable calendars and shows account identity.
- Read-only calendars are visible only in explanatory text, not as selectable
  values.
- If there is exactly one writable calendar, it is selected automatically.
- If the current default becomes unavailable, creation is blocked and Settings
  shows “Choose a new event destination.”
- Event creation UI always shows the destination calendar before final save.

### Acceptance criteria

- [ ] At most one default write calendar exists per user.
- [ ] A read-only or disconnected calendar cannot become the default.
- [ ] Changing the default does not move existing events.
- [ ] Event creation fails safely when no writable destination exists.
- [ ] The chosen destination persists after refresh and on another device.

---

## LOS-305 — Manual sync, reconnect, and disconnect recovery

**Type:** Story  
**Priority:** P1  
**Owner:** Full stack  
**Estimate:** 5 points  
**Status:** Ready

### Required behavior

- “Sync now” triggers a real account sync, not a placeholder response.
- Repeated clicks while a sync is running do not create parallel jobs.
- The UI reports queued, syncing, completed, partially failed, and failed states.
- Reconnect preserves calendar preferences when provider calendar IDs still
  match.
- Disconnect revokes provider access when possible, clears stored credentials,
  stops jobs, and removes cached events for that account.
- Provider errors are translated into useful categories: reconnect required,
  rate limited, temporary provider failure, and configuration failure.

### Acceptance criteria

- [ ] Manual sync changes last-attempt and last-success timestamps accurately.
- [ ] Two simultaneous manual-sync requests result in one running sync.
- [ ] Reconnect cannot be completed using an OAuth state issued to another user.
- [ ] Disconnect removes local cached events but never deletes Google events.
- [ ] Error copy never exposes provider payloads, stack traces, or tokens.

---

## LOS-306 — Complete Settings information architecture

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 3 points  
**Status:** Partially implemented

### UI specification

The persistent Settings navigation must contain:

- Personalization
- Date & time
- Calendar
- Integrations
- Focus
- Notifications
- Data & privacy

Desktop uses a stable secondary sidebar. Mobile uses grouped row navigation with
a clear Back to Settings action. The URL contains the selected section.

Rules:

- Descriptions stay beside the control they explain.
- Saving is immediate for low-risk preferences.
- Destructive actions live only in Data & privacy or an account overflow menu.
- A saved state is acknowledged without disruptive toast spam.
- Errors remain adjacent to the affected control.

### Acceptance criteria

- [ ] Every existing preference has exactly one predictable location.
- [ ] Reloading or sharing a Settings URL restores the selected section.
- [ ] Browser Back returns to the previous section.
- [ ] Mobile navigation does not display the desktop sidebar.
- [ ] Destructive actions require confirmation and are visually separated.

---

# EPIC LOS-400 — Google Calendar reliability

## LOS-401 — Secure OAuth lifecycle

**Type:** Story  
**Priority:** P0  
**Owner:** Backend  
**Estimate:** 5 points  
**Status:** Partially implemented

### Requirements

- Continue using short-lived signed OAuth state plus a single-use database
  record.
- Bind the state to authenticated user, provider, purpose, and expiry.
- Mark state consumed atomically before exchanging the authorization code.
- Request the minimum scopes needed for the selected read/write behavior.
- Preserve an existing refresh token when Google omits a new one during
  reconnection.
- Encrypt tokens at rest with a key separate from the application JWT secret.
- Callback redirects use an explicit configured frontend URL, not the first CORS
  entry.
- Record consent scope changes and mark reconnect required when necessary.

### Acceptance criteria

- [ ] Missing, expired, reused, malformed, or wrong-user state is rejected.
- [ ] OAuth callback cannot attach credentials to a different authenticated user.
- [ ] Tokens and authorization codes never appear in logs or client responses.
- [ ] Reconnect without a new refresh token retains the valid existing token.
- [ ] OAuth denial returns the user to Settings with non-error cancellation copy.
- [ ] Integration tests cover success, replay, expiry, wrong user, denial, and
      provider exchange failure.

---

## LOS-402 — Incremental inbound calendar sync

**Type:** Story  
**Priority:** P0  
**Owner:** Backend  
**Estimate:** 13 points  
**Status:** Ready

### User story

As a user, I want Google changes to appear reliably in Life OS without duplicate
events or excessive provider requests.

### Requirements

- Discover and upsert the account's calendar inventory after connection.
- Perform an initial bounded sync for a documented date window.
- Store and use provider sync tokens for incremental changes.
- Upsert by account, calendar, and provider event ID.
- Apply cancellations/deletions to the local cache.
- Use a per-account lock to prevent overlapping sync workers.
- Reset safely to a full bounded sync when a provider invalidates the sync token.
- Refresh expired access tokens and persist rotated credentials securely.
- Use scheduled polling first; webhook support may follow behind a feature flag.
- Store normalized event fields required by Agenda and Calendar. Retain only the
  minimum provider metadata needed for correct updates and recurrence.

### Acceptance criteria

- [ ] Replaying the same provider page creates no duplicate rows.
- [ ] An updated Google event changes the existing local row.
- [ ] A cancelled Google event disappears from user-facing views.
- [ ] A deleted or disconnected calendar stops contributing events.
- [ ] One calendar failure does not corrupt successful calendars in the account.
- [ ] Invalid sync token recovery completes without duplicating existing events.
- [ ] All reads and writes are scoped to the owning user and account.
- [ ] Rate limits and temporary failures are retried with bounded backoff and
      jitter.

---

## LOS-403 — Outbound event and task synchronization

**Type:** Story  
**Priority:** P1  
**Owner:** Backend  
**Estimate:** 8 points  
**Status:** Ready

### User story

As a user, I want explicitly chosen Life OS work to appear on Google Calendar so
that the same commitment is visible outside Life OS.

### Requirements

- Replace the current placeholder `/sync` and `/unsync` behavior.
- Outbound sync is explicit per task in the first release.
- Create in the user's default write calendar.
- Persist account, calendar, provider event ID, and last outbound version on the
  task or mapping record.
- Updates are idempotent and use an idempotency key.
- Unsync asks whether to:
  - Remove the Google event but keep the Life OS schedule, or
  - Stop managing it while leaving the Google event.
- Never delete or modify an external event that was not created or explicitly
  adopted by Life OS.
- Provider write failure leaves the Life OS task intact and marks sync state.

### Acceptance criteria

- [ ] Syncing the same task twice creates one Google event.
- [ ] Editing a synced task updates the mapped event, not a new event.
- [ ] Unsync behavior matches the user's explicit choice.
- [ ] A read-only or disconnected destination blocks the write with actionable
      copy.
- [ ] User A cannot sync a task through User B's account or calendar.
- [ ] Failed writes are retryable and do not lose the local schedule.

---

## LOS-404 — Calendar semantic correctness

**Type:** Story  
**Priority:** P0  
**Owner:** Backend + QA  
**Estimate:** 8 points  
**Status:** Ready

### Requirements

Normalize and test:

- Timed events.
- All-day events using exclusive end dates.
- Events spanning midnight.
- Recurring series and modified/cancelled instances.
- Daylight-saving transitions.
- Source and display time zones.
- Free versus busy transparency.
- Private events with restricted details.
- Organizer/attendee response state where it affects availability.

Rules:

- Never convert an all-day event into a timed UTC block.
- Private events may be shown as “Busy” when details are unavailable.
- Declined events do not affect availability by default.
- Tentative events follow a documented user preference.
- Passive calendar classification overrides provider busy status inside Life OS.

### Acceptance criteria

- [ ] All-day events render on the correct local dates in positive and negative
      UTC offsets.
- [ ] DST tests cover a missing hour and a repeated hour.
- [ ] A modified recurrence instance replaces only that occurrence.
- [ ] A cancelled instance is removed without deleting the full series.
- [ ] Restricted events do not leak hidden title or attendee details.
- [ ] Availability results are deterministic and documented.

---

## LOS-405 — Sync observability and contract test suite

**Type:** Story  
**Priority:** P1  
**Owner:** Backend / QA  
**Estimate:** 5 points  
**Status:** Ready

### Requirements

- Emit structured logs with request/job correlation ID, user-safe internal
  account ID, calendar ID hash, operation, result, duration, and error category.
- Add metrics for sync attempts, success, latency, events inserted/updated/
  deleted, token refresh, reconnect required, duplicate prevention, and queue
  depth.
- Do not log titles, descriptions, attendees, tokens, codes, or raw provider
  bodies.
- Add contract fixtures for provider pagination, incremental sync, deletion,
  recurrence, rate limit, expired token, invalid sync token, and partial failure.
- Surface last successful sync and current health through the account API.

### Acceptance criteria

- [ ] An operator can distinguish configuration, authentication, rate-limit, and
      temporary-provider failures without inspecting private event data.
- [ ] Calendar sync success rate and p95 latency can be calculated.
- [ ] A test intentionally replaying provider data proves duplicate prevention.
- [ ] Account status API reflects the latest completed job, not merely the latest
      attempted job.

---

# EPIC LOS-500 — Daily opening and shutdown rituals

## LOS-501 — Morning Plan

**Type:** Story  
**Priority:** P2  
**Owner:** Frontend + Backend  
**Estimate:** 8 points  
**Status:** Ready after Agenda core

### User story

As a user, I want a short morning planning ritual so that I choose a realistic
outcome before the day chooses for me.

### UI specification

The Plan flow is a focused sheet or page, not a dashboard:

1. **See commitments** — today's active calendar blocks and already scheduled
   tasks.
2. **Choose one outcome** — select or create the most important result.
3. **Protect time** — accept, edit, or reject suggested focus windows.
4. **Confirm day** — review scheduled focus and remaining capacity.

The user can leave at any time without losing confirmed changes. Suggested
windows are labeled “Suggestion” and never save until accepted.

### Acceptance criteria

- [ ] The flow can be completed with one selected outcome and one focus block.
- [ ] Skipping a suggestion makes no calendar or task change.
- [ ] Confirmation records a Plan completion for the local day.
- [ ] Existing conflicts are explained before a block is scheduled.
- [ ] Empty-calendar users can still plan from tasks.
- [ ] User-entered outcome text is not sent to analytics.

---

## LOS-502 — Capacity and suggested focus windows

**Type:** Story  
**Priority:** P2  
**Owner:** Backend  
**Estimate:** 8 points  
**Status:** Ready after reliable calendar sync

### Requirements

Calculate available windows using:

- User working hours and time zone.
- Active busy events only.
- Existing scheduled tasks.
- Optional meeting buffers.
- Task estimate and preferred focus rhythm.

Return proposals with a plain-language reason and conflicts. Do not persist a
proposal until the user confirms it.

### Acceptance criteria

- [ ] Passive and free events do not reduce capacity.
- [ ] Meeting buffers are applied only when enabled.
- [ ] No proposed block falls outside configured working hours.
- [ ] Suggestions are deterministic for identical inputs.
- [ ] Confirming a suggestion uses the same ownership and conflict validation as
      manual scheduling.

---

## LOS-503 — Evening Shutdown and tomorrow handoff

**Type:** Story  
**Priority:** P2  
**Owner:** Frontend + Backend  
**Estimate:** 8 points  
**Status:** Ready after Agenda core

### User story

As a user, I want to close the day by deciding what happens to unfinished work so
that tomorrow does not begin with invisible debt.

### UI specification

The Shutdown flow contains:

- Today summary: completed tasks and Focus time, presented quietly.
- Unfinished decisions: each incomplete scheduled task must be moved to a chosen
  time/day, returned to Unscheduled, completed, or dropped.
- Tomorrow preview: active calendar commitments and accepted handoffs.
- “Close the day” explicit final action.

No confetti or streak pressure. The confirmation message is: “Day closed.
Tomorrow is ready.”

### Acceptance criteria

- [ ] Every unfinished scheduled task receives an explicit decision or remains
      clearly marked unresolved.
- [ ] Closing the day records completion for the user's local date.
- [ ] A user can reopen the flow and see the decisions already made.
- [ ] Moving a task uses conflict validation and supports Undo.
- [ ] Focus totals come from persisted completed sessions, not client memory.

---

# EPIC LOS-600 — Quality, measurement, and rollout

## LOS-601 — Route-level code splitting and startup performance

**Type:** Story  
**Priority:** P1  
**Owner:** Frontend  
**Estimate:** 5 points  
**Status:** Ready

### Context

The current main JavaScript chunk is approximately 939 KB. Calendar, chat,
settings, and editor-heavy features should not all block initial Login or Agenda
rendering.

### Requirements

- Lazy-load route-level pages and heavy optional panels.
- Split calendar editors, AI chat, settings subsections, and visualization
  libraries where practical.
- Keep loading states visually stable.
- Capture before/after bundle output and browser performance measurements.

### Acceptance criteria

- [ ] Production build no longer emits the current oversized-main-chunk warning,
      or an approved documented exception names the remaining dependency.
- [ ] Login and onboarding do not download Calendar or chat-only code before it
      is needed.
- [ ] Lazy loading introduces no blank page or layout shift.
- [ ] Core flows pass after direct navigation and browser refresh.

---

## LOS-602 — Daily-loop product analytics

**Type:** Story  
**Priority:** P1  
**Owner:** Full stack / product  
**Estimate:** 5 points  
**Status:** Ready

### Requirements

Record privacy-safe milestones:

- Onboarding completed.
- Google connected or explicitly skipped.
- First Agenda item scheduled.
- Morning Plan completed.
- Focus started and completed.
- Shutdown completed.
- Daily loop completed.

The daily loop uses the user's local date and is idempotent. Events contain IDs,
durations, counts, and state categories only—never user content.

### Acceptance criteria

- [ ] Days per week with Plan → Focus → Complete can be calculated per anonymous
      product user ID.
- [ ] Repeated client delivery does not double-count a milestone.
- [ ] Time-zone changes have a documented rule and do not create duplicate day
      completions.
- [ ] Users who opt out of product analytics generate no optional analytics
      events.
- [ ] Analytics failure never blocks a user action.

---

## LOS-603 — Release QA, accessibility, and rollout controls

**Type:** Story  
**Priority:** P0  
**Owner:** QA / release  
**Estimate:** 8 points  
**Status:** Ready

### Requirements

- Add end-to-end coverage for:
  - Signup → onboarding skip.
  - Signup → Google connect.
  - Active/passive calendar configuration.
  - Agenda scheduling → Focus → completion.
  - Refresh recovery during active Focus.
  - Sync error → reconnect.
  - Shutdown handoff.
- Test current Chrome, Firefox, Safari/WebKit, and mobile viewports.
- Add feature flags for the new Agenda contract, calendar control center, and
  rituals.
- Provide rollback steps that do not roll back the PostgreSQL schema.
- Run an accessibility review on Auth, Agenda, Settings, and Focus.

### Acceptance criteria

- [ ] Critical end-to-end flows pass against a production-like PostgreSQL
      environment.
- [ ] No serious or critical accessibility violations remain.
- [ ] Feature flags can disable incomplete P1/P2 surfaces independently.
- [ ] Rollback preserves user accounts, tasks, Focus sessions, and calendar
      preferences.
- [ ] Production smoke tests pass immediately after deployment.

---

# Execution order

## Release A — Foundation

1. LOS-401 secure OAuth lifecycle.
2. LOS-101 production hardening and deployment.
3. LOS-102 regression coverage.
4. LOS-601 initial bundle split.

Exit condition: a new user can authenticate, onboard, use tasks and Focus, and
initiate Google connection on production PostgreSQL.

## Release B — Trustworthy calendar foundation

1. LOS-301 account/calendar inventory.
2. LOS-402 inbound sync.
3. LOS-404 semantic correctness.
4. LOS-405 observability.
5. LOS-302, LOS-303, LOS-304, and LOS-305 UI/API integration.

Exit condition: users can explain what is connected, what appears in Agenda,
what affects availability, where new events go, and whether sync is healthy.

## Release C — Agenda core

1. LOS-202 unified Agenda API.
2. LOS-201 day frame.
3. LOS-203 item presentation.
4. LOS-204 scheduling.
5. LOS-205 Focus handoff.
6. LOS-206 resilience and accessibility.

Exit condition: a user can understand the day, schedule a priority, and begin
Focus without leaving Agenda.

## Release D — Complete daily loop

1. LOS-501 Morning Plan.
2. LOS-502 capacity suggestions.
3. LOS-503 Evening Shutdown.
4. LOS-602 daily-loop analytics.
5. LOS-603 final release QA and controlled rollout.

Exit condition: Plan → Focus → Complete is functional, measurable, and
recoverable.

# Explicitly out of scope

- Importing historical MongoDB data.
- Contacts, Notes, or Journal.
- Outlook, Apple Calendar, or additional providers.
- Automatic AI rescheduling without confirmation.
- Team scheduling, meeting booking links, or shared availability pages.
- Decorative focus scenes, synthetic ambient audio, and streak-first rewards.

