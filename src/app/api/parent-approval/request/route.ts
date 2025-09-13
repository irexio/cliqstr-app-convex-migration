import { NextResponse, NextRequest } from 'next/server';
import { sendParentApprovalEmail } from '@/lib/auth/sendParentApprovalEmail';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const parentApprovalRequestSchema = z.object({
  childFirstName: z.string().min(1, 'Child first name is required'),
  childLastName: z.string().min(1, 'Child last name is required'),
  childBirthdate: z.string().min(1, 'Child birthdate is required'),
  parentEmail: z.string().email('Valid parent email is required'),
});

/**
 * POST /api/parent-approval/request
 * 
 * Handles parent approval requests for child signups
 * Sends an email to the parent with approval link
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = parentApprovalRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        error: parsed.error.errors[0]?.message || 'Invalid request data' 
      }, { status: 400 });
    }

    const { childFirstName, childLastName, childBirthdate, parentEmail } = parsed.data;

    console.log(`[PARENT-APPROVAL] Processing approval request for child: ${childFirstName} ${childLastName}`);

    // Calculate child's age
    const birthDate = new Date(childBirthdate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const adjustedAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) 
      ? age - 1 
      : age;

    // Generate a simple approval code (in a real app, this would be stored in the database)
    const approvalCode = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send parent approval email
    const result = await sendParentApprovalEmail({
      to: parentEmail,
      childName: `${childFirstName} ${childLastName}`,
      childAge: adjustedAge,
      approvalCode: approvalCode,
    });

    if (!result.success) {
      console.error(`[PARENT-APPROVAL] Failed to send email to ${parentEmail}:`, result.error);
      return NextResponse.json({ 
        error: 'Failed to send parent approval email' 
      }, { status: 500 });
    }

    console.log(`[PARENT-APPROVAL] Successfully sent approval email to ${parentEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Parent approval request sent successfully',
    });

  } catch (error) {
    console.error('[PARENT-APPROVAL] Error processing approval request:', error);
    return NextResponse.json({ 
      error: 'Failed to process parent approval request' 
    }, { status: 500 });
  }
}
