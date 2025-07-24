# 📋 Profile vs Account - Architecture Guide

## Overview

Cliqstr maintains a clear separation between **Profile** (social media features) and **Account** (authentication/system features). This guide clarifies the distinction to prevent confusion during development.

## 🎭 Profile (Social Media Profile)

**Purpose**: Public-facing social information visible to other cliq members

### Database Model
```prisma
model Profile {
  id                String            @id @default(cuid())
  username          String            @unique  // @username handle
  firstName         String?           // Display name
  lastName          String?           // Display name
  birthdate         DateTime          // For age group calculation
  about             String?           // Bio/description
  image             String?           // Avatar URL
  bannerImage       String?           // Cover photo URL
  ageGroup          String?           // child/teen/adult
  aiModerationLevel AIModerationLevel // Content filtering
  scrapbookItems    ScrapbookItem[]   // Photo gallery
  childSettings     ChildSettings?    // Parental controls
  // ... relations
}
```

### Key Features
- **Username**: Unique @handle for social identification
- **Display Info**: Name, bio, avatar, banner
- **Social Content**: Scrapbook/gallery for sharing photos
- **Privacy**: Only visible to members of shared cliqs
- **Child Safety**: AI moderation and parental controls

### Routes & Pages
- `/profile/create` - Create social profile
- `/profile/[username]` - View someone's profile
- `/profile/edit` - Edit your profile
- `/api/profile/*` - Profile API endpoints

### When to Use Profile
✅ Displaying user information in cliqs
✅ Social features (bio, photos, username)
✅ Member directories and search
✅ Public-facing user information

## 🔐 Account (System Account)

**Purpose**: Authentication, authorization, and system-level user management

### Database Model
```prisma
model Account {
  id               String   @id @default(cuid())
  userId           String   @unique
  role             String   // adult, child, parent
  isApproved       Boolean  @default(false)
  stripeCustomerId String?
  stripeStatus     String?
  plan             String?  // Subscription plan
  suspended        Boolean  @default(false)
  // ... relations
}
```

### Key Features
- **Role Management**: adult, child, parent roles
- **Approval System**: Parent approval for children
- **Billing**: Stripe integration and subscription plans
- **Access Control**: Account suspension, permissions
- **Security**: Session management, password resets

### Routes & Pages
- `/account` - Account settings page
- `/api/auth/*` - Authentication endpoints
- `/sign-up`, `/sign-in` - Account creation/login
- `/choose-plan` - Subscription selection

### When to Use Account
✅ Authentication and login
✅ Role-based permissions
✅ Billing and subscriptions
✅ Security settings
✅ Parent/child relationships

## 🔄 How They Work Together

```
User (core identity)
  ├── Account (system access)
  │     ├── role (adult/child/parent)
  │     ├── billing info
  │     └── approval status
  └── Profile (social presence)
        ├── @username
        ├── bio, avatar
        └── scrapbook
```

## 💡 Common Patterns

### Creating a New User
1. User signs up → `User` record created
2. System creates → `Account` record (role, approval)
3. User guided to → Create `Profile` (username, bio)

### Checking Permissions
```typescript
// For system access
if (user.account.role === 'Child') { /* check parent approval */ }

// For social features  
if (user.profile.childSettings?.canPostImages) { /* allow uploads */ }
```

### Display Names
```typescript
// Use Profile for display
const displayName = `${profile.firstName} ${profile.lastName}`;
const handle = `@${profile.username}`;

// Never display Account data publicly
// ❌ user.account.stripeCustomerId
// ❌ user.account.role
```

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T
- Don't create "profile" routes for account management
- Don't expose Account data in public APIs
- Don't mix billing info with social profiles
- Don't use Profile for authentication

### ✅ DO
- Keep social features in Profile
- Keep system features in Account
- Use Profile.username for social identity
- Use Account.role for permissions

## 🏗️ Adding New Features

### Social Feature? → Add to Profile
Examples: bio fields, social links, interests, photo galleries

### System Feature? → Add to Account  
Examples: 2FA settings, email preferences, API keys, permissions

### Not Sure? Ask These Questions:
1. Is it visible to other users? → Profile
2. Is it for authentication/authorization? → Account
3. Is it billing related? → Account
4. Is it for social interaction? → Profile

## 📁 File Organization

```
src/
├── app/
│   ├── profile/          # Social profile pages
│   │   ├── [username]/   # Public profile view
│   │   ├── create/       # Profile creation
│   │   └── edit/         # Profile editing
│   ├── account/          # Account management
│   └── api/
│       ├── profile/      # Social profile APIs
│       └── auth/         # Account/auth APIs
└── components/
    ├── profile/          # Profile UI components
    └── account/          # Account UI components
```

## 🔍 Quick Reference

| Feature | Profile | Account |
|---------|---------|---------|
| Username | ✅ | ❌ |
| Bio/About | ✅ | ❌ |
| Avatar | ✅ | ❌ |
| Gallery | ✅ | ❌ |
| Role (adult/child) | ❌ | ✅ |
| Billing | ❌ | ✅ |
| Password | ❌ | ✅ |
| Email | ❌ | ✅ |
| Approval Status | ❌ | ✅ |

---

**Remember**: Profile is what users **share**, Account is what the **system** needs.