import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/auth/session-config';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const req = new Request('http://local', { headers: { cookie: cookieStore.toString() } });
    const res = new Response();
    const session = await getIronSession<SessionData>(req as any, res as any, sessionOptions);
    if (session && session.userId) {
      session.lastActivityAt = Date.now();
      await session.save();
    }
  } catch {}
  return new NextResponse(null, { status: 204 });
}


