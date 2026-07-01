---
description: Multi-Tenant Ticketing SaaS
---

# AGENTS.md

## 🧠 Multi-Tenant Ticketing SaaS — Agent Rules

This document defines the architecture, coding standards, and constraints for all contributors (human or AI agents) working on this repository.

The goal is to build a **multi-tenant SaaS ticketing system** with guest-first ticket submission and an admin dashboard per organization.

---

# 1. Core Philosophy

- Simplicity over complexity
- Build monolith-first, not microservices
- Avoid premature optimization
- Prefer clarity, maintainability, and predictable structure
- Introduce new tools only when necessary and justified

---

# 2. Tech Stack (STRICT)

## Frontend
- React (Vite)
- TypeScript preferred
- ESLint required
- Tailwind CSS allowed

## Backend
- Node.js
- Express.js (REST API only)
- No GraphQL unless explicitly approved

## Database
- PostgreSQL
- Prisma ORM only
- No raw SQL unless required for advanced constraints or migrations

## Infrastructure (Development)
- Docker for PostgreSQL only
- No Kubernetes or distributed systems at MVP stage

---

# 3. Project Structure

Monorepo layout:

apps/
  web/        # Frontend (React admin + UI)
  api/        # Backend (Express API)

packages/
  shared/     # Shared types/utilities (optional)

---

# 4. Multi-Tenant Rules (CRITICAL)

- Every database record MUST belong to an organization via `organizationId`
- No cross-tenant data access is allowed under any circumstance
- All queries MUST be scoped by organization
- Guest access must resolve organization via:
  - `slug`
  - `publicToken`

---

# 5. Architecture Rules

All backend code must follow this structure:

routes → controller → service → prisma

### Rules:
- Routes: request handling only
- Controllers: input/output orchestration
- Services: business logic only
- Prisma: database access only (never directly in routes)

---

# 6. API Design Rules

- REST only

Example endpoints:
- GET /tickets
- POST /tickets
- GET /tickets/:id

- Guest endpoints MUST NOT require authentication
- Admin endpoints MUST be scoped by organization and role

---

# 7. Database Rules

- Always run Prisma migrations for schema changes
- Never modify database manually without migrations
- Every model should include:
  - organizationId (for tenant isolation)
  - createdAt
  - updatedAt (where applicable)

- Avoid cross-organization foreign key assumptions unless enforced at service layer

---

# 8. Security Rules

- Never store plaintext passwords
- Always use hashed passwords (passwordHash)
- Validate all input before database operations
- Enforce tenant isolation in service layer (not only schema)

---

# 9. Forbidden Practices

- No business logic inside route handlers
- No direct Prisma calls inside routes
- No hardcoded secrets in codebase
- No skipping migrations
- No mixing Prisma Accelerate/Data Proxy unless explicitly required
- No bypassing multi-tenant checks
- No direct cross-org data queries

---

# 10. Development Workflow

Before implementing any feature:

1. Define data model (Prisma)
2. Run migration
3. Implement service layer
4. Build controller
5. Build route
6. Test with sample data

### Commit Discipline

Every **page** or **component** must be committed individually with a clear, descriptive message. No lumping multiple pages or components into a single commit. This keeps history clean and reviewable.

Examples:
- `git add -A && git commit -m "feat: add AdminTicketDetail page with timeline and reply form"`
- `git add -A && git commit -m "feat: add Reports page with KPI cards and category chart"`

### Running Services (CRITICAL)

Three processes must stay running for the app to work:

| Process | Command | Port | Purpose |
|---------|---------|------|---------|
| **API** | `cd apps/api && npm run dev` | 3001 | Backend server |
| **Frontend** | `cd apps/web && npm run dev` | 5173 | Dev server / Vite |
| **Tunnel** | `cloudflared tunnel --url http://localhost:5173` | — | Public access |

**NEVER run `taskkill //F //IM node.exe`** — it kills ALL Node.js processes including the frontend, API, and any active Hermes agent sessions. Instead, kill specific processes by PID or use the terminal's Ctrl+C in the correct window.

When working with agents (AI), be aware that agent-managed background processes may die when the agent's session ends. Always run services in your own terminal windows for persistent uptime.

---

# 14. Security Rules (CRITICAL — apply on every new project)

## Production Checklist

| Rule | Implementation |
|------|---------------|
| **Helmet** | `npm install helmet` + `app.use(helmet())` — sets security headers |
| **CORS locked** | `cors({ origin: process.env.FRONTEND_URL })` — never wide open |
| **Rate limiting** | `express-rate-limit` on `/login` — 5 req/min |
| **JWT secret** | Must come from env, crash if missing: `if (!JWT_SECRET) process.exit(1)` |
| **Input validation** | Never pass `req.body` directly to service — destructure known fields only |
| **Mass assignment** | Block `isSystem`, `role`, `organizationId` from user input |
| **File upload** | Whitelist extensions + file size limit in multer config |
| **Password hashing** | bcrypt (never plaintext) |
| **Email enumeration** | Forgot-password: return same message whether email exists or not |
| **Error messages** | Never leak internals — generic "Invalid credentials" |

## Forbidden

- `req.body` passed directly to Prisma/Service (mass assignment vector)
- Hardcoded secrets or fallback defaults (JWT_SECRET, DB passwords)
- Open CORS (`app.use(cors())` with no origin)
- No rate limiting on auth endpoints
- Storing passwords in plaintext
- Exposing stack traces in error responses

## Always Apply

```js
// index.js template
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use("/api/auth/login", rateLimit({ windowMs: 60_000, max: 5 }));

// Controller validation pattern — never pass req.body raw
const { allowedField1, allowedField2 } = req.body;
const updates = {};
if (allowedField1 !== undefined) updates.allowedField1 = allowedField1;
// Block protected fields explicitly
updates.role = undefined;
return res.json({ data: await service.update(id, updates) });
```

---

# 11. SaaS Product Rules

- Everything is multi-tenant by default
- Every feature must support multiple organizations
- Guest experience must NOT require login
- Admin experience must be role-based
- Public endpoints must be safe and rate-limited where needed

---

# 12. API Response Standard

All API responses:

{
  "success": true,
  "data": {},
  "error": null
}

---

# 13. Final Principle

This system is a:

Multi-tenant SaaS ticketing platform with guest-first support flow

All engineering decisions must prioritize:
- isolation between tenants
- simplicity for MVP speed
- scalability for future growth