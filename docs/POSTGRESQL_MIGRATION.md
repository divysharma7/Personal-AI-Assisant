# PostgreSQL migration — complete

LAIF uses Prisma ORM with Prisma Postgres as its only persistence layer.

## Final architecture

- Schema: `laif-api/prisma/schema.prisma`
- Migrations: `laif-api/prisma/migrations`
- Runtime client: `laif-api/src/lib/prisma.ts`
- Production host: Prisma Compute
- Production region: `ap-southeast-1`

All active API routes use Prisma. Mongoose models, MongoDB connection code,
Mongo maintenance scripts, the historical-data importer, and the `mongoose`
dependency have been removed.

## Data policy

The PostgreSQL database starts as a clean product database. Historical MongoDB
data will not be imported. MongoDB IDs, snapshots, and rollback procedures are
therefore not part of the production architecture.

## Schema deployment

Validate and generate:

```bash
cd laif-api
npm run prisma:validate
npm run prisma:generate
```

Apply committed migrations:

```bash
npx prisma migrate deploy
```

Use committed migrations for production changes. Do not use `prisma db push`
against production because it bypasses the reviewed migration history.

## Production integration

The frontend uses:

```env
VITE_API_URL=https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build
```

The backend allows the exact frontend origin:

```env
CORS_ORIGINS=https://laif-iota.vercel.app
```

Authentication uses cross-origin secure cookies, so both sides must keep
`credentials: include` and CORS must not use a wildcard origin.
