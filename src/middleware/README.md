# Cliqstr Middleware

This directory contains middleware functions that handle requests before they reach the route handlers.

## Authentication Middleware

`auth.middleware.ts` implements the custom APA (Aiden's Power Auth) system that provides:

- COPAA-compliant authentication for children
- Parental approval enforcement
- Role-based access controls
- JWT token validation

### Important Notes

1. This middleware is part of the ghost-type solution for Next.js 15.x parameter handling.
2. Do not modify the matching patterns without understanding the implications for route security.
3. The middleware uses a custom JWT implementation specific to Cliqstr's security requirements.

## Usage

The middleware is automatically applied to routes defined in the `config.matcher` array:

```typescript
export const config = {
  matcher: ['/cliqs/:path*', '/my-cliqs', '/parents-hq'],
};
```
