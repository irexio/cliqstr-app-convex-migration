# TODO.md

> ✅ Updated: August 3, 2025
> This is the active developer-facing task list for finalizing core APA flows, UI improvements, and parent-facing features. Items marked ✅ are complete and deployed. Remaining tasks are prioritized by impact.

---

## ✅ INCOMPLETED TASKS

* [] Replace `/invite/parent` landing with simplified approval interface
* [] Route `/invite/parent` → `/parents/hq?inviteCode=xxx`
* [] Implement `ChildInviteApprovalFlow.tsx`
* [] Add Red Alert and Silent Monitoring controls
* [] Create `ParentLink` and `ChildSettings` on approval
* [] Log Red Alert acceptance in `ParentAuditLog`
* [] Enforce `invite.used = true` **after** approval
* [] Use `upsert` for `ChildSettings` to prevent conflict
* [] Clean unused approval components
* [] Create `/docs/README.md` index
* [] Add docs folder classification and APA routing documentation

---

## 🔧 HIGH PRIORITY (APA & LAUNCH CRITICAL)

* [ ] Finalize `ParentDashboard` multi-child support
* [ ] Add UI in `/parents/hq` to:

  * Edit existing children
  * View pending invites
  * Display cliqs child is part of
* [ ] Show "approval pending" badge on invite if parent hasn't completed flow
* [ ] Add `Decline` option to `/invite/parent` screen and track it
* [ ] Write `/api/invite/decline` endpoint

---

## 🧠 MEDIUM PRIORITY (UX, CONTROLS, AUDIT)

* [ ] Migrate old approval docs to `ARCHIVE/`
* [ ] Add plan-aware post limits to MyCliqs + Feed views
* [ ] Add `/invite-status` debug route to check invite codes (for internal use)
* [ ] Enhance `ParentAuditLog` with invite context + timestamps
* [ ] Finalize cliq card notification for "recent posts"
* [ ] Display parental control status inside each child profile

---

## 🎨 UI POLISH & ACCESSIBILITY

* [ ] Add brand logo to parent invite emails
* [ ] Improve `/parents/hq` layout on mobile
* [ ] Center text and button spacing on `/invite/parent`
* [ ] Standardize button shapes and hover colors
* [ ] Use consistent font weights and sizes across components

---

## 📁 DOCUMENTATION & ORGANIZATION

* [ ] Mark completed `.md` files with ✅ and date
* [ ] Create `SECURITY/APA-Dev-Rules.md` with session and invite safety principles
* [ ] Document fallback behavior and safety triggers for failed invites
* [ ] Finalize investor-ready summary of APA flow and feature map

---
