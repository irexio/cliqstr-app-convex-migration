import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  issuedAt?: number;
  lastActivityAt?: number;
  expiresAt?: number;
  idleCutoffMinutes?: number;
  // Compatibility fields used by some routes
  createdAt?: number;
  lastAuthAt?: number;
  refreshIntervalMinutes?: number;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'cliqstr-session',
  cookieOptions: {
    // Use secure cookies in production; allows local development over http
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // Session-only cookie: do not set maxAge or expires
  },
};