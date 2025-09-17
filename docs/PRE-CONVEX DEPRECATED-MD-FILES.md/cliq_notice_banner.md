## CLIQ NOTICE BANNER SPEC

This document defines the structure and behavior of the in-cliq notice system for Cliqstr. These banners appear at the top of each cliq's main page (`/cliqs/[id]`) and communicate timely information to members. Notices are automated (e.g., birthdays, safety alerts) or posted by cliq admins.

---

### 🔔 SUPPORTED NOTICE TYPES

| Type                 | Trigger Source       | Visibility          | Auto-Expires? |
| -------------------- | -------------------- | ------------------- | ------------- |
| `birthday`           | MyProfile.birthdate  | Members of the cliq | Yes (7 days)  |
| `admin`              | Cliq owner/moderator | Members of the cliq | Optional      |
| `red_alert_open`     | Red Alert triggered  | Members of the cliq | No            |
| `red_alert_resolved` | Moderator action     | Members of the cliq | Yes (7 days)  |

---

### 💡 DISPLAY COMPONENT

- **Component:** `<CliqNoticeBar />`
- **Location:** Renders at top of `/cliqs/[id]`
- **Behavior:**
  - Can support multiple stacked notices (birthday + red alert)
  - Always pinned and dismissible (UX optional)

---

### 🎉 BIRTHDAY NOTICE

- Shown during the user's birthday week
- Based on `user.myProfile.birthdate`
- **Message example:**
  > 🎉 This week is Sarah's birthday! Drop her some birthday wishes in the cliq.

---

### 🛠️ ADMIN NOTICE

- Entered manually by cliq owner
- Common use: reminders, schedule changes, event announcements
- **Message example:**
  > 🗓️ Don't forget: Saturday's game starts at 10AM. Bring water and sunscreen!

---

### 🔴 RED ALERT NOTICE

- Posted automatically when a user hits the "Red Alert" button inside the cliq

- **Initial Alert Message:**

  > ⚠️ A safety concern was reported in this cliq. Our team is reviewing it.

- **Resolved Alert Message:**

  > ✅ A recent Red Alert in this cliq has been reviewed and addressed.

- Never discloses who triggered it

- Must be visible to all members including silent observers (e.g. parents)

---

### 🧠 DATABASE MODEL: `CliqNotice`

```ts
model CliqNotice {
  id          String   @id @default(cuid())
  cliqId      String
  type        String   // birthday, admin, red_alert_open, red_alert_resolved
  content     String   // message to display
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  cliq        Cliq     @relation(fields: [cliqId], references: [id])
}
```

- `expiresAt` controls auto-dismissal for birthday/resolved alerts
- Admin notices may remain until manually removed

---

### 🔐 APA-SAFE ENFORCEMENT

- All notices are visible **only to authenticated users who are members of the cliq**
- No notice content is ever shared outside of cliq context
- `getCurrentUser()` is used to validate session before rendering notices
- Parents silently monitoring their child's cliqs will see the notices as well

