/**
 * 🔐 APA-HARDENED ROUTE: GET /api/parent-approval/validate
 *
 * Purpose:
 *   - Validates parent approval request
 *   - Returns child information for preview
 *
 * Query Params:
 *   - inviteCode: string (required)
 *   - childId: string (required)
 *
 * Returns:
 *   - 200 OK with child info if valid
 *   - 400 if missing required params
 *   - 404 if invite not found
 *   - 500 if server error
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// DEPRECATION STUB: GET /api/parent-approval/validate
// This endpoint is deprecated. Use canonical invite validation endpoint:
// - API: /api/validate-invite

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('inviteCode') || '';
  console.warn('[DEPRECATED_API_HIT]', {
    file: __filename,
    path: url.pathname,
    method: 'GET',
    code,
  });
  return NextResponse.json(
    {
      deprecated: true,
      message: 'This endpoint has been deprecated. Use /api/validate-invite.',
      newApi: '/api/validate-invite',
      params: { code },
    },
    { status: 410 }
  );
}
