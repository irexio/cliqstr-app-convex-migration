import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

/**
 * Simple test endpoint to verify Resend API is working
 * Access via: /api/test-email?email=your@email.com
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
    }
    
    // Log environment variables (without exposing full API key)
    const apiKey = process.env.RESEND_API_KEY;
    console.log('🔑 RESEND_API_KEY exists:', !!apiKey);
    console.log('🔑 RESEND_API_KEY first 4 chars:', apiKey?.substring(0, 4));
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }
    
    const resend = new Resend(apiKey);
    
    // Try with Resend's onboarding email first (always works if API key is valid)
    const { data: onboardingData, error: onboardingError } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Cliqstr Test Email (Onboarding)',
      html: `
        <p>This is a test email from Cliqstr using Resend's onboarding address.</p>
        <p>If you received this, the Resend API key is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    
    if (onboardingError) {
      console.error('❌ Resend onboarding error:', onboardingError);
      return NextResponse.json({ 
        success: false, 
        error: 'Onboarding email failed',
        details: onboardingError
      }, { status: 500 });
    }
    
    // If onboarding email works, try with the verified domain
    const { data: domainData, error: domainError } = await resend.emails.send({
      from: 'Cliqstr <noreply@email.cliqstr.com>',
      to: email,
      subject: 'Cliqstr Test Email (Verified Domain)',
      html: `
        <p>This is a test email from Cliqstr using your verified domain.</p>
        <p>If you received this, your domain verification is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    
    return NextResponse.json({
      success: true,
      onboardingEmail: {
        success: true,
        id: onboardingData?.id
      },
      domainEmail: {
        success: !domainError,
        id: domainData?.id,
        error: domainError
      }
    });
    
  } catch (err) {
    console.error('💥 Test email exception:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
