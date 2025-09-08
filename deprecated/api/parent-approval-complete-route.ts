import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// DEPRECATION STUB: POST /api/parent-approval/complete
// This endpoint is deprecated. Use canonical invite acceptance endpoint:
// - API: /api/accept-invite

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
      message: 'This endpoint has been deprecated. Use /api/accept-invite.',
      newApi: '/api/accept-invite',
    },
    { status: 410 }
  );
}
