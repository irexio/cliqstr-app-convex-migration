import { NextResponse, NextRequest } from 'next/server';
import { sendParentEmail } from '@/lib/auth/sendParentEmail';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';
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
 * Creates a pending child signup record and sends parent email
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

    // For now, we'll create a temporary ID and store the child data
    // In a full implementation, this would be stored in a pending signups table
    const tempChildId = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[PARENT-APPROVAL] Created temporary child signup ID: ${tempChildId}`);

    // Send parent approval email using the existing sendParentEmail function
    // This will link to /parents/hq where parent can complete the setup
    const result = await sendParentEmail({
      to: parentEmail,
      childName: childFirstName,
      childId: tempChildId,
      // No inviteCode for direct child signups
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
      pendingChildId: tempChildId,
    });

  } catch (error) {
    console.error('[PARENT-APPROVAL] Error processing approval request:', error);
    return NextResponse.json({ 
      error: 'Failed to process parent approval request' 
    }, { status: 500 });
  }
}
