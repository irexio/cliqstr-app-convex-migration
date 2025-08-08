import { test, expect } from '@playwright/test';

const INVITE_CODE = 'test123';

// Helper to mock invite validation API
function mockInviteValidation(route: any) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      valid: true,
      inviteRole: 'child',
      cliqName: 'Test Cliq',
      inviterName: 'Adult A',
      friendFirstName: 'Child C'
    })
  });
}

test('unauthenticated parent is routed to signup and inviteCode persists', async ({ page }) => {
  await page.route('**/api/invites/validate**', mockInviteValidation);
  await page.route('**/api/auth/status', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) }));

  await page.goto(`/invite/accept?code=${INVITE_CODE}`);
  await expect(page).toHaveURL(`/invite/parent/signup?inviteCode=${INVITE_CODE}`);
});

test('logged-in child is blocked from accepting invite', async ({ page }) => {
  await page.route('**/api/invites/validate**', mockInviteValidation);
  await page.route('**/api/auth/status', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ user: { role: 'Child' } })
  }));
  await page.route('**/api/auth/sign-out', route => route.fulfill({ status: 200 }));

  await page.goto(`/invite/accept?code=${INVITE_CODE}`);
  await expect(page).toHaveURL('/invite/invalid?reason=child-role');
});

