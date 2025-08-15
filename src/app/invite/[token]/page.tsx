import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = params;

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

    // Check if invite exists and is valid
    if (!invite) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600">Invalid Invitation</h1>
            <p className="mt-2 text-gray-600">This invite link is not valid.</p>
          </div>
        </div>
      );
    }

    // Check if invite is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600">Expired Invitation</h1>
            <p className="mt-2 text-gray-600">This invite link has expired.</p>
          </div>
        </div>
      );
    }

    // Check if invite is already completed/used/canceled
    if (invite.status === 'completed' || invite.status === 'canceled' || invite.used) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-red-600">Invite Already Used</h1>
            <p className="mt-2 text-gray-600">This invitation has already been used.</p>
          </div>
        </div>
      );
    }

    // Valid invite - set pending_invite cookie and redirect
    const cookieStore = cookies();
    cookieStore.set('pending_invite', JSON.stringify({ inviteId: invite.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    // Redirect to Parents HQ with hash
    redirect('/parents/hq#create-child');

  } catch (error) {
    console.error('[INVITE_ACCEPT] Error:', error);
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
