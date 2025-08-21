import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ character secret
  cookieName: 'cliqstr-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    // QA toggle: when true, omit maxAge so cookies expire on browser close
    // Otherwise default to 7 days
    ...(process.env.QA_SESSION_SESSION_ONLY === 'true'
      ? {}
      : { maxAge: 7 * 24 * 60 * 60 }),
    path: '/',
    // Ensure one session cookie works on both apex and www in production
    // Do NOT set a domain for dev/preview to avoid localhost/preview host issues
    ...(process.env.NODE_ENV === 'production' ? { domain: '.cliqstr.com' } : {}),
  },
};

export interface SessionData {
  userId: string;
  createdAt: number; // legacy
  // New policy fields
  issuedAt: number;
  lastActivityAt: number;
  expiresAt: number; // absolute expiration epoch ms
  lastAuthAt: number; // for step-up reauth
  idleCutoffMinutes: number;
  refreshIntervalMinutes: number;
  // Magic link / invite support
  inviteId?: string; // set when redeeming an invite; used to prepopulate PHQ
}