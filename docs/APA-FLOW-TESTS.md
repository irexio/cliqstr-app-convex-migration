# APA Flow Test Suite for Cliqstr

This file defines testable flows to verify that all APA (Aiden’s Power Auth) logic is functioning correctly across the Cliqstr platform. Use this as a checklist for QA, developer verification, or AI agent testing.

---

## 👶 Child Sign-Up Without Invite

**Role:** `child` (under 13)  
**Steps:**
1. Go to `/sign-up`
2. Enter email, birthdate (e.g., age 10), password
3. Submit

**Expected:**
- Redirect to `/awaiting-approval`
- Parent email is required
- Cannot proceed without approval

**APA Protection:**
- No access to `/choose-plan`, `/cliqs/create`, or `/cliq/[id]`

---

## 📱 SMS Invite to Adult

**Role:** `adult`  
**Steps:**
1. Receive SMS with invite link
2. Click link
3. Redirect to `/sign-up`, cliq auto-pre-filled
4. Complete account setup

**Expected:**
- Redirect to `/choose-plan`
- Auto-join cliq after plan selection

**APA Protection:**
- Invite token validated
- Logged with inviter ID and timestamp

---

## 🧑‍👧 Parent HQ – Silent Monitoring

**Role:** `parent`  
**Steps:**
1. Sign in
2. Visit `/parents-hq`
3. View child’s cliqs, posts, and invite history

**Expected:**
- Can toggle permissions: `canInvite`, `canCreatePublic`
- Can view posts and memberships

**APA Protection:**
- Parent cannot be seen by child (silent observer)

---

## 🚨 Red Alert (Child)

**Role:** `child`  
**Steps:**
1. Sign in
2. Trigger Red Alert

**Expected:**
- Immediate parent notification
- Alert logged with child ID, timestamp, cliq ID

**APA Protection:**
- If triggered by adult: alert goes to AI moderation

---

## 🔧 Note to Developer

This file is designed to evolve. Add more test flows as features expand.

_Last updated: 2025-07-14_  
_To add a new flow, use the format: Role → Steps → Expected → APA Protection._

