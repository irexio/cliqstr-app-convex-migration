import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentEmail, childName, isInvited } = body;

    console.log('📩 Incoming request to send-parent-email');
    console.log('Parent Email:', parentEmail);
    console.log('Child Name:', childName);
    console.log('Is Invited:', isInvited);

    if (!parentEmail || !childName) {
      console.warn('❌ Missing parentEmail or childName');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const approvalLink = `https://cliqstr.com/approve?child=${encodeURIComponent(childName)}`;

    const message = isInvited
      ? `${childName} was invited to join a Cliq on Cliqstr.`
      : `${childName} recently signed up for Cliqstr.`;

    const { data, error } = await resend.emails.send({
      from: 'no-reply@cliqstr.com', // ✅ This must be a verified sender in Resend
      to: parentEmail,
      subject: 'Cliqstr - Parent Approval Needed',
      html: `
        <p>Hi there,</p>
        <p>${message} As a safety-first platform, we require parent approval for children under 18.</p>
        <p>Please click the button below to complete the approval process:</p>
        <p><a href="${approvalLink}" style="background-color:#4F46E5;color:white;padding:10px 15px;border-radius:6px;text-decoration:none;">Approve Account</a></p>
        <p>If you did not expect this email, you can safely ignore it.</p>
        <p>– The Cliqstr Team</p>
      `,
    });

    if (error) {
      console.error('❌ Resend send failed:', error);
      return NextResponse.json({ error: 'Email failed to send' }, { status: 500 });
    }

    console.log('✅ Email sent successfully via Resend:', data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Unexpected error in send-parent-email:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
