import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ character secret
  cookieName: 'cliqstr-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 60, // 30 minutes
    path: '/',
  },
};

export interface SessionData {
  userId: string;
  createdAt: number;
}