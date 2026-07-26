# LAIF Migration Baseline Report

> TASK 00 — Recorded 2026-07-26 before remaining migration work.
> Purpose: Establish known-good state. No fixes applied.

---

## 1. Git Status

**Branch**: `main` (up to date with `origin/main`)

**34 modified files** (migration changes from ChatGPT session):
- `package.json`, `package-lock.json`
- `tsconfig.json`, `vitest.config.ts`, `tailwind.config.ts`, `playwright.config.ts`
- 12 page/component files (navigation migration)
- 15 hook files (env variable migration)
- `src/lib/api/client.ts`
- `src/contexts/FocusContext.tsx`

**12 untracked files** (new migration artifacts):
- `vite.config.ts`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`
- `src/config/env.ts`, `src/router/` (3 files), `src/components/shared/` (2 files)
- `vercel.json`, `nginx.conf.example`, `VERIFICATION-REPORT.md`

---

## 2. Unit Tests

**Command**: `npm run test:run` (vitest run)

| Suite | Status | Details |
|-------|--------|---------|
| src/__tests__/smoke.test.ts | PASS | 1 test |
| src/stores/undoStore.test.ts | PASS | 5 tests |
| src/lib/calendarLayout.test.ts | PASS | 9 tests |
| src/lib/colorUtils.test.ts | PASS | 6 tests |
| src/lib/errors.test.ts | PASS | 20 tests |
| src/lib/dateUtils.test.ts | PASS | 17 tests |
| src/lib/taskColor.test.ts | PASS | 14 tests |
| src/stores/settingsStore.test.ts | PASS | 11 tests |
| src/stores/calendarStore.test.ts | PASS | 17 tests |
| src/components/calendar/calendarUtils.test.ts | PASS | 64 tests |
| src/lib/workflowTemplates.test.ts | PASS | 15 tests |
| src/lib/nlpParser.test.ts | PASS | 17 tests |
| **src/hooks/useBatchActions.test.ts** | **FAIL** | Suite-level crash (ZodError) |
| **src/hooks/useTasks.test.ts** | **FAIL** | Suite-level crash (ZodError) |

**Summary**: 12 passed, 2 failed, 196 individual tests passed, 0 individual tests failed.

**Root cause of failures**: Both suites import `useTasks.ts` which imports `src/config/env.ts`. That module calls `z.parse()` with `import.meta.env.VITE_API_URL` at import time. In vitest (jsdom), `import.meta.env.VITE_API_URL` is `undefined`, causing a ZodError that crashes the entire suite before any tests run. This is a **test environment configuration issue**, not individual test logic failures.

---

## 3. useTasks.test.ts (Isolated)

**Command**: `npx vitest run src/hooks/useTasks.test.ts --reporter=verbose`

**Result**: FAIL — 0 tests executed. Suite crashed at import with:

```
ZodError: [
  {
    "expected": "string",
    "code": "invalid_type",
    "path": ["VITE_API_URL"],
    "message": "Invalid input: expected string, received undefined"
  }
]
  ❯ src/config/env.ts:8:27
  ❯ src/hooks/useTasks.ts:2:1
  ❯ src/hooks/useTasks.test.ts:6:1
```

**Note**: The migration plan expected "6 individual test failures." The actual behavior is different — the suite crashes entirely at module load time before any test runs. This is a pre-existing issue caused by the migration adding `src/config/env.ts` with strict Zod validation, but not configuring vitest to provide the `VITE_API_URL` env var.

---

## 4. Typecheck

**Command**: `npm run typecheck` (tsc --noEmit)

**Result**: FAIL — 3 errors

| File | Line | Error |
|------|------|-------|
| `src/app/login/page.tsx` | 239 | `style jsx` — Property `jsx` does not exist on `<style>` element (styled-jsx is Next.js-only) |
| `src/app/workflows/[id]/page.tsx` | 126 | `string \| undefined` not assignable to `string \| null` |
| `src/components/calendar/week/WeekTimeGrid.tsx` | 526 | `style jsx` — Property `jsx` does not exist on `<style>` element |

---

## 5. Next.js Build

**Command**: `npm run build` (next build)

**Result**: FAIL

```
Next.js 14.2.35
✓ Compiled successfully
Failed to compile.

./src/app/login/page.tsx:239:14
Type error: Type '{ children: string; jsx: true; }' is not assignable to type
'DetailedHTMLProps<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>'.
Property 'jsx' does not exist on type ...
```

Next.js compiled successfully but the type-checking phase failed on the same `style jsx` error. The `tsconfig.json` was modified during migration (removed Next.js plugin, changed jsx to react-jsx), which broke styled-jsx support.

---

## 6. Vite Build

**Command**: `npm run build:vite` (tsc --noEmit && vite build)

**Result**: FAIL (due to typecheck step — same 3 errors as above)

**Vite-only build** (npx vite build, skipping tsc): **SUCCESS**

```
vite v8.1.5 building client environment for production...
✓ 2489 modules transformed.
✓ built in 1.38s
```

Output: 39 chunks in `dist/`, largest is `index-Cvu_ol8Q.js` at 936.72 kB (gzip: 287.09 kB).

---

## 7. Summary of Baseline State

| Check | Status |
|-------|--------|
| Git status recorded | DONE |
| Unit tests (full suite) | 12/14 suites pass, 2 crash at import |
| useTasks.test.ts (isolated) | 0 tests run — ZodError at import |
| Typecheck | 3 errors (2 styled-jsx, 1 type mismatch) |
| Next.js build | FAIL (typecheck phase) |
| Vite build (with tsc) | FAIL (typecheck phase) |
| Vite build (without tsc) | SUCCESS |

### Failure Classification

| Issue | Type | Severity |
|-------|------|----------|
| `VITE_API_URL` undefined in vitest | Env config gap | Blocks 2 test suites |
| `<style jsx>` not recognized | Pre-existing (styled-jsx needs Next.js types) | Blocks typecheck + builds |
| `string \| undefined` → `string \| null` | Pre-existing type mismatch | Blocks typecheck + builds |

### Acceptance Criteria

- [x] Existing failures documented
- [x] Vite build status known (succeeds without tsc, fails with tsc)
- [x] Next build status known (fails at typecheck phase)
- [x] No fixes made
