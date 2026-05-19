# LAIF — Your Intelligent Life Manager

> Tasks, habits, focus sessions, calendar, and AI — unified in one premium workspace.

<p align="center">
  <img src="public/logo_new.png" alt="LAIF" width="80" />
</p>

<p align="center">
  <strong>Stop switching between 5 apps. Start living in one.</strong>
</p>

---

## 🌟 Highlights

- **Tasks + Habits = Same Model** — A habit is just a recurring task with a streak counter. One mental model, half the surface area.
- **3 Themed Focus Clocks** — Aurora (drifting gradients), Minimal (pure numbers), Liquid (morphing blob). Not a boring timer.
- **Eisenhower Matrix** — Auto-sorts tasks by priority x urgency. No manual dragging.
- **5-State Kanban** — Backlog, To-Do, In Progress, Done, Dropped. Tasks without deadlines live in Backlog.
- **Calendar with Capacity Bars** — See "6.5h / 8h scheduled" before you overcommit. Drag tasks onto time slots.
- **Google Calendar Sync** — Push tasks as events. One direction of authority per item.
- **13 Themes** — System, Light, Dark, Blackout, Ocean, Berry, Forest, Sunset, Blossom, and 4 more.
- **Daily Habit Check-in** — 15-second evening flow. "Unachieved with reason" reframes failure as data.
- **AI Chat** — Natural language task management with 8 agentic tools.
- **MCP Ready** — Claude Desktop integration architecture with 10 tool definitions.

---

## ℹ️ Overview

LAIF is a personal productivity app that combines task management, habit tracking, time-blocking, Pomodoro focus sessions, and analytics. Think TickTick + Todoist + Habitica, opinionated around how real people actually plan their days.

The core insight: **a habit like "Write 1 blog/week" is structurally identical to a recurring task with a streak counter.** By unifying them, habits flow through Inbox, Today, Matrix, and Folders without a parallel UI.

### 🎯 Who is this for?

Solo builders, founders, PMs, and creators who currently use 2+ apps for tasks and habits, want everything in one place, and care about effort tracking — not just checkboxes.

### ⚡ What makes it different?

| Feature | TickTick | Todoist | Notion | **LAIF** |
|---|---|---|---|---|
| Tasks + Habits unified | Separate modules | No habits | Manual templates | **Same model** |
| Focus timer with themes | Basic | None | None | **3 visual themes** |
| Eisenhower Matrix | None | None | Manual | **Auto-sorted** |
| Capacity awareness | None | None | None | **Daily hours bar** |
| AI assistant | None | Basic | Basic | **8-tool agent** |

---

## 🚀 Quick Start

```bash
git clone https://github.com/divysharma7/Personal-AI-Assisant.git
cd Personal-AI-Assisant

npm install

cp .env.example .env.local
# Edit .env.local with your MongoDB URI + JWT secret

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Requirements

- **Node.js** 18+
- **MongoDB Atlas** account (free tier works)
- **OpenRouter API key** (optional — for AI Chat)
- **Google Cloud project** (optional — for Calendar sync)

---

## 📸 Screenshots

### Three-Column Layout
> Sidebar | Content | Artwork pane — consistent across every screen

### Focus Timer — Aurora Theme
> Drifting gradient sphere, heartbeat pulse, number-flip animation

### Eisenhower Matrix
> 2x2 grid, auto-sorted by priority and urgency, effort displayed per task

### Calendar — Day View
> CSS Grid time slots, capacity bar, overdue lane, drag-and-drop scheduling

### Habit Check-in
> Progress bar, weekly dot grid, unachieved reason chips, streak celebrations

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│                  Frontend                      │
│  Next.js 14 · React · Tailwind · Framer Motion│
│  TipTap · @dnd-kit · lucide-react              │
├──────────────────────────────────────────────┤
│                  Backend                       │
│  77 API Routes · Mongoose · JWT Auth           │
│  OpenRouter LLM · Google Calendar OAuth2       │
├──────────────────────────────────────────────┤
│                 Database                       │
│  MongoDB Atlas · 23 Collections                │
├──────────────────────────────────────────────┤
│              MCP (Claude Desktop)               │
│  10 Tool Definitions · Stdio Transport          │
└──────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + 13 CSS Variable themes |
| Animation | Framer Motion |
| State | TanStack Query (optimistic updates) |
| Editor | TipTap (ProseMirror) |
| Drag & Drop | @dnd-kit |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (cookies + Bearer tokens) |
| AI | OpenRouter (Llama 3.3 70B) |
| Calendar | Google Calendar API (OAuth2) |
| Fonts | Instrument Serif (display) + Inter (body) |

---

## 📱 Pages

| Route | What it does |
|---|---|
| `/` | **Inbox** — task capture with inline add, priority/date popovers |
| `/today` | **Today** — scheduled tasks, habits, focus session banner |
| `/tasks` | **Tasks** — list view, 5-state Kanban board, filter tabs |
| `/matrix` | **Eisenhower Matrix** — auto-sorted 2x2 grid |
| `/habits` | **Habits** — dashboard, gallery (20 templates), creation wizard |
| `/habits/checkin` | **Check-in** — 15-second evening flow with streaks |
| `/focus` | **Focus** — Pomodoro with Aurora / Minimal / Liquid themes |
| `/calendar` | **Calendar** — day/week/month, drag-and-drop, capacity bars |
| `/chat` | **AI Chat** — natural language with suggestion chips |
| `/lists` | **Lists** — browse, search, star to pin |
| `/lists/[id]` | **List Detail** — tasks inside a folder |
| `/profile` | **Statistics** — overview, task, focus tabs |
| `/settings` | **Settings** — 7 tabs, 13 themes, focus, calendar prefs |
| `/updates` | **Updates** — notification feed (4 sub-tabs) |
| `/login` | **Login** — cinematic split-screen |
| `/onboarding` | **Onboarding** — 3-step frosted glass flow |

---

## 🔌 API Overview

<details>
<summary><strong>Auth</strong> — 4 routes</summary>

```
POST /api/auth/login      — email/password → JWT
POST /api/auth/signup     — register + auto-login
POST /api/auth/logout     — clear session
GET  /api/auth/me         — current user profile
```
</details>

<details>
<summary><strong>Tasks</strong> — 8 routes</summary>

```
GET/POST     /api/tasks
GET/PATCH/DEL /api/tasks/[id]
PATCH        /api/tasks/[id]/schedule
PATCH        /api/tasks/[id]/unschedule
POST         /api/tasks/[id]/comments
```
</details>

<details>
<summary><strong>Habits</strong> — 4 routes</summary>

```
GET  /api/habits/today
POST /api/habits/[id]/checkin
GET  /api/habits/[id]/completions
GET  /api/habits/stats
```
</details>

<details>
<summary><strong>Focus</strong> — 5 routes</summary>

```
POST  /api/focus/sessions
PATCH /api/focus/sessions/[id]   — pause/resume/extend/complete/cancel
GET   /api/focus/sessions/active
GET   /api/focus/sessions
GET   /api/focus/stats
```
</details>

<details>
<summary><strong>Calendar</strong> — 5 routes</summary>

```
GET  /api/calendar/events       — unified (tasks+habits+google+focus)
GET  /api/calendar/unscheduled
GET  /api/calendar/overdue
GET  /api/calendar/capacity
POST /api/calendar/sync-google
```
</details>

<details>
<summary><strong>Lists & Folders</strong> — 8 routes</summary>

```
GET/POST      /api/lists
GET/PATCH/DEL /api/lists/[id]
POST          /api/folders
PATCH/DEL     /api/folders/[id]
PATCH         /api/folders/[id]/tasks
```
</details>

<details>
<summary><strong>Google Calendar</strong> — 6 routes</summary>

```
GET  /api/integrations/google/auth
GET  /api/integrations/google/callback
POST /api/integrations/google/sync
POST /api/integrations/google/unsync
POST /api/integrations/google/disconnect
GET  /api/integrations/google/status
```
</details>

<details>
<summary><strong>AI Chat</strong> — 2 routes</summary>

```
POST /api/chat           — streaming NDJSON agent (8 tools)
GET  /api/conversation   — chat history
```
</details>

---

## 🤖 MCP Integration

LAIF ships with an MCP server architecture for Claude Desktop. 10 tools defined:

| Tool | What it does |
|---|---|
| `laif_list_tasks` | List tasks with filters |
| `laif_create_task` | Create a task |
| `laif_complete_task` | Mark as done |
| `laif_get_today` | Today's schedule |
| `laif_start_focus` | Start a Pomodoro |
| `laif_check_habits` | Habit status + streaks |
| `laif_checkin_habit` | Check in a habit |
| `laif_get_stats` | Productivity statistics |
| `laif_create_list` | Create a folder |
| `laif_schedule_task` | Schedule to a time slot |

Setup: see `src/mcp/claude_desktop_config.example.json`

---

## 🎨 Themes

13 themes with atmospheric radial gradient backgrounds:

**Dark:** Dark, Blackout, Ocean, Berry, Forest, Black & Yellow, Blue & Red
**Light:** Light, Sunset, Blossom, Blue & White, Red & White
**Auto:** System (follows OS preference)

Each theme defines full CSS variable sets for backgrounds, text, accents, borders, and shadows.

---

## ⚙️ Environment Variables

```bash
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-64-char-random-string

# Optional — AI
OPENROUTER_API_KEY=sk-or-...

# Optional — Google Calendar
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
```

Full list in `.env.example`.

---

## 📂 Project Structure

```
src/
├── app/                    # 17 Next.js pages
│   ├── api/                # 77 API routes
│   ├── focus/              # Pomodoro (3 themed clocks)
│   ├── habits/             # Dashboard + check-in
│   ├── calendar/           # Day/week/month views
│   ├── matrix/             # Eisenhower 2x2
│   ├── chat/               # AI Chat
│   └── ...                 # Inbox, Today, Tasks, Profile, Settings
├── components/             # 62 React components
│   ├── focus/themes/       # Aurora, Minimal, Liquid
│   ├── calendar/           # DayView, WeekView, MonthView, DnD
│   ├── habits/             # Gallery, Wizard, Analytics, Celebration
│   └── ...
├── hooks/                  # 14 TanStack Query hooks
├── lib/
│   ├── models/             # 23 Mongoose schemas
│   ├── services/           # Streak, notification, folder logic
│   ├── copy.ts             # All UI strings (single source)
│   ├── motion.ts           # Animation presets (single source)
│   └── sounds.ts           # Completion chimes (Web Audio)
├── mcp/                    # Claude Desktop integration
└── contexts/               # Theme + Focus providers
```

---

## 📱 Mobile App

A Flutter companion app sharing the same backend is planned. The notification data layer is already built:
- `NotificationSchedule` collection with scheduling, quiet hours, frequency caps
- `User.pushDevices[]` array ready for FCM/APNs tokens
- Delivery stub (`src/lib/services/notificationDelivery.ts`) documented for Flutter integration

---

## 🔒 Security

- Secrets in environment variables, never hardcoded
- `.env.local` gitignored, credential patterns in `.gitignore`
- Passwords hashed with bcryptjs (cost 12)
- JWT auth via httpOnly secure cookies + Bearer token fallback
- All API routes verify ownership before mutations
- AI API keys server-side only

---

## ✍️ Author

**Divy Sharma** — building a personal Life OS, one module at a time.

[![GitHub](https://img.shields.io/github/followers/divysharma7?style=social)](https://github.com/divysharma7)

---

## 💬 Feedback & Contributing

Found a bug? Have a feature idea? [Open an issue](https://github.com/divysharma7/Personal-AI-Assisant/issues).

PRs welcome. Start with the codebase structure above to find your way around.

---

<p align="center">
  <sub>Built with obsessive attention to detail.</sub>
</p>
