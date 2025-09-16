#!/usr/bin/env node

/**
 * Temporary script to create admin account for mimi@cliqstr.com
 * Run this once to set up admin access, then delete the file
 */

const { ConvexHttpClient } = require("convex/browser");

// You'll need to replace this with your actual Convex deployment URL
const CONVEX_URL = process.env.CONVEX_URL || "https://your-deployment.convex.cloud";

async function createAdminAccount() {
  const client = new ConvexHttpClient(CONVEX_URL);
  
  try {
    console.log("Creating admin account for mimi@cliqstr.com...");
    
    // First, try to promote existing user to admin
    try {
      const result = await client.mutation("users:promoteToAdmin", {
        email: "mimi@cliqstr.com"
      });
      console.log("✅ Successfully promoted existing user to admin:", result);
      return;
    } catch (error) {
      console.log("User doesn't exist, creating new admin account...");
    }
    
    // If user doesn't exist, create new admin account
    const result = await client.mutation("users:createAdminAccount", {
      email: "mimi@cliqstr.com",
      password: "admin123" // Change this to a secure password
    });
    
    console.log("✅ Successfully created admin account:", result);
    console.log("📧 Email: mimi@cliqstr.com");
    console.log("🔑 Password: admin123");
    console.log("⚠️  Please change the password after first login!");
    
  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  }
}

createAdminAccount();
