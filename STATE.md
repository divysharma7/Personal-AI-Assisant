# LAIF project state

Updated July 29, 2026.

## Architecture

- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query, Zustand
- Backend: Express, Zod, Prisma ORM
- Database: Prisma Postgres only
- Frontend hosting: Vercel
- Backend hosting: Prisma Compute in `ap-southeast-1`

Production:

- https://laif-iota.vercel.app
- https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build

MongoDB and Mongoose are not part of the runtime or data plan. Historical data
will not be imported.

## Working product areas

- Cookie-based login, signup, onboarding, and protected routes
- Tasks, habits, Inbox, Today, Matrix, folders, and lists
- Calendar and scheduling
- Focus and Pomodoro sessions
- Workflows and Kanban
- Chat sessions and memories
- User settings and Google Calendar integration

Contacts, Notes, and Journal have been removed from the product.

## Verification baseline

- Frontend typecheck, tests, and production build pass
- Backend typecheck, 51 tests, and production build pass
- Frontend and backend dead-code scans pass
- PostgreSQL migrations are applied to the primary database

See `TODO.md` for remaining work and `docs/CODEX_HANDOFF.md` for deployment
details.
