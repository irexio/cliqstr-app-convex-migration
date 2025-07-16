# Cliqstr Auth System — APA-Compliant Only

This folder implements the APA-safe authentication layer for Cliqstr. All user authentication must follow these principles:

✅ Session-based only  
❌ No tokens, JWTs, or refresh logic allowed  
✅ All role and approval checks server-side  
✅ Password reset codes are temporary and deleted after use

🚫 `jwt.ts` exists for reference only — never import or use it.

Refer to `getCurrentUser.ts` and `enforceAPA.ts` for proper session validation.
