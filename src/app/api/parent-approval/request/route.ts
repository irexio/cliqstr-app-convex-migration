export const dynamic = 'force-dynamic';

/**
 * 🔐 APA-HARDENED ROUTE: POST /api/parent-approval/request
 *
 * Purpose:
 *   - Handles child sign-up requests that require parent approval
 *   - Sends approval email to parent/guardian
 *   - Stores pending approval in database
 *
 * Body Params:
 *   - childFirstName: string (required)
 *   - childBirthdate: string (required) 
 *   - parentEmail: string (required)
 *
 * Returns:
 *   - 200 OK if approval request sent successfully
 *   - 400 if missing required fields
 *   - 500 if server error
 *
 * Security:
 *   - No account created until parent approves
 *   - APA-compliant child protection flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { generateInviteCode } from '@/lib/auth/generateInviteCode';
import { z } from 'zod';

const parentApprovalSchema = z.object({
  childFirstName: z.string().min(1, 'Child first name is required'),
  childLastName: z.string().min(1, 'Child last name is required'),
  childBirthdate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, 'Valid birthdate is required'),
  parentEmail: z.string().email('Valid parent email is required'),
});

// Simple GET handler for testing
export async function GET() {
  return NextResponse.json({ message: 'Parent approval API is working' });
}

export async function POST(req: NextRequest) {
  try {
    console.log('[PARENT_APPROVAL] Starting request processing');
    const body = await req.json();
    console.log('[PARENT_APPROVAL] Request body:', body);
    
    const parsed = parentApprovalSchema.safeParse(body);
    console.log('[PARENT_APPROVAL] Schema validation result:', { success: parsed.success });

    if (!parsed.success) {
      console.error('[PARENT_APPROVAL] Validation failed:', parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { childFirstName, childLastName, childBirthdate, parentEmail } = parsed.data;

    // Calculate age to verify child status
    const birthDateObj = new Date(childBirthdate);
    const ageDifMs = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age >= 18) {
      return NextResponse.json({ error: 'This route is only for children under 18' }, { status: 400 });
    }

    // Generate unique approval code
    const approvalCode = await generateInviteCode();

    // Store pending approval in database
    // We'll use the Invite table with a special type for parent approvals
    await prisma.invite.create({
      data: {
        code: approvalCode,
        invitedRole: 'Child',
        inviteType: 'parent-approval',
        friendFirstName: childFirstName,
        trustedAdultContact: parentEmail,
        inviteeEmail: parentEmail, // Required field
        inviteNote: `Child approval request for ${childFirstName}, age ${age}`,
        status: 'pending',
        maxUses: 1, // Required field
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        // We'll set inviterId and cliqId later when parent approves
        inviterId: 'system', // placeholder
        cliqId: 'pending', // placeholder
      },
    });

    // Send approval email to parent
    console.log(`[PARENT_APPROVAL] Attempting to send email to ${parentEmail} for child ${childFirstName} ${childLastName}`);
    
    const emailResult = await sendParentEmail({
      to: parentEmail,
      childName: `${childFirstName} ${childLastName}`,
      childId: approvalCode, // Use approval code as temporary ID
      inviteCode: approvalCode,
    });

    if (!emailResult.success) {
      console.error(`[PARENT_APPROVAL] Email failed:`, emailResult.error);
      return NextResponse.json({ 
        error: `Failed to send email: ${emailResult.error?.message || emailResult.error || 'Unknown email error'}` 
      }, { status: 500 });
    }

    console.log(`[PARENT_APPROVAL] Request sent successfully for child ${childFirstName} to parent ${parentEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Parent approval request sent successfully',
    });

  } catch (error) {
    console.error('[PARENT_APPROVAL_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to send parent approval request: ${errorMessage}` 
    }, { status: 500 });
  }
}
