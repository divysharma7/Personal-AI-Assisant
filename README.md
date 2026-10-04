<p align="center">
  <img 
    src="assets/icon/lifeos-icon.png" 
    alt="Life OS — Your Daily Operating System" 
    width="120" 
    height="120" 
    style="border-radius: 24px;" 
  />
</p>

<h1 align="center">Life OS</h1>

<p align="center">
  <strong>Your Daily Operating System</strong>
</p>

<p align="center">
  A unified productivity platform that combines tasks, habits, calendar planning,<br/>
  focus sessions, workflows, and an AI assistant into one calm, focused interface.<br/>
  Built for people who want a thinking partner, not just another task manager.
</p>

<p align="center">
  <b>Task Management</b> &nbsp;·&nbsp;
  <b>Habit Tracking</b> &nbsp;·&nbsp;
  <b>Focus & Pomodoro</b> &nbsp;·&nbsp;
  <b>AI Assistant</b>
</p>

<div align="center">

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/license-MIT-5B5BD6?style=flat-square)](LICENSE)
[![Release](https://img.shields.io/github/v/release/divysharma7/Personal-AI-Assisant?style=flat-square&color=22C55E&label=latest)](https://github.com/divysharma7/Personal-AI-Assisant/releases/latest)

</div>

<br/>

<p align="center">
  <a href="#features"><strong>Features</strong></a> &nbsp;·&nbsp;
  <a href="#screenshots"><strong>Screenshots</strong></a> &nbsp;·&nbsp;
  <a href="#architecture"><strong>Architecture</strong></a> &nbsp;·&nbsp;
  <a href="#getting-started"><strong>Getting Started</strong></a> &nbsp;·&nbsp;
  <a href="#contributing"><strong>Contributing</strong></a>
</p>

<br/>

---

<br/>

## Features

### Task Management

- 📥 Inbox for capturing new and incoming tasks
- ⚡ Quick Add from any screen with global composer
- ⌨️ Command Palette for keyboard-driven search and actions
- 🌳 Subtasks with hierarchical nesting and drag-and-drop
- 🏷️ Priorities, tags, due dates, and color coding

### Organization

- 📁 Lists and folders with nested grouping
- 📋 Kanban boards with custom workflow columns
- 🎯 Eisenhower Matrix for urgency/importance sorting
- 🔄 Workflow templates for Kanban, Sprint, Sales, and Content
- ↕️ Drag-and-drop reordering across lists and boards

### Planning & Calendar

- ☀️ Today view for daily focus
- 📅 Next 7 Days view for weekly planning
- 🗓️ Full calendar with time-grid visualization
- 🔄 Google Calendar two-way sync
- ⏱️ Time blocking and capacity warnings

### Habits & Routines

- ✅ Habit tracking with daily check-ins
- 🔥 Streak counters and monthly heatmaps
- 🧩 Habit gallery with curated templates
- 🎯 Binary and count-based goal types
- 🌅 Morning Plan and Evening Shutdown rituals

### Focus & Pomodoro

- 🍅 Pomodoro timer with customizable durations
- ⏱️ Stopwatch mode for open-ended focus
- 🔗 Link sessions to tasks or habits
- 🫁 Breathing ring animation during focus
- 📊 Session history and focus records

### AI & Intelligence

- ✨ AI Chat assistant with conversation history
- 🧠 AI Brief dashboard widget with daily summaries
- 💭 Memories system for books, movies, ideas, and more
- ⚡ Smart task suggestions and context awareness
- 🔌 MCP (Model Context Protocol) integration support

### Design & Experience

- 🌙 Deep ocean midnight dark theme with indigo accents
- ☀️ Light theme with lavender-white base
- ✨ Smooth page transitions and micro-animations
- 📱 Responsive layout with collapsible sidebar
- ✍️ Rich text editor with slash commands powered by TipTap

### Platform & Security

- 🔐 Cookie-based JWT authentication
- 👤 Per-user data isolation with ownership filtering
- 🔄 Cross-platform sync via REST API
- 🛡️ Rate limiting and CORS protection
- ⌨️ Keyboard shortcuts for power users

<br/>

---

<br/>

<h2 align="center" id="screenshots">Screenshots</h2>

<p align="center">
  <img src="assets/screenshots/dashboard.png" width="220" alt="Dashboard with clock, habits, and AI brief" />
  <img src="assets/screenshots/today.png" width="220" alt="Today view with task workspace" />
  <img src="assets/screenshots/calendar.png" width="220" alt="Calendar with time grid" />
</p>

<p align="center">
  <img src="assets/screenshots/focus.png" width="220" alt="Focus mode with Pomodoro timer" />
  <img src="assets/screenshots/habits.png" width="220" alt="Habits strip with heatmap" />
  <img src="assets/screenshots/workflows.png" width="220" alt="Kanban workflow board" />
</p>

<br/>

---

<br/>

<h2 align="center" id="architecture">Architecture</h2>

<p align="center">
  <b>Separate frontend and backend services</b> — React SPA communicates with an Express REST API backed by PostgreSQL via Prisma ORM.
</p>

```text
Personal-AI-Assisant/
 ├── src/                      # React frontend application
 │   ├── app/                  # Route pages (today, calendar, focus, habits, chat, etc.)
 │   ├── components/           # UI components organized by domain
 │   ├── hooks/                # Custom React hooks (tasks, habits, focus, calendar)
 │   ├── stores/               # Zustand state stores
 │   ├── router/               # React Router configuration
 │   ├── contexts/             # React context providers
 │   ├── lib/                  # Utility functions and API client
 │   ├── mcp/                  # Model Context Protocol integration
 │   └── types/                # TypeScript type definitions
 ├── laif-api/                 # Express backend (separate service)
 │   ├── prisma/               # PostgreSQL schema and migrations
 │   ├── src/routes/           # REST API route handlers
 │   ├── src/services/         # Business logic layer
 │   ├── src/middleware/       # Auth, error handling, rate limiting
 │   └── src/lib/              # Prisma client and utilities
 ├── docs/                     # Architecture and delivery documentation
 ├── tests/                    # End-to-end Playwright tests
 └── public/                   # Static assets
```

<h3 align="center">Application Flow</h3>

```text
Signup / Login (cookie-based JWT)
      ↓
Onboarding (name, priorities, calendar setup)
      ↓
Dashboard (clock, habits strip, AI brief, quick stats)
      ↓
Today · Calendar · Tasks · Focus · Habits · Workflows · Chat
      ↓
Express REST API → Prisma ORM → PostgreSQL
```

<br/>

<h3 align="center">Tech Stack</h3>

<div align="center">

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 8, React Router 7 |
| **Language** | TypeScript 5.9 |
| **State Management** | Zustand + TanStack Query |
| **Styling** | Tailwind CSS 3, Framer Motion |
| **Rich Text** | TipTap (StarterKit, TaskList, Links) |
| **Drag & Drop** | dnd-kit (core, sortable, utilities) |
| **Backend** | Express 4, Zod validation |
| **Database** | PostgreSQL 16 via Prisma ORM 7 |
| **Authentication** | Cookie-based JWT (jose + bcryptjs) |
| **Calendar Sync** | Google Calendar API (googleapis) |
| **Testing** | Vitest, Playwright, MSW, Testing Library |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Prisma Compute (ap-southeast-1) |
| **Logging** | Pino |

</div>

<br/>

---

<br/>

<h2 align="center" id="getting-started">Getting Started</h2>

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (local or remote)
- npm or your preferred package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/divysharma7/Personal-AI-Assisant.git

# Navigate to the project directory
cd Personal-AI-Assisant

# Install frontend dependencies
npm install

# Install backend dependencies
cd laif-api
npm install
```

### Environment Setup

Create `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:4000
```

Create `laif-api/.env` from `laif-api/.env.example`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/lifeos
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
CORS_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

> Never commit secrets, API keys, private credentials, or production configuration files to the repository.

### Database Setup

```bash
cd laif-api

# Generate Prisma client
npm run prisma:generate

# Apply migrations
npx prisma migrate deploy
```

### Run the Project

Open two terminals.

**Terminal 1 — Backend API**

```bash
cd laif-api
npm run dev
```

Backend runs at:

```text
http://localhost:4000
```

**Terminal 2 — Frontend**

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### Build for Production

```bash
# Frontend
npm run build

# Backend
cd laif-api
npm run build
```

### Useful Commands

```bash
# Frontend

npm run dev                 # Start dev server
npm run build               # Production build
npm run typecheck           # TypeScript type checking
npm run lint                # ESLint
npm run test                # Vitest watch mode
npm run test:run            # Vitest single run
npm run test:coverage       # Vitest with coverage
npm run test:e2e:fullstack  # Full-stack Playwright E2E tests


# Backend

cd laif-api

npm run dev                 # Start dev server with hot reload
npm run build               # Prisma generate + TypeScript build
npm run typecheck           # TypeScript type checking
npm run test:run            # Vitest single run
npm run prisma:validate     # Validate Prisma schema
npm run prisma:generate     # Generate Prisma client
```

<br/>

---

<br/>

<h2 align="center">Data Flow</h2>

```text
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT                                                 │
│  Task creation, habit check-in, focus session, chat message │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  REACT APPLICATION                                          │
│  Zustand stores · TanStack Query hooks · React Router       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  EXPRESS REST API                                           │
│  Route handlers · Zod validation · JWT auth middleware      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  PRISMA ORM → POSTGRESQL                                    │
│  20+ models · Migrations · Ownership-filtered queries       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                          │
│  Google Calendar sync · AI assistant · Push notifications   │
└─────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

<h2 align="center">Configuration</h2>

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |

### Backend (`laif-api/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode (`development` / `production`) | Yes |
| `PORT` | API server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for signing JWT tokens (32+ chars) | Yes |
| `CORS_ORIGINS` | Allowed frontend origins | Yes |
| `FRONTEND_URL` | Frontend URL for redirects | Yes |
| `LOG_LEVEL` | Pino log level | No |
| `DEV_USER_ID` | Dev-only user bypass | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL | No |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | 32-byte base64 token encryption key | No |
| `GOOGLE_SYNC_INTERVAL_MINUTES` | Background sync cadence, default 5 minutes | No |

<br/>

---

<br/>

<h2 align="center">Roadmap</h2>

- [x] Task management with subtasks, priorities, and tags
- [x] Habit tracking with streaks and heatmaps
- [x] Calendar with Google Calendar two-way sync
- [x] Focus / Pomodoro timer with session history
- [x] Workflows and Kanban boards
- [x] AI chat assistant with conversation memory
- [x] Morning Plan and Evening Shutdown rituals
- [x] Eisenhower Matrix prioritization
- [x] Dark and light theme support
- [x] Cookie-based JWT authentication with onboarding
- [ ] Zod validation on all write routes
- [ ] Integration tests for AI chat tool functions
- [ ] Notification delivery (push/email reminders)
- [ ] Frontend bundle splitting (route/vendor chunks)
- [ ] Mobile companion app (Flutter)

<br/>

---

<br/>

<h2 align="center" id="contributing">Contributing</h2>

<p align="center">
  Contributions, issues, and feature requests are welcome.
</p>

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run validation before submitting:

```bash
npm run typecheck
npm run test:run
npm run lint
npm run build
```

5. Commit your changes.
6. Open a pull request.

```bash
git checkout -b feature/your-feature-name

git add .

git commit -m "Add your feature"

git push origin feature/your-feature-name
```

<br/>

---

<br/>

<h2 align="center">License</h2>

<p align="center">
  This project is licensed under the <a href="LICENSE">MIT License</a>.
</p>

<br/>

---

<br/>

<p align="center">
  <a href="https://github.com/divysharma7/Personal-AI-Assisant/issues">
    <strong>Report an Issue</strong>
  </a>
  &nbsp;·&nbsp;
  <a href="https://github.com/divysharma7/Personal-AI-Assisant/releases">
    <strong>Releases</strong>
  </a>
  &nbsp;·&nbsp;
  <a href="https://laif-iota.vercel.app">
    <strong>Live Demo</strong>
  </a>
</p>

<br/>

<p align="center">
  <sub>
    MIT License · Built with React + Express + Prisma ·
    Made by <a href="https://github.com/divysharma7">@divysharma7</a>
  </sub>
</p>