// Check admin user configuration for login issues
const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');

async function checkAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking admin user configuration...\n');
    
    const adminEmail = 'admin@cliqstr.com';
    const testPassword = 'admin123';
    
    // Find admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        account: true,
        myProfile: true
      }
    });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.createdAt}`);
    console.log(`   Verified: ${admin.isVerified}`);
    console.log(`   VerificationToken: ${admin.verificationToken || 'null'}`);
    console.log(`   DeletedAt: ${admin.deletedAt || 'null'}`);
    console.log(`   Password hash length: ${admin.password?.length || 0}`);
    console.log('');
    
    // Check account
    if (admin.account) {
      console.log('✅ Account record found:');
      console.log(`   Role: ${admin.account.role}`);
      console.log(`   Approved: ${admin.account.isApproved}`);
      console.log(`   Suspended: ${admin.account.suspended}`);
      console.log(`   Birthdate: ${admin.account.birthdate}`);
    } else {
      console.log('❌ Account record MISSING!');
    }
    console.log('');
    
    // Check profile
    if (admin.myProfile) {
      console.log('✅ Profile record found:');
      console.log(`   Username: ${admin.myProfile.username}`);
      console.log(`   Birthdate: ${admin.myProfile.birthdate}`);
    } else {
      console.log('❌ Profile record MISSING!');
    }
    console.log('');
    
    // Test password verification
    console.log('🔐 Testing password verification...');
    try {
      const passwordMatch = await compare(testPassword, admin.password);
      console.log(`   Password '${testPassword}' matches: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
    } catch (error) {
      console.log(`   Password verification error: ${error.message}`);
    }
    console.log('');
    
    // Check for any blocking conditions
    console.log('🚨 Checking for blocking conditions:');
    const blockers = [];
    
    if (admin.deletedAt) blockers.push('User is deleted');
    if (admin.verificationToken) blockers.push('Email verification pending');
    if (!admin.account) blockers.push('Missing account record');
    if (admin.account?.suspended) blockers.push('Account suspended');
    if (admin.account?.role === 'Child' && !admin.account?.isApproved) blockers.push('Child not approved');
    
    if (blockers.length > 0) {
      console.log('❌ Found blocking conditions:');
      blockers.forEach(blocker => console.log(`   - ${blocker}`));
    } else {
      console.log('✅ No blocking conditions found');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
