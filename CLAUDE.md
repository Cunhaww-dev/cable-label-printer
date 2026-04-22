# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server with hot reload (tsx watch)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled server
npm run typecheck    # Type-check without emitting

npm run db:generate  # Generate Drizzle migration
npm run db:make      # Generate migration with custom name
npm run db:migrate   # Apply pending migrations
npm run db:push      # Push schema changes directly (dev only)
npm run db:studio    # Open Drizzle Studio GUI
```

No test suite exists yet.

## Architecture

Node.js + Express REST API for cable label printing and management. TypeScript, ES modules (`.js` extensions in imports).

**Key files:**
- `src/server.ts` — Express app entry point; middleware setup only (no routes yet)
- `src/db/index.ts` — Drizzle + mysql2 client, initialized from `DATABASE_URL`
- `src/db/schema.ts` — All 6 tables and their relations

**Database schema** (MySQL via Drizzle ORM):
- `stores` — Physical locations; soft-deleted via `deleted_at`
- `users` — Accounts with `ADMIN`/`SELLER` roles, scoped to a store
- `cables` — Inventory with brand/color/mm/type/price; can be global or store-specific
- `labels` — Generated labels; snapshot cable data at creation time, include barcode + expiry
- `auditLogs` — Before/after JSON trail of user actions
- `refreshTokens` — JWT refresh token storage

Soft deletes (`deleted_at`) on stores, users, and cables. All tables have `created_at`/`updated_at` auto-defaults.

## Environment

Requires `DATABASE_URL` (MySQL connection string). `PORT` defaults to 3000.

## Deployment

Targets Hostinger shared hosting, which doesn't run build steps on deploy. `dist/server.js` is committed to the repo for this reason.
