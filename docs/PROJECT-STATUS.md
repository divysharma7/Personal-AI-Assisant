# LAIF project status

Updated July 29, 2026.

## Current stack

| Layer | Production system |
| --- | --- |
| Frontend | Vite React SPA on Vercel |
| Backend | Express API on Prisma Compute |
| ORM | Prisma ORM |
| Database | Prisma Postgres |
| Authentication | Secure cookie JWT |

The PostgreSQL migration is complete. MongoDB, Mongoose, and historical data
import are intentionally out of scope and have been removed.

## Completed stabilization

- PostgreSQL schema and committed migration
- Prisma-backed route conversion
- User ownership checks across core CRUD
- Production cookie and Origin/CSRF policy
- Backend integration tests
- Frontend entry-point smoke tests
- Dead-code and dependency cleanup
- Contacts, Notes, and Journal removal

## Production

- Frontend: https://laif-iota.vercel.app
- API: https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build
- Prisma project: `proj_cms57bdgy02wx6lf4xyqw7yas`
- Compute app: `cps_dqyymmjqlclmt8jako8x3blz`
- Region: `ap-southeast-1`

## Remaining product work

See `TODO.md`. The main engineering priorities are bundle code-splitting,
remaining write-route validation, AI tool tests, and implementing a real
notification delivery pipeline.
