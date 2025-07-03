/**
 * APA Authentication - Invite Code Tests
 * 
 * Tests specifically for invite code enforcement and validation:
 * - Invite codes should be limited to specific cliqs
 * - Each invite code should be marked as used after being claimed
 * - Child invites must trigger parent approval workflow even with valid invite
 */

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

// Initialize test environment
const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test data - Use timestamp to ensure uniqueness
const timestamp = Date.now();
const testCliq = {
  name: `Test Cliq ${timestamp}`,
  description: 'Test cliq for invite tests',
  minAge: 13
};

const testUsers = {
  invitedAdult: {
    email: `invited-adult-${timestamp}@example.com`,
    password: 'InvitePass123!',
    birthdate: '1990-01-01',
    name: 'Invited Adult'
  },
  invitedChild: {
    email: `invited-child-${timestamp}@example.com`,
    password: 'InviteChildPass123!',
    birthdate: '2015-01-01',
    name: 'Invited Child',
    parentEmail: `parent-invited-${timestamp}@example.com`
  }
};

// Test helper functions
async function registerWithInvite(userData, inviteCode) {
  const response = await fetch(`${BASE_URL}/api/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...userData,
      inviteCode
    })
  });
  return { 
    status: response.status,
    data: await response.json()
  };
}

async function validateInvite(inviteCode) {
  const response = await fetch(`${BASE_URL}/api/validate-invite?code=${inviteCode}`, {
    method: 'GET'
  });
  return { 
    status: response.status,
    data: await response.json()
  };
}

// Setup and cleanup
async function setupTestCliqAndInvites() {
  // Create a test cliq
  const cliq = await prisma.cliq.create({
    data: {
      name: testCliq.name,
      description: testCliq.description,
      minAge: testCliq.minAge,
      private: true
    }
  });

  // Create invite codes for the cliq
  const singleUseInvite = await prisma.invite.create({
    data: {
      code: `SINGLE-${timestamp}`,
      maxUses: 1,
      used: false,
      cliqId: cliq.id
    }
  });

  const multiUseInvite = await prisma.invite.create({
    data: {
      code: `MULTI-${timestamp}`,
      maxUses: 3,
      used: false,
      cliqId: cliq.id
    }
  });

  // Create another cliq for cross-cliq testing
  const otherCliq = await prisma.cliq.create({
    data: {
      name: `Other Cliq ${timestamp}`,
      description: 'Other test cliq',
      minAge: 0,
      private: true
    }
  });

  return { cliq, singleUseInvite, multiUseInvite, otherCliq };
}

async function cleanupTestData() {
  // Clean up users
  const testEmails = Object.values(testUsers).map(user => user.email);
  await prisma.profile.deleteMany({
    where: { user: { email: { in: testEmails } } }
  });
  await prisma.user.deleteMany({
    where: { email: { in: testEmails } }
  });

  // Clean up invites and cliqs
  await prisma.invite.deleteMany({
    where: { code: { contains: timestamp.toString() } }
  });
  await prisma.cliq.deleteMany({
    where: { name: { contains: timestamp.toString() } }
  });
}

// Test Suite: Invite Code Enforcement
describe('APA Authentication - Invite Code Tests', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTestCliqAndInvites();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  test('Invite code validation should return correct cliq info', async () => {
    const result = await validateInvite(testData.singleUseInvite.code);
    
    expect(result.status).toBe(200);
    expect(result.data.valid).toBe(true);
    expect(result.data.cliqId).toBe(testData.cliq.id);
    expect(result.data.cliqName).toBe(testCliq.name);
  });

  test('Adult registration with valid invite code should succeed', async () => {
    const result = await registerWithInvite(
      testUsers.invitedAdult, 
      testData.singleUseInvite.code
    );
    
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    
    // Verify invite code was marked as used
    const updatedInvite = await prisma.invite.findUnique({
      where: { code: testData.singleUseInvite.code }
    });
    
    expect(updatedInvite.used).toBe(true);
    
    // Verify user was added to the cliq
    const userCliqMembership = await prisma.cliqMember.findFirst({
      where: {
        user: { email: testUsers.invitedAdult.email },
        cliqId: testData.cliq.id
      }
    });
    
    expect(userCliqMembership).not.toBeNull();
  });

  test('Child registration with valid invite should still require parent approval', async () => {
    const result = await registerWithInvite(
      testUsers.invitedChild, 
      testData.multiUseInvite.code
    );
    
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    
    // Verify child account requires approval despite valid invite
    const childUser = await prisma.user.findUnique({
      where: { email: testUsers.invitedChild.email },
      include: { profile: true }
    });
    
    expect(childUser).not.toBeNull();
    expect(childUser.profile.role).toBe('child');
    expect(childUser.profile.isApproved).toBe(false);
    
    // Verify invite is still valid for multi-use (not fully used up)
    const updatedInvite = await prisma.invite.findUnique({
      where: { code: testData.multiUseInvite.code }
    });
    
    // For multi-use invites, it shouldn't be marked as fully used yet
    expect(updatedInvite.used).toBe(false);
  });

  test('Invalid invite code should be rejected', async () => {
    const result = await registerWithInvite(
      { ...testUsers.invitedAdult, email: `another-${timestamp}@example.com` }, 
      'INVALID-CODE'
    );
    
    expect(result.status).toBe(403);
    expect(result.data.error).toBe('Invalid or expired invite code');
  });

  test('Used single-use invite code should be rejected', async () => {
    // Try to use the already-used single-use invite code
    const result = await registerWithInvite(
      { ...testUsers.invitedAdult, email: `another-${timestamp}@example.com` }, 
      testData.singleUseInvite.code
    );
    
    expect(result.status).toBe(403);
    expect(result.data.error).toBe('Invalid or expired invite code');
  });
});
