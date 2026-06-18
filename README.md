# Simple To-Do List

A minimal Next.js app for testing deployment on a VM or in a container while
using PostgreSQL as the database. The app has no authentication and exposes a
small CRUD API through Next.js route handlers. This app is optimized for Supabase + Vercel.

## Stack

- Next.js App Router
- PostgreSQL (via Supabase)

## Requirements (without Docker)

- Node.js 20 or newer
- npm
- A reachable PostgreSQL server
- A PostgreSQL user with permission to create tables used by this app

## Local installation

This project uses `.env` for the database scripts. Keep your PostgreSQL connection
there so `npm run db:migrate` and `npm run db:seed` work without extra flags.

1. Copy `.env.example` to `.env`.
2. Update `.env` with your PostgreSQL connection.
3. Install dependencies with `npm install`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed`.
6. Start the app with `npm run dev`.
7. Open [http://localhost:3000](http://localhost:3000).

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

## Environment variables

This app uses two different Supabase connection URLs depending on the context:

| Purpose | Pooler type | Port |
|---|---|---|
| Migrations (local) | Session Pooler | 5432 |
| App at runtime (Vercel) | Transaction Pooler | 6543 |

**For migrations** — use the Session Pooler (port 5432):
```env
DATABASE_URL=postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

**For Vercel** — use the Transaction Pooler (port 6543):
```env
DATABASE_URL=postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

Both URLs are available in **Supabase → Project Settings → Database → Connection string**
(toggle "Display connection pooler" on).

## Database commands

- `npm run db:migrate` applies `database/schema.sql` to the target database.
- `npm run db:seed` inserts the sample todos if the table is empty.
- `npm run db:setup` runs migration and seed in order.

If your PostgreSQL user cannot create databases, create `simple_todo_list`
manually first, then rerun `npm run db:migrate`.

## API routes

- `GET /api/health` returns an application health payload.
- `GET /api/todos` lists all todos.
- `POST /api/todos` creates a todo with `{ "title": "..." }`.
- `PATCH /api/todos/:id` updates `title` and or `completed`.
- `DELETE /api/todos/:id` removes a todo.

## Deploy on Vercel + Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com). Save the database password.
2. **Run migrations locally** using the Session Pooler URL (port 5432):
   ```bash
   npm run db:migrate
   npm run db:seed   # optional
   ```
3. **Import the repo** at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js.
4. **Add the environment variable** in Vercel's project settings:
   - `DATABASE_URL` → Transaction Pooler URL (port 6543) with `?sslmode=require`
5. **Deploy.**

## Deploy on a VM

1. Install Node.js 20 or newer.
2. Copy the project to the VM.
3. Copy `.env.example` to `.env` and fill in the PostgreSQL connection.
4. Ensure the VM can reach your PostgreSQL server.
5. Run `npm ci`.
6. Run `npm run db:setup`.
7. Run `npm run build`.
8. Start the app with `npm run start`.

## Deploy with Docker (app only)

Build and run against an external PostgreSQL server:

```bash
docker build -t simple-to-do-list .
docker run --env-file .env -p 3000:3000 simple-to-do-list
```

Run migrations before starting the container:

```bash
npm run db:migrate
npm run db:seed   # optional
```

## PostgreSQL notes

- The app uses server-side database credentials only.
- Because there is no authentication, anyone who can access the app can create,
  edit, and delete todos through the app's API.
- `updated_at` is maintained by a trigger defined in `database/schema.sql`.
