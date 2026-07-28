# LAIF — Setup Guide

> A personal productivity web app: tasks, habits, calendar, focus, AI chat, and kanban workflows.

## Prerequisites

- Node.js 18+
- A MongoDB instance (Atlas free tier works)
- An OpenRouter account (optional — for AI chat)

---

## 1. Clone and install

```bash
git clone https://github.com/divysharma7/Personal-AI-Assisant.git
cd Personal-AI-Assisant

# Frontend
npm install

# Backend (separate terminal)
cd laif-api
npm install
```

---

## 2. Environment variables

### Frontend (`.env.local` in project root)

```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_AUTH=true
```

### Backend (`laif-api/.env.local`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/laif

# Auth
JWT_SECRET=<any long random string>
DEV_USER_ID=<a-valid-mongodb-objectid>   # Dev-only: bypasses auth

# OpenRouter (AI chat) — optional
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Google Calendar — optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
```

Full list in `.env.example`.

---

## 3. MongoDB setup

No manual schema creation needed — Mongoose creates collections automatically on first run.

To seed sample data:

```bash
cd laif-api && npm run seed
```

---

## 4. Run locally

```bash
# Terminal 1 — Frontend (Vite dev server)
npm run dev          # http://localhost:5173

# Terminal 2 — Backend (Express API)
cd laif-api && npm run dev   # http://localhost:3000
```

Open [http://localhost:5173](http://localhost:5173).

---

## 5. Verify

```bash
# Frontend
npm run typecheck    # Should pass with 0 errors
npm run lint         # Should pass with 0 errors
npm run test:run     # Should pass all tests
npm run build        # Should produce dist/ output

# Backend
cd laif-api
npm run typecheck    # Should pass with 0 errors
npm run build        # Should produce dist/ output
```

---

## Project structure

```
src/                    # Frontend (Vite + React)
├── app/                # Page components (lazy-loaded)
├── components/         # React components
├── hooks/              # TanStack Query hooks
├── lib/api/            # API client modules
├── router/             # React Router config
├── stores/             # Zustand stores
├── contexts/           # Theme + Focus providers
└── config/             # Environment config (Zod-validated)

laif-api/               # Backend (Express)
├── src/
│   ├── routes/         # Express route handlers
│   ├── models/         # Mongoose schemas
│   ├── middleware/      # Auth, CORS, rate limiting
│   └── lib/            # Auth, validation, logging
└── dist/               # Compiled output
```
