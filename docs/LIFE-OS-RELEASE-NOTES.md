# Life OS Product Release Notes — Capability Index & Structured Plan

**Purpose:** Give an LLM (or product/engineering team) a crisp, complete map of Life OS capabilities so it can plan, compare, or extend the product without re-reading the codebase.

**Method:** Every capability uses the **Speed-Read Dummies Framework** — a four-line block that answers the only questions that matter.

---

## How to read this file

For every capability:

- **In one line** — the shortest possible explanation.
- **What it does** — the observable behavior, no fluff.
- **Why it matters** — the user outcome it unlocks.
- **Speed-read** — a single sentence an LLM can consume instantly.

Use the **Capability Matrix** first to get the map, then drill into the blocks you need.

---

## Capability Matrix

| # | Capability | Category | Core Job |
| --- | --- | --- | --- |
| 1 | Account Signup | Auth | Create a workspace |
| 2 | Login / Logout | Auth | Access and leave the workspace |
| 3 | Onboarding | Auth | Personalize first-run setup |
| 4 | Getting Started | Onboarding | Teach core actions interactively |
| 5 | Inbox | Capture | Hold new and incoming tasks |
| 6 | Quick Add | Capture | Capture a task from anywhere |
| 7 | Global Command Palette | Capture | Search and act fast |
| 8 | Task Detail Panel | Capture | Manage task context |
| 9 | Subtasks | Organize | Break work into steps |
| 10 | Priorities | Organize | Rank task importance |
| 11 | Tags / Labels | Organize | Add cross-list labels |
| 12 | Lists | Organize | Group tasks into containers |
| 13 | Folders & Groups | Organize | Nest lists into groups |
| 14 | Today | Plan | See only what is due today |
| 15 | Tasks (All) | Plan | See every active task |
| 16 | Next 7 Days | Plan | See the coming week |
| 17 | Kanban / Board | Organize | Visualize task flow |
| 18 | Workflows | Organize | Create structured board pipelines |
| 19 | Eisenhower Matrix | Prioritize | Sort by urgency and importance |
| 20 | Calendar | Schedule | Visualize tasks on a time grid |
| 21 | Google Calendar Integration | Integrate | Sync external events |
| 22 | Time Blocking | Schedule | Assign tasks to time slots |
| 23 | Capacity | Schedule | Warn when a day is overloaded |
| 24 | Reminders | Notify | Trigger time-based alerts |
| 25 | Recurring Tasks | Notify | Repeat tasks automatically |
| 26 | Task Comments | Collaborate | Discuss within a task |
| 27 | Notes & Attachments | Detail | Store task context |
| 28 | Rich Text / Slash Menu | Detail | Format task content |
| 29 | Focus / Pomodoro | Focus | Work in timed sessions |
| 30 | Focus Targets | Focus | Link focus to tasks or habits |
| 31 | Focus Records | Focus | Persist completed sessions |
| 32 | Habits | Build | Track repeatable routines |
| 33 | Habit Gallery | Build | Start from curated templates |
| 34 | Habit Check-in | Build | Log daily completion |
| 35 | Habit Analytics | Build | See streaks and completion |
| 36 | Morning Plan | Ritual | Choose the day's outcome |
| 37 | Evening Shutdown | Ritual | Decide unfinished work |
| 38 | AI Chat | Assist | Ask questions about your day |
| 39 | Statistics | Reflect | Measure progress |
| 40 | Settings | Personalize | Control profile and preferences |
| 41 | Theme | Personalize | Change visual appearance |
| 42 | Keyboard Shortcuts | Navigate | Move fast without mouse |
| 43 | Cross-Platform Sync | System | Same data everywhere |
| 44 | Ownership Isolation | System | Keep user data private |

---

## Capability Blocks

### 1. Account Signup
- **In one line:** Create a personal workspace.
- **What it does:** Creates an account with name, email, and password.
- **Why it matters:** Establishes the user's private data boundary.
- **Speed-read:** New user creates a workspace.

### 2. Login / Logout
- **In one line:** Enter and leave the workspace.
- **What it does:** Authenticates with cookie-based JWT; logout clears the session.
- **Why it matters:** Protects data and enables returning users.
- **Speed-read:** Cookie-auth access control.

### 3. Onboarding
- **In one line:** Personalize the first-run experience.
- **What it does:** Captures name, priorities, and calendar connection preference.
- **Why it matters:** Tailors the starting workspace.
- **Speed-read:** Guided first-run setup.

### 4. Getting Started
- **In one line:** Interactive guide to core actions.
- **What it does:** Shows a checklist and feature map for new users.
- **Why it matters:** Reduces the learning curve.
- **Speed-read:** In-app product tour.

### 5. Inbox
- **In one line:** A home for new and incoming tasks.
- **What it does:** Displays uncategorized tasks and quick capture.
- **Why it matters:** Gives every task a default landing spot.
- **Speed-read:** Default task collection point.

### 6. Quick Add
- **In one line:** Capture a task without leaving the current view.
- **What it does:** Uses a global composer with title, date, priority, and list.
- **Why it matters:** Removes friction from task entry.
- **Speed-read:** Fast global task entry.

### 7. Global Command Palette
- **In one line:** Search and act from a single overlay.
- **What it does:** Finds tasks and triggers common actions.
- **Why it matters:** Enables keyboard-driven navigation.
- **Speed-read:** Unified search and action menu.

### 8. Task Detail Panel
- **In one line:** A focused view of one task.
- **What it does:** Shows and edits metadata, subtasks, comments, reminders, and context.
- **Why it matters:** Keeps task details organized.
- **Speed-read:** Single-task management surface.

### 9. Subtasks
- **In one line:** Smaller steps inside a task.
- **What it does:** Nests child tasks under a parent.
- **Why it matters:** Breaks complex work into actionable pieces.
- **Speed-read:** Hierarchical task breakdown.

### 10. Priorities
- **In one line:** Mark tasks by importance.
- **What it does:** Assigns priority levels for sorting and focus.
- **Why it matters:** Surfaces what matters first.
- **Speed-read:** Task importance ranking.

### 11. Tags / Labels
- **In one line:** Lightweight labels that cut across lists.
- **What it does:** Adds reusable labels for grouping and workflows.
- **Why it matters:** Enables flexible organization.
- **Speed-read:** Cross-list task labels.

### 12. Lists
- **In one line:** Containers that group related tasks.
- **What it does:** Organizes tasks into named lists.
- **Why it matters:** Separates life areas and projects.
- **Speed-read:** Named task containers.

### 13. Folders & Groups
- **In one line:** Nest lists into larger categories.
- **What it does:** Groups lists under folders for hierarchy.
- **Why it matters:** Keeps many lists manageable.
- **Speed-read:** Hierarchical list organization.

### 14. Today
- **In one line:** See only what is due today.
- **What it does:** Filters tasks and habits for the current day.
- **Why it matters:** Reduces the working set.
- **Speed-read:** Daily focus view.

### 15. Tasks (All)
- **In one line:** See every active task.
- **What it does:** Lists all non-completed tasks with filters.
- **Why it matters:** Provides a full inventory of work.
- **Speed-read:** Complete task inventory.

### 16. Next 7 Days
- **In one line:** See the coming week.
- **What it does:** Groups tasks by upcoming days.
- **Why it matters:** Surfaces near-term commitments.
- **Speed-read:** Weekly task preview.

### 17. Kanban / Board
- **In one line:** Board view with columns.
- **What it does:** Groups tasks into stages or sections.
- **Why it matters:** Visualizes workflow and progress.
- **Speed-read:** Board-style task flow.

### 18. Workflows
- **In one line:** Structured board pipelines.
- **What it does:** Creates Kanban, sprint, sales, content, matrix, or custom templates.
- **Why it matters:** Models repeatable processes.
- **Speed-read:** Templated pipeline boards.

### 19. Eisenhower Matrix
- **In one line:** Prioritize by urgency and importance.
- **What it does:** Places tasks into four quadrants based on priority and effort.
- **Why it matters:** Forces deliberate prioritization.
- **Speed-read:** Quadrant-based prioritization.

### 20. Calendar
- **In one line:** Visualize tasks on a time grid.
- **What it does:** Provides day, week, month, year, and agenda views.
- **Why it matters:** Turns tasks into a schedule.
- **Speed-read:** Time-based task visualization.

### 21. Google Calendar Integration
- **In one line:** Connect external Google events.
- **What it does:** Syncs and displays Google Calendar events alongside tasks.
- **Why it matters:** Unifies task and external calendar.
- **Speed-read:** Google Calendar bridge.

### 22. Time Blocking
- **In one line:** Assign tasks to specific time slots.
- **What it does:** Places tasks on the calendar for focused work.
- **Why it matters:** Protects time for priorities.
- **Speed-read:** Schedule tasks into blocks.

### 23. Capacity
- **In one line:** Warn when a day is overloaded.
- **What it does:** Shows scheduled hours and over-capacity warnings.
- **Why it matters:** Prevents overcommitting.
- **Speed-read:** Daily workload guardrail.

### 24. Reminders
- **In one line:** Alerts at a chosen time.
- **What it does:** Triggers notifications for tasks and habits.
- **Why it matters:** Prevents missed work.
- **Speed-read:** Time-based task alerts.

### 25. Recurring Tasks
- **In one line:** Tasks that repeat automatically.
- **What it does:** Repeats daily, weekdays, weekly, monthly, yearly, or custom.
- **Why it matters:** Maintains routines without re-creating tasks.
- **Speed-read:** Auto-repeating tasks.

### 26. Task Comments
- **In one line:** Discuss within a task.
- **What it does:** Adds threaded comments with author context.
- **Why it matters:** Keeps conversations with the work.
- **Speed-read:** Task-level discussion.

### 27. Notes & Attachments
- **In one line:** Context attached to a task.
- **What it does:** Stores descriptions, images, files, and details.
- **Why it matters:** Keeps everything needed in one place.
- **Speed-read:** Task context storage.

### 28. Rich Text / Slash Menu
- **In one line:** Format task content.
- **What it does:** Adds headings, lists, dividers, images, and attachments via `/` menu.
- **Why it matters:** Makes task notes structured and readable.
- **Speed-read:** Structured rich content in tasks.

### 29. Focus / Pomodoro
- **In one line:** Work in timed focus sessions.
- **What it does:** Runs a timer with work/break phases and completion tracking.
- **Why it matters:** Improves focus and reduces procrastination.
- **Speed-read:** Timed focus sessions.

### 30. Focus Targets
- **In one line:** Link focus to tasks or habits.
- **What it does:** Selects a task or habit as the focus intention.
- **Why it matters:** Connects effort to a specific outcome.
- **Speed-read:** Intention-linked focus.

### 31. Focus Records
- **In one line:** Persist completed sessions.
- **What it does:** Stores focus duration, target, mode, and notes.
- **Why it matters:** Builds an accurate history of focus time.
- **Speed-read:** Focus history persistence.

### 32. Habits
- **In one line:** Track repeatable routines.
- **What it does:** Creates daily, weekly, or interval habits with goals.
- **Why it matters:** Builds consistency through visible progress.
- **Speed-read:** Routine tracking with goals.

### 33. Habit Gallery
- **In one line:** Start from curated templates.
- **What it does:** Offers habits across content, learning, health, and career categories.
- **Why it matters:** Lowers the barrier to starting.
- **Speed-read:** Curated habit templates.

### 34. Habit Check-in
- **In one line:** Log daily completion.
- **What it does:** Marks habits achieved, unachieved, skipped, or frozen with reasons.
- **Why it matters:** Creates honest daily reflection.
- **Speed-read:** Daily habit logging.

### 35. Habit Analytics
- **In one line:** See streaks and completion.
- **What it does:** Shows completion rates, day breakdowns, and 90-day heatmaps.
- **Why it matters:** Gives feedback on consistency.
- **Speed-read:** Habit progress analytics.

### 36. Morning Plan
- **In one line:** Choose the day's outcome.
- **What it does:** Reviews commitments, selects an outcome, and protects focus windows.
- **Why it matters:** Starts the day with intention.
- **Speed-read:** Daily outcome-setting ritual.

### 37. Evening Shutdown
- **In one line:** Decide unfinished work.
- **What it does:** Moves, unschedules, completes, or drops unfinished tasks.
- **Why it matters:** Closes the loop without hidden debt.
- **Speed-read:** End-of-day work review.

### 38. AI Chat
- **In one line:** Ask questions about your day.
- **What it does:** Assists with planning, overdue work, summaries, and goal breakdown.
- **Why it matters:** Provides a conversational interface to the system.
- **Speed-read:** Conversational task assistant.

### 39. Statistics
- **In one line:** Measure progress.
- **What it does:** Tracks tasks completed, focus hours, and habit consistency.
- **Why it matters:** Shows evidence of progress.
- **Speed-read:** Progress analytics.

### 40. Settings
- **In one line:** Control profile and preferences.
- **What it does:** Manages profile, features, integrations, notifications, labels, and collaborators.
- **Why it matters:** Lets users tailor the system.
- **Speed-read:** User preference control.

### 41. Theme
- **In one line:** Change visual appearance.
- **What it does:** Offers system, light, dark, and multiple color themes.
- **Why it matters:** Personalizes the experience.
- **Speed-read:** Visual theme switching.

### 42. Keyboard Shortcuts
- **In one line:** Navigate and act without a mouse.
- **What it does:** Provides hotkeys for tasks, calendar views, and capture.
- **Why it matters:** Speeds up power users.
- **Speed-read:** Keyboard-driven navigation.

### 43. Cross-Platform Sync
- **In one line:** Same data everywhere.
- **What it does:** Syncs tasks, lists, and preferences across devices.
- **Why it matters:** Enables seamless switching.
- **Speed-read:** Universal data sync.

### 44. Ownership Isolation
- **In one line:** Keep user data private.
- **What it does:** Scopes every resource to the authenticated user.
- **Why it matters:** Prevents cross-user access.
- **Speed-read:** User-scoped data security.

---

## Structured Release Plan

The plan is divided into **Release Waves** so an LLM can sequence work without ambiguity.

### Wave 1 — Core Capture & Task Foundation
**Goal:** A user can capture, organize, and complete basic tasks.

- Account Signup
- Login / Logout
- Onboarding
- Getting Started
- Inbox
- Quick Add
- Task Detail Panel
- Subtasks
- Priorities
- Tags / Labels
- Lists
- Folders & Groups
- Tasks (All)
- Next 7 Days

**Exit condition:** Create → organize → complete works end to end.

---

### Wave 2 — Scheduling & Planning
**Goal:** Tasks become time-aware.

- Today
- Calendar
- Google Calendar Integration
- Time Blocking
- Capacity
- Reminders
- Recurring Tasks

**Exit condition:** A user can place tasks on a calendar and see external events.

---

### Wave 3 — Focus & Productivity Rituals
**Goal:** Users can protect time and build habits.

- Focus / Pomodoro
- Focus Targets
- Focus Records
- Habits
- Habit Gallery
- Habit Check-in
- Habit Analytics
- Morning Plan
- Evening Shutdown

**Exit condition:** A user can run a focus session, log a habit, and close the day.

---

### Wave 4 — Advanced Organization & Collaboration
**Goal:** Power users and teams can manage complex work.

- Kanban / Board
- Workflows
- Eisenhower Matrix
- Global Command Palette
- Task Comments
- Notes & Attachments
- Rich Text / Slash Menu
- Keyboard Shortcuts

**Exit condition:** Boards, workflows, and advanced filtering work.

---

### Wave 5 — Assist, Reflect & Personalize
**Goal:** The app feels personal and provides feedback.

- AI Chat
- Statistics
- Settings
- Theme
- Cross-Platform Sync
- Ownership Isolation

**Exit condition:** Users can customize, ask questions, and see progress.

---

## Release Notes Copy (customer-facing, concise)

**Life OS brings tasks, calendar, focus, and habits into one calm system.**

- **Capture faster.** Inbox, quick add, and a global command palette get work out of your head.
- **Stay organized.** Lists, folders, tags, priorities, subtasks, and boards keep everything in place.
- **See your day.** Today, Next 7 Days, calendar views, Google Calendar, and time blocking make schedules visible.
- **Protect time.** Focus sessions, targets, and records turn intentions into deep work.
- **Build momentum.** Habits, check-ins, and analytics turn routines into visible progress.
- **Close the loop.** Morning Plan sets the day; Evening Shutdown decides unfinished work.
- **Ask your system.** AI Chat helps plan, inspect overdue work, and break down goals.
- **Make it yours.** Themes, settings, and keyboard shortcuts adapt to the user.
- **Trust it.** Every resource is scoped to your account, so your data stays private.

---

## Sources

- Life OS source code (`src/lib/copy.ts`, app routes, hooks, components)
- Existing product documentation (`docs/`, `STATE.md`, `PLAN.md`)
