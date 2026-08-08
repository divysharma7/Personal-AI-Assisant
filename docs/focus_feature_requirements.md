# Focus / Pomodoro Feature — Functional Requirements Document

**Document type:** Feature Requirements Document (FRD)  
**Purpose:** Define the behavior, data model, states, flows, calculations, edge cases, and acceptance criteria required to build a Focus feature with functional parity to the reference experience shown in the provided screenshots.  
**Audience:** Product, Design, Frontend, Backend, QA, and coding/LLM agents.  
**Primary principle:** A focus session is not only a timer. It is a time-tracking record that can be associated with a Task or Habit and later aggregated into history and statistics.

---

# 1. Product Summary

Build a **Focus** module with two timing modes:

1. **Pomo** — countdown-based Pomodoro focus sessions.
2. **Stopwatch** — count-up focus sessions with no predefined end time.

A user can optionally associate a focus session with:

- a **Task**, or
- a **Habit**.

When a session is completed, the system creates a persistent **Focus Record** containing:

- associated Task/Habit,
- start timestamp,
- end timestamp,
- duration,
- focus mode,
- Pomodoro count where applicable,
- optional focus note.

The Focus screen also exposes:

- today's Pomodoro count,
- today's total focus duration,
- all-time Pomodoro count,
- all-time focus duration,
- chronological focus history,
- manual creation of focus records,
- navigation to Statistics,
- navigation to Focus Settings.

---

# 2. Core User Problem

Users need one place to:

- decide what they are focusing on,
- start a structured focus timer,
- track actual time spent,
- associate focused time with existing work,
- recover missing time entries manually,
- view historical focus activity,
- understand aggregate focus performance.

The key system loop is:

```text
Choose work
   ↓
Choose timing mode
   ↓
Start focus session
   ↓
Track elapsed time
   ↓
Complete / stop session
   ↓
Create Focus Record
   ↓
Update Overview + History + Statistics
```

---

# 3. Scope

## 3.1 In Scope

The first implementation must include:

- Focus screen
- Pomo mode
- Stopwatch mode
- configurable/default focus duration
- start session
- running session state
- pause/resume support if enabled by product configuration
- stop/finish session
- Task association
- Habit association
- searchable Task/Habit selector
- focus record persistence
- Overview counters
- Focus Record timeline
- manual Add Focus Record modal
- optional Focus Note
- Statistics entry point
- Focus Settings entry point
- correct aggregation across sessions
- date grouping
- session duration calculation
- handling sessions crossing midnight

## 3.2 Out of Scope for Initial Parity

Unless separately required, do not include:

- social focus rooms
- team productivity
- leaderboards
- AI coaching
- ambient focus music catalog
- gamification
- badges
- calendar synchronization
- automatic task completion
- device usage blocking
- website blocking
- notification blocking
- billing/paywall logic

These can be separate features.

---

# 4. Functional Architecture

The system should be treated as four related domains.

```text
┌─────────────────────────────┐
│ 1. Work Objects             │
│ Task / Habit                │
└──────────────┬──────────────┘
               │ optional association
               ▼
┌─────────────────────────────┐
│ 2. Focus Engine             │
│ Pomo / Stopwatch            │
│ Timer state                 │
└──────────────┬──────────────┘
               │ completion
               ▼
┌─────────────────────────────┐
│ 3. Focus Record             │
│ Start / End / Duration      │
│ Type / Note / Association   │
└──────────────┬──────────────┘
               │ aggregation
               ▼
┌─────────────────────────────┐
│ 4. Reporting                │
│ Overview / History / Stats  │
└─────────────────────────────┘
```

These must remain logically separate.

A **Task** or **Habit** is not the Focus Record.

A **Focus Session** is the live timer runtime.

A **Focus Record** is the persisted result of a completed or manually-created session.

---

# 5. Primary Screen Layout

The Focus screen has three functional regions.

```text
┌─────────────────────────────────────┬───────────────────────────┐
│                                     │ Overview                  │
│          Focus Timer                │                           │
│                                     │ Today's Pomo              │
│      [ Pomo | Stopwatch ]           │ Today's Focus             │
│                                     │ Total Pomo                │
│           Focus >                   │ Total Focus Duration      │
│                                     │                           │
│            25:00                    │ Focus Record              │
│                                     │                           │
│            Start                    │ Date                      │
│                                     │ session rows              │
│                                     │                           │
└─────────────────────────────────────┴───────────────────────────┘
```

Top-level actions include:

- `+` → Add Focus Record
- `...` → secondary menu
  - Statistics
  - Focus Settings

---

# 6. Focus Mode Selector

## 6.1 Modes

Display a segmented control:

```text
[Pomo] [Stopwatch]
```

Exactly one mode is active.

### Pomo

Behavior:

- Countdown timer.
- Starts from configured Pomo duration.
- Reference default shown: `25:00`.
- Completing the full countdown creates a completed Pomo session.
- Completed Pomo sessions increment Pomodoro counters.

### Stopwatch

Behavior:

- Starts at `00:00`.
- Counts upward.
- Session ends only when user explicitly finishes/stops it.
- Duration is calculated from start/end timestamps.
- Stopwatch sessions contribute to Focus Duration.
- Stopwatch sessions do not increment Pomodoro count unless product explicitly maps them to Pomos.

## 6.2 Mode Switching Rules

Before session start:

- User may switch freely between Pomo and Stopwatch.

During an active session:

- Do not silently change mode.
- Recommended parity rule:
  - disable mode switching while running, or
  - prompt user to stop current session before switching.

After completion:

- keep previously selected mode active for the next session.

---

# 7. Focus Target Selector

Above the timer, show:

```text
Focus >
```

The label represents the current focus target.

If no target is selected:

```text
Focus >
```

If a target is selected:

```text
<Selected task/habit name> >
```

Clicking opens the Focus Target popover.

---

# 8. Focus Target Popover

The popover contains:

```text
[Task] [Habit]

Search...

<list of available items>
```

## 8.1 Task Tab

When `Task` is active:

- show Tasks eligible for focus,
- support grouping, such as `Today`,
- show task title,
- show a single-select circle/radio control,
- selecting one item associates it with the next/current focus session.

Task selector must support:

- search by title,
- scrolling,
- single selection,
- no selection,
- closing without changes.

Suggested order:

1. due today / Today
2. overdue if applicable
3. other eligible/open tasks

Do not include completed/deleted tasks unless the product intentionally supports historical selection.

## 8.2 Habit Tab

When `Habit` is active:

- show active Habits,
- show habit title,
- show single-select circle/radio control,
- allow one Habit to be selected.

Examples visible in the reference:

- Morning Meditation
- Daily Check-in
- Run
- Exercise
- Read

## 8.3 Search Behavior

Search applies only to the currently active tab.

Expected behavior:

```text
User types "read"
→ filter visible Task/Habit records
→ case-insensitive partial match
```

If no result exists:

```text
No matching tasks
```

or

```text
No matching habits
```

## 8.4 Selection Rules

A focus session may have:

```text
0 or 1 Task
OR
0 or 1 Habit
```

Do not allow both simultaneously unless explicitly designed.

Internally model the association as:

```text
focus_target_type = NONE | TASK | HABIT
focus_target_id   = nullable ID
```

Selecting a Task after a Habit was selected should replace the Habit association.

Selecting a Habit after a Task was selected should replace the Task association.

---

# 9. Pomo Timer

## 9.1 Initial State

Default:

```text
Mode: Pomo
Time remaining: 25:00
Status: IDLE
Primary action: Start
```

The timer duration must come from Focus Settings, not be hardcoded in the UI.

Example:

```text
pomo_duration_minutes = 25
```

## 9.2 Start

On `Start`:

1. create an in-memory or persisted active Focus Session,
2. save start timestamp,
3. save selected mode,
4. snapshot selected Task/Habit association,
5. move state to `RUNNING`,
6. begin countdown.

Example:

```json
{
  "session_id": "focus_session_123",
  "mode": "POMO",
  "status": "RUNNING",
  "started_at": "2026-08-09T00:41:00+05:30",
  "planned_duration_seconds": 1500,
  "target_type": "TASK",
  "target_id": "task_456"
}
```

## 9.3 Running

While running:

- timer decrements once per second,
- UI reflects remaining time,
- session survives normal view changes,
- target association remains attached,
- duplicate Start actions are prevented.

Timer accuracy must be based on timestamps rather than trusting UI intervals.

Correct approach:

```text
remaining =
planned_end_timestamp - current_timestamp
```

Avoid:

```text
remaining = previous_remaining - 1 every second
```

as the sole source of truth.

## 9.4 Pause / Resume

If pause behavior is included:

Pause:

- store `paused_at`,
- freeze visible timer,
- set state `PAUSED`.

Resume:

- calculate pause duration,
- adjust planned end timestamp,
- set state `RUNNING`.

Persist cumulative pause duration.

```text
active_duration =
end - start - total_paused_duration
```

## 9.5 Pomo Completion

When countdown reaches `00:00`:

1. mark active Focus Session complete,
2. set end timestamp,
3. create Focus Record,
4. mark record as `POMO`,
5. assign `pomo_count = 1`,
6. update Overview,
7. append record to Focus Record list,
8. reset timer for next session.

Completion must be idempotent.

If the frontend fires completion twice, only one Focus Record may be created.

---

# 10. Stopwatch Timer

## 10.1 Initial State

```text
Mode: Stopwatch
Elapsed: 00:00
Status: IDLE
Primary action: Start
```

## 10.2 Start

On Start:

- store start timestamp,
- set session type `STOPWATCH`,
- associate selected Task/Habit,
- state becomes `RUNNING`.

## 10.3 Running

Displayed elapsed duration:

```text
elapsed =
current_timestamp - started_at - paused_duration
```

## 10.4 Stop / Finish

On finish:

1. set end timestamp,
2. calculate active duration,
3. create Focus Record,
4. record mode `STOPWATCH`,
5. set `pomo_count = 0`,
6. update focus duration aggregates,
7. show record in history.

---

# 11. Timer State Machine

Use an explicit state machine.

```text
                    Start
       ┌──────────────┐
       │              ▼
     IDLE --------> RUNNING
                       │
                 Pause │
                       ▼
                    PAUSED
                       │
                Resume │
                       ▼
                    RUNNING
                       │
             Finish / Timer ends
                       ▼
                   COMPLETED
                       │
                       ▼
                     IDLE
```

Optional cancellation:

```text
RUNNING / PAUSED
       │
     Cancel
       ▼
   CANCELLED
       │
       ▼
      IDLE
```

Do not create a completed Focus Record for a cancelled session unless the product intentionally offers “save elapsed time.”

---

# 12. Focus Session vs Focus Record

This distinction is mandatory.

## 12.1 Focus Session

Temporary/runtime object:

```text
FocusSession
```

Used for:

- active timer state,
- pause/resume state,
- crash recovery,
- determining whether a timer is already active.

## 12.2 Focus Record

Persistent historical object:

```text
FocusRecord
```

Created when:

- a timer session completes,
- a stopwatch session is stopped and saved,
- user manually adds a record.

---

# 13. Focus Record Data Model

Recommended schema:

```ts
type FocusMode = "POMO" | "STOPWATCH";

type FocusTargetType = "TASK" | "HABIT" | "NONE";

interface FocusRecord {
  id: string;

  userId: string;

  targetType: FocusTargetType;
  targetId: string | null;

  // Snapshot text protects history if original object is renamed/deleted.
  targetTitleSnapshot: string | null;

  startTime: string;        // ISO-8601
  endTime: string;          // ISO-8601

  durationSeconds: number;

  mode: FocusMode;

  // 1 for a normal completed Pomo.
  // May be >1 for manually-added long Pomo records if supported.
  // 0 for Stopwatch.
  pomoCount: number;

  note: string | null;

  source: "TIMER" | "MANUAL";

  createdAt: string;
  updatedAt: string;

  timezone: string;
}
```

Recommended constraints:

```text
endTime > startTime
durationSeconds >= 0
pomoCount >= 0

targetType = NONE
→ targetId = null

targetType != NONE
→ targetId should normally be non-null
```

---

# 14. Overview

The Overview panel contains four metrics:

```text
Today's Pomo
Today's Focus

Total Pomo
Total Focus Duration
```

## 14.1 Today's Pomo

Definition:

```text
sum(pomoCount)
for records belonging to the user's current local day
```

Example:

```text
4 completed Pomo records
→ Today's Pomo = 4
```

## 14.2 Today's Focus

Definition:

```text
sum(durationSeconds)
for all valid Focus Records belonging to today
```

Includes:

- Pomo
- Stopwatch
- manually added records

unless product rules intentionally exclude manual records.

Display compactly:

```text
0m
25m
1h 15m
3h 20m
```

## 14.3 Total Pomo

Definition:

```text
sum(pomoCount)
across all non-deleted Focus Records
```

## 14.4 Total Focus Duration

Definition:

```text
sum(durationSeconds)
across all non-deleted Focus Records
```

Example visible in reference:

```text
Total Pomo = 8
Total Focus Duration = 3h 20m
```

For eight 25-minute Pomos:

```text
8 × 25 min = 200 min = 3h 20m
```

---

# 15. Date Attribution Rule

Use the user's timezone.

Recommended rule for one-session-one-record behavior:

```text
record belongs to the local calendar date of startTime
```

However, for accurate daily statistics when sessions cross midnight, statistics should split duration by local day.

Example:

```text
Start: Aug 8 23:50
End:   Aug 9 00:20
```

History may show one record under Aug 8 if using start-date grouping.

Daily statistics should preferably attribute:

```text
Aug 8: 10 min
Aug 9: 20 min
```

Choose and document one behavior consistently.

---

# 16. Focus Record Timeline

The right panel contains:

```text
Focus Record
```

Records are grouped by date.

Example:

```text
Aug 2
  4:51 - 5:16      25m
  4:26 - 4:51      25m
  1:00 - 1:25      25m

Aug 1
  23:37 - 0:02     25m
  23:11 - 23:36    25m
```

## 16.1 Sorting

Recommended:

```text
date descending
within date: startTime descending
```

Newest records appear first.

## 16.2 Record Row

Each record row should support displaying:

- focus type icon,
- start time,
- end time,
- duration,
- associated target title if present,
- optional focus note indicator/details.

Minimum parity:

```text
[icon] 4:51 - 5:16                         25m
```

If target exists:

```text
[icon] 18:21 - 18:46                       25m
       No Title
```

or target title.

## 16.3 Empty State

If no Focus Records exist:

```text
No focus records yet.
Start a focus session to see your history here.
```

---

# 17. Add Focus Record

Clicking the `+` action opens an `Add Focus Record` modal.

Reference fields:

```text
Add Focus Record

Task       [Set Task        v]
Start Time [Set Time        v]
End Time   [Set Time        v]
Type       [Pomo : 0 Pomo   v]

Focus Note
[ What do you have in mind? ]

[Close] [OK]
```

---

# 18. Manual Focus Record — Field Requirements

## 18.1 Task

Label in reference:

```text
Task
```

Behavior:

- optional,
- opens work-item selector,
- should support Task selection,
- if desired, extend selector to Habit for parity with live focus associations.

Recommended data model still supports Task/Habit.

## 18.2 Start Time

Required.

User selects:

- date,
- time.

If the date is inferred from context, still store full timestamp.

## 18.3 End Time

Required.

Validation:

```text
End Time > Start Time
```

If invalid:

```text
End time must be later than start time.
```

## 18.4 Type

Dropdown controls record type.

At minimum:

```text
Pomo
Stopwatch
```

Reference copy indicates:

```text
Pomo : 0 Pomo
```

For manually entered Pomo records, allow Pomo count to be derived or selected.

Recommended deterministic rule:

```text
pomoCount = floor(duration / configuredPomoDuration)
```

Only use this rule if the design does not expose explicit Pomo count editing.

Safer implementation:

```text
Type = Pomo
Pomo Count = explicit user-selected integer
```

because a user may manually log a non-standard session.

## 18.5 Focus Note

Optional multiline text field.

Requirements:

- plain text,
- optional,
- preserve line breaks,
- enforce reasonable length, e.g. 2,000 characters,
- trim accidental leading/trailing whitespace on save.

## 18.6 Close

`Close`:

- dismisses modal,
- does not persist changes.

If data has been entered, optional confirmation:

```text
Discard this focus record?
```

## 18.7 OK

`OK`:

1. validate required fields,
2. create Focus Record,
3. close modal,
4. insert record into history,
5. recompute Overview,
6. recompute Statistics.

---

# 19. Add Focus Record Validation

Required validation rules:

```text
startTime != null
endTime != null
endTime > startTime
duration > 0
type != null
```

Optional validation:

```text
duration <= maximum manual entry duration
```

Do not allow impossible date ranges.

Avoid silent correction of invalid user input.

---

# 20. Secondary Menu

Clicking the `...` action opens:

```text
Statistics
Focus Settings
```

## 20.1 Statistics

Navigates to Focus Statistics.

## 20.2 Focus Settings

Navigates to configuration for timer behavior.

---

# 21. Focus Settings

The screenshots only expose the entry point, so the exact options are not visually defined.

To support the timer correctly, the settings domain should at minimum support:

```text
Pomo duration
Short break duration
Long break duration
Long-break interval
Auto-start break
Auto-start next focus session
Sound / notification preference
Pause policy
```

Only expose options that are intended for the product, but architect the timer so durations are configuration-driven.

Recommended defaults:

```json
{
  "pomoDurationMinutes": 25,
  "shortBreakMinutes": 5,
  "longBreakMinutes": 15,
  "longBreakAfterPomos": 4,
  "autoStartBreak": false,
  "autoStartPomo": false
}
```

---

# 22. Statistics

The screenshot confirms a Statistics destination but does not show the screen.

At minimum, the data model must support statistics generated from Focus Records.

Recommended statistics:

```text
Focus duration by day
Pomo count by day
Focus duration by week
Focus duration by month
Focus duration by Task
Focus duration by Habit
Focus duration by hour of day
Focus duration by mode
```

The Statistics feature should never maintain its own independent source-of-truth counters.

Correct architecture:

```text
Focus Records
    ↓
Aggregation queries
    ↓
Statistics
```

Not:

```text
Timer → increment many unrelated counters
```

Persistent denormalized aggregate tables may be used for performance, but Focus Records remain the canonical source.

---

# 23. Pomo Count Rules

Define Pomo count explicitly.

For a normal completed timer:

```text
one completed Pomo session = 1 Pomo
```

For cancelled/abandoned Pomo:

```text
0 Pomo
```

For Stopwatch:

```text
0 Pomo
```

For manual Pomo records:

```text
pomoCount must be explicitly stored
```

Do not infer historical Pomo count every time from duration because:

- users can change their configured Pomo duration,
- historical sessions may use different durations,
- manual records may not align to current settings.

---

# 24. Duration Rules

Every Focus Record stores its own immutable duration.

Recommended:

```text
durationSeconds =
endTime - startTime - pausedDuration
```

For manual records:

```text
durationSeconds =
endTime - startTime
```

If record timestamps are later edited:

```text
recalculate durationSeconds
```

---

# 25. Timezone Requirements

Store timestamps in UTC or ISO-8601 with offset.

Also retain relevant user timezone for reporting.

Example:

```text
2026-08-09T00:41:00+05:30
```

or UTC:

```text
2026-08-08T19:11:00Z
```

Display times in the current user timezone.

Daily statistics must use local calendar boundaries rather than UTC day boundaries.

---

# 26. Persistence / Refresh Behavior

An active focus session must not disappear on page refresh.

On every Focus page load:

```text
GET active focus session
```

If one exists:

```text
derive current timer value from timestamps
render RUNNING or PAUSED state
```

Example:

```text
session started: 10:00
planned end:     10:25
user refreshes:  10:07

remaining = 18 minutes
```

Do not reset to `25:00`.

---

# 27. Multi-Tab / Multi-Device Behavior

Recommended:

Only one active Focus Session per user.

If another browser tab tries to start one:

```text
A focus session is already running.
```

If multi-device sync exists:

- active session state must synchronize,
- completing on one device must update others,
- duplicate Focus Records must be prevented.

Backend should enforce uniqueness, not only frontend.

Possible rule:

```text
unique active session per user
where status IN (RUNNING, PAUSED)
```

---

# 28. Active Session Schema

Recommended:

```ts
interface FocusSession {
  id: string;
  userId: string;

  mode: "POMO" | "STOPWATCH";

  status:
    | "IDLE"
    | "RUNNING"
    | "PAUSED"
    | "COMPLETED"
    | "CANCELLED";

  targetType: "TASK" | "HABIT" | "NONE";
  targetId: string | null;
  targetTitleSnapshot: string | null;

  startedAt: string;
  plannedEndAt: string | null;

  pausedAt: string | null;
  totalPausedSeconds: number;

  plannedDurationSeconds: number | null;

  createdAt: string;
  updatedAt: string;
}
```

---

# 29. Suggested Backend API

Exact routes can differ, but functionality should map to these operations.

## Read Focus Dashboard

```http
GET /api/focus/dashboard
```

Response:

```json
{
  "activeSession": null,
  "overview": {
    "todayPomo": 0,
    "todayFocusSeconds": 0,
    "totalPomo": 8,
    "totalFocusSeconds": 12000
  },
  "records": []
}
```

## Start Session

```http
POST /api/focus/sessions
```

Request:

```json
{
  "mode": "POMO",
  "targetType": "TASK",
  "targetId": "task_123"
}
```

## Pause Session

```http
POST /api/focus/sessions/{sessionId}/pause
```

## Resume Session

```http
POST /api/focus/sessions/{sessionId}/resume
```

## Finish Session

```http
POST /api/focus/sessions/{sessionId}/finish
```

## Cancel Session

```http
POST /api/focus/sessions/{sessionId}/cancel
```

## Get Focus Records

```http
GET /api/focus/records?cursor=...
```

## Add Manual Focus Record

```http
POST /api/focus/records
```

Request:

```json
{
  "targetType": "TASK",
  "targetId": "task_123",
  "startTime": "2026-08-08T23:00:00+05:30",
  "endTime": "2026-08-08T23:25:00+05:30",
  "mode": "POMO",
  "pomoCount": 1,
  "note": "Finished first draft."
}
```

## Get Target Candidates

```http
GET /api/focus/targets?type=TASK&q=read
```

and:

```http
GET /api/focus/targets?type=HABIT&q=read
```

## Get Settings

```http
GET /api/focus/settings
```

## Update Settings

```http
PATCH /api/focus/settings
```

---

# 30. Idempotency

Critical endpoints must be safe against duplicate requests.

Particularly:

```text
Finish Session
Create Focus Record from timer
```

Example failure:

```text
timer hits 00:00
frontend sends finish
network retries
frontend sends finish again
```

Expected:

```text
1 completed session
1 Focus Record
1 Pomo increment
```

Never:

```text
2 records
2 Pomos
```

---

# 31. Focus Target Lifecycle

If a Task/Habit is renamed after a Focus Record was created:

- future UI may display current title,
- historical fallback should remain available through `targetTitleSnapshot`.

If a Task/Habit is deleted:

- Focus Record must remain.
- History must not be deleted.
- Display snapshot title or `Deleted task`.

This ensures historical analytics are stable.

---

# 32. Completion and Task Status

Completing a Focus Session must **not automatically complete the associated Task**.

The concepts are different:

```text
Focus finished ≠ Work finished
```

A task may require multiple focus sessions.

Example:

```text
Task: Write Product Spec

Session 1: 25m
Session 2: 25m
Session 3: 25m

Task may still remain open.
```

---

# 33. Task-Level Focus Aggregation

The architecture should support:

```text
Task
  ├── Focus Record 1: 25m
  ├── Focus Record 2: 25m
  └── Focus Record 3: 15m

Actual focused time = 65m
```

This allows future task-level analytics without changing core records.

---

# 34. Habit-Level Focus Aggregation

Similarly:

```text
Habit: Read

Aug 1: 25m
Aug 2: 25m
Aug 5: 40m

Total focused reading = 90m
```

Focus time does not necessarily mean the Habit was checked off.

Keep:

```text
Habit completion
```

and

```text
Habit focus time
```

as separate domain events unless product requirements explicitly connect them.

---

# 35. UI State Requirements

## 35.1 Initial

```text
Pomo selected
Configured time visible
Start enabled
No active session
```

## 35.2 Target Selected

```text
Target title visible
Start enabled
```

## 35.3 Running

```text
Timer live
Start hidden/replaced
Mode switching restricted
Target switching restricted or explicitly confirmed
```

## 35.4 Paused

```text
Timer frozen
Resume available
Finish/Cancel available
```

## 35.5 Completed

```text
Record saved
Overview recalculated
History updated
Timer reset
```

## 35.6 Error

Examples:

```text
Unable to start focus session.
Unable to save focus record.
```

Never display a completed success state until persistence succeeds or a robust offline-sync mechanism exists.

---

# 36. Search Interaction Requirements

Task/Habit selector should:

- debounce search input,
- search case-insensitively,
- support partial title matching,
- preserve selected target when reopening,
- show clear selected state,
- allow deselection.

Recommended debounce:

```text
150–300 ms
```

For local datasets, search can be immediate.

---

# 37. History Pagination

Do not load unlimited historical records.

Use cursor-based pagination.

Example:

```http
GET /api/focus/records?limit=50
```

Response:

```json
{
  "items": [],
  "nextCursor": "..."
}
```

UI may implement:

- infinite scroll, or
- Load more.

---

# 38. History Grouping Algorithm

Pseudo-code:

```ts
const grouped = groupBy(records, record => {
  return localDate(record.startTime, user.timezone);
});

const sortedDates = sortDescending(Object.keys(grouped));

for (const date of sortedDates) {
  grouped[date].sort(
    (a, b) => timestamp(b.startTime) - timestamp(a.startTime)
  );
}
```

---

# 39. Overview Calculation Pseudocode

```ts
function calculateOverview(records, timezone, now) {
  const today = localDate(now, timezone);

  let todayPomo = 0;
  let todayFocusSeconds = 0;
  let totalPomo = 0;
  let totalFocusSeconds = 0;

  for (const record of records) {
    if (record.deleted) continue;

    totalPomo += record.pomoCount;
    totalFocusSeconds += record.durationSeconds;

    if (localDate(record.startTime, timezone) === today) {
      todayPomo += record.pomoCount;
      todayFocusSeconds += record.durationSeconds;
    }
  }

  return {
    todayPomo,
    todayFocusSeconds,
    totalPomo,
    totalFocusSeconds
  };
}
```

For cross-midnight sessions, use interval splitting if exact per-day duration is required.

---

# 40. Duration Formatting

Use compact duration presentation.

Examples:

```text
0 seconds        → 0m
60 seconds       → 1m
1500 seconds     → 25m
3600 seconds     → 1h
4500 seconds     → 1h 15m
12000 seconds    → 3h 20m
```

Timer itself should use:

```text
MM:SS
```

or for long Stopwatch sessions:

```text
HH:MM:SS
```

---

# 41. Accessibility Requirements

Interactive controls must be keyboard-accessible.

Requirements:

- Task/Habit tabs usable by keyboard
- modal focus trapped inside modal
- Escape closes popover/modal where safe
- radio controls have labels
- timer status announced accessibly without announcing every second
- Start/Pause/Resume/Finish controls have accessible names
- sufficient contrast in dark/light themes
- don't encode state only by color

---

# 42. Notifications

When a Pomo finishes:

- provide visible completion feedback,
- optionally system notification,
- optionally sound.

Notification behavior should follow Focus Settings and OS/browser permissions.

If notifications are denied, timer completion must still function.

---

# 43. Background Tab Accuracy

Browsers throttle timers in background tabs.

Therefore:

Do not rely on:

```js
setInterval(() => remaining--, 1000)
```

as source of truth.

Use:

```js
remaining = plannedEndAt - Date.now()
```

on every render/update.

When tab returns to foreground:

- recalculate from timestamps,
- if remaining <= 0, trigger idempotent completion flow.

---

# 44. Offline Behavior

Choose one policy and implement it consistently.

Recommended minimum:

- active timer can visually continue offline,
- server completion waits for network,
- UI marks completion as pending,
- retry with an idempotency key.

Alternative:

- require online connection to start/finish.

Do not silently lose completed focus time.

---

# 45. Conflict Handling

Potential conflict:

```text
Device A starts focus
Device B starts focus
```

Backend returns conflict:

```http
409 ACTIVE_FOCUS_SESSION_EXISTS
```

Frontend then offers:

```text
A focus session is already active.
```

If desired:

```text
Resume existing session
```

---

# 46. Analytics Events

Product analytics should be separate from user Focus Records.

Recommended instrumentation:

```text
focus_screen_viewed
focus_mode_changed
focus_target_selector_opened
focus_target_selected
focus_target_removed
focus_session_started
focus_session_paused
focus_session_resumed
focus_session_cancelled
focus_session_completed
focus_record_add_opened
focus_record_added
focus_statistics_opened
focus_settings_opened
```

Suggested properties:

```json
{
  "mode": "POMO",
  "target_type": "TASK",
  "duration_seconds": 1500,
  "source": "TIMER"
}
```

Do not send task names or focus notes to analytics unless privacy policy explicitly allows it.

---

# 47. Product Metrics

Useful feature metrics:

```text
Focus activation rate
= users starting >=1 focus session / users opening Focus

Focus completion rate
= completed sessions / started sessions

Focus target attachment rate
= sessions with Task/Habit / total sessions

Weekly focused users

Average focus duration

Pomo vs Stopwatch usage

Manual record usage

Focus sessions per active user

Task-linked focused time
```

---

# 48. Error States

## Cannot load Tasks/Habits

```text
Couldn't load tasks.
Try again.
```

Timer must still be usable without a target.

## Cannot create session

```text
Couldn't start focus session.
```

Do not start a fake timer that cannot be recovered unless offline mode is supported.

## Cannot save completion

Keep local pending state and retry.

Do not reset the UI and lose the record.

## Cannot load history

Overview/timer should remain independently usable.

---

# 49. Edge Cases

Engineering and QA must explicitly test:

1. Pomo completes while browser tab is backgrounded.
2. Browser refresh during Pomo.
3. Browser refresh during Stopwatch.
4. User closes browser and returns before Pomo ends.
5. User returns after Pomo should already have ended.
6. Session crosses midnight.
7. Session crosses timezone change.
8. Daylight saving change where applicable.
9. Task is deleted during active focus.
10. Habit is archived during active focus.
11. Task is renamed during active focus.
12. Network fails during completion.
13. Completion request is retried.
14. User clicks Start twice rapidly.
15. User clicks Finish twice rapidly.
16. Two browser tabs start simultaneously.
17. Manual record has equal start/end time.
18. Manual record has end before start.
19. Very long Stopwatch session.
20. User changes Pomo duration after historical records exist.
21. User manually adds a record in the past.
22. User manually adds a record for today and Overview immediately updates.
23. User has zero Focus Records.
24. History contains hundreds/thousands of records.
25. Search returns no Tasks.
26. Search returns no Habits.

---

# 50. Acceptance Criteria — Focus Dashboard

### AC-FD-01

Given the user opens Focus with no active session,  
when Pomo is selected,  
then the configured Pomo duration is displayed and Start is available.

### AC-FD-02

Given the user has historical Focus Records,  
when Focus loads,  
then Today's Pomo, Today's Focus, Total Pomo, and Total Focus Duration are calculated and displayed.

### AC-FD-03

Given records exist on multiple dates,  
when Focus Record is displayed,  
then records are grouped by date and newest records appear first.

---

# 51. Acceptance Criteria — Target Selection

### AC-TS-01

Given the target selector is opened,  
then Task and Habit tabs are visible.

### AC-TS-02

Given Task is selected,  
then the user can search and select one Task.

### AC-TS-03

Given Habit is selected,  
then the user can search and select one Habit.

### AC-TS-04

Given a target is selected,  
when a session starts,  
then the session stores the target association.

### AC-TS-05

Given no target is selected,  
then the user can still start a focus session.

---

# 52. Acceptance Criteria — Pomo

### AC-PM-01

Given Pomo mode is idle,  
when the user selects Start,  
then a Focus Session is created and countdown begins.

### AC-PM-02

Given a Pomo reaches zero,  
then exactly one Focus Record is created.

### AC-PM-03

Given one full Pomo is completed,  
then `pomoCount = 1`.

### AC-PM-04

Given a Pomo completes,  
then Total Focus Duration increases by the session's active duration.

### AC-PM-05

Given a Pomo completion belongs to today,  
then Today's Pomo and Today's Focus update immediately.

---

# 53. Acceptance Criteria — Stopwatch

### AC-SW-01

Given Stopwatch is selected,  
when Start is pressed,  
then elapsed time begins at zero.

### AC-SW-02

Given Stopwatch is running,  
when Finish is pressed,  
then a Focus Record is created with the actual elapsed duration.

### AC-SW-03

A Stopwatch record must have:

```text
mode = STOPWATCH
pomoCount = 0
```

unless product requirements explicitly define otherwise.

---

# 54. Acceptance Criteria — Manual Record

### AC-MR-01

Clicking `+` opens Add Focus Record.

### AC-MR-02

The modal contains:

- Task
- Start Time
- End Time
- Type
- Focus Note
- Close
- OK

### AC-MR-03

Given End Time <= Start Time,  
when OK is selected,  
then save is blocked and validation is shown.

### AC-MR-04

Given valid data,  
when OK is selected,  
then the record is persisted and appears in Focus Record history.

### AC-MR-05

If the manual record belongs to today,  
today's metrics update immediately.

### AC-MR-06

Closing the modal without saving must not create a record.

---

# 55. Acceptance Criteria — Menu

### AC-MN-01

Clicking `...` exposes:

```text
Statistics
Focus Settings
```

### AC-MN-02

Clicking Statistics navigates to Focus Statistics.

### AC-MN-03

Clicking Focus Settings navigates to Focus Settings.

---

# 56. Database Model

A relational implementation could use:

```sql
focus_sessions
--------------
id
user_id
mode
status
target_type
target_id
target_title_snapshot
started_at
planned_end_at
paused_at
total_paused_seconds
planned_duration_seconds
created_at
updated_at

focus_records
-------------
id
user_id
target_type
target_id
target_title_snapshot
start_time
end_time
duration_seconds
mode
pomo_count
note
source
timezone
created_at
updated_at
deleted_at

focus_settings
--------------
user_id
pomo_duration_seconds
short_break_duration_seconds
long_break_duration_seconds
long_break_after_pomos
auto_start_break
auto_start_pomo
notifications_enabled
sound_enabled
created_at
updated_at
```

Indexes:

```sql
focus_records(user_id, start_time DESC)
focus_records(user_id, target_type, target_id)
focus_sessions(user_id, status)
```

Enforce one active session using an appropriate partial unique index where supported.

---

# 57. LLM Implementation Rules

When this specification is provided to a coding LLM, it should follow these rules:

1. Do not collapse Focus Session and Focus Record into one object.
2. Do not hardcode `25 minutes`; read from Focus Settings.
3. Do not calculate timers only through frontend intervals.
4. Use timestamps as the timer source of truth.
5. Do not require a Task/Habit to start a focus session.
6. Only one Task or Habit can be attached to a session.
7. Do not automatically complete a Task when a focus timer finishes.
8. Persist historical Focus Records even if their Task/Habit is later deleted.
9. Store Pomodoro count on the historical record.
10. Never recalculate historical Pomo count using the user's current settings.
11. Manual records must use the same Focus Record model as timer-created records.
12. Overview and Statistics must derive from Focus Records.
13. Completion must be idempotent.
14. Active sessions must survive refresh.
15. Use the user's timezone for daily grouping.
16. All timestamps must be stored in an unambiguous standard format.
17. Separate user productivity records from product analytics telemetry.
18. Do not invent functionality not described in this document without marking it as an extension.

---

# 58. Recommended Implementation Sequence

## Phase 1 — Data Foundation

Build:

- Focus Settings model
- Focus Session model
- Focus Record model
- Task/Habit association
- aggregation functions

Deliverable:

```text
Backend can create/read Focus Records and calculate Overview.
```

## Phase 2 — Timer Engine

Build:

- Pomo timer
- Stopwatch
- active session persistence
- state machine
- finish/cancel
- idempotency
- refresh recovery

Deliverable:

```text
Reliable timing engine.
```

## Phase 3 — Target Association

Build:

- Focus target popover
- Task tab
- Habit tab
- search
- selected target display

Deliverable:

```text
Sessions can be associated with work.
```

## Phase 4 — Focus Dashboard

Build:

- Overview
- Focus Record timeline
- date grouping
- duration formatting
- pagination

Deliverable:

```text
Users can see today + historical focus activity.
```

## Phase 5 — Manual Record

Build:

- Add Focus Record modal
- Task selection
- Start Time
- End Time
- Type
- Focus Note
- validation

Deliverable:

```text
Users can recover focus time that was not recorded by the timer.
```

## Phase 6 — Settings + Statistics

Build:

- settings page
- statistics page
- aggregate charts/data
- historical filtering

Deliverable:

```text
Complete focus-management loop.
```

## Phase 7 — Hardening

Test:

- background timers
- refresh
- retries
- cross-midnight
- multiple tabs
- offline behavior
- large history
- deleted targets

---

# 59. MVP Definition

For a first shippable version with the same core utility, the minimum is:

```text
✓ Pomo
✓ Stopwatch
✓ Task selector
✓ Habit selector
✓ Start/finish focus
✓ Persist Focus Record
✓ Today's Pomo
✓ Today's Focus
✓ Total Pomo
✓ Total Focus Duration
✓ Focus Record timeline
✓ Add Focus Record
✓ Focus Note
✓ Statistics navigation
✓ Focus Settings navigation
✓ Active-session recovery after refresh
```

The feature is not complete if it is only a visual countdown timer.

The important product behavior is:

```text
WORK OBJECT
    +
FOCUS TIMER
    ↓
FOCUS RECORD
    ↓
HISTORY + AGGREGATION
```

---

# 60. Canonical End-to-End Examples

## Example A — Task + Pomo

```text
User opens Focus
→ selects Task
→ chooses "Write PRD"
→ Pomo remains selected
→ timer shows 25:00
→ clicks Start
→ timer runs 25 minutes
→ session completes
→ Focus Record created:

Task: Write PRD
Start: 10:00
End: 10:25
Duration: 25m
Type: Pomo
Pomo Count: 1

→ Today's Pomo +1
→ Today's Focus +25m
→ Total Pomo +1
→ Total Focus +25m
→ record appears in today's history
```

## Example B — Habit + Stopwatch

```text
User opens Focus
→ selects Habit
→ chooses "Read"
→ switches to Stopwatch
→ clicks Start
→ reads for 42 minutes
→ clicks Finish

Focus Record:

Habit: Read
Duration: 42m
Type: Stopwatch
Pomo Count: 0

→ Today's Focus +42m
→ Total Focus +42m
→ Pomo counters unchanged
```

## Example C — No Target

```text
User opens Focus
→ does not select Task/Habit
→ starts Pomo
→ completes 25m

Focus Record:

Target: none
Duration: 25m
Type: Pomo
Pomo Count: 1
```

The record is valid.

## Example D — Manual Recovery

```text
User forgot to start the timer
→ clicks +
→ Add Focus Record
→ Task: Research
→ Start: 14:00
→ End: 14:50
→ Type: Stopwatch
→ Note: "Competitor analysis"
→ clicks OK

System:
→ creates 50-minute manual Focus Record
→ updates Overview
→ inserts into history
→ includes record in Statistics
```

---

# 61. Final Product Principle

This module should be implemented as a **focus-tracking system**, not as a Pomodoro widget.

The product model is:

```text
What am I working on?
        ↓
How am I timing it?
        ↓
What actually happened?
        ↓
What does my history show?
```

That relationship between **Task/Habit → Session → Record → Statistics** is the core functionality that must remain intact.
