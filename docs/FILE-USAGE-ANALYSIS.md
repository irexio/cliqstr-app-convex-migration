# File Usage Analysis Report
Generated: July 25, 2025

## ⚠️ IMPORTANT WARNINGS
- This is an ANALYSIS ONLY - no files have been deleted
- Some files may appear unused but are:
  - Referenced dynamically
  - Used by Next.js conventions
  - Part of unfinished features
  - Required for production builds

## Analysis Methodology
1. Check import statements across the codebase
2. Identify Next.js convention files (pages, api routes, etc.)
3. Flag files with no apparent references
4. Cross-reference with git history for recent additions

---

## 🔍 Analysis Results

### ✅ ACTIVE & CRITICAL FILES (DO NOT DELETE)

#### Core Authentication & Session
- `/src/app/api/sign-in/route.ts` - Login endpoint
- `/src/app/api/sign-up/route.ts` - Registration endpoint
- `/src/lib/auth/getCurrentUser.ts` - Session management
- `/src/lib/auth/session-config.ts` - Iron session config
- `/src/app/api/sign-out/route.ts` - Logout endpoint

#### Profile System
- `/src/app/profile/create/page.tsx` - Profile creation page
- `/src/components/CreateProfileForm.tsx` - Profile form component
- `/src/app/api/profile/create/route.ts` - Profile creation API
- `/src/components/NewProfileClient.tsx` - Profile display

#### Cliq System
- `/src/app/cliqs/build/page.tsx` - Cliq creation page
- `/src/app/api/cliqs/create/route.ts` - Cliq creation API
- `/src/components/cliqs/CliqCard.tsx` - Cliq display component
- `/src/app/my-cliqs-dashboard/page.tsx` - User's cliq dashboard

#### Parent/Child System
- `/src/app/parents/hq/page.tsx` - Parent control panel
- `/src/app/api/parent-approval/complete/route.ts` - Approval flow
- `/src/app/awaiting-approval/page.tsx` - Child waiting page

### ⚠️ POTENTIALLY REDUNDANT FILES (Investigation Needed)

#### Duplicate/Similar Routes
1. **Invite Validation** (multiple endpoints doing similar things):
   - `/src/app/api/validate-invite/route.ts`
   - `/src/app/api/invites/validate/route.ts`
   - *Recommendation*: Check which is actually used

2. **Parent Approval** (overlapping functionality):
   - `/src/app/api/parent-approval/complete/route.ts`
   - `/src/app/api/parent/approval-complete/route.ts`
   - *Recommendation*: Verify active endpoint

3. **Profile Routes**:
   - `/src/app/profile/page.tsx` (no username param)
   - `/src/app/profile/[username]/page.tsx` (with param)
   - *Note*: First might redirect or show current user

#### Unused Components (Need Verification)
1. **Old Auth Components**:
   - Files referencing JWT or token-based auth
   - Legacy session management

2. **Test/Debug Pages**:
   - `/src/app/debug/session-check/page.tsx`
   - `/src/app/test-email/route.ts`
   - `/src/app/dev-reset/route.ts`
   - *Note*: May be needed for development

3. **Incomplete Features**:
   - `/src/app/explore/page.tsx` - Discovery feature
   - `/src/app/session-ping/page.tsx` - Keep-alive feature
   - Various admin routes under `/src/app/admin/`

### 📊 SAFE CLEANUP RECOMMENDATIONS

1. **DO NOT DELETE without verification**:
   - Any file imported by another file
   - Any Next.js convention file (page/route/layout)
   - Any file modified in last 30 days
   - Any file with "TODO" or "WIP" comments

2. **Safe to Archive** (move to backup folder):
   - Clearly marked test files
   - Files with .bak or .old extensions
   - Duplicate implementations after verification

3. **Investigation Process**:
   ```bash
   # Check if a file is imported anywhere
   grep -r "filename" src/
   
   # Check git history
   git log --follow src/path/to/file.tsx
   
   # Check for dynamic imports
   grep -r "import.*dynamic" src/
   ```

### 🔒 CRITICAL WARNING

Some files appear unused because they are:
1. **Loaded by Next.js conventions** (pages, API routes)
2. **Referenced dynamically** at runtime
3. **Part of unfinished features** that will be needed
4. **Security fallbacks** (error pages, auth checks)
5. **Required for production** (webhooks, email handlers)

### 📝 NEXT STEPS

1. Run usage analysis on specific suspicious files
2. Check with team about incomplete features
3. Review git history for context
4. Create a "deprecated" folder before deleting
5. Test thoroughly after any cleanup

---

Remember: It's safer to keep a potentially unused file than to delete a critical one.