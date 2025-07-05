# Cliqstr Application Route Flow

## Overview

This document outlines the current route structure and authentication flow of the Cliqstr application after recent middleware consolidation and security enhancements.

## Middleware Configuration

The application now uses a consolidated middleware approach in `src/middleware.ts` that handles three primary concerns:

1. **Admin Route Protection** - Ensures only users with Admin role can access admin routes
2. **APA (Aiden's Power Auth) Protected Routes** - Enforces child safety with approval checks
3. **General Pass-through** - All other routes are accessible without authentication

### Current Middleware Matchers

```typescript
// From src/middleware.ts
export const config = {
  matcher: [
    // Admin routes
    '/admin', '/admin/:path*',
    // APA-protected routes - include variations to ensure full coverage
    '/cliqs/:path*', '/Cliqs/:path*', '/CLIQS/:path*',
    '/my-cliqs', '/My-Cliqs', '/MY-CLIQS',
    '/my-cliqs/:path*', '/My-Cliqs/:path*', '/MY-CLIQS/:path*',
    '/parents-hq', '/Parents-HQ', '/PARENTS-HQ',
    '/parents-hq/:path*', '/Parents-HQ/:path*', '/PARENTS-HQ/:path*'
  ],
};
```

## Authentication Flow

### Sign-In Process
1. User submits credentials to `/api/auth/sign-in`
2. Server validates credentials and issues JWT token in `auth_token` cookie
3. User session is verified via `/auth/status` or `/api/auth/status` endpoints
4. Auto-logout based on role-specific timeouts is handled by client-side inactivity detection

### Session Verification
1. `getCurrentUser.ts` extracts the JWT token from cookies
2. Token is verified using `verifyToken()` from `@/lib/auth/jwt.ts`
3. User data is fetched from Prisma database with profile information
4. Legacy accounts without profiles are handled with fallback data

## Route Types and Protection

### 1. Public Routes
- `/` - Homepage
- `/explore` - Public cliqs exploration
- `/how-it-works` - Information page
- `/about` - About page
- `/faqs` - Frequently asked questions
- `/sign-in` - Sign in form
- `/sign-up` - Sign up form
- `/reset-password` - Password reset page

### 2. Admin Routes (Protected)
- `/admin/*` - All admin routes
  - Protected by middleware that checks for:
    - Valid JWT token
    - User role === 'Admin'
  - Redirects unauthorized users to `/not-authorized`

### 3. APA-Protected Routes (Authentication Required)
- `/cliqs/*` - All cliq content routes
- `/my-cliqs` - User's cliqs dashboard
- `/parents-hq` - Parent headquarters
  - Protected by middleware that checks for:
    - Valid JWT token
    - For child accounts: ensures approved status
  - Unapproved child accounts redirected to `/awaiting-approval`
  - Unauthenticated users redirected to `/sign-in`

### 4. API Routes
- `/api/admin/*` - Admin actions (password reset, user management)
  - Requires Admin role in JWT
- `/api/auth/*` - Authentication endpoints
  - Sign-in, sign-out, status check
- `/api/cliqs/*` - Cliq data operations
  - Protected by middleware for authenticated users
- `/api/users/*` - User data operations
  - Protected by middleware for authenticated users

## Next.js Configuration

The application uses Next.js 15.3.4 with:
- App directory routing
- Dynamic route handling with `export const dynamic = 'force-dynamic'` on API routes
- External packages configuration in experimental settings
- Serverless function handling for Vercel deployment

```javascript
// From next.config.js
experimental: {
  serverActions: {
    allowedOrigins: ['localhost:3000', 'cliqstr.app', '*.cliqstr.app', 'vercel.app', '*.vercel.app'],
  },
  // Updated from serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['@prisma/client']
},
```

## Security Features

1. **JWT Authentication**
   - 1-hour token expiry
   - Stored in HTTP-only cookie `auth_token`
   - Verification on every protected route

2. **Child Safety**
   - Role-based access control
   - Approval required for child accounts
   - Strict redirection of unapproved children
   - Enhanced audit logging for child account access

3. **Password Security**
   - Admin-triggered password reset via email with secure token
   - Tokens expire after 1 hour
   - Passwords never exposed, only reset via secure links

## Known Issues

1. **Legacy Account Handling**
   - Users created before flow changes may have session inconsistencies
   - Admin password reset feature added to mitigate these issues

2. **Next.js Dynamic Routes**
   - Next.js 15+ "ghost" type errors mitigated with `dynamic = 'force-dynamic'` flags
   - Some routes may still experience TypeScript errors during build

3. **Middleware Conflicts**
   - Previous middleware conflicts with multiple middleware files resolved through consolidation
   - Case sensitivity and path variations addressed in route matchers

## Recent Changes

1. **Middleware Consolidation**
   - Combined all middleware logic into a single root middleware.ts
   - Added comprehensive path matching for route protection

2. **Next.js Configuration Updates**
   - Updated experimental configuration property names
   - Fixed dynamic server usage errors

3. **Authentication Robustness**
   - Enhanced route protection with case-insensitive path matching
   - Added detailed logging for debugging authentication issues
