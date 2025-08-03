# SECURITY FIX PLAN — SESSION AND CHILD PERMISSION
Date: July 25, 2025

## EXECUTIVE SUMMARY
This plan addresses two critical security vulnerabilities:
1. **Session Cookie Vulnerability**: Raw user ID stored in cookies allows impersonation
2. **Missing Child Permission Check**: Children can create public cliqs without permission

## PART 1: SESSION COOKIE VULNERABILITY FIX

### Current State Analysis
The system currently stores raw user IDs in cookies:
- **Sign-in route** (`/src/app/api/sign-in/route.ts`): Lines 99-107, 124-132
- **Parent approval route** (`/src/app/api/parent-approval/complete/route.ts`): Lines 208-216
- **getCurrentUser** (`/src/lib/auth/getCurrentUser.ts`): Line 12 reads raw ID

### Security Risk
Anyone can manually set `session=<any-user-id>` cookie and impersonate that user.

### Proposed Solution: iron-session Implementation

#### Why iron-session?
- Encrypts session data with a secret key
- Provides signed, httpOnly cookies
- Session-only (no persistent tokens)
- Works seamlessly with Next.js App Router

#### Implementation Plan

##### 1. Install Dependencies
```bash
npm install iron-session
```

##### 2. Create Session Configuration (`/src/lib/auth/session-config.ts`)
```typescript
import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ character secret
  cookieName: 'cliqstr-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 60, // 30 minutes
    path: '/',
  },
};

export interface SessionData {
  userId: string;
  createdAt: number;
}
```

##### 3. Update Environment Variables
Add to `.env.local`:
```
SESSION_SECRET=your-32-character-or-longer-secret-key-here
```

##### 4. Files to Update

###### A. `/src/app/api/sign-in/route.ts`
Replace lines 99-107 and 124-132:
```typescript
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

// Instead of response.cookies.set()
const session = await getIronSession<SessionData>(req, response, sessionOptions);
session.userId = user.id;
session.createdAt = Date.now();
await session.save();
```

###### B. `/src/app/api/parent-approval/complete/route.ts`
Replace lines 208-216 with same iron-session approach.

###### C. `/src/lib/auth/getCurrentUser.ts`
Complete rewrite:
```typescript
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  try {
    const session = await getIronSession<SessionData>(
      { headers: { cookie: cookies().toString() } },
      new Response(),
      sessionOptions
    );

    if (!session.userId) {
      console.log('[APA] No session found');
      return null;
    }

    // Check session age (30 min timeout)
    const sessionAge = Date.now() - session.createdAt;
    if (sessionAge > 30 * 60 * 1000) {
      console.log('[APA] Session expired');
      await session.destroy();
      return null;
    }

    // Continue with existing user lookup logic...
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      // ... rest of existing query
    });
    
    // ... rest of existing logic
  } catch (error) {
    console.error('[APA] Error in getCurrentUser:', error);
    return null;
  }
}
```

###### D. `/src/app/api/sign-out/route.ts`
Update to destroy iron-session:
```typescript
const session = await getIronSession<SessionData>(req, response, sessionOptions);
await session.destroy();
```

##### 5. Add Session Refresh Middleware
Create `/src/middleware/session-refresh.ts` to refresh session on activity:
```typescript
export async function refreshSession(session: any) {
  if (session.userId) {
    session.createdAt = Date.now();
    await session.save();
  }
}
```

## PART 2: CHILD PUBLIC CLIQ PERMISSION FIX

### Current State
`/src/app/api/cliqs/create/route.ts` has NO validation for child permissions.

### Required Fix
Add permission check after line 55:

```typescript
// After existing plan check (line 55)
if (user.role === 'Child' && privacy === 'public') {
  const childSettings = await prisma.childSettings.findUnique({
    where: { profileId: user.profile.id }
  });

  if (!childSettings?.canCreatePublicCliqs) {
    console.log('[APA] Child blocked from creating public cliq:', user.email);
    return NextResponse.json({
      error: 'You need parent permission to create public cliqs'
    }, { status: 403 });
  }
}
```

### Files to Update
- `/src/app/api/cliqs/create/route.ts`: Add check after line 55

## TESTING PLAN

### Session Security Testing
1. Verify manual cookie manipulation is blocked
2. Test session expiration after 30 minutes
3. Ensure sign-out destroys session
4. Verify session persists across requests
5. Test session refresh on activity

### Child Permission Testing
1. Create child account with `canCreatePublicCliqs = false`
2. Attempt to create public cliq → should fail with 403
3. Update permission to `true` via parent account
4. Retry public cliq creation → should succeed
5. Verify private/semi-private cliqs work regardless

## ROLLBACK PLAN
If issues arise:
1. Revert git commits
2. Clear all browser cookies
3. Restart Next.js server
4. Users will need to sign in again

## DEPLOYMENT CHECKLIST
- [ ] Generate secure SESSION_SECRET (32+ chars)
- [ ] Add SESSION_SECRET to production env
- [ ] Update all session write locations
- [ ] Update getCurrentUser implementation
- [ ] Add child permission check
- [ ] Test all auth flows
- [ ] Deploy with monitoring

## RISK MITIGATION
- Implement gradually: session fix first, then permissions
- Monitor error logs for session failures
- Have support ready for user sign-in issues
- Document the new session format for future reference