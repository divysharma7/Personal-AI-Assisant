# LAIF setup

## 1. Install

```bash
npm install
cd laif-api
npm install
```

## 2. Configure the frontend

Create `.env.local` in the repository root:

```env
VITE_API_URL=http://localhost:4000
```

For the Vercel production project, set:

```env
VITE_API_URL=https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build
```

Vite embeds this value during the frontend build, so redeploy Vercel after
changing it.

## 3. Configure the backend

Copy `laif-api/.env.example` to `laif-api/.env`, then set:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/laif
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

Optional Google Calendar and OpenRouter variables are documented in
`laif-api/.env.example`.

## 4. Prepare PostgreSQL

```bash
cd laif-api
npm run prisma:generate
npx prisma migrate deploy
```

The schema is defined in `laif-api/prisma/schema.prisma`. PostgreSQL is the only
database; no MongoDB setup or data import is required.

## 5. Start locally

Backend:

```bash
cd laif-api
npm run dev
```

Frontend, from the repository root:

```bash
npm run dev
```

Open `http://localhost:5173`.

## 6. Production integration

The Prisma Compute backend must allow the exact Vercel origin:

```env
CORS_ORIGINS=https://laif-iota.vercel.app
```

Do not use `*`: authentication uses cross-origin cookies and
`credentials: include`.

Current production endpoints:

- Frontend: https://laif-iota.vercel.app
- API: https://dqyymmjqlclmt8jako8x3blz.sin.prisma.build
