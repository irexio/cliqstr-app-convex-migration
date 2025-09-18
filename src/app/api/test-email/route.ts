import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('🧪 [TEST EMAIL] Testing email send to:', email);
    console.log('🧪 [TEST EMAIL] RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);
    console.log('🧪 [TEST EMAIL] API Key length:', process.env.RESEND_API_KEY?.length || 0);

    const result = await sendEmail({
      to: email,
      subject: 'Test Email from Cliqstr',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000;">Test Email</h2>
          <p>This is a test email to verify Resend is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>If you receive this, email delivery is working!</p>
        </div>
      `
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    });

  } catch (error) {
    console.error('❌ [TEST EMAIL] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

