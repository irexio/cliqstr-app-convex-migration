import { test, expect } from '@playwright/test';

/**
 * Test for the child invite flow that was freezing at Parent HQ step 1
 * This test verifies the fix where we changed router.refresh() to window.location.href
 */

test.describe('Child Invite - Parent HQ Flow', () => {
  test('parent can complete full flow from invite to child creation', async ({ page }) => {
    // Test data
    const inviteToken = 'test-token-123';
    const parentEmail = 'newparent@example.com';
    const parentPassword = 'TestPassword123!';
    const childFirstName = 'Johnny';
    const childLastName = 'Smith';
    const childUsername = 'johnny_smith_2025';
    const childPassword = 'ChildPass123!';

    // Mock the invite token validation
    await page.route(`**/invite/${inviteToken}`, async route => {
      // Simulate setting the cookie and redirecting to parent HQ
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/parents/hq#create-child',
          'Set-Cookie': `pending_invite=${Buffer.from(JSON.stringify({
            inviteId: 'test-invite-id',
            cliqId: 'test-cliq-id',
            inviteType: 'child',
            friendFirstName: childFirstName,
            friendLastName: childLastName
          })).toString('base64url')}; Path=/; HttpOnly`
        }
      });
    });

    // Mock the parent signup API
    await page.route('**/api/wizard/parent-signup', async route => {
      const request = route.request();
      const data = await request.postDataJSON();
      
      // Verify the parent signup data
      expect(data.email).toBe(parentEmail);
      expect(data.password).toBe(parentPassword);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
        headers: {
          'Set-Cookie': 'session=test-session; Path=/; HttpOnly'
        }
      });
    });

    // Mock the child creation API
    await page.route('**/api/parent/children', async route => {
      const request = route.request();
      const data = await request.postDataJSON();
      
      // Verify the child creation data
      expect(data.firstName).toBe(childFirstName);
      expect(data.lastName).toBe(childLastName);
      expect(data.username).toBe(childUsername);
      expect(data.password).toBe(childPassword);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          ok: true, 
          childId: 'new-child-id' 
        })
      });
    });

    // Step 1: Navigate to invite link
    await page.goto(`/invite/${inviteToken}`);
    
    // Should be redirected to /parents/hq#create-child
    await expect(page).toHaveURL(/\/parents\/hq#create-child/);

    // Step 2: Parent signup form should be visible
    await expect(page.locator('h2:has-text("Create your Parent account")')).toBeVisible();
    
    // Fill in parent signup form
    await page.fill('input[name="firstName"]', 'Parent');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', parentEmail);
    await page.fill('input[name="birthdate"]', '1985-01-01');
    await page.fill('input[name="password"]', parentPassword);
    
    // Select plan
    await page.click('input[value="invited-free"]');
    
    // Submit parent signup
    await page.click('button:has-text("Create account")');
    
    // CRITICAL: After parent signup, page should reload and show child creation form
    // This was the bug - it was freezing here before the fix
    await page.waitForLoadState('load');
    
    // Step 3: Child creation form should now be visible
    await expect(page.locator('h2:has-text("Create your child\'s account")')).toBeVisible();
    
    // Verify child's name is pre-filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue(childFirstName);
    await expect(page.locator('input[name="lastName"]')).toHaveValue(childLastName);
    
    // Fill in remaining child account details
    await page.fill('input[name="username"]', childUsername);
    await page.fill('input[name="birthdate"]', '2015-06-15');
    await page.fill('input[name="password"]', childPassword);
    
    // Submit child creation
    await page.click('button:has-text("Create child account")');
    
    // Should redirect to parents HQ dashboard
    await page.waitForURL('**/parents/hq');
    
    // Verify success
    await expect(page).toHaveURL(/\/parents\/hq/);
  });

  test('existing parent can skip signup and go directly to child creation', async ({ page }) => {
    // Mock existing parent session
    await page.route('**/api/auth/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'existing-parent-id',
            email: 'existing@parent.com',
            role: 'Parent'
          }
        })
      });
    });

    // Mock the pending invite cookie
    await page.addInitScript(() => {
      document.cookie = `pending_invite=${Buffer.from(JSON.stringify({
        inviteId: 'test-invite-id',
        cliqId: 'test-cliq-id',
        inviteType: 'child',
        friendFirstName: 'Sally',
        friendLastName: 'Jones'
      })).toString('base64url')}; path=/`;
    });

    // Navigate to parents HQ
    await page.goto('/parents/hq#create-child');
    
    // Should skip signup and show child creation form directly
    await expect(page.locator('h2:has-text("Create your child\'s account")')).toBeVisible();
    
    // Verify child's name is pre-filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Sally');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Jones');
  });
});