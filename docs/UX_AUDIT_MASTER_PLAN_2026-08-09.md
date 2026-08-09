# Life OS UX audit and master plan

**Audit date:** 2026-08-09  
**Scope:** Authentication, onboarding, global navigation, Inbox, Today, Next 7 Days, Tasks, Lists, Workflows, Agenda, Calendar, Habits, Focus, Morning Plan, Evening Shutdown, Priority Matrix, Chat, Statistics, Profile, Settings, integrations, and cross-cutting accessibility/responsiveness.  
**Method:** Static product and interaction audit of the current frontend and API surface, checked against the [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). This is a heuristic and implementation audit; it should be followed by observed usability sessions.

## 1. Executive diagnosis

Life OS has most of the ingredients of a strong personal operating system, but they currently behave like adjacent tools rather than one dependable system.

The intended loop is clear:

> Capture -> clarify -> plan -> schedule -> focus -> complete -> reflect -> adapt

The largest UX problem is **journey continuity**. Users repeatedly lose task context, encounter different actions for the same object, or reach a surface that reports a different version of reality. Further visual refinement should follow—not precede—a product integrity pass.

### Product health snapshot

| Area | Maturity | Main gap |
|---|---:|---|
| Navigation and shell | 3/5 | Compact but overloaded; global create is broken |
| Task capture and management | 3/5 | Five task presentations with different action coverage |
| Lists and workflows | 3/5 | Capable organization, inconsistent task detail and menus |
| Agenda | 4/5 | Strong daily surface, but broken empty-state create and share links |
| Calendar | 3/5 | Broad views, but state is not shareable and overlaps Agenda conceptually |
| Habits | 3/5 | Useful tracking, duplicated check-in journeys and weak URL continuity |
| Focus | 4/5 | Strong timer core, duplicated session controllers and notification gap |
| Plan and Shutdown | 2/5 | Excellent concept; several actions do not produce the promised result |
| Priority Matrix | 2/5 | Classification exists, creation and toolbar behavior are incomplete |
| Chat | 2/5 | Core streaming works; visible attachment/mic affordances are inert |
| Analytics and Profile | 1/5 | Duplicate surfaces contain placeholder, zero, or fabricated focus data |
| Settings and integrations | 2/5 | Several settings are descriptive or inert rather than operational |
| Accessibility and responsive use | 1/5 | Product is blocked below 1024px; small targets and keyboard gaps remain |

## 2. Severity model

- **P0 — Trust or completion blocker:** A visible action fails, produces incorrect data, loses work/context, or misrepresents the product.
- **P1 — Major journey friction:** The user can finish, but only by switching mental models, repeating work, or discovering hidden behavior.
- **P2 — Quality and scale issue:** Accessibility, responsive behavior, performance, consistency, or polish that materially affects repeated use.
- **P3 — Enhancement:** Delight or optimization after the core loop is dependable.

Effort shorthand: **S** = up to 2 engineering days, **M** = 3–5 days, **L** = 1–2 weeks, **XL** = more than 2 weeks.

## 3. P0 findings: fix before more UI expansion

| ID | Finding | Evidence | User impact | Fix | Effort |
|---|---|---|---|---|---:|
| UX-001 | Global “Create new task” does nothing | `TodaySidebar.tsx:146` dispatches Ctrl+N, while `useGlobalShortcuts.ts:16` rejects Ctrl/Meta shortcuts other than K | Breaks the most important global action | Introduce one `openGlobalTaskComposer()` command; use it from rail, command palette, empty states, and keyboard | S |
| UX-002 | Agenda empty-state “Add task” also does nothing | Agenda dispatches `laif:focus-new-task`; only Inbox listens for it | Empty day has no reliable activation action | Put the composer in the shell, not a page; keep destination/date context in the command payload | S |
| UX-003 | Copied task links cannot restore task detail | Task links include `?task=...`, but the shell only opens detail from an in-memory custom event | Shared/reloaded links lose the object the user intended to show | Make `task` a route-backed shell state and support direct load, back/forward, and close | M |
| UX-004 | Profile displays fabricated focus performance | `profile/page.tsx:13–43` defines placeholder focus data and renders it as personal history | Direct trust violation | Remove placeholder values; use the focus statistics API with explicit loading/empty/error states | M |
| UX-005 | Global Statistics Focus tab always reports zero | `statistics/page.tsx:359–393` hard-codes zeros and empty records | Contradicts the Focus dashboard and Profile | Create one analytics query/model consumed by Focus Statistics, global Statistics, and Profile | M |
| UX-006 | Data export and delete-account controls are inert | `settings/page.tsx:292–315` renders buttons with no handlers | Dangerous false affordance, especially for deletion/privacy | Implement verified export and re-authenticated deletion, or remove controls until real | M/L |
| UX-007 | Evening Shutdown “Move” does not move a task | `shutdown/page.tsx:165–180` records the decision but does not change date/time | User closes the day believing tomorrow is ready when it is not | Require destination date/time; persist the move before marking the item decided | M |
| UX-008 | Undo after unscheduling cannot restore the schedule | `shutdown/page.tsx:198–202` explicitly cannot restore old start/end | “Undo” is not reversible and can lose a schedule | Store the complete pre-mutation snapshot and restore it transactionally | S |
| UX-009 | “Plan tomorrow” opens today’s plan | Shutdown navigates to `/plan`, while Plan always uses `useTodayDate()` | The final daily-loop handoff targets the wrong day | Support `/plan?date=YYYY-MM-DD`; pass tomorrow explicitly | S |
| UX-010 | Morning Plan counts scheduled tasks from every date | `plan/page.tsx:69–78` filters scheduled tasks without checking the plan date | Capacity and confirmation summaries can be incorrect | Use the selected plan date and the agenda response as the single day boundary | S |
| UX-011 | Priority Matrix creates blank tasks | Matrix asks only for estimated effort, then creates `title: ''` | Produces invisible/meaningless records | Ask for title first, then metadata; keep a pending draft until valid | S |
| UX-012 | Integrations claim capabilities that are unavailable | Alexa API says disabled pending audit; MCP endpoint returns “implement as needed,” while Settings can show it Active | Users expose keys or attempt setup for non-working services | Hide behind an internal flag or label “Unavailable”; do not issue keys until end-to-end verified | S |

## 4. Journey audit

### 4.1 First run: promise -> setup -> first value

**What works**

- Authentication has clear loading/error handling.
- Onboarding is short and offers calendar connection as optional.
- The product promise centers planning, focus, and habits.

**Gaps**

- Selected onboarding priorities are written to `life-os-onboarding-priorities` but never used elsewhere.
- Every onboarding choice ends at Inbox instead of a personalized first-success path.
- A user can finish onboarding on a small screen and then hit a desktop-only wall.
- Getting Started documents only part of the product and omits core concepts such as Agenda, Plan, Shutdown, Lists, Workflows, and Matrix.

**Target journey**

1. Select an outcome: organize tasks, plan time, focus, or build habits.
2. Create one real object or connect one real source during onboarding.
3. Land on a personalized Today checklist with one highlighted next action.
4. Reach first value in under two minutes and retain the setup state across devices.

### 4.2 Capture: thought -> trusted task

**Gaps**

- New-task behavior differs by Inbox, Today, list, Matrix, Calendar, Agenda, and global rail.
- The create destination is implicit and sometimes wrong.
- Mutation failures frequently roll back data silently without explaining what happened.
- Empty states do not all lead to a working composer.

**Target journey**

- One global composer opens from `N`, the rail, command palette, and every empty state.
- The composer clearly shows destination, date, and workflow; defaults inherit current context.
- Enter creates, Shift+Enter expands details, Escape cancels, and success/failure is announced.

### 4.3 Clarify and organize: task -> actionable work

**Gaps**

- Today/Next/Tasks/Agenda share a rich context menu, while Inbox, Lists, Matrix, and Workflows expose different subsets.
- Right-click is the main entry to advanced actions, with weak keyboard/touch discoverability.
- Task detail is global in memory but not global in the URL.
- Destructive actions alternate between browser confirm, custom UI, and immediate mutation.

**Target journey**

- A single task command registry powers card overflow, context menu, detail panel, command palette, and bulk actions.
- All surfaces support the same core actions: complete, schedule, prioritize, move, tag, focus, duplicate, copy link, and delete.
- Context controls may differ, but the object model and result cannot differ.

### 4.4 Plan and schedule: priorities -> realistic day

**What works**

- Agenda combines events, scheduled tasks, free time, conflicts, and unscheduled priorities.
- Morning Plan expresses the right planning sequence: commitments, outcome, protect time, confirm.

**Gaps**

- `/agenda` and the Calendar “Agenda” view compete for the same term.
- Calendar view/date/options are local state, so refresh, share, and browser history lose context.
- Plan date logic is not dependable, and suggested blocks become generic high-priority tasks.
- Calendar preferences and availability rules are spread across Calendar, Settings, and integration setup.

**Target journey**

- **Today** answers “What should I do?”
- **Agenda** answers “How does this day unfold?”
- **Calendar** answers “How is my time arranged across dates?”
- One date and time-zone model drives all three; every navigable date/view has a URL.

### 4.5 Focus: selected work -> protected attention

**What works**

- Pomodoro and stopwatch modes, session recovery, records, targets, and manual entries are present.
- Focus can start from tasks and habits.

**Gaps**

- `FocusContext` and `useFocusTimer` maintain separate clocks and session behavior; the global clock is interval-based while the page timer is timestamp-based.
- Pause/resume/cancel errors are logged but not shown.
- Enabling browser notifications never requests or diagnoses permission.
- Focus settings exist both in `/focus/settings` and as non-operational copy in global Settings.
- Focus statistics appear in three places with different data quality.

**Target journey**

- One Focus Session Controller owns start, restore, pause, resume, finish, cancel, notification, and global progress.
- Starting from any surface visibly confirms the target and offers “Open Focus” without losing the source context.
- One settings surface and one statistics model feed all presentations.

### 4.6 Complete and close: action -> reliable closure

**Gaps**

- Completion behavior and celebration vary by surface.
- Shutdown applies mutations before the user closes the day, but some cannot be fully undone.
- Failed ritual API writes fall back silently to local storage, so cross-device status can diverge.
- “Move” and “Plan tomorrow” break the intended closure loop.

**Target journey**

- Decisions are staged, summarized, and applied atomically when the day closes.
- Every staged decision is editable and exactly reversible before commit.
- Closing the day leads to a real tomorrow plan, not today’s completed state.

### 4.7 Reflect and adapt: history -> useful change

**Gaps**

- Profile, Statistics, Focus Statistics, Habit Analytics, and calendar heatmaps form competing insight destinations.
- Some analytics are real, some derived client-side, some hard-coded, and some placeholders.
- Graphs lack accessible textual summaries and time-range state is not shareable.
- Insights rarely lead back to a corrective action.

**Target journey**

- Statistics becomes the canonical insight center with Overview, Tasks, Focus, and Habits.
- Profile is identity/account summary, not a second analytics product.
- Every insight offers a relevant action: schedule backlog, adjust focus protocol, edit a habit, or review an overloaded day.

## 5. Feature-by-feature findings

| Feature | Strength | Main UX gaps | Priority |
|---|---|---|---:|
| Global rail/drawer | Preserves access to all product areas | 15 primary rail icons create recall burden; 30px hit targets; globally fetches tasks/lists/workflows; create action broken | P0/P1 |
| Inbox | Fast capture and keyboard support | Uses an older task presentation and action set; detail links are not restorable | P1 |
| Today / Next / Tasks | Most consistent task workspace | Tiny 9–11px text, advanced actions depend on right-click, native confirm for delete, errors are mostly silent | P1/P2 |
| Lists | Flexible organization | Detail selection is not route state; fewer commands than Today; hierarchy features are not clearly taught | P1 |
| Workflows | Useful Kanban structure | Different task card/action model; workflow context is not always preserved when moving/creating | P1 |
| Agenda | Best expression of the product | Empty create broken, copied links broken, 2,300-line interaction surface risks divergence, hard-coded locale | P0/P1 |
| Calendar | Rich day/week/month/year/agenda views | View/date not encoded in URL, unsupported share fails silently, duplicate Agenda concept, redundant back control | P1 |
| Habits | Strong weekly overview and quick check-in | `/habits` and `/habits/checkin` duplicate the same job; selected habit/filter/date are not fully URL-backed; right-click dependency | P1 |
| Focus | Accurate page timer and history | Duplicate controllers, notification permission gap, silent mutation errors, duplicate settings/stats | P1 |
| Morning Plan | Excellent ritual structure | Wrong task date scope, no route date, weak recovery for save failures | P0 |
| Evening Shutdown | Strong closure concept and task decisions | Move is incomplete, undo is lossy, tomorrow handoff is wrong, mutations are not atomic | P0 |
| Priority Matrix | Clear 2x2 model | Blank task creation; Filter and More buttons are inert; eligibility rules are invisible | P0/P1 |
| Chat | Streaming responses and session history | Attachment and microphone buttons are inert; API error mentions `.env.local` to production users; session-save failures are silent | P0/P1 |
| Statistics | Useful task/habit derivations | Focus tab is hard-coded; tabs/ranges not in URL; duplicates Profile and Focus Statistics | P0/P1 |
| Profile | Real task/habit summaries | Fabricated focus values; duplicates analytics; tabs not shareable | P0/P1 |
| Settings | Improved grouped IA and URL section state | Focus section is descriptive only; Data controls are inert; notification page contradicts reminder UI; save failures hidden | P0/P1 |
| Google Calendar | Account and calendar control exists | Sync errors need one visible recovery language; connection health should surface in Agenda/Calendar too | P1 |
| Alexa / MCP | Discoverable integration concept | Presented as available despite disabled/stub backend | P0 |

## 6. Cross-cutting system gaps

### 6.1 Information architecture

Keep every feature, but stop treating every feature as an equal primary destination.

Recommended hierarchy:

- **Always visible rail:** Today, Inbox, Agenda, Focus, global Create, Search/Command, Settings.
- **User-pinned rail slots:** up to four of Calendar, Habits, Lists, Tasks, Workflows, Matrix, Statistics, Chat, Plan, Shutdown.
- **Expanded drawer:** the complete feature inventory, lists, workflows, filters, and counts.
- **Contextual prompts:** surface Plan in the morning and Shutdown later in the day without removing their permanent access.

This preserves all functionality while reducing recall burden and keeping attention on work.

### 6.2 Interaction architecture

Create three shared controllers:

1. **Task Command Registry** — availability, labels, permission, execute, undo, telemetry.
2. **Route-backed Detail Controller** — `task`, `habit`, `event`, and date/view context in the URL.
3. **Focus Session Controller** — one source of truth for session lifecycle and elapsed time.

### 6.3 Feedback and recovery

- Replace silent catches with a consistent inline/toast error and retry.
- Use optimistic UI only where exact rollback is available.
- Standardize destructive confirmation and provide undo for recoverable deletion.
- Give every async state: idle, pending, success, error, empty, and stale/offline behavior.
- Add a small sync-health indicator only when action is required; avoid persistent noise.

### 6.4 Accessibility and responsive behavior

Current evidence includes 37 `outline-none` usages, 10 `transition-all` usages, 30px rail targets, right-click-dependent commands, and a hard product gate below 1024px.

Required baseline:

- Keyboard equivalent for every pointer/right-click action.
- Visible `:focus-visible` state on every interactive element.
- 44px touch targets on touch layouts and at least a 40px effective hit area on desktop controls.
- Dialog semantics, initial focus, focus trap, Escape, and return focus.
- `aria-live` for status/toast/mutation feedback.
- `prefers-reduced-motion` support for page, completion, timer, and celebration animation.
- Responsive read/capture/check-in at 390px; full planning workspace at 768px and above.
- If any capability remains desktop-only, disclose that before sign-up and offer a useful mobile subset.

### 6.5 Locale, time, and date correctness

There are at least 36 hard-coded `en-US` formatting calls. Date/time behavior is core product logic, not cosmetic formatting.

- Centralize locale, time zone, 12/24-hour preference, and week start.
- Use `Intl.DateTimeFormat` and user settings everywhere.
- Test DST changes, overnight blocks, all-day events, and travel time zones.
- Store route dates as `YYYY-MM-DD` and instants as UTC ISO values with explicit zone interpretation.

### 6.6 Performance and maintainability

- The authenticated shell mounts task data globally, and the sidebar adds list/workflow dependencies on every route.
- Agenda is a large monolith with repeated popover/scheduling behavior.
- Calendar and task surfaces repeat date and action logic.

Actions:

- Prefetch by likely journey, not every feature at shell mount.
- Split Agenda by interaction boundary, not merely visual component.
- Virtualize lists above 50 visible rows.
- Centralize date utilities, action commands, and async status components.
- Add bundle and query-count budgets to CI.

## 7. Master delivery plan

### Phase 0 — Product integrity (days 1–4)

**Outcome:** Every visible control tells the truth and the daily loop cannot produce incorrect state.

- Fix UX-001 through UX-012.
- Remove or explicitly label every placeholder/inert affordance.
- Add an automated “visible control contract” checklist to pull requests.
- Add P0 journey tests for create, link restore, Plan tomorrow, Shutdown move/undo, Focus stats, and data controls.

**Exit gate:** No P0 finding remains; no placeholder value is presented as user data.

### Phase 1 — Unified task kernel (week 1)

**Outcome:** A task behaves the same everywhere.

- Build the Task Command Registry.
- Move the global composer and detail controller into the shell.
- Migrate Inbox, Today, Next, Tasks, Agenda, Lists, Workflows, and Matrix.
- Standardize delete/undo, mutation feedback, and keyboard access.

**Exit gate:** The core action matrix passes on every task surface; copied links survive reload and browser navigation.

### Phase 2 — Connected daily loop (week 2)

**Outcome:** The product guides one continuous day rather than exposing isolated tools.

- Make onboarding choices drive the first-run checklist and initial pinned rail items.
- Add route dates to Plan and Shutdown.
- Stage Shutdown changes and commit atomically.
- Preserve source/target context across Plan -> Agenda -> Focus -> Shutdown -> Tomorrow Plan.
- Add a calm “next best action” slot to Today, not a dashboard of every feature.

**Exit gate:** A first-time user can complete Capture -> Plan -> Focus -> Close without guessing which surface to use.

### Phase 3 — Time system convergence (week 3)

**Outcome:** Today, Agenda, and Calendar are distinct views of one scheduling model.

- Define and apply the semantic roles of Today, Agenda, and Calendar.
- Route-back calendar date, view, selection, and relevant filters.
- Consolidate calendar preferences and integration health.
- Reuse one scheduling conflict, duration, and time-zone service.
- Rename Calendar’s internal Agenda view if research shows persistent confusion (for example, “Schedule list”).

**Exit gate:** Refresh/share/back/forward preserve the exact time context; all three surfaces show the same task/event truth.

### Phase 4 — Habits, Focus, and Insights convergence (week 4)

**Outcome:** Repeated behavior and reflection have one source of truth each.

- Merge Habit list/check-in into one route with route-backed views.
- Replace dual focus clocks with the Focus Session Controller.
- Implement permission-aware notifications and delivery status.
- Consolidate analytics queries; remove Profile analytics duplication.
- Give insights a corrective action.

**Exit gate:** Focus totals match across every surface; habit completion and selected dates survive navigation; no duplicate analytics definitions remain.

### Phase 5 — Settings and integration trust (week 5)

**Outcome:** Settings are operational, reversible, and honest.

- Route global Focus settings to the real Focus settings controls or embed the same component.
- Implement export/deletion with progress, confirmation, and recovery rules.
- Reconcile task/habit reminders with the Notifications page.
- Hide disabled integrations; add health, last sync, and recovery states to active integrations.
- Add unsaved-change guards where controls are not auto-save.

**Exit gate:** Every settings row changes a documented behavior or is visibly unavailable with a reason.

### Phase 6 — Inclusive, calm quality pass (weeks 6–7)

**Outcome:** The system works beyond a single desktop/mouse configuration without becoming visually noisy.

- Responsive shell and essential mobile journeys.
- Keyboard, screen reader, touch target, focus, motion, and contrast remediation.
- Central locale/date/time system.
- Query and bundle optimization; virtualize long lists.
- Allow user-pinned rail destinations while retaining complete drawer access.

**Exit gate:** WCAG 2.2 AA-oriented manual checks pass for critical journeys; essential workflows pass at 390, 768, 1024, and 1440px.

## 8. Acceptance criteria by system

### Navigation

- All features remain reachable from the expanded drawer.
- A user can pin/unpin secondary features without losing them.
- Global create works on every authenticated route in one interaction.
- Current location and focus are visible to keyboard and screen-reader users.

### Tasks

- Create, open, edit, complete, move, schedule, tag, focus, duplicate, link, and delete behave consistently on every task surface.
- Direct task URLs restore the exact task panel after refresh.
- Failed mutations display an error and preserve or restore the prior state.

### Daily loop

- Plan and Shutdown accept an explicit date.
- “Move” changes the task destination before being marked complete as a decision.
- Undo restores every modified field exactly.
- “Plan tomorrow” always targets tomorrow in the user’s time zone.

### Focus and habits

- One active focus session exists across tabs and surfaces.
- Timer accuracy remains within one second after backgrounding and refresh.
- Notification setting shows Granted, Blocked, Unsupported, or Off—not merely on/off.
- Habit and focus statistics reconcile with their underlying records.

### Analytics

- No fake/sample data is shown without a persistent “Sample data” label.
- The same date range returns the same totals in all presentations.
- Every chart has a text summary and meaningful empty/error states.

### Settings and integrations

- Every enabled control persists and visibly confirms success or failure.
- Data export creates a valid downloadable artifact.
- Account deletion requires re-authentication and an explicit irreversible confirmation.
- An integration cannot be marked Active unless an end-to-end health check passes.

## 9. Measurement plan

### North-star metric

**Intentional days per active user per week:** a day with a confirmed plan, at least one completed focus session or scheduled priority completed, and a closed-day decision set.

### Funnel metrics

- Sign-up -> onboarding completion.
- Onboarding -> first real task/event/habit.
- First capture -> first scheduled task.
- Scheduled task -> focus started.
- Focus started -> focus completed.
- Plan started -> Plan confirmed.
- Shutdown started -> day closed.

### Quality guardrails

- Visible-action failure rate < 0.5%.
- Calendar sync success > 99%.
- No conflicting totals across analytics surfaces in contract tests.
- Median warm Agenda load < 1 second.
- P95 task mutation feedback < 500ms optimistic / < 2s confirmed.
- Critical journeys complete with keyboard only.
- No critical accessibility violations in automated checks.

### Research cadence

- Five moderated first-run sessions before Phase 2 exit.
- Five daily-planning sessions and five end-of-day sessions before Phase 3 exit.
- Monthly support/query review grouped by journey stage, not page name.
- Maintain a usability issue log with severity, frequency, and affected journey.

## 10. First ten implementation tickets

1. **Global Task Composer:** replace page-scoped create events and broken Ctrl+N dispatch.
2. **Route-backed Task Detail:** parse/write `task` in the shell and restore direct links.
3. **Analytics Integrity:** remove Profile placeholders and hard-coded global Focus zeros.
4. **Shutdown Correctness:** implement move destination and lossless undo snapshots.
5. **Date-aware Rituals:** add route date to Plan/Shutdown and repair “Plan tomorrow.”
6. **Plan Day Scope:** filter commitments and summaries by the selected date.
7. **Settings Truth Pass:** remove or implement Data controls, Focus controls, Alexa, MCP, and Learn More.
8. **Matrix Creation:** title-first draft and working Filter/More actions.
9. **Chat Affordance Pass:** remove/disable attachment and mic until operational; replace developer-facing errors.
10. **Task Command Registry:** define the shared action contract and migrate Today plus Agenda first.

## 11. Definition of done for future UI changes

A UI change is not complete until:

- It preserves every existing capability or explicitly documents a product decision to remove one.
- Every visible control has working behavior, a disabled reason, or is absent.
- Pointer, keyboard, and touch paths are defined.
- Loading, empty, error, success, stale, and destructive states are designed.
- Route-worthy state is deep-linkable and supports browser back/forward.
- User data is real, sourced, and consistent with other surfaces.
- The feature has at least one end-to-end journey test and appropriate component/API tests.
- The layout is checked at 390, 768, 1024, and 1440px.
- Focus visibility, reduced motion, labels, status announcements, and contrast are checked.

This gate protects the user’s original direction: **all capabilities stay available, while the interface becomes quieter and more focused.**
