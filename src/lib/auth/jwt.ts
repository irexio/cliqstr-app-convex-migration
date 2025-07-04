import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '7d'; // 7 days to match cookie expiry

// Export the TokenPayload type for use in other modules
export type TokenPayload = {
  userId: string;
  role?: string;
  isApproved?: boolean;
  purpose?: 'email_verification' | 'password_reset' | 'authentication';
  exp?: number; // Optional explicit expiration timestamp
};

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function signToken(payload: TokenPayload): string {
  // Match cookie duration (7 days) to prevent session verification errors
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
