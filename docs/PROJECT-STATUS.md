# LAIF — Project Status & Remaining Work

> **Prepared for:** Cross-functional review  
> **Date:** July 26, 2026  
> **Author:** TPM / Engineering Lead  
> **Purpose:** Share with ChatGPT or stakeholders for planning, prioritization, and execution guidance.

---

## 1. What Is LAIF?

LAIF is a **personal productivity web application** — think of it as a Notion + Todoist + Headspace hybrid. It combines task management, calendar, habits tracking, AI chat assistant, focus/pomodoro timer, and kanban workflows into a single interface.

> **Note:** Contacts, Notes, and Journal features have been removed from the product. References to them in this document are historical.

**Target user:** Single user (themselves), managing their daily life — tasks, habits, calendar, focus sessions.

**Tech stack:**
- **Frontend:** Vite + React 18 + TypeScript + Tailwind CSS + React Router v7 + React Query + Framer Motion
- **Backend:** Express.js + Mongoose/MongoDB + JWT auth + Zod validation
- **AI:** OpenRouter API (configured but not yet wired)
- **Deployment:** Vercel (frontend), standalone Node.js (backend)

**Architecture:** The project was originally a Next.js monolith. It was migrated to a split architecture:
- `Personal-AI-Assisant/` — Vite SPA frontend (this repo)
- `laif-api/` — Express.js backend API (cloned to `./laif-api/`)

---

## 2. What's Done (The Good News)

### Frontend — 90% Complete

| Feature | Status | Details |
|---------|--------|---------|
| **Color & Theming** | ✅ 100% | Dark/light themes, ocean-midnight palette, CSS custom properties |
| **Focus Mode (Pomodoro)** | ✅ 100% | Timer with 3 visual themes (aurora/minimal/liquid), breathing ring, task picker, sound effects |
| **Habits Strip** | ✅ 100% | Dashboard habits dots, sidebar habits section with check-in toggle, standalone habits page with CRUD |
| **Daily Journal** | ❌ REMOVED | Feature removed from product |
| **Dashboard** | ✅ 100% | Greeting header, real-time clock, weather (wttr.in), AI Brief widget, today's tasks, habits strip, inbox section |
| **Notes** | ❌ REMOVED | Feature removed from product |
| **Keyboard Shortcuts** | ✅ 100% | T (new task), E (calendar), Ctrl+K (search), Ctrl+N (new task), arrow keys, space/enter |
| **Sidebar** | ✅ 100% | Collapse persistence via localStorage, badge counts, workflows section, habits section |
| **Page Transitions** | ✅ 100% | CSS-based fade+slide animation (safe, no framer-motion tree destruction) |
| **Empty States** | ✅ 100% | Added to calendar, focus, statistics, workflows pages |
| **Calendar** | ✅ 100% | 7 views (Day, 3-Day, Week, Month, Year heatmap, Agenda), drag-to-create, click-to-create, keyboard shortcut `q` |
| **Chat** | ✅ 90% | Persistent sessions, history panel, 14 tool functions, but OpenRouter integration is a stub on backend |
| **Workflows (Kanban)** | ✅ 100% | Custom columns, drag-and-drop, task creation, workflow management |
| **Settings** | ✅ 100% | Profile, features (theme/sounds), integrations (Alexa/Google/MCP) |
| **Auth (frontend)** | ✅ 100% | Login, signup, onboarding, RequireAuth route guard, cookie-based session |

### Backend — Functionally Complete, Security Gaps

| Feature | Status | Details |
|---------|--------|---------|
| **API Routes** | ✅ 22 modules | Tasks, habits, focus, calendar, events, lists, folders, workflows, kanban, memories, reminders, list-groups, pomodoro, chat, notifications, push, users, integrations, mcp, alexa, auth, devices (contacts, notes, journal removed) |
| **Mongoose Models** | ✅ 17 models | Task, Habit, Event, User, FocusSession, ChatSession, Workflow, List, ListGroup, Reminder, Memory, KanbanSection, PomodoroSession, Device, NotificationSchedule, WebPushSubscription, ExternalCalendarEvent (Note, Contact, JournalEntry, NoteFolder removed) |
| **Auth Middleware** | ✅ | Cookie/Bearer/API-key resolution, dev bypass with DEV_USER_ID |
| **Error Handling** | ✅ | Typed AppError hierarchy, Zod error surfacing, request-id logging |
| **Zod Validation** | ⚠️ 14/19 routes | 5 routes missing validation (memories, users partial) |
| **Notification Service** | ✅ | Timezone-aware scheduling, frequency patterns (daily/weekly/interval), 30-day rolling window |
| **Streak Service** | ✅ | Consecutive day computation for habits |
| **Folder Service** | ✅ | Task organization into folders |

---

## 3. What's NOT Done (The Real Work)

### 3.1 — ~~CRITICAL: Backend Security Holes~~ RESOLVED (features removed)

> **Note:** The contacts, notes, and journal routes that had user-scoping issues have been removed from the product. Remaining route files should still be audited for proper userId scoping.

---

### 3.2 — CRITICAL: Zero Backend Tests

**Problem:** The backend has `vitest` configured but **zero test files**. The frontend has 209 tests passing but they only cover utility functions, stores, and 2 hooks. There are zero component render tests and zero API integration tests.

**Why it matters:** Without tests, every change is a coin flip. The 14 AI chat tool functions have mutation side effects (create/update/delete documents) and are completely untested. A bad AI response could corrupt user data.

**What needs testing (priority order):**
1. Auth flow (login → cookie → protected route)
2. CRUD operations for core entities (tasks, habits)
3. The 14 AI chat tool functions
4. Zod validation (reject bad input)
5. User-scoping (User A can't see User B's data)

**Effort:** ~2 days  
**Risk:** Medium — may discover existing bugs during test writing

---

### 3.3 — HIGH: AI Chat Is a Stub

**Problem:** The backend `chat.ts` route returns a placeholder: `"Chat API connected. AI integration pending."` The `OPENROUTER_API_KEY` is configured in the environment but **zero OpenRouter API calls exist** in the codebase.

**Why it matters:** The chat page is one of the app's core features. Users see a full chat UI with history, suggestions, and session management — but the AI never actually responds. This is the biggest feature gap.

**What needs to happen:**
1. Create an `openRouterService.ts` that calls `https://openrouter.ai/api/v1/chat/completions`
2. Wire it into the `POST /api/chat` route with streaming support
3. Implement the 14 tool functions (fetch data, add task, check availability, etc.)
4. Create the `/api/ai/brief` endpoint (generates a daily summary for the dashboard widget)

**Effort:** ~1-2 days  
**Risk:** Medium — OpenRouter API is straightforward, but tool-calling integration is complex

---

### 3.4 — HIGH: Migration Cleanup Debt

**Problem:** The Next.js → Vite migration left behind dead code:

| Item | Impact | Fix |
|------|--------|-----|
| `next` + `eslint-config-next` in package.json | Adds ~150MB to node_modules | Remove from package.json |
| `next.config.mjs` + `next-env.d.ts` | Confusing, dead files | Delete both |
| `"lint": "next lint"` script | Broken command | Replace with `eslint .` |
| 155 files with `'use client'` | Dead directives in Vite | Remove (no runtime impact) |
| All API client types are `any` | Zero type safety across 14 API files | Add TypeScript interfaces |

**Why it matters:** Dead dependencies bloat install size. Dead config files confuse contributors. `any` types mean the compiler can't catch API shape mismatches.

**Effort:** ~half day  
**Risk:** Low — mechanical cleanup

---

### 3.5 — MEDIUM: Missing Zod Validation on 5 Backend Routes

**Problem:** These routes accept arbitrary request bodies:

| Route | What's Missing |
|-------|---------------|
| `memories.ts` | No validation at all — passes `req.body` directly to Mongoose |
| `users.ts` | Only validates focus preferences; calendar prefs and MCP prefs are unchecked |
| ~~`contacts.ts` (GET)~~ | REMOVED — feature removed from product |
| ~~`notes.ts` (GET)~~ | REMOVED — feature removed from product |
| ~~`journal.ts` (GET)~~ | REMOVED — feature removed from product |

**Why it matters:** Without validation, the API silently accepts malformed data. Mongoose drops unknown fields but doesn't enforce nested invariants (e.g., habit frequency must have a valid type).

**Effort:** ~1 hour  
**Risk:** Low — schemas already exist in `src/lib/validation.ts` for similar entities

---

### 3.6 — MEDIUM: Notification Pipeline Is Stub

**Problem:** The notification scheduling service (`notificationService.ts`) is well-built — it creates `NotificationSchedule` documents with timezone-aware dates. But the actual **delivery** (`notificationDelivery.ts`) and the webhook receiver (`posthookListener.ts`) are stubs. The PostHook API key is not configured.

**Why it matters:** Users can set reminders on tasks and events, but they never fire. The UI shows reminder settings; the backend schedules them; nobody delivers them.

**What needs to happen:**
1. Configure PostHook API key (or replace with a cron job)
2. Implement webhook receiver that triggers FCM + Web Push
3. Test end-to-end: create event with reminder → schedule → webhook → push notification

**Effort:** ~1 day  
**Risk:** Medium — requires external service (PostHook) or self-hosted cron

---

### 3.7 — LOW: Frontend PLAN.md Items

| Item | What | Effort |
|------|------|--------|
| 3.6 | Habits management tab in Settings page | ~1 hour |
| 3.7 | Monthly heatmap on hover over habit dots | ~2 hours |
| ~~4.8~~ | ~~Show linked tasks inline in journal entries~~ | REMOVED |
| ~~4.10~~ | ~~Feed journal into AI Brief prompt~~ | REMOVED |

**Why they matter:** These are polish items. The app is fully functional without them. They improve the experience but aren't blockers.

---

### 3.8 — LOW: Missing Frontend API Clients

| Backend Route | Frontend Client | Status |
|--------------|----------------|--------|
| `/notifications` | None | Missing — no way to view/manage scheduled notifications |
| `/alexa` | None | Missing — Alexa skill has no frontend management UI |
| `/mcp` | `settings.ts` hits `/users/me/mcp` | Possible route mismatch with backend's `/mcp` |

**Effort:** ~1 hour  
**Risk:** Low — these are edge cases, not core features

---

### 3.9 — LOW: Production Auth Verification

**Problem:** Dev mode bypasses auth via `DEV_USER_ID`. No one has verified that real JWT auth works end-to-end in production mode.

**What needs to happen:**
1. Set `NODE_ENV=production` on backend
2. Attempt login with real credentials
3. Verify JWT cookie is set and `RequireAuth` guard works
4. Verify no dev-mode fallback leaks through

**Effort:** ~30 minutes  
**Risk:** Low — the auth code looks correct, this is just verification

---

## 4. Dependency Map

```
3.3 (AI Chat) ──blocks──→ Frontend AI Brief widget actually working
       │
3.2 (Tests) ──should run before──→ 3.5 (Zod validation)
       │
3.6 (Notifications) ──independent──→ Can be done anytime
       │
3.4 (Migration cleanup) ──independent──→ Can be done anytime
```

---

## 5. Prioritized Execution Plan

### Phase 1: Security & Stability (Day 1)
**Goal:** Fix critical security holes, establish test baseline

| # | Task | Effort | Owner |
|---|------|--------|-------|
| ~~1~~ | ~~Fix userId scoping on notes, contacts, journal routes~~ | REMOVED | — |
| 2 | Add Zod validation to memories + users routes | 1h | Backend |
| 3 | Write auth flow tests (login → cookie → protected route) | 2h | Backend |
| 4 | Write CRUD tests for tasks, habits, notes | 3h | Backend |

### Phase 2: AI Integration (Day 2-3)
**Goal:** Make the chat feature actually work

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 5 | Create openRouterService.ts with streaming | 4h | Backend |
| 6 | Wire into POST /api/chat with tool-calling | 4h | Backend |
| 7 | Implement 14 tool functions with proper error handling | 4h | Backend |
| 8 | Create /api/ai/brief endpoint | 2h | Backend |
| 9 | Test AI chat tool functions (mutation side effects) | 2h | Backend |

### Phase 3: Frontend Polish (Day 3-4)
**Goal:** Clean up migration debt, finish remaining features

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 10 | Remove next, eslint-config-next, dead config files | 30m | Frontend |
| 11 | Add TypeScript interfaces to all API clients | 2h | Frontend |
| 12 | Add habits tab to Settings page | 1h | Frontend |
| 13 | Add monthly heatmap on hover for habit dots | 2h | Frontend |
| ~~14~~ | ~~Show linked tasks inline in journal~~ | REMOVED | — |

### Phase 4: Production Readiness (Day 4-5)
**Goal:** Deploy-ready

| # | Task | Effort | Owner |
|---|------|--------|-------|
| 15 | Verify production auth (JWT, no dev bypass) | 30m | Backend |
| 16 | Implement notification delivery pipeline | 4h | Backend |
| 17 | Fix service worker for Vite (`/_next/` → `/assets/`) | 15m | Frontend |
| 18 | Add missing API clients (notifications, alexa) | 1h | Frontend |
| 19 | Run full E2E test suite against live server | 2h | QA |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenRouter API changes break chat | Low | High | Pin API version, add fallback model |
| MongoDB Atlas costs spike with unindexed queries | Medium | Medium | Add missing indexes (sectionId, scheduledStart) |
| Habit model confusion (Task-based vs legacy Habit model) | Medium | Medium | Complete TODO #1: legacy habit migration |
| No CI/CD pipeline — manual deploys | Medium | High | Add GitHub Actions for lint + test + build |
| Single-user assumption baked into routes | Low | High | Already scoped via userId in most routes; remaining audited post-feature-removal |
| Service worker caches stale Next.js paths | Low | Medium | Fix sw.js asset path pattern |

---

## 7. Architecture Decisions Log

| Decision | What | Why | Confidence |
|----------|------|-----|------------|
| Labels → Workflows | Tasks use `workflowId` instead of `labelIds[]` | Simpler mental model, no empty-labels problem | HIGH |
| Lists coexist with Workflows | Lists are flat grouping, Workflows are kanban boards | Both serve different use cases | MEDIUM |
| AnimatePresence removed from AppShell | CSS transitions instead | Framer-motion destroyed React tree on route change, causing chunk errors | HIGH |
| useSearchParams removed | `window.location.search` instead | Next.js 14 prerendering failed with Suspense boundary | HIGH |
| Backend extracted to separate repo | Vite SPA + Express API | Cleaner separation, independent deployment, no server-side rendering needed | HIGH |
| Habits stored as Tasks with `isHabit: true` | Single model for tasks + habits | Avoids duplicating CRUD, but adds query complexity | MEDIUM |

---

## 8. What "Done" Looks Like

### MVP (Minimum Viable Product)
- [x] User can create, edit, complete, delete tasks
- [x] User can organize tasks into workflows (kanban boards)
- [x] User can track habits with daily check-ins and streaks
- ~~[x] User can write daily journal entries with rich text~~ REMOVED
- ~~[x] User can take notes with auto-save~~ REMOVED
- [x] User can use focus/pomodoro timer
- [x] User can view calendar with multiple views
- [x] User can navigate via keyboard shortcuts
- [x] Dashboard shows greeting, clock, weather, habits, today's tasks

### Production-Ready
- [ ] AI chat actually responds (OpenRouter integration)
- [ ] AI Brief generates daily summary
- [ ] Reminders actually fire (notification pipeline)
- [ ] All backend routes validated (Zod) and user-scoped
- [ ] Backend has test coverage for critical paths
- [ ] Production auth verified (no dev bypass)
- [ ] No dead code or leftover Next.js artifacts
- [ ] API clients have TypeScript types (no `any`)

### Stretch
- [ ] Alexa skill end-to-end tested
- [ ] Google Calendar sync working
- [ ] MCP server functional
- [ ] E2E Playwright tests passing against live server
- [ ] CI/CD pipeline (GitHub Actions)

---

## 9. Metrics

| Metric | Current | Target |
|--------|---------|--------|
| PLAN.md completion | 35/39 (90%) | 39/39 (100%) |
| Frontend build | ✅ Passes (1.3s) | ✅ Passes |
| TypeScript errors | 0 | 0 |
| Frontend tests | 209 passing, 14 files | 209+ (add component tests) |
| Backend tests | 0 files | 30+ test files |
| Zod validation coverage | 14/19 routes (74%) | 19/19 routes (100%) |
| User-scoped routes | 16/19 (84%) | 19/19 (100%) |
| Dead dependencies | 2 (next, eslint-config-next) | 0 |
| `any` types in API clients | 14 files | 0 files |

---

## 10. Questions for Stakeholder / ChatGPT

1. **Priority trade-off:** Should we fix security (Phase 1) before building AI chat (Phase 2), or do both in parallel?
2. **AI model choice:** OpenRouter is configured with `meta-llama/llama-3.3-70b-instruct:free`. Should we use a paid model for better quality? Which one?
3. **Notification delivery:** PostHook (external service) vs self-hosted cron job? PostHook adds a dependency; cron adds infrastructure.
4. **Lists vs Workflows:** Should we fully remove Lists and migrate to Workflows, or keep both?
5. **Habit model:** Should we complete the legacy Habit → Task migration (TODO #1) before adding new habit features?
6. **Deployment target:** Vercel for frontend + where for backend? Railway? Render? VPS?
7. **Testing strategy:** Unit tests first (fast feedback) or integration tests (higher confidence)?
8. **Scope for v1.0:** Is the current feature set enough for launch, or do we need the stretch items?
