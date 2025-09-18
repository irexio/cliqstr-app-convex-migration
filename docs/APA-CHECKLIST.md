# APA Quick Checklist

Use this checklist when adding or reviewing routes.

## Server-first Guards
- [ ] Page `page.tsx`: `const user = await getCurrentUser(); enforceAPA(user);`
- [ ] API route: `const user = await getCurrentUser(); enforceAPA(user);`
- [ ] No auth in middleware (only static/API pass-through + canonical redirect)

## Server/Client Split
- [ ] Client hooks (Convex `useQuery`, state) live in `_client.tsx`
- [ ] Server passes `user` and stable props into client component

## Special Cases
- [ ] Public cliqs: allowed for authenticated users with plan; still APA-guarded
- [ ] Profiles `/profile/[username]`: APA required; visibility driven by profile settings
- [ ] Invites acceptance: APA required; if unauthenticated, redirect to signup/login then back
- [ ] Account hub `/account/*`: APA required; TODO wiring left for Resend/Stripe/Sessions

## Email & Base URL
- [ ] Email links use `BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cliqstr.com"`
- [ ] Server code prefers `req.nextUrl.origin`; prod uses `NEXT_PUBLIC_SITE_URL` if present

## Session
- [ ] iron-session cookie `cliqstr-session`
- [ ] `SessionData` contains issued/lastActivity/expires/idle cutoff
- [ ] Optional KV cache enabled if KV env present

## Testing
- [ ] `npm run build` is clean
- [ ] Sign-in → choose plan → dashboard redirects as expected
- [ ] Invite acceptance redirects if unauthenticated; returns to accept after login
- [ ] Profile pages are APA-guarded and respect visibility settings

## Docs & TODOs
- [ ] Leave TODOs for: Change Email (Resend), Change Password (reset), Security (sessions), Billing (Stripe portal)
- [ ] Keep `docs/APA.md` up to date and link from README
