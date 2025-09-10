// Debug route to check what data exists in Convex database
import { NextResponse } from 'next/server';
import { convexHttp } from '@/lib/convex-server';
import { api } from 'convex/_generated/api';

export async function GET() {
  try {
    console.log("🔍 Checking Convex database for existing data...");
    
    // Check users
    const users = await convexHttp.query(api.users.getAllUsers);
    console.log(`👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user._id})`);
    });
    
    // Check if robynpthomas@gmail.com exists
    const robynUser = await convexHttp.query(api.users.getUserByEmail, { email: "robynpthomas@gmail.com" });
    let robynData = null;
    if (robynUser) {
      console.log(`🎯 Found robynpthomas@gmail.com:`);
      console.log(`  - ID: ${robynUser._id}`);
      console.log(`  - Email: ${robynUser.email}`);
      console.log(`  - Verified: ${robynUser.isVerified}`);
      
      // Get account info
      const account = await convexHttp.query(api.users.getCurrentUser, { userId: robynUser._id });
      if (account) {
        console.log(`  - Role: ${account.role}`);
        console.log(`  - Approved: ${account.approved}`);
        console.log(`  - Profile: ${account.myProfile ? `@${account.myProfile.username}` : 'None'}`);
        robynData = {
          id: robynUser._id,
          email: robynUser.email,
          verified: robynUser.isVerified,
          role: account.role,
          approved: account.approved,
          profile: account.myProfile ? `@${account.myProfile.username}` : null
        };
      }
    } else {
      console.log(`❌ robynpthomas@gmail.com not found`);
    }
    
    // Check profiles
    const profiles = await convexHttp.query(api.profiles.getAllProfiles);
    console.log(`👤 Profiles (${profiles.length}):`);
    profiles.forEach(profile => {
      console.log(`  - @${profile.username} (User: ${profile.userId})`);
    });
    
    // Check if @mimi exists
    const mimiProfile = await convexHttp.query(api.profiles.getProfileByUsername, { username: "mimi" });
    let mimiData = null;
    if (mimiProfile) {
      console.log(`🎯 Found @mimi profile:`);
      console.log(`  - ID: ${mimiProfile._id}`);
      console.log(`  - Username: @${mimiProfile.username}`);
      console.log(`  - User ID: ${mimiProfile.userId}`);
      mimiData = {
        id: mimiProfile._id,
        username: mimiProfile.username,
        userId: mimiProfile.userId
      };
    } else {
      console.log(`❌ @mimi profile not found`);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalProfiles: profiles.length,
        robynUser: robynData,
        mimiProfile: mimiData,
        allUsers: users.map(u => ({ id: u._id, email: u.email })),
        allProfiles: profiles.map(p => ({ id: p._id, username: p.username, userId: p.userId }))
      }
    });
    
  } catch (error) {
    console.error("❌ Error checking data:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
