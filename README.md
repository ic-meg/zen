
# Zen — E‑commerce Web App

This repository contains the frontend web application (React + Vite) and a NestJS backend API (located in `zen-backend`). This README explains how to set up, run, build, and test both parts locally and provides useful notes for development.

## Contents

- `src/` — Frontend source (React, Vite, Tailwind)
- `zen-backend/` — Backend source (NestJS, Prisma)
- `package.json` — Root scripts for frontend and convenience scripts to run the backend

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, TanStack Query
- Backend: NestJS, Prisma, PostgreSQL (assumed), Jest for tests

> Note: The backend uses `prisma` and includes generated Prisma client files under `zen-backend/generated/prisma`. Adjust database steps below to match your environment.

## Prerequisites

- Node.js (LTS recommended, 18+ or the version you normally use)
- npm (bundled with Node.js)
- A database for the backend (PostgreSQL is the expected target for Prisma migrations). If you already have a database, set `DATABASE_URL` in the backend environment.

## Quick start (development)

Open a terminal (PowerShell) at the project root.

To install dependencies for the frontend and the backend (two terminals recommended):

```powershell
# in project root
npm install

# then in a second terminal for backend
cd zen-backend; npm install
```

Run only the frontend dev server:

```powershell
npm run dev
```

Run only the backend in watch mode (from project root):

```powershell
npm run dev:backend
# or
cd zen-backend; npm run start:dev
```

Run both frontend and backend concurrently (the repository includes `concurrently` and the root script `dev:all`):

```powershell
npm run dev:all
```

Default ports used by the tools:
- Frontend (Vite): 5173 (unless configured otherwise)
- Backend (NestJS): 3000 (unless configured otherwise)

If you need to change or confirm ports, check `vite` config and `zen-backend/src/main.ts` for NestJS bootstrap settings.

## Build and preview

Build frontend for production:

```powershell
npm run build
```

Build backend for production (from `zen-backend`):

```powershell
cd zen-backend; npm run build
```

Start the backend production build:

```powershell
cd zen-backend; npm run start:prod
```

Preview the production build of the frontend locally (Vite preview):

```powershell
npm run preview
```

## Backend database & Prisma

The backend depends on Prisma. Typical development flow (run from `zen-backend`):

1. Set your `DATABASE_URL` (example for local PostgreSQL):

```powershell
#$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/zen_dev?schema=public"
```

2. Run Prisma migrations:

```powershell
cd zen-backend
npx prisma migrate dev --name init
```

3. Generate the client (Prisma usually runs this automatically during migration):

```powershell
npx prisma generate
```

If the repository already contains generated artifacts (look under `zen-backend/generated/prisma`), you may not need to run `generate` unless you change the Prisma schema at `zen-backend/prisma/schema.prisma`.

## Environment variables

Create a `.env` file in `zen-backend/` (or provide environment variables by other means). Common variables you will likely need:

- `DATABASE_URL` — Prisma database connection string
- `PORT` — (optional) port for the NestJS server (default 3000)
- `JWT_SECRET` — (if authentication uses JWT; adjust according to code)
- `RESEND_API_KEY` — (if using Resend for email delivery; the backend includes `resend` dependency)
- `PAYMONGO_SECRET_KEY` / `PAYMONGO_PUBLIC_KEY` — (if using PayMongo integrations; adjust to your payment provider)

Note: The repository contains `zen-backend/src` folders such as `auth`, `cart`, `orders`, `payments`, `products`. Inspect the code to determine any other required environment variables and exact names. If you want, I can scan for usages and list the exact keys.

## Scripts

Frontend (root `package.json`):

- `npm run dev` — start Vite dev server (frontend)
- `npm run dev:backend` — change into `zen-backend` and run the backend in dev
- `npm run dev:all` — start frontend and backend concurrently
- `npm run build` — build frontend
- `npm run preview` — preview built frontend
- `npm run lint` — run ESLint over the project

Backend (`zen-backend/package.json`):

- `npm run start` — start NestJS server
- `npm run start:dev` — start NestJS in watch mode
- `npm run start:prod` — start production build (node dist/main)
- `npm run build` — build the backend artifacts
- `npm run test` — run Jest tests
- `npm run lint` — lint backend TypeScript

## Running tests

Backend unit tests and e2e tests are available through Jest. From `zen-backend`:

```powershell
cd zen-backend; npm run test
cd zen-backend; npm run test:e2e
```

The frontend does not include a test script in the root `package.json` by default. Add test tooling (Jest with React Testing Library or Vitest) if needed.

## API overview (high level)

The backend implements typical e-commerce endpoints. From the project layout you will find controllers and routes for:

- `auth` — authentication and user management
- `products` — product listing and details
- `cart` — cart operations
- `orders` — creating and listing orders
- `payments` — payment integration endpoints

Example request to list products (adjust host/port as needed):

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/products
```

Inspect `zen-backend/src` for exact route names, DTOs, and request shapes.

## Project structure notes

- Frontend: `src/` contains `App.jsx`, `main.jsx`, components under `src/components`, API helper modules under `src/api`, context under `src/context`, and hooks under `src/hooks`.
- Backend: `zen-backend/src` contains modules such as `auth`, `cart`, `orders`, `payments`, `products`, and Prisma integration under `zen-backend/prisma`.

## Development tips

- When you change the Prisma schema, run `npx prisma migrate dev` and `npx prisma generate` in `zen-backend`.
- If the frontend needs to call the backend during development, ensure the correct base URL is configured in `src/api/axiosConfig.js` or `src/config/api.js`.
- The root `dev:all` script uses `concurrently` to run both servers. If ports collide, adjust the port env var for Nest or Vite.

## Troubleshooting

- If the backend fails to start due to database errors, verify `DATABASE_URL` and run migrations.
- If the frontend cannot reach the API, confirm the backend is listening on the expected port and update the frontend API base URL.

## License and notes

This repository is marked private in its `package.json` files. Confirm intended license and open-source status before publishing.




