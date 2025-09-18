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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  },
};