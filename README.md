# Multi-Tenant Ticketing Platform

Multi-tenant helpdesk SaaS that enables businesses to manage customer support tickets without requiring customer accounts.

Copyright (c) 2026 akmalhafizin

All rights reserved.

This source code is proprietary and confidential.
Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

---

## Overview

This platform lets multiple independent businesses ("tenants") each run their own helpdesk under one shared application. Every tenant gets:

- Their own isolated set of staff accounts, tickets, and categories
- A single public submission URL (and QR code) — **no customer account or login required**
- A private tracking link for each ticket so a customer can check status + reply without signing up
- Custom roles with granular page access and ticket permissions (RBAC)
- Resolution SLA tracking and guest rating system (1-5 stars, auto-closes ticket)

All tenant data is scoped by `organizationId` throughout the schema — every query in the application layer filters on it to maintain tenant isolation.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-tenant auth** | JWT-based login scoped per organization, subdomain-aware |
| **Role-based access (RBAC)** | Custom roles with per-page and per-ticket-action permissions |
| **Ticket management** | Create, assign, update status/category, comment with internal notes |
| **Guest tracking** | Customers track ticket progress via `/track/{publicToken}` — no login |
| **File uploads** | Drag & drop images + documents with preview, multer backend |
| **Staff invites** | Invite new agents/admins via tokenized invite links |
| **SLA tracking** | Per-org resolution time targets with progress bars |
| **Guest rating** | Resolved tickets ask for 1-5 star rating, which auto-closes the ticket |
| **Reports** | Live KPI cards, category distribution, status breakdown, recent activity |
| **Subdomain support** | Each org gets `{slug}.yourdomain.com` for public submission form |

---

## Project Structure

```
multi-tenant-ticketing-platform/
├── apps/
│   ├── api/
│   │   ├── prisma/          # Schema, migrations
│   │   ├── src/
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── middleware/   # Auth, tenant resolution, upload
│   │   │   ├── routes/      # Express routers
│   │   │   ├── services/    # Business logic
│   │   │   └── scripts/     # Seed script
│   │   ├── uploads/         # Uploaded files
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── hooks/       # Auth, tenant hooks
│       │   ├── lib/         # API client, types
│       │   └── pages/       # Page components
│       └── package.json
├── docker-compose.yml       # PostgreSQL
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express 5, CommonJS |
| **ORM** | Prisma 7 (PostgreSQL adapter) |
| **Database** | PostgreSQL 15 (Docker) |
| **Frontend** | React 19, Vite 8, TypeScript 6 |
| **Styling** | Tailwind CSS 4, Material Symbols |
| **Auth** | bcryptjs + JSON Web Tokens |
| **File uploads** | Multer (disk storage, 25MB limit) |
| **ID strategy** | `cuid()` for all primary keys |

---

## Data Model

### `Organization` (tenant)
- `slug` — unique subdomain identifier (e.g. `rcl-engineering`)
- `welcomeMessage`, `defaultCategoryId` — public form customization
- `resolutionSlaHours` — target hours to resolve tickets

### `Role` (custom RBAC)
- `name`, `description`, `isSystem` (protected from deletion)
- `permissions` (JSON): `pages` (7 admin pages) and `tickets` (6 actions)
- Pre-seeded: Owner, Admin, Agent — each with appropriate defaults

### `User` (staff)
- Scoped to `organizationId`
- `role` (OWNER/ADMIN/AGENT) + optional `roleId` linking to a custom Role
- `@@unique([organizationId, email])` — email unique per tenant

### `OrganizationInvite`
- Tokenized invite flow for onboarding new staff
- `status`: PENDING → ACCEPTED | EXPIRED | REVOKED
- Partial unique index enforces one pending invite per email per org

### `Category`
- Ticket categories, scoped per organization
- `@@unique([organizationId, name])`

### `Ticket`
- Created via public form (guest) or staff dashboard
- `publicToken` — unique tracking link for guests
- `status`: OPEN → PENDING → ON_HOLD → RESOLVED → CLOSED
- `rating` — guest rating (1-5), auto-closes the ticket
- `resolvedAt` — timestamp for SLA computation
- Composite FK on `(organizationId, categoryId)` prevents cross-org category assignment

### `Comment`
- Supports AGENT and GUEST author types
- `isInternal` — staff-only notes hidden from guest view

### `Attachment`
- Files linked to tickets, stored in `uploads/` and served statically

---

## Getting Started

### Prerequisites

- Node.js
- Docker (for local Postgres) or a local PostgreSQL install

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 15 container.

> If you have a native PostgreSQL running locally, it may be bound to port `5432`. Either stop it or remap the container (e.g. `5433:5432`) and update `DATABASE_URL`.

### 2. Configure environment

```bash
# apps/api/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ticketing"
JWT_SECRET="your-secret-key-change-in-production"
FRONTEND_URL="http://localhost:5173"
```

### 3. Run migrations + seed

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 4. Start the API

```bash
cd apps/api
npm run dev
```

API runs on **http://localhost:3001**.

### 5. Start the frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**.

The Vite dev server proxies `/api` requests to the backend automatically (configured in `vite.config.ts`). No separate `VITE_API_URL` needed for local dev.

### 6. Access via subdomain (local dev)

Use **[lvh.me](http://lvh.me)** — free DNS that resolves `*.lvh.me` to `127.0.0.1`:

```bash
http://rcl-engineering.lvh.me:5173/login          # Admin login
http://rcl-engineering.lvh.me:5173/report          # Public ticket form
http://rcl-engineering.lvh.me:5173/admin/dashboard # Staff dashboard
```

---

## Running for Public Demo (Cloudflare Tunnel)

To share your local server with anyone:

```bash
# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Frontend
cd apps/web && npm run dev

# Terminal 3 — Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5173
```

The tunnel gives you a public URL like:
```
https://something.trycloudflare.com
```

**All three processes must stay running.** Share the tunnel URL — anyone can access the full app through it.

### Seeded Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@rclengineering.com` | `admin123` | OWNER |
| `agent@rclengineering.com` | `agent123` | AGENT |

---

## API Reference

All responses follow the standard format:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/forgot-password` | Public |
| `GET` | `/api/auth/me` | Authenticated |

### Tickets
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/tickets` | Authenticated |
| `GET` | `/api/tickets/:id` | Authenticated |
| `POST` | `/api/tickets` | Authenticated (staff create) |
| `PATCH` | `/api/tickets/:id` | Authenticated (status/category/assignee) |
| `POST` | `/api/tickets/public` | Public (subdomain required) |
| `GET` | `/api/tickets/track/:publicToken` | Public |
| `POST` | `/api/tickets/track/:publicToken/reply` | Public |
| `POST` | `/api/tickets/rate/:publicToken` | Public (1-5 rating, auto-closes) |
| `POST` | `/api/tickets/:id/comments` | Authenticated |

### Categories
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/categories` | Authenticated |
| `POST` | `/api/categories` | OWNER/ADMIN |
| `PUT` | `/api/categories/:id` | OWNER/ADMIN |
| `DELETE` | `/api/categories/:id` | OWNER/ADMIN |

### Users & Staff
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/users` | OWNER/ADMIN |
| `PATCH` | `/api/users/:id/role` | OWNER only |
| `DELETE` | `/api/users/:id` | OWNER/ADMIN |

### Roles (RBAC)
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/roles` | OWNER only |
| `POST` | `/api/roles` | OWNER only |
| `PUT` | `/api/roles/:id` | OWNER only |
| `DELETE` | `/api/roles/:id` | OWNER only (system roles protected) |

### Invites
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/invites` | OWNER/ADMIN |
| `POST` | `/api/invites` | OWNER/ADMIN |
| `PATCH` | `/api/invites/:id/revoke` | OWNER/ADMIN |
| `GET` | `/api/invites/:token` | Public (accept flow) |
| `POST` | `/api/invites/:token/accept` | Public |

### Organization
| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/org` | Authenticated |
| `PATCH` | `/api/org` | OWNER/ADMIN |

---

## Multi-Tenancy & Subdomains

Each organization gets a unique subdomain, e.g. `rcl-engineering.yourapp.com`. The tenant is resolved from the subdomain for public flows (ticket submission, guest tracking).

### How it works

1. The frontend detects the subdomain from `window.location.hostname`
2. Every API call includes an `X-Org-Slug` header
3. The backend's `resolveTenant` middleware reads the header and attaches the organization to `req.tenant`
4. Public endpoints (ticket creation, tracking) use `req.tenant.id` to scope records
5. Login can be scoped to the subdomain's org — email only needs to be unique within that tenant

### Multi-Tenancy Rules

- Every query in application code must filter by `organizationId`
- No cross-tenant data access is allowed
- Guest access resolves organization via `slug` or `publicToken`
- Staff login resolves the organization from the JWT or subdomain

---

## RBAC Permission Model

Each role has permissions stored as JSON:

```json
{
  "pages": {
    "dashboard": true,
    "tickets": true,
    "categories": false,
    "users": false,
    "roles": false,
    "settings": false,
    "reports": false
  },
  "tickets": {
    "view": true,
    "create": true,
    "assign": false,
    "close": false,
    "delete": false,
    "reply": true
  }
}
```

Only OWNER/ADMIN can set tickets to CLOSED status. AGENT role is blocked from role management and org settings.

---

## Architecture Rules

```
routes → controller → service → prisma
```

- Routes: request handling only
- Controllers: input/output orchestration
- Services: business logic only
- Prisma: database access only (never directly in routes)

## Security Rules

- Never store plaintext passwords (bcrypt with 12 salt rounds)
- Validate all input before database operations
- Enforce tenant isolation in service layer (not only schema)
- JWT tokens expire after 8 hours, signed with server-side secret
- File uploads restricted to allowed types, max 25MB per file
- CLOSED status restricted to OWNER/ADMIN at the service level
