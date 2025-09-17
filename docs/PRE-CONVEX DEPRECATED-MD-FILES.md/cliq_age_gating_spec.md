## 🚧 Cliq Age Gating Logic (APA-Safe)

This document defines the APA-compliant age restriction system for Cliq creation and membership.

---

### 🎯 Objective

Ensure that when a user creates a public or semi-private cliq, they can optionally specify minimum and maximum age restrictions. These limits determine who is allowed to join the cliq based on their `Account.birthdate`.

---

### 🧱 Prisma Schema Changes

``** Model — Add:**

```ts
minAge        Int?   // Optional minimum age for joining
maxAge        Int?   // Optional maximum age for joining
```

---

### 🧩 Frontend UI Requirements

**Cliq Creation Form:**

- If `privacy = 'public'` or `privacy = 'semi_private'`, display two numeric fields:
  - `Minimum Age`
  - `Maximum Age`
- If `privacy = 'private'`, these fields must be hidden or disabled

---

### 🔐 Backend Join Validation

On all join attempts (via invite or request):

1. **Retrieve **``
2. **Calculate age:**

```ts
const age = calculateAge(account.birthdate)
```

3. **Reject if:**

```ts
if ((cliq.minAge && age < cliq.minAge) || (cliq.maxAge && age > cliq.maxAge)) {
  return res.status(403).json({ error: 'Age restriction not met' })
}
```

4. **If user is a child**, ensure their parent has enabled:

```ts
canJoinPublicCliqs = true // In ParentLink → childSettings
```

---

### 🛡️ APA Enforcement Rules

- ✅ Use `Account.birthdate` only (never MyProfile.birthdate)
- ✅ Validate age gating on both frontend and backend
- ✅ Enforce `canJoinPublicCliqs` for all child accounts
- ✅ Apply rules for both join requests and direct invites

---

### 🧪 QA / Testing

- Attempt to join a cliq outside age range → should fail
- Attempt to join as child with parent disapproval → should fail
- Join within valid range as approved user → should succeed

---

### 🔄 Future Enhancement

- Add age range tags (e.g., 13–17, 18+, 40–60) to Cliq listings and filters
- Allow parents to subscribe to alerts when their child requests access to an age-gated group

---

This file must be referenced for all age logic related to cliq membership and invite enforcement. It enforces the APA boundary that all child safety logic stems from immutable system `Account` data, not social profile fields.

