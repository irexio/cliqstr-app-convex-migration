// Debug route to clean up old test data from partial Prisma migration
import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST() {
  try {
    console.log("🧹 Cleaning up old test data...");
    
    const results = {
      deletedUsers: [] as string[],
      deletedProfiles: [] as string[],
      deletedAccounts: [] as string[],
      errors: [] as string[]
    };
    
    // Find and delete robynpthomas@gmail.com user
    const robynUser = await convexHttp.query(api.users.getUserByEmail, { email: "robynpthomas@gmail.com" });
    if (robynUser) {
      try {
        // Get user's profile and account first
        const userData = await convexHttp.query(api.users.getCurrentUser, { userId: robynUser._id });
        
        // Delete profile if exists
        if (userData?.myProfile) {
          await convexHttp.mutation(api.profiles.deleteProfile, { profileId: userData.myProfile.id });
          results.deletedProfiles.push(`@${userData.myProfile.username}`);
        }
        
        // Delete account if exists
        const account = await convexHttp.query(api.accounts.getAccountByUserId, { userId: robynUser._id });
        if (account) {
          await convexHttp.mutation(api.accounts.deleteAccount, { accountId: account._id });
          results.deletedAccounts.push(robynUser.email);
        }
        
        // Delete user
        await convexHttp.mutation(api.users.deleteUser, { userId: robynUser._id });
        results.deletedUsers.push(robynUser.email);
        
        console.log(`✅ Deleted robynpthomas@gmail.com and associated data`);
      } catch (error) {
        results.errors.push(`Failed to delete robynpthomas@gmail.com: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Find and delete @mimi profile (if it exists without robyn user)
    try {
      const mimiProfile = await convexHttp.query(api.profiles.getProfileByUsername, { username: "mimi" });
      if (mimiProfile) {
        await convexHttp.mutation(api.profiles.deleteProfile, { profileId: mimiProfile._id });
        results.deletedProfiles.push("@mimi");
        console.log(`✅ Deleted @mimi profile`);
      }
    } catch (error) {
      results.errors.push(`Failed to delete @mimi profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Clean up any other test data (users with test emails)
    const allUsers = await convexHttp.query(api.users.getAllUsers, {});
    const testEmails = ['test@example.com', 'admin@test.com', 'parent@test.com'];
    
    for (const user of allUsers) {
      if (testEmails.includes(user.email.toLowerCase())) {
        try {
          const userData = await convexHttp.query(api.users.getCurrentUser, { userId: user._id });
          
          // Delete profile if exists
          if (userData?.myProfile) {
            await convexHttp.mutation(api.profiles.deleteProfile, { profileId: userData.myProfile.id });
            results.deletedProfiles.push(`@${userData.myProfile.username}`);
          }
          
          // Delete account if exists
          const account = await convexHttp.query(api.accounts.getAccountByUserId, { userId: user._id });
          if (account) {
            await convexHttp.mutation(api.accounts.deleteAccount, { accountId: account._id });
            results.deletedAccounts.push(user.email);
          }
          
          // Delete user
          await convexHttp.mutation(api.users.deleteUser, { userId: user._id });
          results.deletedUsers.push(user.email);
          
          console.log(`✅ Deleted test user: ${user.email}`);
        } catch (error) {
          results.errors.push(`Failed to delete ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      results
    });
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
