import { NextResponse } from 'next/server';

/**
 * API Route for signing out users
 * Clears auth_token cookie and any other session data
 */
export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully signed out' 
    });
    
    // Set an expired cookie to clear it
    response.cookies.set({
      name: 'session',
      value: '',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/' 
    });
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to sign out' 
      },
      { status: 500 }
    );
  }
}
