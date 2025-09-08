#!/usr/bin/env tsx

/**
 * Data Validation Script: Verify Neon → Convex Migration
 * 
 * This script compares data between your original Neon database
 * and your new Convex database to ensure the migration was successful.
 * 
 * Usage:
 * 1. Run after migration: npx tsx scripts/validate-migration.ts
 */

import { PrismaClient } from '@prisma/client';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Initialize clients
const prisma = new PrismaClient();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ValidationResult {
  table: string;
  neonCount: number;
  convexCount: number;
  match: boolean;
  issues: string[];
}

async function validateUsers(): Promise<ValidationResult> {
  console.log('🔍 Validating users...');
  
  const neonUsers = await prisma.user.findMany();
  const convexUsers = await convex.query(api.users.getAllUsers);
  
  const issues: string[] = [];
  
  // Check counts
  if (neonUsers.length !== convexUsers.length) {
    issues.push(`Count mismatch: Neon=${neonUsers.length}, Convex=${convexUsers.length}`);
  }
  
  // Check specific users
  for (const neonUser of neonUsers) {
    const convexUser = convexUsers.find(u => u.email === neonUser.email);
    if (!convexUser) {
      issues.push(`Missing user in Convex: ${neonUser.email}`);
    } else {
      if (neonUser.isVerified !== convexUser.isVerified) {
        issues.push(`Verification mismatch for ${neonUser.email}`);
      }
      if (neonUser.isParent !== convexUser.isParent) {
        issues.push(`Parent status mismatch for ${neonUser.email}`);
      }
    }
  }
  
  return {
    table: 'users',
    neonCount: neonUsers.length,
    convexCount: convexUsers.length,
    match: issues.length === 0,
    issues,
  };
}

async function validateCliqs(): Promise<ValidationResult> {
  console.log('🔍 Validating cliqs...');
  
  const neonCliqs = await prisma.cliq.findMany();
  const convexCliqs = await convex.query(api.cliqs.getAllCliqs);
  
  const issues: string[] = [];
  
  if (neonCliqs.length !== convexCliqs.length) {
    issues.push(`Count mismatch: Neon=${neonCliqs.length}, Convex=${convexCliqs.length}`);
  }
  
  for (const neonCliq of neonCliqs) {
    const convexCliq = convexCliqs.find(c => c.name === neonCliq.name);
    if (!convexCliq) {
      issues.push(`Missing cliq in Convex: ${neonCliq.name}`);
    } else {
      if (neonCliq.privacy !== convexCliq.privacy) {
        issues.push(`Privacy mismatch for cliq: ${neonCliq.name}`);
      }
    }
  }
  
  return {
    table: 'cliqs',
    neonCount: neonCliqs.length,
    convexCount: convexCliqs.length,
    match: issues.length === 0,
    issues,
  };
}

async function validatePosts(): Promise<ValidationResult> {
  console.log('🔍 Validating posts...');
  
  const neonPosts = await prisma.post.findMany();
  const convexPosts = await convex.query(api.posts.getAllPosts);
  
  const issues: string[] = [];
  
  if (neonPosts.length !== convexPosts.length) {
    issues.push(`Count mismatch: Neon=${neonPosts.length}, Convex=${convexPosts.length}`);
  }
  
  return {
    table: 'posts',
    neonCount: neonPosts.length,
    convexCount: convexPosts.length,
    match: issues.length === 0,
    issues,
  };
}

async function validateMemberships(): Promise<ValidationResult> {
  console.log('🔍 Validating memberships...');
  
  const neonMemberships = await prisma.membership.findMany();
  const convexMemberships = await convex.query(api.memberships.getAllMemberships);
  
  const issues: string[] = [];
  
  if (neonMemberships.length !== convexMemberships.length) {
    issues.push(`Count mismatch: Neon=${neonMemberships.length}, Convex=${convexMemberships.length}`);
  }
  
  return {
    table: 'memberships',
    neonCount: neonMemberships.length,
    convexCount: convexMemberships.length,
    match: issues.length === 0,
    issues,
  };
}

async function main() {
  console.log('🔍 Starting data validation...');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to Neon database');
    
    const results: ValidationResult[] = [];
    
    // Run validations
    results.push(await validateUsers());
    results.push(await validateCliqs());
    results.push(await validatePosts());
    results.push(await validateMemberships());
    
    // Print results
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(60));
    
    let allPassed = true;
    
    for (const result of results) {
      const status = result.match ? '✅' : '❌';
      console.log(`${status} ${result.table.toUpperCase()}`);
      console.log(`   Neon: ${result.neonCount} records`);
      console.log(`   Convex: ${result.convexCount} records`);
      
      if (result.issues.length > 0) {
        allPassed = false;
        console.log(`   Issues:`);
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }
      console.log('');
    }
    
    if (allPassed) {
      console.log('🎉 All validations passed! Your migration was successful.');
    } else {
      console.log('⚠️  Some validations failed. Please review the issues above.');
    }
    
  } catch (error) {
    console.error('💥 Validation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
main().catch(console.error);
