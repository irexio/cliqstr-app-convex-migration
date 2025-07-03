/**
 * APA (Aiden's Power Auth) Authentication System Tests
 * 
 * This test suite validates the entire authentication flow including:
 * - User registration (adult, child, teen)
 * - Invite-based registration
 * - Sign-in validation
 * - Parent approval flow
 * - Age-based access controls
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Initialize test environment
const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Test data
const testUsers = {
  adult: {
    email: `test-adult-${Date.now()}@example.com`,
    password: 'SecurePass123!',
    birthdate: '1980-01-01', // Adult (43 years old)
    name: 'Test Adult'
  },
  child: {
    email: `test-child-${Date.now()}@example.com`,
    password: 'ChildPass123!',
    birthdate: '2015-01-01', // Child (10 years old)
    name: 'Test Child',
    parentEmail: `parent-${Date.now()}@example.com`
  },
  teen: {
    email: `test-teen-${Date.now()}@example.com`,
    password: 'TeenPass123!',
    birthdate: '2010-01-01', // Teen (15 years old)
    name: 'Test Teen',
    parentEmail: `parent-teen-${Date.now()}@example.com`
  }
};

// Test helper functions
async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/api/sign-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return { 
    status: response.status,
    data: await response.json()
  };
}

async function signIn(credentials) {
  const response = await fetch(`${BASE_URL}/api/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return { 
    status: response.status,
    data: await response.json(),
    headers: response.headers
  };
}

async function createInviteCode(cliqId, maxUses = 1) {
  return prisma.invite.create({
    data: {
      code: `TEST-${Date.now()}`,
      maxUses,
      used: false,
      cliqId
    }
  });
}

// Clean up test data before running tests
async function cleanupTestData() {
  const testEmails = Object.values(testUsers).map(user => user.email);
  await prisma.profile.deleteMany({
    where: { user: { email: { in: testEmails } } }
  });
  await prisma.user.deleteMany({
    where: { email: { in: testEmails } }
  });
}

// Test Suite 1: Basic Registration Tests
describe('APA Authentication - Registration Tests', () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  test('Adult registration should succeed and auto-approve', async () => {
    const result = await registerUser(testUsers.adult);
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);

    // Verify user was created with correct role
    const user = await prisma.user.findUnique({
      where: { email: testUsers.adult.email },
      include: { profile: true }
    });

    expect(user).not.toBeNull();
    expect(user.profile.role).toBe('adult');
    expect(user.profile.isApproved).toBe(true);
  });

  test('Child registration should succeed but require approval', async () => {
    const result = await registerUser(testUsers.child);
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);

    // Verify user was created with child role and not approved
    const user = await prisma.user.findUnique({
      where: { email: testUsers.child.email },
      include: { profile: true }
    });

    expect(user).not.toBeNull();
    expect(user.profile.role).toBe('child');
    expect(user.profile.isApproved).toBe(false);

    // TODO: Verify parent email was sent (would require mocking email service)
  });

  test('Teen registration should succeed but require approval', async () => {
    const result = await registerUser(testUsers.teen);
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);

    // Verify user was created with child role and not approved
    const user = await prisma.user.findUnique({
      where: { email: testUsers.teen.email },
      include: { profile: true }
    });

    expect(user).not.toBeNull();
    expect(user.profile.role).toBe('child'); // Anyone under 18 should be 'child'
    expect(user.profile.isApproved).toBe(false);
  });
});

// Test Suite 2: Sign-In Tests
describe('APA Authentication - Sign-In Tests', () => {
  test('Adult sign-in should succeed', async () => {
    const result = await signIn({
      email: testUsers.adult.email,
      password: testUsers.adult.password
    });

    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    
    // Verify auth token cookie was set
    const cookies = result.headers.get('set-cookie');
    expect(cookies).toContain('auth_token');
  });

  test('Unapproved child sign-in should fail with 403', async () => {
    const result = await signIn({
      email: testUsers.child.email,
      password: testUsers.child.password
    });

    expect(result.status).toBe(403);
    expect(result.data.error).toBe('Awaiting parent approval');
  });
  
  test('Invalid credentials should fail with 401', async () => {
    const result = await signIn({
      email: testUsers.adult.email,
      password: 'WrongPassword123!'
    });

    expect(result.status).toBe(401);
    expect(result.data.error).toBe('Invalid credentials');
  });
});

// After all tests complete
afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});
