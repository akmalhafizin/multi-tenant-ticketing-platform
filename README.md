# multi-tenant-ticketing-platform
Multi-tenant helpdesk SaaS that enables businesses to manage customer support tickets without requiring customer accounts.

Copyright (c) 2026 akmalhafizin

All rights reserved.

This source code is proprietary and confidential.
Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## Overview

This platform lets multiple independent businesses ("tenants") each run their own helpdesk under one shared application. Every tenant gets:

- Their own isolated set of staff accounts, tickets, and categories
- A single public submission URL (and QR code) that customers use to open a ticket — **no customer account or login required**
- A private tracking link for each ticket so a customer can check status later without signing up

All tenant data is scoped by `organizationId` throughout the schema — every query in the application layer should filter on it to maintain tenant isolation.

## Project Structure

```
multi-tenant-ticketing-platform/
├── apps/
│   ├── api/          # Backend — Prisma schema, migrations, API server
│   └── web/          # Frontend — Vite app (staff dashboard + public ticket form)
└── docker-compose.yml
```

> Adjust the `web` folder name above to match whatever you actually named the Vite app directory.

## Tech Stack

- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Frontend:** [Vite](https://vite.dev/)
- **ID strategy:** `cuid()` for all primary keys

## Data Model

The schema lives at `prisma/schema.prisma`. Below is a summary of each model and how they relate.

### `Organization` (tenant)

The top-level tenant record. Each organization has:

- A unique `slug` used to build its public ticket-submission URL/QR code (e.g. `https://yourapp.com/submit/{slug}`)
- Optional `welcomeMessage` and `defaultCategoryId` to customize the public submission form
- Owns its own `users`, `tickets`, `categories`, and `invites`

### `User` (staff / agent)

Logged-in staff accounts, always scoped to one organization.

- `role` is one of `OWNER`, `ADMIN`, or `AGENT`
- `passwordHash` stores a bcrypt/argon2 hash — **never** a plaintext password. Hashing happens in application code before Prisma ever receives the value
- `email` is unique **per organization**, not globally — the same person could be an agent at two different tenants with the same email, so login flows need to resolve which organization first (e.g. via a subdomain, slug in the URL, or an org-picker step)

### `OrganizationInvite` (onboarding)

Handles inviting new staff into an organization.

- An admin/owner creates an invite with a target `email`, intended `role`, and `expiresAt`
- A unique `token` is emailed to the invitee; visiting the link lets them accept and create their `User` account
- `status` tracks `PENDING → ACCEPTED`, or `EXPIRED` / `REVOKED`
- Only one `PENDING` invite per email per organization should exist at a time. This is enforced via a **partial unique index** added through a raw SQL migration (see [Manual Migration Steps](#manual-migration-steps-required) below) rather than a plain `@@unique`, since a plain unique constraint would also incorrectly block legitimate invite history (e.g. two prior `EXPIRED` rows for the same email)

### `Category`

Optional ticket categorization (e.g. "Billing", "Technical", "General"), scoped per organization.

### `Ticket`

The core entity. Can be created two ways:

1. **By a guest, with no login** — via the organization's public submission URL. Guest identity is captured loosely via `guestName`, `guestEmail`, `guestPhone` (all optional, no account created)
2. **By a staff member**, directly inside the dashboard

Other notable fields:

- `publicToken` — a unique, unguessable token generated per ticket so a guest can check status later at a private tracking link (e.g. `/track/{publicToken}`) without ever needing an account
- `status` — `OPEN`, `PENDING`, `ON_HOLD`, `RESOLVED`, `CLOSED`
- `priority` — `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `assignedAgentId` — optionally links to a `User` handling the ticket
- `categoryId` uses a **composite foreign key** against `Category`'s `(organizationId, id)` compound unique index. This guarantees at the database level that a ticket can never be assigned a category belonging to a *different* organization — a plain single-column FK can't express that constraint

### `Comment`

The reply thread on a ticket. Supports both staff and guest replies (e.g. a guest replying via an emailed magic link).

- `authorType` is `AGENT` or `GUEST`
- `isInternal` marks a note as staff-only, hidden from the guest
- **Important constraint not enforceable in Prisma's schema language:** when `authorType = AGENT`, `userId` must be set; when `authorType = GUEST`, `guestEmail` must be set. This must be enforced both in application-level validation and via a database `CHECK` constraint added manually post-migration (see below)

### `Attachment`

Files (e.g. screenshots) attached to a ticket.

## Manual Migration Steps Required

Prisma's schema language cannot express `CHECK` constraints or partial/filtered unique indexes. Two rules in this schema rely on raw SQL that **will not be generated automatically** — you must add them yourself after running `prisma migrate dev --create-only`, by editing the generated `migration.sql` file before applying it:

**1. Comment author consistency**

```sql
ALTER TABLE "Comment" ADD CONSTRAINT "comment_author_consistency"
CHECK (
  ("authorType" = 'AGENT' AND "userId" IS NOT NULL) OR
  ("authorType" = 'GUEST' AND "guestEmail" IS NOT NULL)
);
```

**2. One pending invite per email per organization**

```sql
CREATE UNIQUE INDEX "one_pending_invite_per_email"
ON "OrganizationInvite" ("organizationId", "email")
WHERE "status" = 'PENDING';
```

Without these, the database will silently allow invalid rows (e.g. a `GUEST` comment with no `guestEmail`, or duplicate pending invites) even though the application layer is expected to prevent them.

> **Note:** `Organization.defaultCategoryId` has a similar same-tenant requirement (the default category must belong to that same organization), but Prisma cannot express a self-referential composite FK here. This must be validated in application code whenever `defaultCategoryId` is set.

## Getting Started

### Prerequisites

- Node.js
- Docker (recommended for local Postgres) or a local PostgreSQL install

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container as defined in `docker-compose.yml`.

> If you also have a native PostgreSQL install running locally, it may already be bound to port `5432`, which will prevent the container from being reachable on that port. Either stop the native service, or remap the container to a different host port (e.g. `5433:5432`) and update `DATABASE_URL` to match.

### 2. Configure environment variables

Create `.env` in the project root (same level as `package.json`):

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/ticketing"
```

Make sure the database name in the URL matches `POSTGRES_DB` in `docker-compose.yml`.

### 3. Run the initial migration

```bash
npx prisma migrate dev --name init
```

This creates all tables defined in `prisma/schema.prisma`. Remember to apply the manual `CHECK` constraint and partial index described above before this migration goes to any shared/production environment.

### 4. Generate the Prisma Client

```bash
npx prisma generate
```

### 5. (Optional) Inspect your data

```bash
npx prisma studio
```

### 6. Start the frontend (Vite)

From the frontend app directory:

```bash
cd apps/web
npm install
npm run dev
```

By default Vite serves on `http://localhost:5173`. The frontend covers two distinct experiences:

- **Staff dashboard** — authenticated, scoped to one organization (login, manage tickets, reply to customers, manage categories/invites)
- **Public ticket form** — unauthenticated, resolved by the organization's `slug` (e.g. `/submit/:slug`), used for both direct links and QR codes

If the frontend needs to call the API, point it at the API's base URL via a Vite env variable (must be prefixed `VITE_` to be exposed to client code):

```dotenv
# apps/web/.env
VITE_API_URL="http://localhost:3000"
```

## Multi-Tenancy Notes

- Every query in application code must filter by `organizationId` to prevent cross-tenant data leaks. Consider a middleware/repository layer that injects this automatically based on the authenticated user's session or the resolved tenant from the public submission URL.
- The public submission flow resolves an `Organization` by its `slug` (e.g. from a QR code or shared link), then creates the `Ticket` with that organization's `id` — no authentication step is involved.
- Staff login must resolve which organization a user belongs to before or alongside checking credentials, since `email` is unique per-organization rather than globally.