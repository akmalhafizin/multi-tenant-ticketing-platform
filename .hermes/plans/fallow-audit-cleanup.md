# Fallow Audit Cleanup Plan

**Source:** `fallow` static analysis results on main branch

---

## Priority 1 — Dead Code Cleanup (low risk, quick wins)

Remove 7 unused exports found by fallow:

| File | Export | Why unused | Action |
|------|--------|------------|--------|
| `apps/api/src/lib/s3.js:99` | `remove` | Exported but never imported anywhere | Delete export |
| `apps/api/src/middleware/tenant.js:72` | `extractSlug` | Helper function, no consumers | Delete export |
| `apps/api/src/services/roleService.js:165` | `SYSTEM_ROLES` | Used only internally within service, doesn't need export | Delete export |
| `apps/web/src/hooks/useTenant.ts:38` | `useTenant` | Hook defined but never imported by any page | Delete export |
| `apps/web/src/hooks/useAuth.tsx:4` | `AuthUser` | Type exported but never imported externally | Delete export |
| `apps/web/src/lib/api.ts:34` | `default` | `export default API_BASE` — never imported via default | Remove default export |
| `apps/web/src/types.ts` | Unused type export | Check which type is flagged | Remove unused type |

**Commit:** `chore: remove unused exports found by fallow`

---

## Priority 2 — Refactor Main Hotspot (medium effort)

`apps/web/src/pages/AdminTicketDetail.tsx` — 307 lines, 31 cyclomatic complexity, CRAP 992

Split into standalone components:

| Component | What it contains | Approx lines |
|-----------|-----------------|--------------|
| `TicketControls.tsx` | Status/category/assignee dropdowns row | ~100 |
| `TicketInfoPanel.tsx` | Customer info, assignment, priority, SLA | ~80 |
| `TicketTimeline.tsx` | Activity feed + comment cards | ~100 |
| `TicketReplyForm.tsx` | Reply textarea + internal/notify checkboxes | ~80 |

**Benefit:** AdminTicketDetail drops from 307→~60 lines. Each component is independently testable.

**Commit:** `refactor: split AdminTicketDetail into TicketControls, InfoPanel, Timeline, ReplyForm`

---

## Priority 3 — Refactor Report.tsx (medium effort)

`apps/web/src/pages/Report.tsx` — 458 lines (largest file)

Split:

| Component | What it contains |
|-----------|-----------------|
| `ImageUploadZone.tsx` | Drag-drop image upload with previews |
| `FileUploadZone.tsx` | Contract/schematic file upload |
| `ReportForm.tsx` | The main form logic (title, description, guest info) |

**Benefit:** Report.tsx drops from 458→~150 lines.

**Commit:** `refactor: split Report page into ImageUploadZone, FileUploadZone, ReportForm`

---

## Priority 5 — Lower Priority

| Item | Action | When |
|------|--------|------|
| 26 duplicate groups | Most are try/catch boilerplate — acceptable for now | Skip |
| Other large pages (AdminUsers 387, AdminRoles 281) | Will naturally shrink as features stabilize | Future |
| SSRF false positives | Already confirmed safe (API_BASE is controlled) | No action |

---

## Summary

| Priority | Files changed | Commits | Risk |
|----------|--------------|---------|------|
| P1 Dead code | ~6 files | 1 commit | None |
| P2 Hotspot refactor | ~5 new files + 1 modified | 1 commit | Low (extract + wire) |
| P3 Report refactor | ~3 new files + 1 modified | 1 commit | Low (extract + wire) |

**Total:** ~3 commits, ~12 files changed/created, low risk.
