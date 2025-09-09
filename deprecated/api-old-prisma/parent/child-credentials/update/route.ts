/**
 * 🔐 APA-HARDENED ROUTE: POST /api/parent/child-credentials/update
 *
 * Purpose:
 *   - Allows a parent to set up or update their child's username and password
 *   - Part of the APA-compliant flow where parents must create credentials for children
 *   - Updates both the user profile (username) and user auth (password)
 *
 * Body Params:
 *   - childId: string (required) - The ID of the child user
 *   - username: string (required) - The new username for the child
 *   - password: string (required) - The new password for the child
 *
 * Returns:
 *   - 200 OK if credentials updated successfully
 *   - 400 if missing required params
 *   - 403 if not authorized (not parent of this child)
 *   - 404 if child not found
 *   - 500 if server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { hash } from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const credentialsSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Get current user (parent)
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Verify parent role
    if (currentUser.role !== 'Parent' && currentUser.role !== 'Adult') {
      return NextResponse.json({ error: 'Only parents can update child credentials' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const parsed = credentialsSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    const { childId, username, password } = parsed.data;
    
    // Verify parent-child relationship
    const parentLink = await prisma.parentLink.findFirst({
      where: {
        parentId: currentUser.id,
        childId: childId,
      },
    });
    
    if (!parentLink) {
      return NextResponse.json({ error: 'Not authorized to update this child\'s credentials' }, { status: 403 });
    }
    
    // Check if username is already taken
    const existingUser = await prisma.myProfile.findFirst({
      where: {
        username: username,
        userId: { not: childId }, // Exclude the current child
      },
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Update child's username in profile
    await prisma.myProfile.update({
      where: { userId: childId },
      data: { username: username },
    });
    
    // Update child's password
    await prisma.user.update({
      where: { id: childId },
      data: { password: hashedPassword },
    });
    
    // Log the action for audit purposes
    console.log(`[APA] Parent ${currentUser.id} updated credentials for child ${childId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Child credentials updated successfully',
    });
  } catch (error) {
    console.error('[CHILD_CREDENTIALS_UPDATE_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: `Failed to update child credentials: ${errorMessage}` 
    }, { status: 500 });
  }
}
