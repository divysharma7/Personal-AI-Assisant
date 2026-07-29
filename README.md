# LAIF — Your Intelligent Life Manager

LAIF combines tasks, habits, calendar planning, focus sessions, workflows, and
an AI assistant in one React application.

## Production

- Frontend: https://laif-iota.vercel.app
- API: https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build
- Database: Prisma Postgres
- Backend hosting: Prisma Compute (`ap-southeast-1`)

## Technology

- React 18, TypeScript, Vite, React Router
- TanStack Query and Zustand
- Express and Zod
- Prisma ORM with PostgreSQL
- Cookie-based JWT authentication

PostgreSQL is the only application database. The project does not require
MongoDB and does not include a historical MongoDB import path.

## Local development

Requirements:

- Node.js 20+
- A PostgreSQL connection string

Install both applications:

```bash
npm install
cd laif-api
npm install
```

Create `.env.local` in the repository root:

```env
VITE_API_URL=http://localhost:4000
```

Create `laif-api/.env` from `laif-api/.env.example` and provide at least:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/laif
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

Prepare PostgreSQL:

```bash
cd laif-api
npm run prisma:generate
npx prisma migrate deploy
```

Run the backend and frontend in separate terminals:

```bash
cd laif-api
npm run dev
```

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at
`http://localhost:4000`.

## Verification

Frontend:

```bash
npm run typecheck
npm run test:run
npm run lint
npm run build
```

Backend:

```bash
cd laif-api
npm run prisma:validate
npm run typecheck
npm run test:run
npm run build
```

## Repository layout

```text
src/                  React application
docs/                 Architecture and delivery notes
laif-api/
  prisma/             PostgreSQL schema and migrations
  src/routes/         Express API routes
  src/lib/prisma.ts   Prisma client
```

`laif-api` is a nested Git repository and should be committed independently
from the frontend repository.
