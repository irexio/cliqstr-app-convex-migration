// Quick script to check what data exists in Convex database
const { ConvexHttpClient } = require("convex/browser");

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("NEXT_PUBLIC_CONVEX_URL not found in environment");
  process.exit(1);
}

const convex = new ConvexHttpClient(convexUrl);

async function checkData() {
  try {
    console.log("🔍 Checking Convex database for existing data...\n");
    
    // Check users
    const users = await convex.query("users:getAllUsers");
    console.log(`👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user._id})`);
    });
    
    // Check if robynpthomas@gmail.com exists
    const robynUser = await convex.query("users:getUserByEmail", { email: "robynpthomas@gmail.com" });
    if (robynUser) {
      console.log(`\n🎯 Found robynpthomas@gmail.com:`);
      console.log(`  - ID: ${robynUser._id}`);
      console.log(`  - Email: ${robynUser.email}`);
      console.log(`  - Verified: ${robynUser.isVerified}`);
      
      // Get account info
      const account = await convex.query("users:getCurrentUser", { userId: robynUser._id });
      if (account) {
        console.log(`  - Role: ${account.role}`);
        console.log(`  - Approved: ${account.approved}`);
        console.log(`  - Profile: ${account.myProfile ? `@${account.myProfile.username}` : 'None'}`);
      }
    } else {
      console.log(`\n❌ robynpthomas@gmail.com not found`);
    }
    
    // Check profiles
    const profiles = await convex.query("profiles:getAllProfiles");
    console.log(`\n👤 Profiles (${profiles.length}):`);
    profiles.forEach(profile => {
      console.log(`  - @${profile.username} (User: ${profile.userId})`);
    });
    
    // Check if @mimi exists
    const mimiProfile = await convex.query("profiles:getProfileByUsername", { username: "mimi" });
    if (mimiProfile) {
      console.log(`\n🎯 Found @mimi profile:`);
      console.log(`  - ID: ${mimiProfile._id}`);
      console.log(`  - Username: @${mimiProfile.username}`);
      console.log(`  - User ID: ${mimiProfile.userId}`);
    } else {
      console.log(`\n❌ @mimi profile not found`);
    }
    
  } catch (error) {
    console.error("❌ Error checking data:", error);
  }
}

checkData();
