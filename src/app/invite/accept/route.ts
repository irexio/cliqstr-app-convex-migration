// Invite acceptance route handler
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// This route handles /invite/accept?code=XYZ
// It will redirect to the appropriate page based on the invite code
export async function GET(request: Request) {
  try {
    // Get the URL and extract the code parameter
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      console.error('[INVITE_ACCEPT] Missing invite code');
      // Redirect to home page if no code is provided
      return NextResponse.redirect(new URL('/', url.origin));
    }
    
    console.log(`[INVITE_ACCEPT] Processing invite code: ${code}`);
    
    // For now, redirect to the existing invite page with the code
    // This maintains compatibility with the existing invite flow
    return NextResponse.redirect(new URL(`/invite/${code}`, url.origin));
    
  } catch (error) {
    console.error('[INVITE_ACCEPT] Error processing invite:', error);
    // Redirect to home page on error
    return NextResponse.redirect(new URL('/', request.url));
  }
}
