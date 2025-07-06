📌 Overview

Cliqstr is not a traditional social platform.

We do not use third-party auth, OAuth, or cookie-less JWT login schemes.

We use APA — Aiden’s Power Auth, a custom, child-safety-first authentication system that enforces:

    ✅ Role-based access (child, adult, parent)

    ✅ Approval-based child account logic

    ✅ Visibility restrictions

    ✅ Invite logic with auditability

    ✅ Silent parental monitoring

    ✅ Session validation at every step

⚠️ Current Problem

The current login system still relies on:

    ❌ verifyToken() from lib/auth/jwt.ts

    ❌ A JWT stored in the auth_token cookie

    ❌ Stateless client-side validation

    ❌ Middleware based on decoding tokens

As a result, login is unreliable. Users are:

    Redirected to /sign-in after selecting a plan

    Kicked out of /my-cliqs and /profile pages

    Logged out silently during transitions

    Unable to persist authentication across reloads or deploys

🔒 Why Session Persistence is Critical in APA

Unlike typical apps where sessions are just for convenience, APA requires continuous session validation to enforce child safety and parental logic.
Reason	Explanation
🧒 Child Role Enforcement	Must know if user is a child, and if they’re approved — at every page render
🧍 Adult vs. Parent Logic	Parents must access /parents-hq, but adults must not
🔐 Silent Monitoring	Parent observers require invisibility & session persistence
🧾 Stripe Plan Enforcement	Plans are tied to userId, and control access to features
🧠 Memory Consistency	Profile, scrapbook, feed — all depend on session context

    If the session breaks, APA breaks.
    If APA breaks — the platform cannot function safely or reliably.

✅ Correct Behavior (APA-Safe Session Flow)
On successful sign-in:

cookies().set('session', user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

On protected pages:

const user = await getCurrentUser();
if (!user?.id) redirect('/sign-in') or notFound();

On logout:

cookies().delete('session');

Middleware:

    Should check for the presence of the session cookie, not the validity of a token

    Token-based logic (verifyToken) must be fully removed

🛠️ Developer Action Plan (For Windsurf)

❌ Remove all verifyToken() usage

❌ Remove any logic tied to the auth_token cookie

✅ Use the updated getCurrentUser.ts provided by Aiden (uses cookies().get('session'))

✅ Update /api/auth/sign-in/route.ts to set session cookie

✅ Update /api/auth/sign-out/route.ts to delete session cookie

✅ Confirm session is valid after:

    Sign-in

    Plan selection

    Profile creation

    Navigating between Cliqs and feeds

 ### 🔥 Required Fixes

- ❌ Remove `verifyToken()` from all files
- ❌ Delete any logic related to the `auth_token` cookie
- ✅ Use `cookies().get('session')` inside `getCurrentUser.ts`
- ✅ In `/api/auth/sign-in/route.ts`, set the session cookie:

# 🔐 APA Session Enforcement – Developer Handbook

## 📌 Overview

Cliqstr is not a traditional social platform.

We do not use third-party auth, OAuth, or cookie-less JWT login schemes.

We use APA — Aiden’s Power Auth, a custom, child-safety-first authentication system that enforces:

- ✅ Role-based access (child, adult, parent)
- ✅ Approval-based child account logic
- ✅ Visibility restrictions
- ✅ Invite logic with auditability
- ✅ Silent parental monitoring
- ✅ Session validation at every step

---

## ⚠️ Current Problem

The current login system still relies on:

- ❌ `verifyToken()` from `lib/auth/jwt.ts`
- ❌ A JWT stored in the `auth_token` cookie
- ❌ Stateless client-side validation
- ❌ Middleware based on decoding tokens

As a result, login is unreliable. Users are:

- Redirected to `/sign-in` after selecting a plan
- Kicked out of `/my-cliqs` and `/profile` pages
- Logged out silently during transitions
- Unable to persist authentication across reloads or deploys

---

## 🔒 Why Session Persistence is Critical in APA

APA requires continuous session validation to enforce child safety and parental logic.

| Reason                     | Explanation                                                  |
|---------------------------|--------------------------------------------------------------|
| 🧒 Child Role Enforcement  | Must know if user is a child, and if they’re approved        |
| 🧍 Adult vs. Parent Logic  | Parents must access `/parents-hq`, adults must not           |
| 🔐 Silent Monitoring       | Parent observers require invisibility & session persistence  |
| 🧾 Stripe Plan Enforcement | Plans are tied to userId, and control access to features     |
| 🧠 Memory Consistency      | Profile, scrapbook, feed — all depend on session context     |

If the session breaks, APA breaks.  
If APA breaks, the platform cannot function safely or reliably.

---

## ✅ Correct APA Behavior

On successful sign-in:

```ts
cookies().set('session', user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

 const user = await getCurrentUser();
if (!user?.id) redirect('/sign-in'); // or notFound()

cookies().delete('session');

----------------------
Windsurf Task Checklist (Action Items Only)
✅ What’s Already Done

    getCurrentUser.ts is already rewritten to use cookies().get('session').
    No changes needed there.

🔥 Required Fixes

    ❌ Remove all usage of verifyToken() from lib/auth/jwt.ts and any other files

    ❌ Delete any logic tied to the auth_token cookie

    ✅ Update /api/auth/sign-in/route.ts to set the session cookie (as above)

    ✅ Update /api/auth/sign-out/route.ts to delete the session cookie

    ✅ Ensure all protected API routes and pages call getCurrentUser() and validate session

📌 Update These Pages and Routes

Protected Pages:

    /my-cliqs/page.tsx

    /profile/[handle]/page.tsx

    /parents-hq/page.tsx

    /cliqs/[id]/invite/page.tsx

API Routes:

    /api/cliqs/*

    /api/profile/*

    /api/posts/*

    /api/invites/*

✅ Validate These Flows

User stays logged in after sign-in

Navigating between pages works without redirects

Refreshing the browser keeps session active

MyCliqs and Profile show correct user data

Logout fully clears session

No ghost redirects or silent logouts

No Supabase or token-based logic remaining

----------------------

APA is not optional.
It is foundational to Cliqstr's mission and launch.

If APA is broken or bypassed, no user is safe, and we cannot deploy publicly.

Do not shortcut this.
Fix it correctly. Fix it everywhere please. 

    