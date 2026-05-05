# AI Call Analytics MVP

A beginner-friendly MVP for viewing and adding call analytics records.

Included:

- React frontend
- Express API
- PostgreSQL database
- Seed data with 10 fake calls
- Local mock data when the database is not configured

Not included:

- AI integrations
- Audio upload
- Billing
- Authentication

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 14 or newer

## 1. Create the database

Open `psql` and run:

```sql
CREATE DATABASE saas_calls;
```

## 2. Configure environment variables

The API reads `DATABASE_URL` from `.env` through `dotenv`. When `DATABASE_URL` is missing or blank, `GET /api/calls` returns 10 local mock calls instead of connecting to PostgreSQL.

To use PostgreSQL, copy the example file:

```bash
cp .env.example .env
```

Update `.env` with your local PostgreSQL URL:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/saas_calls
CLIENT_URL=http://localhost:5173
```

Adjust the username, password, host, port, or database name if your local PostgreSQL install uses different values.

## 3. Install dependencies

```bash
npm install
```

## 4. Create tables and seed fake calls

Skip this step if you want to use the local sample calls only.

`npm run db:setup` and `npm run db:seed` expect `DATABASE_URL` to be available in your shell. If you only added it to `.env`, load or set the value first.

On macOS/Linux:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/saas_calls
npm run db:setup
npm run db:seed
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/saas_calls"
npm run db:setup
npm run db:seed
```

You can also run `psql` directly:

```powershell
psql "postgres://postgres:postgres@localhost:5432/saas_calls" -f server/schema.sql
psql "postgres://postgres:postgres@localhost:5432/saas_calls" -f server/seed.sql
```

## 5. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend runs on port `5173`. The API runs on port `3001`.

## Pages

- `/calls` - calls table
- `/calls/new` - add call form
- `/calls/:id` - call detail page

## Notes

This MVP does not require authentication. The `/health` endpoint stays available at `http://localhost:3001/health`.
