import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  try {
    console.log('🔍 Testing email configuration...');
    
    // Check environment variables
    const hasResendKey = !!process.env.RESEND_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    
    console.log('Environment check:');
    console.log('- RESEND_API_KEY present:', hasResendKey);
    console.log('- SITE_URL:', siteUrl);
    
    if (!hasResendKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment variables'
      });
    }
    
    // Try to send a test email
    const result = await sendEmail({
      to: 'test@example.com', // This will fail but show us the error
      subject: 'Test Email Debug',
      html: '<p>This is a test email to debug the configuration.</p>'
    });
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Email system working' : 'Email system failed',
      error: result.error,
      messageId: result.messageId,
      environment: {
        hasResendKey,
        siteUrl,
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error) {
    console.error('Email debug test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
