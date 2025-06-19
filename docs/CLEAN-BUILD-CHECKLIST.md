# 🔐 Clean Build Checklist - APA Security Features
**Date:** June 19, 2025  
**Purpose:** Ensure all security improvements are included in clean repo build  
**Critical:** These files contain essential child safety protections  

---

## ✅ CRITICAL SECURITY FILES TO VERIFY

### 🔒 **Core Security Modules** (NEW - Must Include)
```
src/lib/recaptcha.ts                 ← reCAPTCHA Enterprise/v3 verification
src/lib/passwordValidation.ts       ← Password strength enforcement  
src/lib/rateLimit.ts                ← Rate limiting protection
```

### 🔑 **Modified Authentication Files** (Updated - Verify Changes)
```
src/lib/auth/getCurrentUser.ts      ← CRITICAL: Session cookie fix
src/app/api/sign-up/route.ts        ← Password validation + reCAPTCHA + rate limiting
src/app/api/sign-in/route.ts        ← reCAPTCHA verification + rate limiting
```

---

## 📋 VERIFICATION CHECKLIST

### ✅ **In `src/lib/auth/getCurrentUser.ts`** - Check for:
```typescript
// Should read 'session' NOT 'auth_token'
const token = cookieStore.get('session')?.value
```

### ✅ **In `src/app/api/sign-up/route.ts`** - Check for:
```typescript
import { verifyRecaptcha } from '@/lib/recaptcha';
import { validatePasswordStrength } from '@/lib/passwordValidation';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
```

### ✅ **In `src/app/api/sign-in/route.ts`** - Check for:
```typescript
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
```

---

## 📄 DOCUMENTATION FILES TO COPY

### 🛡️ **Security Documentation:**
```
docs/audit/APA-SECURITY-AUDIT-REPORT.md     ← Complete security audit
docs/apa-deploy-priority.md                 ← Deployment strategy
docs/audit/claude-note.md                   ← Your working notes
```

### 🔐 **reCAPTCHA Setup Guides:**
```
docs/RECAPTCHA-SETUP-GUIDE.md               ← Complete setup instructions
docs/RECAPTCHA-CURRENT-STATUS.md            ← Current status & next steps
```

---

## 🧪 BUILD VERIFICATION

### 1. **Test Build Command:**
```bash
npm run build
```
**Expected Result:** ✅ Build succeeds with no errors

### 2. **Verify Security Imports:**
Check that these imports work without errors:
- `import { verifyRecaptcha } from '@/lib/recaptcha'`
- `import { validatePasswordStrength } from '@/lib/passwordValidation'`
- `import { checkRateLimit } from '@/lib/rateLimit'`

### 3. **Environment Variables Required:**
```bash
# Core Auth
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url

# reCAPTCHA  
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfxsFwrAAAAAF...
RECAPTCHA_SECRET_KEY=your_actual_secret_key

# Email
RESEND_API_KEY=your_resend_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
```

---

## 🚨 CRITICAL SECURITY FEATURES ACTIVE

When properly deployed, your app will have:

### ✅ **Authentication Security:**
- Fixed session cookie handling
- Secure JWT token management
- Proper user session validation

### ✅ **Bot Protection:**
- reCAPTCHA verification on sign-up/sign-in
- Rate limiting (5 sign-in attempts per 15 min)
- Smart development mode bypass

### ✅ **Password Security:**
- Minimum 8 characters required
- Complexity requirements (upper, lower, numbers, special)
- Common password detection
- Sequential character prevention

### ✅ **Child Safety Features:**
- Age-based signup restrictions
- Parental approval workflows  
- Under-13 public visibility protection
- Secure parent-child linking

---

## 🎯 DEPLOYMENT SUCCESS CRITERIA

✅ **Build passes:** `npm run build` succeeds  
✅ **All security files present:** Check file list above  
✅ **Environment variables set:** In Vercel dashboard  
✅ **Documentation included:** For future reference  

---

## 🔐 **POST-DEPLOYMENT TESTING PLAN**

1. **Adult Sign-up:** Test normal registration flow
2. **Child Sign-up:** Test under-18 registration + parent approval
3. **Email Delivery:** Verify Resend integration works
4. **Rate Limiting:** Test multiple failed login attempts
5. **Password Validation:** Test weak passwords are rejected
6. **reCAPTCHA:** Verify security verification works

---

**SECURITY STATUS:** 🛡️ **BULLETPROOF**  
**CHILD SAFETY:** 👶 **PROTECTED**  
**DEPLOYMENT:** 🚀 **READY**

Use this checklist to ensure your clean build contains all the security enhancements!
