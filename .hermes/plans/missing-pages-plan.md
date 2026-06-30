# Plan: Missing Frontend Pages

## Current State

| Route | Page | Status |
|---|---|---|
| `/` | Home — Hero + CTA | ✅ Built |
| `/report` | Public Issue Form | ✅ Built (no backend) |
| `/report/success` | Submission Confirmation | ✅ Built |
| `/projects` | Placeholder | ⏳ Placeholder |
| `/login` | Admin Portal Login | ✅ Built (no backend) |
| `/admin/dashboard` | Operations Dashboard | ✅ Built (mock data) |
| `/admin/tickets` | Ticket Management List | ✅ Built (mock data) |
| `/admin/reports` | Reports Page | ⏳ Placeholder |
| — | Admin Ticket Details | ❌ Missing |
| — | Guest Ticket Tracking | ❌ Missing |
| — | Public Submit by Org | ❌ Missing |
| — | Invite Acceptance | ❌ Missing |
| — | Admin Create Ticket | ❌ Missing |

---

## Phase 1 — Pages You Requested

### 1️⃣ Admin Ticket Details (`/admin/tickets/:id`)

**What it is:** A full detail view when an admin clicks a ticket row in `/admin/tickets`.

**Page structure:**
```
┌─ Top Bar ──────────────────────────────────────┐
│  ← Back to Tickets    Ticket #RCL-9281         │
├────────────────────────────────────────────────┤
│  Status Badge   Priority Badge   Category Tag  │
│  Assigned To: Ahmad Zaki                       │
│  Guest: John Doe  |  john@email.com            │
│  Created: Oct 24, 2023   |   Updated: 2h ago   │
├────────────────────────────────────────────────┤
│  TITLE: HVAC Failure — Building B, Level 2     │
│  Description:                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ Air conditioning unit B-204 is leaking │   │
│  │ water and making loud noises...         │   │
│  └─────────────────────────────────────────┘   │
│  Attachments: [img1.jpg] [img2.jpg]             │
├────────────────────────────────────────────────┤
│  ─── Activity Timeline ───────────────────────  │
│  │ 24 Oct '23 14:30 — Ahmad Zaki commented:    │
│  │   "Dispatched technician to site."   AGENT   │
│  │ 24 Oct '23 12:15 — Status → In-Progress     │
│  │ 24 Oct '23 10:00 — Ticket created by guest  │
│  └────────────────────────────────────────────  │
├────────────────────────────────────────────────┤
│  Reply Box: [textarea]  [Internal Note ☐]      │
│  [Submit Reply]  [Change Status ▾]              │
└────────────────────────────────────────────────┘
```

**Components needed:**
- `TicketDetailHeader` — ID, status, priority, category badges
- `TicketInfoPanel` — customer details, assignment, dates
- `TicketDescriptionCard` — title + description body
- `AttachmentGallery` — thumbnails of uploaded files
- `ActivityTimeline` — chronological log of comments + status changes
- `ReplyForm` — textarea with internal note toggle + status dropdown

**Data (mock):** One hardcoded ticket object with full fields (comments, attachments, activity history). No API calls yet — consistent with existing pattern.

---

### 2️⃣ Admin Reports (`/admin/reports`)

**What it is:** The full analytics/reports dashboard (replacing the current placeholder).

**Page structure (bento grid):**
```
┌─ Header ──────────────────────────────────────┐
│  Reports & Analytics     [Date Range ▾]        │
├────────────────────────────────────────────────┤
│ ┌─ Total Tickets ─┐ ┌─ Avg Resolution ──────┐ │
│ │      1,284      │ │       3.2 days         │ │
│ │ +12% vs last Mo │ │ -8% improvement       │ │
│ └─────────────────┘ └────────────────────────┘ │
│ ┌─ Open Tickets ──┐ ┌─ CSAT Score ──────────┐ │
│ │        47       │ │      4.8 / 5.0         │ │
│ │ 5 urgent        │ │ 92% satisfaction       │ │
│ └─────────────────┘ └────────────────────────┘ │
├────────────────────────────────────────────────┤
│  ┌─ Tickets by Category (bar chart) ────────┐ │
│  │  Mechanical & HVAC    ██████████ 45%     │ │
│  │  Electrical           ██████▌   30%     │ │
│  │  Fire Protection      ███▎      15%     │ │
│  │  Civil & General      ██▏       10%     │ │
│  └──────────────────────────────────────────┘ │
├────────────────────────────────────────────────┤
│  ┌─ Tickets Over Time ───┐ ┌─ Status Dist ──┐ │
│  │ (sparkline chart)     │ │ Open     ██ 18%│ │
│  │                       │ │ In-Prog  ██ 22%│ │
│  │                       │ │ Resolved ██ 45%│ │
│  │                       │ │ Closed   █▎ 15%│ │
│  └───────────────────────┘ └────────────────┘ │
├────────────────────────────────────────────────┤
│  ┌─ Recent Activity Feed ───────────────────┐ │
│  │  • #RCL-9921 → Completed by Engr. Lee   │ │
│  │  • #RCL-9918 → Priority raised to HIGH  │ │
│  │  • #RCL-9915 → Assigned to Siti         │ │
│  │  • #RCL-9899 → New ticket from guest    │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Components needed:**
- `StatCard` — reusable metric display (title, value, trend)
- `BarChart` — horizontal category distribution bars
- `SparklineChart` — simple trend visualization
- `StatusPieChart` — simple status distribution
- `ActivityFeed` — scrollable recent events list

---

## Phase 2 — Other Missing Pages (Not Yet Requested)

These are implied by the README and data model but haven't been built:

### 3️⃣ Guest Ticket Tracking (`/track/:publicToken`)
- **Purpose:** Let a guest check their ticket status using the `publicToken` sent to their email
- **No login required** — just enter/view using the token from the URL
- Shows: status, priority, description, and public comments

### 4️⃣ Public Submission by Org (`/submit/:slug`)
- **Purpose:** Organization-specific public ticket submission form
- Resolves the org by `slug`, customizes the form with `welcomeMessage` and `defaultCategoryId`
- This is the QR-code destination mentioned in the README

### 5️⃣ Admin Create Ticket (`/admin/tickets/create`)
- **Purpose:** Staff-side ticket creation form
- Reuses the Report form pattern but with extra fields (assignment, priority, internal notes)

### 6️⃣ Invite Acceptance (`/invite/:token`)
- **Purpose:** New staff member accepts an organization invite
- Validates token → shows sign-up form → creates User account

---

## Build Order (Proposed)

| Step | Page | Effort | Depends On |
|------|------|--------|-----------|
| 1 | Admin Ticket Details | 🟡 Medium | — |
| 2 | Admin Reports | 🟡 Medium | — |
| 3 | Register routes in `App.tsx` | 🟢 Trivial | 1, 2 |
| 4 | (Later) Guest Track / Submit / Invite | 🔴 Larger | Backend API |

---

## Notes & Conventions

- **Mock data style:** Match existing pattern — typed interfaces, hardcoded arrays, client-side state only
- **No API layer yet** — all existing pages use mock data, new pages should too
- **Component colocation:** New components go in `apps/web/src/components/` (new folder)
- **Tailwind CSS 4** — use the existing design tokens (red-600 primary, gray palette, Inter font)
- **Material Symbols** — reuse existing icon patterns

---

**Ready for your review.** I'll hold off building until you confirm the plan.
