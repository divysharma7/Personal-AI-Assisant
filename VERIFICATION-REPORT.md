# LAIF — Vite Migration Verification Report

> Generated: 2026-06-18
> Scope: Full codebase audit for Next.js → Vite/React Router migration completeness

---

## Executive Summary

The migration is **substantially complete but not production-ready**. The Vite infrastructure (entry point, router, env config, error boundaries, API client) is correctly wired up. However, **19 source files still reference `process.env.NEXT_PUBLIC_API_URL`** instead of the new Vite env pattern, the **Next.js middleware file is still present**, and **155 files retain `'use client'` directives** that are dead code in Vite.

| Category | Status | Count |
|----------|--------|-------|
| ✅ Vite infrastructure files | Complete | 10/10 |
| ✅ React Router setup | Complete | — |
| ✅ Next.js component imports removed | Complete | 0 remaining |
| ✅ Error boundaries (ErrorBoundary + ChunkErrorBoundary) | Complete | — |
| ⚠️ `process.env.NEXT_PUBLIC_*` still in use | **Needs fix** | 19 files |
| ⚠️ `'use client'` directives (dead code) | **Cleanup needed** | 155 files |
| ⚠️ Next.js-only files still present | **Needs removal** | 3 files |
| ⚠️ `package.json` scripts still default to Next.js | **Needs fix** | 3 scripts |
| ⚠️ Service worker references `/_next/static/` | **Needs fix** | 1 file |
| ⚠️ `.env.example` not updated for VITE_ prefix | **Needs fix** | 1 file |
| ✅ No `getServerSideProps` / `getStaticProps` | Complete | 0 |
| ✅ No `'use server'` directives | Complete | 0 |
| ✅ No `next/image`, `next/link`, `next/navigation`, `next/router` imports | Complete | 0 |

---

## 1. Vite Infrastructure — All Present ✅

| File | Status | Notes |
|------|--------|-------|
| `vite.config.ts` | ✅ | React plugin, `@/` alias, port 3000, `dist` output |
| `index.html` | ✅ | Root div, module script `/src/main.tsx`, Google Fonts, theme init script |
| `src/main.tsx` | ✅ | `createRoot`, `RouterProvider`, `ChunkErrorBoundary` > `ErrorBoundary` > `Providers` |
| `src/vite-env.d.ts` | ✅ | Declares `VITE_API_URL`, `VITE_USE_MOCK_AUTH` |
| `src/config/env.ts` | ✅ | Zod-validated `import.meta.env.VITE_API_URL` |
| `src/router/router.tsx` | ✅ | `createBrowserRouter` with lazy imports, public + protected routes |
| `src/router/AppLayout.tsx` | ✅ | Wraps `AppShell` + `<Outlet />` |
| `src/router/RequireAuth.tsx` | ✅ | `useSessionAuth()` fetches `/api/auth/me`, redirects to `/login` |
| `src/components/shared/ErrorBoundary.tsx` | ✅ | Class component with retry + go-home |
| `src/components/shared/ChunkErrorBoundary.tsx` | ✅ | Catches `ChunkLoadError`, prompts reload |

---

## 2. Remaining `process.env.NEXT_PUBLIC_API_URL` — 19 Files ❌

These files still use the Next.js env variable pattern. In Vite, `process.env` is undefined in the browser — these will all resolve to `''` at runtime, breaking API calls.

**Affected files:**

| # | File | Line |
|---|------|------|
| 1 | `src/contexts/FocusContext.tsx` | 2 |
| 2 | `src/hooks/useWorkflows.ts` | 2 |
| 3 | `src/hooks/useTasks.ts` | 2 |
| 4 | `src/hooks/useSettings.ts` | 2 |
| 5 | `src/hooks/useLists.ts` | 2 |
| 6 | `src/hooks/useFolders.ts` | 2 |
| 7 | `src/hooks/useKanbanSections.ts` | 2 |
| 8 | `src/hooks/useCalendar.ts` | 2 |
| 9 | `src/hooks/useChatSessions.ts` | 2 |
| 10 | `src/hooks/useFocus.ts` | 2 |
| 11 | `src/hooks/useHeatmap.ts` | 2 |
| 12 | `src/hooks/useHabits.ts` | 2 |
| 13 | `src/hooks/useGoogleCalendar.ts` | 2 |
| 14 | `src/app/chat/page.tsx` | 2 |
| 15 | `src/app/getting-started/page.tsx` | 2 |
| 16 | `src/app/login/page.tsx` | 2 |
| 17 | `src/app/onboarding/page.tsx` | 2 |
| 18 | `src/app/signup/page.tsx` | 2 |
| 19 | `src/components/layout/Sidebar.tsx` | 2 |

**Pattern found in all 19 files:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
```

**Required fix:** Replace with either:
```typescript
// Option A: Direct import.meta.env (simple)
const API_BASE = import.meta.env.VITE_API_URL || ''

// Option B: Centralized env config (preferred — already exists)
import { env } from '@/config/env'
const API_BASE = env.VITE_API_URL
```

**Note:** 15 of these files are hooks/pages that make direct `fetch()` calls instead of using the centralized `src/lib/api/client.ts` (which already correctly uses `env.VITE_API_URL`). Ideally, these should be migrated to use the `http` client from `src/lib/api/client.ts`.

---

## 3. Next.js-Only Files Still Present — 3 Files ❌

### 3a. `src/middleware.ts` (31 lines)
**Must be deleted.** Vite has no server middleware concept. This file:
- Imports `NextResponse`, `NextRequest` from `next/server`
- Uses `request.nextUrl`, `request.cookies.has()`
- Checks for `/_next` in public prefixes
- Auth redirect logic has been **correctly replicated** in `src/router/RequireAuth.tsx`

### 3b. `src/app/error.tsx` (55 lines)
**Next.js convention — not used by React Router.** Uses:
- `'use client'` directive
- `error.digest` (Next.js-specific error property)
- Next.js `reset()` callback pattern

The app already has `src/components/shared/ErrorBoundary.tsx` which handles errors in the Vite/React Router setup.

### 3c. `src/app/loading.tsx` (13 lines)
**Next.js convention — not used by React Router.** Next.js automatically shows this during page transitions. React Router has no equivalent built-in; loading states need to be handled via Suspense or custom logic.

### 3d. `src/app/layout.tsx` (15 lines)
**Next.js root layout — not used by React Router.** The equivalent is now `src/router/AppLayout.tsx`. This file is dead code but harmless.

---

## 4. `'use client'` Directives — 155 Files ⚠️

All `.tsx` component and page files contain `'use client'` at the top. In Vite, every component is client-side by default — these directives are **ignored** but are dead code.

**Recommendation:** Remove in a dedicated cleanup session. Low priority — no runtime impact.

---

## 5. `package.json` Scripts — Still Default to Next.js ❌

```json
{
  "scripts": {
    "dev": "next dev",           // ← Should be: "vite"
    "build": "next build",       // ← Should be: "tsc --noEmit && vite build"
    "start": "next start",       // ← Should be: "vite preview"
    "lint": "next lint",         // ← Can keep or switch to eslint directly
    "dev:vite": "vite",          // ← Duplicate after fix
    "build:vite": "tsc --noEmit && vite build",  // ← Duplicate after fix
    "preview:vite": "vite preview"  // ← Duplicate after fix
  }
}
```

**Required fix:** Swap the default scripts to use Vite, remove the `:vite` suffixed duplicates.

---

## 6. Service Worker — References Next.js Static Paths ⚠️

**File:** `public/sw.js` (line 51)

```javascript
if (url.pathname.match(/\.(js|css|png|...)$/) || url.pathname.startsWith('/_next/static/')) {
```

The `/_next/static/` pattern is Next.js-specific. Vite outputs to `/assets/` by default. This line should be updated to:
```javascript
url.pathname.startsWith('/assets/')
```

---

## 7. `.env.example` — Not Updated for Vite ⚠️

The current `.env.example` has no `VITE_API_URL` entry. It references `NEXT_PUBLIC_VAPID_PUBLIC_KEY` which should become `VITE_VAPID_PUBLIC_KEY`.

**Required additions:**
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_AUTH=true
```

---

## 8. Remaining `next` Dependency in `package.json` ⚠️

```json
"next": "^14.2.35"
```

The `next` package is still listed as a dependency. After migration is complete, it should be removed along with:
- `eslint-config-next` (devDependency)

**Keep:** `@vitejs/plugin-react` and `vite` are already present.

---

## 9. No Health Check Endpoint Found

The prompt referenced `src/pages/api/dashboard/health.ts` — this file does not exist. The project uses the App Router (`src/app/`), not Pages Router (`src/pages/`). No health check endpoint exists anywhere in the codebase.

---

## 10. No Docker / Kubernetes / Nginx / CI-CD Found

| Item | Status |
|------|--------|
| Dockerfile | Not found |
| docker-compose.yml | Not found |
| Kubernetes manifests | Not found |
| Nginx config | Not found |
| `.github/workflows/` | Not found |
| Deploy scripts | Not found |

The project deploys to **Vercel** (per SETUP.md and `.gitignore` references to `.vercel`). No containerization or CI/CD pipeline exists.

---

## 11. Security Posture (from `docs/SECURITY_AUDIT.md`)

The security audit (dated 2026-05-24) documents 16 findings. As of the audit:

| Status | Count | Items |
|--------|-------|-------|
| ✅ Fixed | 3 | Alexa route disabled, DELETE routes userId-scoped |
| ⏳ Open | 5 | Rate limiting, security headers, sameSite=strict, CORS, token rotation |
| ⚠️ Deferred | 8 | UPDATE routes missing userId, weak password policy, MCP info disclosure |

**Notable for migration:** The auth middleware in `src/middleware.ts` (to be deleted) only did cookie-presence checks. The real auth verification happens in `src/router/RequireAuth.tsx` (client-side) and in individual API routes via `getAuthUserId()`. The middleware deletion is safe.

---

## 12. Files Correctly Migrated

| Area | Status | Evidence |
|------|--------|----------|
| Routing | ✅ | `react-router-dom` `createBrowserRouter` in `src/router/router.tsx` |
| Navigation | ✅ | All `<Link>` imports from `react-router-dom` (confirmed in `not-found.tsx`) |
| 404 page | ✅ | Uses `react-router-dom` `Link` |
| API client | ✅ | `src/lib/api/client.ts` uses `env.VITE_API_URL` |
| Auth flow | ✅ | `RequireAuth.tsx` → `fetch('/api/auth/me')` → redirect to `/login` |
| Providers | ✅ | QueryClient, Theme, Focus — no Next.js dependencies |
| Error handling | ✅ | ErrorBoundary + ChunkErrorBoundary wrap the app |
| TypeScript | ✅ | `tsconfig.json` uses `moduleResolution: "bundler"`, `jsx: "react-jsx"` |
| Testing | ✅ | Vitest + Playwright configs present |
| Tailwind | ✅ | Content paths include `./index.html` |

---

## Recommended Fix Priority

### P0 — Blocks Vite from working correctly
1. **Replace `process.env.NEXT_PUBLIC_API_URL`** in all 19 files with `import.meta.env.VITE_API_URL` or `env.VITE_API_URL`
2. **Update `package.json` scripts** — make Vite the default `dev`/`build`/`start`
3. **Create/update `.env.example`** with `VITE_API_URL`

### P1 — Cleanup for clean codebase
4. **Delete `src/middleware.ts`** — Next.js-only, auth logic already in RequireAuth
5. **Delete `src/app/error.tsx`** — Next.js convention, ErrorBoundary handles this
6. **Delete `src/app/loading.tsx`** — Next.js convention
7. **Update `public/sw.js`** — replace `/_next/static/` with `/assets/`
8. **Remove `next` and `eslint-config-next`** from `package.json`

### P2 — Cosmetic cleanup
9. **Remove `'use client'`** from all 155 files (no runtime impact)
10. **Remove `src/app/layout.tsx`** — dead code

---

## Verification Commands for Post-Fix

```bash
# 1. Ensure no remaining Next.js env references
grep -r "process\.env\.NEXT_PUBLIC" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 matches

# 2. Ensure no remaining process.env in browser code
grep -r "process\.env" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v playwright
# Expected: 0 matches (except test/config files)

# 3. Ensure no Next.js imports
grep -r "from 'next/" src/ --include="*.ts" --include="*.tsx"
# Expected: 0 matches

# 4. Ensure middleware.ts is deleted
test -f src/middleware.ts && echo "STILL EXISTS" || echo "CLEAN"
# Expected: CLEAN

# 5. Type check
npx tsc --noEmit

# 6. Run tests
npm test
```
