# Testing Guide - Rate Limiting Fix

## The Problem
The rate limiter was set to only allow **10 attempts per minute per IP**, which was too restrictive for testing multiple scenarios on the same computer/IP.

## The Solution
Rate limiting is now much more permissive during testing:

### For Local Development
- **Complete bypass** for localhost and private IPs
- **100 attempts per minute** for other development IPs

### For Vercel Testing
- **500 attempts per minute** when `VERCEL_ENV=preview` or `TESTING_MODE=true`
- **10 attempts per minute** in production (unchanged)

## How to Enable Testing Mode on Vercel

### Option 1: Use Preview Deployments
Preview deployments automatically get `VERCEL_ENV=preview`, so they'll use the permissive limits.

### Option 2: Set Testing Mode Environment Variable
Add this environment variable in your Vercel dashboard:
```
TESTING_MODE=true
```

## Manual Rate Limit Reset (if needed)
If you still hit limits during testing, you can reset them:

```bash
# Reset rate limit for your IP
curl -X POST https://your-app.vercel.app/api/dev/reset-rate-limit \
  -H "Content-Type: application/json" \
  -d '{"ip": "your-ip-address"}'

# Check current rate limit status
curl https://your-app.vercel.app/api/dev/reset-rate-limit?ip=your-ip-address
```

## Your 7 Critical Test Scenarios
Now you should be able to test all of these without rate limit issues:

1. ✅ **Sign up Adult** - Should work smoothly
2. ✅ **Sign up Child** - Should work smoothly  
3. ✅ **Invite Adult** - Should work smoothly
4. ✅ **Invite Child to New Parent** - Should work smoothly
5. ✅ **Invite Child to Existing Parent** - Should work smoothly
6. ✅ **Invite Adult to Existing Adult** - Should work smoothly
7. ✅ **Password Change Request** - Should work smoothly

## Future SMS Testing
When you get Twilio working, you'll also be able to test:
- SMS invites (all types)
- SMS for Red Alert or AI Moderation Notices

## Production Safety
- Production deployments still use the strict 10 attempts per minute limit
- Testing mode is only available in preview/development environments
- The rate limiter will log when it's using permissive limits for transparency
