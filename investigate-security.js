/**
 * 🔐 Security Investigation Script
 * 
 * Safely investigates unknown users in the database
 * Compatible with crypto-based auth system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateUnknownUsers() {
  try {
    console.log('🔍 SECURITY INVESTIGATION REPORT');
    console.log('================================\n');

    // 1. Get all users with basic info
    console.log('📋 ALL USERS IN DATABASE:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        isVerified: true,
        account: {
          select: {
            role: true,
            isApproved: true,
            plan: true,
            createdAt: true
          }
        },
        myProfile: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Role: ${user.account?.role || 'No account'}`);
      console.log(`   Approved: ${user.account?.isApproved || false}`);
      console.log(`   Plan: ${user.account?.plan || 'None'}`);
      console.log(`   Profile: ${user.myProfile?.firstName || 'No profile'} ${user.myProfile?.lastName || ''}`);
      console.log('');
    });

    // 2. Check invite usage
    console.log('\n📨 INVITE CODE USAGE:');
    const invites = await prisma.invite.findMany({
      where: {
        OR: [
          { status: 'accepted' },
          { used: true }
        ]
      },
      select: {
        code: true,
        inviteeEmail: true,
        status: true,
        used: true,
        createdAt: true,
        inviteType: true,
        inviter: {
          select: {
            email: true
          }
        },
        cliq: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (invites.length === 0) {
      console.log('No used invite codes found.');
    } else {
      invites.forEach((invite, index) => {
        console.log(`${index + 1}. Code: ${invite.code}`);
        console.log(`   Invitee: ${invite.inviteeEmail}`);
        console.log(`   Status: ${invite.status} | Used: ${invite.used}`);
        console.log(`   Inviter: ${invite.inviter.email}`);
        console.log(`   Cliq: ${invite.cliq?.name || 'Unknown'}`);
        console.log(`   Created: ${invite.createdAt.toISOString()}`);
        console.log(`   Type: ${invite.inviteType || 'adult'}`);
        console.log('');
      });
    }

    // 3. Check for any pending invites
    console.log('\n⏳ PENDING INVITES:');
    const pendingInvites = await prisma.invite.findMany({
      where: {
        status: 'pending',
        used: false
      },
      select: {
        code: true,
        inviteeEmail: true,
        createdAt: true,
        expiresAt: true,
        inviter: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (pendingInvites.length === 0) {
      console.log('No pending invites found.');
    } else {
      pendingInvites.forEach((invite, index) => {
        console.log(`${index + 1}. Code: ${invite.code}`);
        console.log(`   For: ${invite.inviteeEmail}`);
        console.log(`   From: ${invite.inviter.email}`);
        console.log(`   Created: ${invite.createdAt.toISOString()}`);
        console.log(`   Expires: ${invite.expiresAt?.toISOString() || 'Never'}`);
        console.log('');
      });
    }

    // 4. Check cliqs and memberships
    console.log('\n🏠 CLIQS AND MEMBERSHIPS:');
    const cliqs = await prisma.cliq.findMany({
      select: {
        name: true,
        createdAt: true,
        owner: {
          select: {
            email: true
          }
        },
        memberships: {
          select: {
            user: {
              select: {
                email: true
              }
            },
            role: true,
            joinedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    cliqs.forEach((cliq, index) => {
      console.log(`${index + 1}. Cliq: ${cliq.name}`);
      console.log(`   Owner: ${cliq.owner.email}`);
      console.log(`   Created: ${cliq.createdAt.toISOString()}`);
      console.log(`   Members:`);
      cliq.memberships.forEach(membership => {
        console.log(`     - ${membership.user.email} (${membership.role}) - joined ${membership.joinedAt.toISOString()}`);
      });
      console.log('');
    });

    console.log('🔍 Investigation complete!');
    console.log('\n💡 Look for:');
    console.log('- Users you don\'t recognize');
    console.log('- Recent signups without corresponding invites');
    console.log('- Unusual email domains');
    console.log('- Users with profiles but no known invite source');

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the investigation
investigateUnknownUsers();
