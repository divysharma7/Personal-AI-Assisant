# Full-stack Playwright harness

Date: 2026-08-14  
Owner: QA/Platform  
Ticket: QA-001

## What the command proves

`npm run test:e2e:fullstack` runs a deliberately small browser suite against:

- a fresh generated PostgreSQL schema;
- every committed Prisma migration;
- the compiled backend under the pinned TSX ESM loader;
- the production Vite build served by `vite preview`; and
- one desktop Chromium project.

The runner refuses non-loopback frontend, API, and PostgreSQL hosts before it
creates anything. It creates only a schema named `laif_e2e_<random>`, drops that
schema in `finally`, removes `DEV_USER_ID`, and writes API/frontend logs under
`test-results/full-stack/servers`.

## Local run

Provide an administrator URL for a local PostgreSQL server. The test runner
manages its own schema and both application processes; do not point this at a
shared or hosted database.

PowerShell:

```powershell
$env:E2E_POSTGRES_ADMIN_URL = 'postgresql://postgres:postgres@127.0.0.1:5432/postgres'
npm run test:e2e:fullstack
```

The guard accepts only `localhost`, `127.0.0.1`, or `::1`. A hosted hostname
causes an immediate failure before migrations or tests.

## CI run

`.github/workflows/quality.yml` provisions PostgreSQL 16 as a service, checks
out the backend into `laif-api`, installs the pinned Chromium build, runs the
harness, and uploads Playwright traces, screenshots, reports, and server logs.

Because the frontend and backend are separate repositories, publish the
verified backend commit before enabling the frontend full-stack workflow on
`main`. A future version-manifest ticket should pin the backend checkout to the
release SHA instead of the moving backend `main` branch.

## Suite boundaries

- `playwright.fullstack.config.ts` is the real API/database gate.
- `playwright.config.ts` remains the broad browser-mocked UI inventory and is
  not release evidence.
- HTTPS cross-site `Secure`/`SameSite` cookie and deployed CORS behavior still
  require the staging deployment smoke suite.
