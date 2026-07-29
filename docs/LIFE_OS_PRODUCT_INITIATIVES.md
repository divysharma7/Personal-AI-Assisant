# Life OS product initiatives

## Product direction

Life OS should not become another place where people maintain lists. Its job is to
help a person move through a complete daily loop:

> See reality → choose what matters → protect time → close the loop.

The product should feel calm, editorial, and decisive. The interface can be rich,
but each surface should answer one clear question.

## What Routine gets right

The Routine review surfaced four principles worth adapting rather than copying:

1. **Agenda is an attention filter.** It is a deliberately narrow view of one day,
   not a compressed calendar grid.
2. **Connection and behavior are separate.** A Google account can be connected,
   while each calendar independently decides whether it is active or passive.
3. **Settings are operational.** Preferences use clear groups, compact rows, and
   immediate state. There is little decorative UI.
4. **Whitespace reduces cognitive load.** The agenda leaves room around the
   timeline and avoids filling an empty day with dashboards.

The strongest model is the distinction between:

- **Active calendars:** commitments that make a person busy and belong in Agenda.
- **Passive calendars:** birthdays, holidays, reference, and planning overlays
  that belong in Calendar but not in the daily attention stream.

## North-star loop

The primary product metric should be:

**Days per week in which a user completes Plan → Focus → Complete.**

Supporting activation measures:

- Onboarding completed in under two minutes.
- Google Calendar connected or explicitly skipped.
- First agenda item planned within 24 hours.
- First focus session completed within 24 hours.
- At least three days with a completed daily loop during week one.

Quality guardrails:

- Calendar sync success above 99%.
- No duplicate external events.
- Median Agenda load under one second after initial app load.
- Less than 2% of connected accounts requiring manual reconnect per month.

## Initiative map

### P0 — Life OS identity and first-run experience

**Problem:** The previous LAIF name and purple glass treatment felt like a generic
AI tool. Onboarding collected information without demonstrating product value.

**Outcome:** A user understands the product promise before creating an account and
starts with a useful workspace.

Scope:

- Life OS name, code-native mark, and warm editorial visual language.
- Auth pages that communicate the Plan → Focus → Reset loop.
- Three-step onboarding: identity, desired outcomes, optional Google connection.
- Transparent calendar permission copy and an equally clear skip path.

Status: first implementation complete.

### P0 — Focus protocol

**Problem:** The old Pomodoro page centered stock photos, fake ambient sounds, and
quotes. It was detached from backend session records and from the work itself.

**Outcome:** Starting focus feels like committing to one clear result. Completed
sessions become reliable product data.

Scope:

- Intent-first timer with flexible 25/5, 50/10, and 90/15 rhythms.
- Clearly labeled focus and reset states.
- Pause, resume, extend, cancel, recovery after refresh, and backend persistence.
- Real daily and weekly focus totals.
- Start focus from a task or habit with context carried into the session.

Status: first implementation complete.

### P1 — Daily Agenda

**Problem:** Calendar grids show time, and task lists show work, but neither tells
the user how to move through today.

**Outcome:** Agenda becomes the default execution surface for the day.

Scope:

- A narrow, chronological day lane combining active calendar events, scheduled
  tasks, habits, and completed focus sessions.
- Unscheduled priority tray with drag-to-time and one-click scheduling.
- Now marker, conflict cues, travel/buffer awareness, and a compact past section.
- Empty state that invites a first meaningful block rather than showing analytics.
- Start Focus directly from the current or next agenda item.

Acceptance criteria:

- A user can understand the day, schedule a task, and begin focus without leaving
  Agenda.
- Passive calendars never make Agenda noisy or mark availability as busy.

### P1 — Calendar control center

**Problem:** “Connected” is not enough. People need to know what is syncing, where
new events go, and which calendars affect availability.

**Outcome:** Calendar behavior is predictable and explainable.

Scope:

- Connected-account cards with sync health, last sync, reconnect, and remove.
- Default write calendar.
- Active and passive calendar groups with visibility, color, and reordering.
- Time-zone handling, duplicate prevention, and explicit read/write permissions.
- Manual Sync action plus understandable error recovery.

Acceptance criteria:

- Every imported event has a clear source.
- A user can hide a birthday calendar from Agenda without disconnecting Google.
- The product shows whether a sync is healthy, delayed, or needs attention.

### P1 — Settings information architecture

**Problem:** As capabilities grow, a flat settings page becomes difficult to scan.

**Outcome:** Users can predict where every preference lives.

Recommended groups:

- Personalization
- Date & time
- Calendar
- Integrations
- Focus
- Notifications
- Data & privacy

Use a persistent settings navigation on desktop and grouped row navigation on
small screens. Keep descriptions close to controls and isolate destructive actions.

### P2 — Daily opening and shutdown rituals

**Problem:** Planning products often help a user add work but do not help them stop.

**Outcome:** Life OS creates a sustainable daily rhythm.

Scope:

- Morning plan: commitments, capacity, top outcome, and suggested focus windows.
- Evening close: completed work, unfinished decisions, tomorrow handoff.
- AI suggestions remain proposals until the user confirms them.

### P2 — Calendar intelligence

**Problem:** Raw calendar data does not account for preparation, recovery, or task
effort.

**Outcome:** Life OS helps protect capacity without pretending to know everything.

Scope:

- Optional buffers around meetings.
- Suggested slots based on task estimate, working hours, and focus preference.
- Conflict explanations in plain language.
- Weekly load view showing committed versus available time.

## Delivery sequence

### Slice 1 — Foundation

- Ship Life OS rebrand, onboarding, and Focus protocol.
- Verify auth, calendar OAuth redirect, session persistence, and responsive states.

### Slice 2 — Agenda core

- Recompose the existing Agenda view around active events and scheduled tasks.
- Add start-focus handoff and first useful empty state.

### Slice 3 — Calendar control

- Extend the Google integration API for account calendars, sync health, and
  active/passive behavior.
- Replace the current setup drawer with the calendar control center.

### Slice 4 — Daily loop

- Add morning planning and evening shutdown.
- Measure the full Plan → Focus → Complete loop and tune activation.

## Deliberate non-goals

- Do not copy Routine’s layouts or visual identity.
- Do not add more integrations before Google Calendar is trustworthy.
- Do not reintroduce decorative focus scenes or synthetic ambient audio.
- Do not let AI silently rearrange a user’s day.
- Do not make streaks the main emotional reward; control and clarity come first.
