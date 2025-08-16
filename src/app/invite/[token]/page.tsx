import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  
  console.log('[INVITE_TOKEN] Processing token:', token);

  try {
    // Validate invite token
    const invite = await prisma.invite.findUnique({
      where: { token },
      select: {
        id: true,
        status: true,
        used: true,
        targetState: true,
        expiresAt: true,
      }
    });

    console.log('[INVITE_TOKEN] Prisma result:', {
      found: !!invite,
      id: invite?.id,
      status: invite?.status,
      used: invite?.used,
      expired: invite?.expiresAt ? invite.expiresAt < new Date() : false
    });

    // Check if invite exists - redirect to join-invalid
    if (!invite) {
      console.log('[INVITE_TOKEN] No invite found, redirecting to /join-invalid');
      redirect('/join-invalid');
    }

    // Check if invite is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      console.log('[INVITE_TOKEN] Invite expired, redirecting to /join-expired');
      redirect('/join-expired');
    }

    // Check if invite is already completed/used/canceled - redirect to join-expired
    if (invite.status === 'completed' || invite.status === 'canceled' || invite.used) {
      console.log('[INVITE_TOKEN] Invite already used/completed/canceled, redirecting to /join-expired');
      redirect('/join-expired');
    }

    // Valid invite - set pending_invite cookie and redirect
    const cookieStore = cookies();
    const cookieValue = JSON.stringify({ inviteId: invite.id });
    
    console.log('[INVITE_TOKEN] Setting cookie:', { cookieValue, inviteId: invite.id });
    
    cookieStore.set('pending_invite', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    console.log('[INVITE_TOKEN] Cookie set, redirecting to /parents/hq#create-child');
    
    // Redirect to Parents HQ with hash
    redirect('/parents/hq#create-child');

  } catch (error) {
    console.error('[INVITE_TOKEN] Unexpected error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">Something went wrong processing this invite.</p>
        </div>
      </div>
    );
  }
}
