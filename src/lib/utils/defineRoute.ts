// 🔐 Ghost-Safe Route Wrapper for Next.js 15.3+
// Ensures dynamic route params are treated as async promises

import { NextRequest, NextResponse } from 'next/server';

type RouteHandler<TParams extends Record<string, string>> = (
  req: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<NextResponse | Response>;

export function defineRoute<TParams extends Record<string, string>>(
  handler: RouteHandler<TParams>
): RouteHandler<TParams> {
  return handler;
}
