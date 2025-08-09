// DEPRECATION: parent/approval-complete
import { NextResponse } from 'next/server';

export async function POST() {
  console.warn('[DEPRECATED_API_HIT] /api/parent/approval-complete');
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      use: ['/api/accept-invite', '/invite/accept?code=...'],
      message: 'This endpoint is deprecated. Use /api/accept-invite.'
    },
    { status: 410 }
  );
}

export async function GET() {
  console.warn('[DEPRECATED_API_HIT] /api/parent/approval-complete');
  return NextResponse.json(
    {
      ok: false,
      deprecated: true,
      use: ['/api/accept-invite', '/invite/accept?code=...'],
      message: 'This endpoint is deprecated. Use /api/accept-invite.'
    },
    { status: 410 }
  );
}
