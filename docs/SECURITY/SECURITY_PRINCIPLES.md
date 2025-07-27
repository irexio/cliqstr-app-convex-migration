# 🔐 Cliqstr Security Principles

## Mission Statement

Cliqstr is a **security-first, privacy-focused** social platform designed to protect families, especially children, from online threats including stalkers, predators, groomers, and cyberbullying.

## The Parent-Child Balance

### Understanding the Challenge

Through interviews with dozens of parents, we discovered a critical tension:
- **Some parents** want maximum control and visibility
- **Other parents** worry their children will reject overly-surveilled platforms
- **Children** need to feel trusted while staying safe

**Our Solution**: Customizable parental controls through the **Parents HQ** dashboard.

## Why Custom Authentication (APA)?

### Standard Auth Solutions Don't Work for Child Safety

We've evaluated and attempted to implement every major authentication provider:
- ❌ **Clerk** - No parent-child relationship modeling
- ❌ **Supabase Auth** - Lacks approval workflows  
- ❌ **NextAuth** - Stateless design incompatible with child monitoring
- ❌ **Auth0/OAuth** - Cannot enforce parental oversight requirements

**Result**: We built **APA (Aiden's Power Auth)** - a custom session-based authentication system designed specifically for family safety with flexible parental controls.

## Core Security Principles

### 1. 🚸 Child Safety with Parent Choice
- **Default protection**: Children (17 and under) require parent consent for account creation
- **Customizable permissions**: Parents decide their child's level of freedom
- **Granular controls**: Each permission can be individually configured
- **Age-appropriate defaults**: Suggested settings based on child's age

### 2. 🎛️ Parents HQ - Customizable Controls

Parents can configure:
- ✅ **Can send invites** - Whether child can invite others
- ✅ **Can invite adults** - Allow inviting grandparents, family friends
- ✅ **Invite requires approval** - Review invites before they're sent
- ✅ **Can join public cliqs** - Access to age-appropriate public groups
- ✅ **Can create public cliqs** - Ability to start public groups
- ✅ **Monitoring level** - From light oversight to full visibility

### 3. 🔒 Privacy by Design
- **Invite-only system**: No public profiles or discoverable users
- **No global search**: Users can only see members of their cliqs
- **Data minimization**: We collect only essential information
- **No tracking**: No analytics, ads, or third-party data sharing

### 4. 🛡️ Defense in Depth
- **Multi-layer authentication**: APA with iron-session based security
- **Role-based permissions**: Respecting parent-configured settings
- **Audit trails**: Based on parent-selected monitoring level
- **Smart friction**: Security checks that adapt to trust level

### 5. 👀 Flexible Oversight
- **Configurable monitoring**: From hands-off to full visibility
- **Red Alert system**: Always active for emergencies
- **Trust building**: Parents can gradually increase freedoms
- **Activity summaries**: Digestible reports instead of overwhelming logs

## Parent Control Philosophy

### The Spectrum of Control

```
High Control                                           High Freedom
     |---------------------------------------------------|
     |                                                   |
[All actions need approval]                    [Child has full autonomy]
     |                                                   |
     └── Most parents choose somewhere in the middle ───┘
```

### Default Settings by Age
- **Under 13**: Higher restrictions, most actions need approval
- **13-15**: Balanced approach, some autonomy with oversight
- **16-17**: More freedom, safety nets still in place

### Parent Feedback Integration

Based on extensive parent interviews:
1. **"I want to know everything"** → Full monitoring mode available
2. **"I trust my teen but want emergency alerts"** → Light touch monitoring
3. **"My child needs to learn responsibility"** → Gradual permission increases
4. **"Different rules for different kids"** → Per-child customization

## Security Features That Don't Compromise

### Always Active (Non-negotiable)
- 🚨 Red Alert system for emergencies
- 🔐 Secure authentication and sessions
- 🚫 No contact with non-connected users
- 📍 No location sharing or tracking
- 🎂 Age verification and appropriate content

### Parent-Configurable
- 👥 Who can send invites to their child
- 📬 Whether invites need pre-approval
- 🌐 Public cliq participation
- 👀 Level of activity monitoring
- 📱 Device and time restrictions

## Developer Guidelines

### When Building Features
1. **Check Parents HQ settings** - Never assume permissions
2. **Respect parent choices** - Don't override configured settings
3. **Provide clear feedback** - Show when parent approval is needed
4. **Log appropriately** - Based on monitoring level selected
5. **Design for trust** - Features should build parent-child trust

### Code Example
```typescript
// Always check parent-configured permissions
const childSettings = await getChildSettings(userId);

if (childSettings.canSendInvites) {
  if (childSettings.inviteRequiresApproval) {
    await createPendingInvite(); // Parent will review
  } else {
    await sendInviteDirectly(); // Parent trusts child
  }
} else {
  showMessage("Your parent hasn't enabled invites yet");
}
```

## Building Trust Through Technology

### Progressive Freedom Model
1. **Start restricted** - Safety first for new accounts
2. **Earn trust** - Good behavior unlocks features
3. **Parent notifications** - "Your child has been responsible"
4. **Gradual expansion** - More freedoms over time
5. **Always reversible** - Parents can tighten if needed

### Success Metrics
- ✅ Children feel trusted, not surveilled
- ✅ Parents feel informed, not overwhelmed
- ✅ Families communicate better
- ✅ Safety without suffocation

---

**Remember**: We're not just building a platform - we're helping families navigate digital life together. Every feature should strengthen family bonds while keeping kids safe.