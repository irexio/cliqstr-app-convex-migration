/**
 * APA Authentication - Parent Approval Flow Tests
 * 
 * Tests specifically for parent approval workflow:
 * - Parent should receive email with approval link
 * - Child account should remain unapproved until parent confirms
 * - After approval, child account should be properly marked as approved
 */

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

// Initialize test environment
const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Test data with timestamp for uniqueness
const timestamp = Date.now();
const testUsers = {
  child: {
    email: `test-child-${timestamp}@example.com`,
    password: 'ChildPass123!',
    birthdate: '2015-01-01', // Child (10 years old)
    name: 'Test Child',
    parentEmail: `parent-${timestamp}@example.com`
  },
  parent: {
    email: `parent-${timestamp}@example.com`,
    password: 'ParentPass123!',
    birthdate: '1980-01-01',
    name: 'Test Parent'
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

async function completeParentApproval(childId, token) {
  const response = await fetch(`${BASE_URL}/api/complete-approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      childId,
      token
    })
  });
  return { 
    status: response.status,
    data: await response.json()
  };
}

// Generate mock approval token (simulating the one sent in email)
function generateApprovalToken(childId) {
  return jwt.sign({ childId, purpose: 'parent-approval' }, JWT_SECRET, { expiresIn: '24h' });
}

// Clean up test data
async function cleanupTestData() {
  const testEmails = [testUsers.child.email, testUsers.parent.email];
  await prisma.profile.deleteMany({
    where: { user: { email: { in: testEmails } } }
  });
  await prisma.user.deleteMany({
    where: { email: { in: testEmails } }
  });
}

// Test Suite: Parent Approval Flow
describe('APA Authentication - Parent Approval Tests', () => {
  let childUser;
  
  beforeAll(async () => {
    await cleanupTestData();
    
    // Register parent account first
    await registerUser(testUsers.parent);
    
    // Register child account with parent email
    await registerUser(testUsers.child);
    
    // Get the created child user for tests
    childUser = await prisma.user.findUnique({
      where: { email: testUsers.child.email },
      include: { profile: true }
    });
  });
  
  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  test('Child account should start unapproved', async () => {
    expect(childUser).not.toBeNull();
    expect(childUser.profile.role).toBe('child');
    expect(childUser.profile.isApproved).toBe(false);
  });
  
  test('Unapproved child cannot sign in', async () => {
    const result = await signIn({
      email: testUsers.child.email,
      password: testUsers.child.password
    });
    
    expect(result.status).toBe(403);
    expect(result.data.error).toBe('Awaiting parent approval');
  });
  
  test('Parent approval should succeed with valid token', async () => {
    const approvalToken = generateApprovalToken(childUser.id);
    
    const result = await completeParentApproval(
      childUser.id,
      approvalToken
    );
    
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    
    // Verify child account is now approved
    const updatedChildUser = await prisma.user.findUnique({
      where: { id: childUser.id },
      include: { profile: true }
    });
    
    expect(updatedChildUser.profile.isApproved).toBe(true);
  });
  
  test('Approved child can now sign in', async () => {
    const result = await signIn({
      email: testUsers.child.email,
      password: testUsers.child.password
    });
    
    expect(result.status).toBe(200);
    expect(result.data.success).toBe(true);
    
    // Verify auth token cookie was set
    const cookies = result.headers.get('set-cookie');
    expect(cookies).toContain('auth_token');
  });
  
  test('Invalid approval token should be rejected', async () => {
    const invalidToken = 'invalid-token';
    
    const result = await completeParentApproval(
      childUser.id,
      invalidToken
    );
    
    expect(result.status).toBe(401);
    expect(result.data.error).toBeTruthy(); // Should have an error message
  });
});
