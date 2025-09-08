export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// DEPRECATION STUB: GET/POST /api/parent-approval/request
// This endpoint is deprecated. Use canonical invite endpoints:
// - Web: /invite/accept?code=...
// - API: /api/validate-invite and /api/accept-invite

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || '';
  console.warn('[DEPRECATED_API_HIT]', {
    file: __filename,
    path: url.pathname,
    method: 'GET',
    code,
  });
  return NextResponse.json(
    {
      deprecated: true,
      message: 'This endpoint has been deprecated. Use /invite/accept (web) or /api/validate-invite + /api/accept-invite (API).',
      newWeb: code ? `/invite/accept?code=${code}` : '/invite/accept',
      newApi: ['/api/validate-invite', '/api/accept-invite'],
    },
    { status: 410 }
  );
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  console.warn('[DEPRECATED_API_HIT]', {
    file: __filename,
    path: url.pathname,
    method: 'POST',
  });
  return NextResponse.json(
    {
      deprecated: true,
      message: 'This endpoint has been deprecated. Use /api/validate-invite and /api/accept-invite.',
      newApi: ['/api/validate-invite', '/api/accept-invite'],
    },
    { status: 410 }
  );
}
