# LAIF — Your Intelligent Life Manager

> Tasks, habits, focus sessions, calendar, and AI — unified in one premium workspace.

<p align="center">
  <img src="public/logo_new.png" alt="LAIF" width="80" />
</p>

<p align="center">
  <strong>Stop switching between 5 apps. Start living in one.</strong>
</p>

---

## Highlights

- **Tasks + Habits = Same Model** — A habit is just a recurring task with a streak counter. One mental model, half the surface area.
- **3 Themed Focus Clocks** — Aurora (drifting gradients), Minimal (pure numbers), Liquid (morphing blob). Not a boring timer.
- **Eisenhower Matrix** — Auto-sorts tasks by priority x urgency. No manual dragging.
- **5-State Kanban** — Backlog, To-Do, In Progress, Done, Dropped. Tasks without deadlines live in Backlog.
- **Calendar with Capacity Bars** — See "6.5h / 8h scheduled" before you overcommit. Drag tasks onto time slots.
- **Google Calendar Sync** — Push tasks as events. One direction of authority per item.
- **13 Themes** — System, Light, Dark, Blackout, Ocean, Berry, Forest, Sunset, Blossom, and 4 more.
- **Daily Habit Check-in** — 15-second evening flow. "Unachieved with reason" reframes failure as data.
- **AI Chat** — Natural language task management with 14 agentic tools.
- **MCP Ready** — Claude Desktop integration architecture with 10 tool definitions.

---

## Overview

LAIF is a personal productivity app that combines task management, habit tracking, time-blocking, Pomodoro focus sessions, and analytics. Think TickTick + Todoist + Habitica, opinionated around how real people actually plan their days.

The core insight: **a habit like "Write 1 blog/week" is structurally identical to a recurring task with a streak counter.** By unifying them, habits flow through Inbox, Today, Matrix, and Folders without a parallel UI.

### Who is this for?

Solo builders, founders, PMs, and creators who currently use 2+ apps for tasks and habits, want everything in one place, and care about effort tracking — not just checkboxes.

### What makes it different?

| Feature | TickTick | Todoist | Notion | **LAIF** |
|---|---|---|---|---|
| Tasks + Habits unified | Separate modules | No habits | Manual templates | **Same model** |
| Focus timer with themes | Basic | None | None | **3 visual themes** |
| Eisenhower Matrix | None | None | Manual | **Auto-sorted** |
| Capacity awareness | None | None | None | **Daily hours bar** |
| AI assistant | None | Basic | Basic | **14-tool agent** |

---

## Quick Start

```bash
git clone https://github.com/divysharma7/Personal-AI-Assisant.git
cd Personal-AI-Assisant

# Frontend
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URI + JWT secret

# Backend (separate terminal)
cd laif-api
npm install
cp .env.example .env.local
# Edit .env.local with same MongoDB URI + JWT secret

# Start both
cd .. && npm run dev      # Frontend on http://localhost:5173
cd laif-api && npm run dev # API on http://localhost:3000
```

### Requirements

- **Node.js** 18+
- **MongoDB Atlas** account (free tier works)
- **OpenRouter API key** (optional — for AI Chat)
- **Google Cloud project** (optional — for Calendar sync)

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Frontend                      │
│  Vite · React 18 · Tailwind · Framer Motion   │
│  TipTap · @dnd-kit · lucide-react              │
├──────────────────────────────────────────────┤
│                  Backend                       │
│  Express · Mongoose · JWT Auth                 │
│  OpenRouter LLM · Google Calendar OAuth2       │
├──────────────────────────────────────────────┤
│                 Database                       │
│  MongoDB Atlas                                 │
├──────────────────────────────────────────────┤
│              MCP (Claude Desktop)               │
│  10 Tool Definitions · Stdio Transport          │
└──────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| Framework | React 18 |
| Routing | React Router 7 |
| Language | TypeScript |
| Styling | Tailwind CSS + 13 CSS Variable themes |
| Animation | Framer Motion |
| State | TanStack Query (optimistic updates) |
| Editor | TipTap (ProseMirror) |
| Drag & Drop | @dnd-kit |
| Backend | Express.js (separate `laif-api/` service) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (cookies + Bearer tokens) |
| AI | OpenRouter (Llama 3.3 70B) |
| Calendar | Google Calendar API (OAuth2) |
| Fonts | Instrument Serif (display) + Inter (body) |

---

## Pages

| Route | What it does |
|---|---|
| `/` | **Inbox** — task capture with inline add, priority/date popovers |
| `/today` | **Today** — scheduled tasks, habits, focus session banner |
| `/tasks` | **Tasks** — list view, filter tabs |
| `/matrix` | **Eisenhower Matrix** — auto-sorted 2x2 grid |
| `/habits` | **Habits** — dashboard, gallery (20 templates), creation wizard |
| `/habits/checkin` | **Check-in** — 15-second evening flow with streaks |
| `/focus` | **Focus** — Pomodoro with Aurora / Minimal / Liquid themes |
| `/calendar` | **Calendar** — day/week/month, drag-and-drop, capacity bars |
| `/chat` | **AI Chat** — natural language with suggestion chips |
| `/workflows/:id` | **Workflows** — Kanban boards with custom columns |
| `/lists` | **Lists** — browse, search |
| `/lists/:id` | **List Detail** — tasks inside a folder |
| `/notes` | **Notes** — quick notes with rich editor |
| `/statistics` | **Statistics** — overview, task, focus tabs |
| `/settings` | **Settings** — profile, habits, themes, focus, calendar, integrations |
| `/profile` | **Profile** — activity heatmap |
| `/login` | **Login** — cinematic split-screen |
| `/onboarding` | **Onboarding** — 3-step frosted glass flow |

---

## Project Structure

```
src/
├── app/                    # Page components (lazy-loaded)
│   ├── focus/              # Pomodoro (3 themed clocks)
│   ├── habits/             # Dashboard + check-in
│   ├── calendar/           # Day/week/month views
│   ├── matrix/             # Eisenhower 2x2
│   ├── chat/               # AI Chat
│   ├── settings/           # Settings tabs
│   └── ...                 # Inbox, Today, Tasks, Profile
├── components/             # React components
│   ├── focus/themes/       # Aurora, Minimal, Liquid
│   ├── calendar/           # DayView, WeekView, MonthView, DnD
│   ├── habits/             # Gallery, Wizard, Analytics, Celebration
│   ├── tasks/kanban/       # Kanban board, columns, cards
│   └── layout/             # AppShell, Sidebar, ArtworkPane
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── api/                # API client modules
│   ├── copy.ts             # All UI strings (single source)
│   ├── motion.ts           # Animation presets (single source)
│   └── sounds.ts           # Completion chimes (Web Audio)
├── router/                 # React Router config
├── stores/                 # Zustand stores
├── contexts/               # Theme + Focus providers
└── config/                 # Environment config (Zod-validated)

laif-api/
├── src/
│   ├── routes/             # Express route handlers
│   ├── models/             # Mongoose schemas
│   ├── middleware/          # Auth, CORS, rate limiting, error handling
│   └── lib/                # Auth, validation, logging
└── dist/                   # Compiled output
```

---

## Environment Variables

```bash
# Frontend (.env.local)
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_AUTH=true

# Backend (laif-api/.env.local)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-64-char-random-string
OPENROUTER_API_KEY=sk-or-...            # Optional — AI Chat
GOOGLE_CLIENT_ID=...                    # Optional — Calendar sync
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
```

Full list in `.env.example`.

---

## Author

**Divy Sharma** — building a personal Life OS, one module at a time.

[![GitHub](https://img.shields.io/github/followers/divysharma7?style=social)](https://github.com/divysharma7)

---

## Feedback & Contributing

Found a bug? Have a feature idea? [Open an issue](https://github.com/divysharma7/Personal-AI-Assisant/issues).

PRs welcome. Start with the codebase structure above to find your way around.

---

<p align="center">
  <sub>Built with obsessive attention to detail.</sub>
</p>
