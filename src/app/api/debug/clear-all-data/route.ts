// Debug route to clear ALL data from Convex database
import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function POST() {
  try {
    console.log("🧹 Clearing ALL data from Convex database...");
    
    const results = {
      deletedUsers: [] as string[],
      deletedProfiles: [] as string[],
      deletedAccounts: [] as string[],
      errors: [] as string[]
    };
    
    // Get all data first
    const [users, profiles, accounts] = await Promise.all([
      convexHttp.query(api.users.getAllUsers),
      convexHttp.query(api.profiles.getAllProfiles),
      convexHttp.query(api.accounts.getAllAccounts)
    ]);
    
    console.log(`Found data: ${users.length} users, ${profiles.length} profiles, ${accounts.length} accounts`);
    
    // Delete in reverse dependency order to avoid foreign key issues
    
    // 1. Delete profiles first
    for (const profile of profiles) {
      try {
        await convexHttp.mutation(api.profiles.deleteProfile, { profileId: profile._id });
        results.deletedProfiles.push(profile._id);
      } catch (error) {
        results.errors.push(`Failed to delete profile ${profile._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 2. Delete accounts
    for (const account of accounts) {
      try {
        await convexHttp.mutation(api.accounts.deleteAccount, { accountId: account._id });
        results.deletedAccounts.push(account._id);
      } catch (error) {
        results.errors.push(`Failed to delete account ${account._id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // 3. Delete users (last)
    for (const user of users) {
      try {
        await convexHttp.mutation(api.users.deleteUser, { userId: user._id });
        results.deletedUsers.push(user.email);
      } catch (error) {
        results.errors.push(`Failed to delete user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    console.log("✅ All user data cleared successfully");
    
    return NextResponse.json({
      success: true,
      message: "All user data cleared successfully",
      results: {
        summary: {
          users: results.deletedUsers.length,
          profiles: results.deletedProfiles.length,
          accounts: results.deletedAccounts.length,
          errors: results.errors.length
        },
        details: results
      }
    });
    
  } catch (error) {
    console.error("❌ Error during full data clear:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
