# Deprecated Folder

This folder holds routes, components, and functions moved out of the main codebase.

Rules:
- Never delete code directly.
- Move it here with `git mv`.
- Add a note explaining why it was deprecated and when.

## Phase 3 Cleanup - Moved on 2025-01-17

### Debug API Routes (moved to `api/debug/`)
- `debug/auth-status/route.ts` → moved because debug route for auth status checking
- `debug/check-data/route.ts` → moved because debug route for data inspection
- `debug/cleanup-test-data/route.ts` → moved because debug route for test data cleanup
- `debug/clear-all-data/route.ts` → moved because debug route for clearing all data
- `debug/session-test/route.ts` → moved because debug route for session testing

### Dev API Routes (moved to `api/dev/`)
- `dev/reset-rate-limit/route.ts` → moved because development utility for rate limiting

### Debug Pages (moved to `pages/debug/`)
- `debug/session-check/page.tsx` → moved because debug page for session checking
- `debug/invite-flow/page.tsx` → moved because debug page for invite flow testing

### Test Pages (moved to `pages/test/`)
- `test-upload/page.tsx` → moved because test page for upload functionality
- `test-simple/page.tsx` → moved because test page for simple functionality
- `test-avatar/page.tsx` → moved because test page for avatar functionality

### Notes
- Uploadthing routes (`api/uploadthing/`, `api/debug-uploadthing/`, `api/test-uploadthing/`) were kept in production as they are working on Vercel
- All moved routes are debug/test utilities that should not be in production
- These routes can be restored if needed for development/debugging

## Phase 3 Cleanup - Moved on 2025-09-18

### Legacy Page
- `pages/legacy/session-ping/page.tsx` → moved because legacy auth bounce page; replaced by server-first auth + hard navigation

### Test API Routes
- `api/test/test-email/route.ts` → moved because temporary Resend verification endpoint
- `api/test/test-uploadthing/route.ts` → moved because temporary UploadThing environment check
