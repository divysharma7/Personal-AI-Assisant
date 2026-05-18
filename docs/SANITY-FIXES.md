# Sanity Fixes — Priority Order

Based on skills audit (next-best-practices, vercel-react-best-practices,
web-design-guidelines) and codebase analysis.

## Batch 1: Ship-blockers (do before any new feature)

### 1. Global error boundary (~5 min)
Create `src/app/error.tsx` — catches any runtime crash, shows a
branded error screen with "Something went wrong" + Retry button.

### 2. Global loading state (~5 min)
Create `src/app/loading.tsx` — shows a minimal skeleton/spinner
during route transitions.

### 3. Not-found page (~5 min)
Create `src/app/not-found.tsx` — branded 404.

### 4. Theme flash fix (~15 min)
Per `rendering-hydration-no-flicker` skill: add a blocking `<script>`
in layout.tsx <head> that reads localStorage and sets data-theme
BEFORE React hydrates. This prevents the dark→light flash.

### 5. Fix `any` types (~5 min)
Find and replace the 2 `any` usages with proper types.

## Batch 2: Performance (do before scaling to more pages)

### 6. Lucide barrel import fix (~30 min)
The `bundle-barrel-imports` skill rates this CRITICAL (200-800ms cost).
Option A: Add `modularizeImports` to next.config:
```js
modularizeImports: {
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  },
},
```
Option B: Use `unplugin-icons` with auto-import.

### 7. Per-route metadata (~20 min)
Add `export const metadata` to each page.tsx with title + description.

## Batch 3: Code quality (do during next feature build)

### 8. Reduce inline styles (~1 hour)
The 132 `style={{}}` instances should migrate to:
- Tailwind utilities where possible (`text-[var(--text-primary)]`)
- CSS classes in globals.css for repeated patterns
- Keep `style={{}}` only for truly dynamic values (computed colors)

### 9. .env.example (~5 min)
Create with all required env vars documented.

## Not fixing now (intentional)

- 9 unused hooks: preserved for Phase 2-4
- Auth bypass: re-enable when backend connected
- useItems returning []: re-enable when backend connected
- Stub files: needed by API routes
