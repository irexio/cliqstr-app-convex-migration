# Data Integrity Audit Report

## Schema vs Function Alignment Analysis

### ✅ USERS Table - PASS
**Schema Fields**: email, password, createdAt, updatedAt, deletedAt, resetToken, resetTokenExpires, verificationExpires, verificationToken, isVerified, isParent

**Functions Using ctx.db.insert**:
- `createUser`: ✅ All required fields present
- `createUserWithAccount`: ✅ All required fields present

**Functions Using ctx.db.patch**:
- `updateUser`: ✅ Proper patch with updatedAt timestamp

### ✅ ACCOUNTS Table - PASS  
**Schema Fields**: userId, birthdate, role, isApproved, stripeStatus, plan, stripeCustomerId, createdAt, suspended

**Functions Using ctx.db.insert**:
- `createAccount`: ✅ All required fields present
- `createUserWithAccount`: ✅ All required fields present

**Functions Using ctx.db.patch**:
- `updateAccount`: ✅ Proper patch with error handling

### ✅ PARENTAPPROVALS Table - PASS
**Schema Fields**: childFirstName, childLastName, childBirthdate, parentEmail, approvalToken, status, context, inviteId, cliqId, inviterName, cliqName, parentState, existingParentId, createdAt, expiresAt, approvedAt, declinedAt

**Functions Using ctx.db.insert**:
- `createParentApproval`: ✅ All required fields present

**Functions Using ctx.db.patch**:
- `markParentApprovalExpired`: ✅ Proper status update
- `approveParentApproval`: ✅ Proper status + timestamp update
- `declineParentApproval`: ✅ Proper status + timestamp update

### ✅ MYPROFILES Table - PASS
**Schema Fields**: username, birthdate, createdAt, userId, ageGroup, about, bannerImage, image, updatedAt, aiModerationLevel, firstName, lastName, showYear

**Functions Using ctx.db.insert**:
- `createProfile`: ✅ All required fields present

**Functions Using ctx.db.patch**:
- `updateProfile`: ✅ Proper patch with updatedAt timestamp

## Critical Issues Found

### ❌ ISSUE 1: Missing Profile Creation in Adult Signup
**Problem**: `createUserWithAccount` creates user + account but NO profile
**Impact**: Adult signup will fail when trying to access profile data
**Fix Needed**: Add profile creation to `createUserWithAccount` or call `createProfile` separately

### ❌ ISSUE 2: Schema Mismatch in Profiles
**Problem**: Schema has `ageGroup` field but `createProfile` doesn't set it
**Impact**: Profile creation may fail or have undefined ageGroup
**Fix Needed**: Add ageGroup to createProfile args and handler

### ❌ ISSUE 3: Missing ParentLinks Creation
**Problem**: No function to create parentLinks records
**Impact**: Parent-child relationships won't be tracked
**Fix Needed**: Create `createParentLink` mutation

## Required Fixes Before Deploy

### Fix 1: Add Profile Creation to Adult Signup
```typescript
// In createUserWithAccount, after account creation:
const profileId = await ctx.db.insert("myProfiles", {
  username: args.username || args.email.split('@')[0], // Generate username
  birthdate: args.birthdate,
  createdAt: now,
  updatedAt: now,
  userId,
  firstName: args.firstName,
  lastName: args.lastName,
  showYear: false,
  aiModerationLevel: "strict",
});
```

### Fix 2: Add ageGroup to createProfile
```typescript
// Add to createProfile args:
ageGroup: v.optional(v.string()),

// Add to handler:
ageGroup: args.ageGroup,
```

### Fix 3: Create ParentLinks Functions
```typescript
// New file: convex/parentLinks.ts
export const createParentLink = mutation({
  args: {
    parentId: v.id("users"),
    childId: v.id("users"),
    email: v.string(),
    type: v.string(),
    inviteContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("parentLinks", {
      parentId: args.parentId,
      childId: args.childId,
      email: args.email,
      type: args.type,
      inviteContext: args.inviteContext,
      createdAt: Date.now(),
    });
  },
});
```

## API Route Dependencies Check

### ✅ /api/sign-up/route.ts
- Calls `createUserWithAccount` ✅
- Needs profile creation fix ❌

### ✅ /api/parent-approval/signup/route.ts  
- Calls `createUserWithAccount` ✅
- Needs profile creation fix ❌

### ✅ /api/parent-approval/plan/route.ts
- Calls `updateAccount` ✅

## Deployment Readiness

**Status**: ❌ NOT READY
**Blockers**: 
1. Missing profile creation in adult signup
2. Missing parentLinks creation for parent-child relationships
3. Schema field mismatch in profiles

**Next Steps**:
1. Fix the 3 critical issues above
2. Test locally with `npx convex dev`
3. Deploy with `npx convex deploy`
4. Test on Vercel with real data persistence
