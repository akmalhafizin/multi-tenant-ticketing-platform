# Build Plan — Remaining Features

## Legend
- ✅ Done (Phase 1)
- 🔷 Phase 2 — Missing Pages  
- 🛠 Phase 3 — Management / Admin Controls

---

## Current State

| Route / Feature | Status |
|---|---|
| `/admin/tickets/:id` — Ticket Detail | ✅ |
| `/admin/reports` — Reports | ✅ |
| Auth (login, JWT, guard, seed) | ✅ |
| Admin Ticket List (`/admin/tickets`) | ✅ (mock) |
| Admin Dashboard (`/admin/dashboard`) | ✅ (mock) |
| Public Report Form (`/report`) | ✅ (no backend) |

---

## 🔷 Phase 2 — Missing Pages

### 2a — Guest Ticket Tracking (`/track/:publicToken`)
**Backend:**
- `GET /api/tickets/track/:publicToken` — returns ticket status + public comments (no auth)
- `POST /api/tickets/track/:publicToken/reply` — guest adds a comment via their tracking token

**Frontend:**
- Page shows: ticket title, status badge, description, public comment thread, reply box
- No login required — identified by the unguessable `publicToken` in the URL
- Route in `Layout.tsx` (public layout)

### 2b — Public Submit by Org (`/submit/:slug`)
**Backend:**
- `GET /api/orgs/by-slug/:slug` — resolve org by slug (for form customization)
- `POST /api/tickets/public` — create a ticket as a guest, requires `slug` in body

**Frontend:**
- Page at `/submit/:slug` — resolves the org, renders branded form with `welcomeMessage` + `defaultCategoryId`
- This is the QR-code destination mentioned in README
- Route in `Layout.tsx` (public layout)

### 2c — Admin Create Ticket (`/admin/tickets/create`)
**Backend:**
- `POST /api/tickets` (authenticated) — staff creates ticket with assignment, priority, internal notes

**Frontend:**
- Form page inside admin layout — reuses Report form pattern with additional fields (assignee, priority, internal note)
- Route in `AdminLayout.tsx`

### 2d — Invite Acceptance (`/invite/:token`)
**Backend:**
- `GET /api/invites/:token` — validate invite
- `POST /api/invites/:token/accept` — accept invite, create User account

**Frontend:**
- Page at `/invite/:token` — shows org name, role, accept button + sign-up form
- Route in `Layout.tsx` (public)

---

## 🛠 Phase 3 — Management & Admin Controls

### 3a — Category Management
**Backend** (`/api/categories`, authenticated):
| Method | Endpoint | Role |
|--------|----------|------|
| `GET` | `/api/categories` | Any |
| `POST` | `/api/categories` | OWNER, ADMIN |
| `PUT` | `/api/categories/:id` | OWNER, ADMIN |
| `DELETE` | `/api/categories/:id` | OWNER, ADMIN |

**Frontend:**
- Page at `/admin/categories` — table of categories with inline edit / delete
- Modal to create new category
- Route in `AdminLayout.tsx`

### 3b — User / Agent Management
**Backend** (`/api/users`, authenticated):
| Method | Endpoint | Role |
|--------|----------|------|
| `GET` | `/api/users` | OWNER, ADMIN |
| `PATCH` | `/api/users/:id/role` | OWNER only |
| `DELETE` | `/api/users/:id` | OWNER, ADMIN |

**Frontend:**
- Page at `/admin/users` — table of staff with name, email, role, status
- Role change dropdown (OWNER only), remove user
- Route in `AdminLayout.tsx`

### 3c — Invite System (Admin Side)
**Backend** (`/api/invites`, authenticated):
| Method | Endpoint | Role |
|--------|----------|------|
| `GET` | `/api/invites` | OWNER, ADMIN |
| `POST` | `/api/invites` | OWNER, ADMIN |
| `PATCH` | `/api/invites/:id/revoke` | OWNER, ADMIN |

**Frontend:**
- Inline invite form on the `/admin/users` page or a dedicated tab
- Email input + role selector → sends invite
- Shows pending/expired/revoked invites table

### 3d — Organization Settings
**Backend** (`/api/org`, authenticated):
| Method | Endpoint | Role |
|--------|----------|------|
| `GET` | `/api/org` | Any |
| `PATCH` | `/api/org` | OWNER, ADMIN |

**Frontend:**
- Page at `/admin/settings` — edit org name, slug, welcome message, default category
- Route in `AdminLayout.tsx`

---

## Build Order

| Step | Feature | Effort | Dependencies |
|------|---------|--------|-------------|
| 1 | **Category Management** (backend + frontend) | 🟡 Medium | Auth |
| 2 | **User Management** (backend + frontend) | 🟡 Medium | Auth |
| 3 | **Organization Settings** | 🟢 Small | Auth, Categories |
| 4 | **Admin Create Ticket** | 🟡 Medium | Auth, Categories |
| 5 | **Invite System** (send/receive) | 🔴 Large | Auth, User Mgmt |
| 6 | **Guest Ticket Tracking** | 🟡 Medium | Tickets |
| 7 | **Public Submit by Org** | 🟡 Medium | Orgs |

---

## Commit Discipline

Per AGENTS.md — each page or component gets its own commit:
```
feat: add CategoryManagement page with CRUD table
feat: add UserManagement page with role management
feat: add OrganizationSettings page
...
```
