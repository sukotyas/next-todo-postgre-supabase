# Simple To-Do List

A minimal Next.js app for testing deployment on a VM or in a container while
using PostgreSQL as the database. The app has no authentication and exposes a
small CRUD API through Next.js route handlers.

## Stack

- Next.js App Router
- PostgreSQL
- Server-side PostgreSQL connection pool kept off the browser

## Run everything with Docker Compose

The fastest way to get a working app plus database:

```bash
docker compose up --build
```

This starts PostgreSQL, runs the migration and seed once, then starts the app.
Open [http://localhost:3000](http://localhost:3000). The database is exposed on
host port `5433` (mapped to the container's `5432`).

## Requirements (without Docker)

- Node.js 20 or newer
- npm
- A reachable PostgreSQL server
- A PostgreSQL user with permission to create the database and tables used by this app

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

Use either `DATABASE_URL`:

```env
DATABASE_URL=postgres://app_user:app_password@127.0.0.1:5432/simple_todo_list
```

Or the individual PostgreSQL variables:

```env
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=simple_todo_list
PGUSER=app_user
PGPASSWORD=app_password
```

## Database commands

- `npm run db:migrate` creates the database if needed and applies `database/schema.sql`.
- `npm run db:seed` inserts the sample todos if the table is empty.
- `npm run db:setup` runs migration and seed in order.
- `npm run build` prepares the standalone server assets used by `npm run start`.

If your PostgreSQL user cannot create databases, create `simple_todo_list`
manually first, then rerun `npm run db:migrate`.

## API routes

- `GET /api/health` returns an application health payload.
- `GET /api/todos` lists all todos.
- `POST /api/todos` creates a todo with `{ "title": "..." }`.
- `PATCH /api/todos/:id` updates `title` and or `completed`.
- `DELETE /api/todos/:id` removes a todo.

## Deploy on a VM

1. Install Node.js 20 or newer.
2. Copy the project to the VM.
3. Copy `.env.example` to `.env` and fill in the PostgreSQL connection.
4. Ensure the VM can reach your PostgreSQL server.
5. Run `npm ci`.
6. Run `npm run db:setup`.
7. Run `npm run build`.
8. Start the app with `npm run start`.

`npm run build` copies the generated `_next/static` files into the standalone
folder so CSS and client-side JavaScript load correctly on the VM.

## Deploy with Docker (app only)

Build and run against an external PostgreSQL server:

```bash
docker build -t simple-to-do-list .
docker run --env-file .env -p 3000:3000 simple-to-do-list
```

## PostgreSQL notes

- The app uses server-side database credentials only.
- Because there is no authentication, anyone who can access the app can create,
  edit, and delete todos through the app's API.
- `updated_at` is maintained by a trigger defined in `database/schema.sql`.
