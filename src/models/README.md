# 📦 Cliqstr Data Models Guide

## Core Models Overview

### 🧑 User
**Purpose**: Core identity that links authentication credentials to all user data

**Key Relations**:
- Has one `Account` (system/auth data)
- Has one `Profile` (social media profile)
- Can trigger `RedAlert` (safety feature)

**Important**: User is the central entity - never expose User.password or sensitive fields

---

### 🎭 Profile (Social Media Profile)
**Purpose**: Public-facing social information visible to cliq members

**Key Fields**:
- `username` - Unique social handle (@username)
- `firstName`, `lastName` - Display name
- `about` - Bio/description
- `image` - Avatar URL
- `bannerImage` - Cover photo
- `scrapbookItems` - Photo gallery

**Usage**: 
- Display in member lists
- Profile pages (`/profile/username`)
- Social interactions

---

### 🔐 Account (System Account)
**Purpose**: Authentication, permissions, and billing

**Key Fields**:
- `role` - adult, child, or parent
- `isApproved` - Parent approval status
- `plan` - Subscription tier
- `stripeCustomerId` - Billing reference
- `suspended` - Account status

**Usage**:
- Permission checks
- Billing/subscription
- Parent-child relationships

---

### 👨‍👩‍👧 ParentLink
**Purpose**: Connects parents to their children for supervision

**Key Relations**:
- `parent` - User with parent role
- `child` - User with child role

**Usage**: Parent dashboard, approval flows

---

### 🏠 Cliq
**Purpose**: Private groups for sharing content

**Key Fields**:
- `privacy` - private, semi_private, or public
- `ageGroup` - Content appropriateness
- `coverImage` - Group banner

**Important**: Children cannot join public cliqs without parent approval

---

### 👥 Membership
**Purpose**: Links users to cliqs they've joined

**Key Fields**:
- `role` - Owner, Admin, or Member
- `joinedAt` - Timestamp

**Usage**: Access control, member lists

---

### 📝 Post
**Purpose**: Content shared within cliqs

**Features**:
- Text content with AI moderation
- Image attachments (with UploadThing)
- Reply threads
- Age-appropriate filtering

---

### 🎯 ChildSettings
**Purpose**: Parental controls for child accounts

**Key Permissions**:
- `canSendInvites` - Allow sending cliq invites
- `inviteRequiresApproval` - Parent reviews invites
- `canCreatePublicCliqs` - Public cliq creation
- `canPostImages` - Photo sharing
- `canAccessGames` - Game features
- `isSilentlyMonitored` - Parent oversight

---

### 📸 ScrapbookItem
**Purpose**: Photo gallery for profiles

**Features**:
- Image storage via UploadThing
- Captions
- Pin favorite photos
- 90-day auto-expiry (unless pinned)

---

### 💌 Invite
**Purpose**: Secure invite system for cliqs

**Key Fields**:
- `code` - Unique invite code
- `inviteType` - adult or child
- `friendFirstName` - Child's name (for child invites)
- `trustedAdultContact` - Parent email (for child invites)

**Important**: Child invites always go through parent

---

### 🚨 RedAlert
**Purpose**: Emergency notification system

**Features**:
- Instant parent notification
- Requires confirmation before sending
- Logs all alerts for safety

---

## Model Relationships Map

```
User
├── Account (1:1) - System & auth
├── Profile (1:1) - Social presence
│   ├── ChildSettings (1:1) - If child
│   └── ScrapbookItem (1:n) - Gallery
├── ParentLink (as parent or child)
├── Membership (1:n) - Joined cliqs
├── Post (1:n) - Content created
├── Invite (1:n) - Invites sent
└── RedAlert (1:n) - Emergency alerts

Cliq
├── Membership (1:n) - Members
├── Post (1:n) - Content
└── Invite (1:n) - Pending invites
```

## Quick Decision Guide

**Where does this feature belong?**

| If it's about... | Put it in... |
|-----------------|--------------|
| Social display (bio, avatar) | Profile |
| Permissions or roles | Account |
| Group management | Cliq |
| Parent controls | ChildSettings |
| Photo sharing | ScrapbookItem |
| Content sharing | Post |
| Emergency contact | RedAlert |

---

⚠️ **Security Note**: Always check user permissions through Account.role and ChildSettings before allowing actions