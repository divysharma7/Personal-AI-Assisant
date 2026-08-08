# Calendar Redesign — Detailed Use Cases

## Objective

Turn the existing Calendar into a full-canvas planning workspace that matches the supplied dark calendar references while preserving Life OS task scheduling, editing, drag-and-drop, Google Calendar visibility, filters, and keyboard workflows.

The reference's **Upgrade Now** control is intentionally excluded. All calendar views are available to the user. The floating control at the bottom is a view switcher only.

## Actors and data

- **Primary actor:** a signed-in Life OS user planning tasks and reviewing commitments.
- **Task events:** writable Life OS tasks with scheduled start/end times or all-day due dates.
- **External events:** read-only calendar commitments displayed alongside tasks.
- **Habit and focus overlays:** optional calendar entries controlled by Calendar settings.
- **Current date:** the date around which each view is calculated and navigated.

## Shared calendar shell

### UC-01 — Open the calendar

**Given** the user navigates to `/calendar`
**When** calendar data finishes loading
**Then** the calendar fills the viewport with no permanent application, mini-calendar, or unscheduled-task sidebar
**And** the header shows the active month, or the active year in Year view
**And** the user's current view and date are represented by the view canvas.

### UC-02 — Change views

**When** the user selects Year, Month, Week, Day, Agenda, Multi-Day, or Multi-Week from the floating view dock or header dropdown
**Then** the canvas switches without losing the current date
**And** the selected view is visibly highlighted in both controls
**And** there is no upgrade prompt or gated view.

View mapping:

| Display label | Internal mode | Range |
| --- | --- | --- |
| Year | `year` | Twelve months |
| Month | `month` | Six calendar weeks |
| Week | `week` | Seven days |
| Day | `day` | One day |
| Agenda | `agenda` | Chronological upcoming events |
| Multi-Day | `3day` | Three consecutive days |
| Multi-Week | `multiweek` | Two consecutive weeks |

### UC-03 — Navigate time

**When** the user clicks Previous or Next
**Then** the current date moves by the active view's natural range.
**When** the user clicks Today
**Then** the current date returns to today while the active view stays selected.

### UC-04 — Create an event

**When** the user clicks the header `+`
**Then** a compact quick-add surface opens for the current date.
**When** the user clicks or drags an empty time slot
**Then** creation is seeded with that date and time.
**When** the user double-clicks a Month cell
**Then** a one-hour task is created at 09:00 for that date.
**And** successful creation updates the calendar data without a full-page reload.

### UC-05 — Inspect or edit an event

**When** the user selects a writable event
**Then** a compact event popover opens near the selected event
**And** the user can continue into the full task editor.
**When** the event is external or read-only
**Then** it remains inspectable but cannot be dragged, resized, or changed.

### UC-06 — Move, resize, and select events

**When** the user drags a writable timed event
**Then** its schedule moves to the target date/time.
**When** the user drags its bottom resize affordance
**Then** its end time changes in 15-minute increments.
**When** the user clicks events while holding Shift, Ctrl, or Command
**Then** events enter multi-selection and the existing batch action bar appears.
**When** the user presses Escape
**Then** the selection clears.

### UC-07 — Use secondary calendar actions

**When** the user opens the ellipsis menu
**Then** they can access view options, arrange tasks, print, share, keyboard shortcuts, and return to the main app.
**And** secondary panels appear as temporary overlays rather than permanently reducing calendar width.

## View-specific use cases

### UC-08 — Year overview

- Show twelve mini-months in a responsive four-column desktop grid.
- Use a blue density heatmap to show the number of calendar entries per day.
- Distinguish days outside each month with reduced opacity.
- Clicking a month name opens Month view for that month.
- Clicking a date opens Week view around that date.

### UC-09 — Month planning

- Show a seven-column, six-row month grid filling the available canvas.
- Show adjacent-month dates with subdued text.
- Mark today with a blue circular date badge.
- Render compact colored event bars with checkbox, title, and optional time.
- Limit visible events per cell and expose overflow with `+N more`.
- Single-click a date to open Day view; double-click empty space to create.

### UC-10 — Week scheduling

- Show seven columns and a visible-hour time grid.
- Keep day names and dates fixed above the scrollable time grid.
- Render timed events at their real vertical position and duration.
- Lay overlapping events side by side.
- Display all-day events in a compact band when present.
- Show a current-time indicator only in the current week.

### UC-11 — Day scheduling

- Show one full-width day column with the same time scale as Week view.
- Render events at their actual duration across the available width.
- Support empty-slot creation, drag-to-create, event movement, and resizing.
- Keep hidden-hour expansion controls available above and below the visible range.

### UC-12 — Agenda review

- Show a centered chronological stream with generous side margins.
- Group events by date using a large date number and short weekday label.
- Render each event as a horizontal colored card connected to a time marker.
- Show start/end time above the title and retain long lists through incremental loading.

### UC-13 — Multi-Day planning

- Show three consecutive day columns on the same timed grid as Week view.
- Preserve drag, resize, creation, all-day, and current-time behaviors.

### UC-14 — Multi-Week planning

- Show fourteen days as two seven-column rows.
- Each row occupies roughly half the available height.
- Render compact event bars near the top of each day while preserving open space for scanning.
- Clicking a date opens Day view.

## Responsive and accessibility requirements

- Desktop is the primary high-density experience and should closely match the 2048×1152 references.
- At narrower widths, the calendar remains horizontally scrollable where shrinking would make time or event text unusable.
- Interactive controls have accessible names, visible keyboard focus, and minimum practical hit areas.
- Color is supplemented by text, date labels, and event structure; it is not the only indicator of meaning.
- Motion honors `prefers-reduced-motion`.
- Keyboard shortcuts remain: Day (`D`/`1`), Week (`W`/`2`), Multi-Day (`3`), Month (`M`/`4`), Year (`Y`/`5`), Agenda (`A`/`6`), Today (`T`), Previous/Next (arrow keys), Quick Add (`Q`).

## Acceptance criteria

1. All seven views render real calendar/task data and are selectable without a paywall CTA.
2. Header and floating dock remain visually consistent across every view.
3. Today, Previous, Next, Quick Add, event detail, drag/drop, resizing, and batch selection continue to work.
4. Year, Month, Week, Day, Agenda, Multi-Day, and Multi-Week visually match their corresponding references in layout, density, color, borders, and spacing.
5. Calendar fills the viewport; permanent side panels do not reduce the canvas.
6. Type checking, unit tests, lint for changed files, and the production build pass.
