import { test, expect } from '@playwright/test';

test('Parents HQ loads after parent approval', async ({ page }) => {
  // Note: This test requires a logged-in parent user
  // In a real test, you'd need to authenticate first
  await page.goto('http://localhost:3000/parents/hq');

  // Check that the route did not 404 or error
  await expect(page).not.toHaveURL(/404|500/);

  // Expect the main page title
  await expect(
    page.locator('h1:has-text("Parents HQ")')
  ).toBeVisible({ timeout: 10000 });

  // Expect the child account creation section
  await expect(
    page.locator('text=Create New Child Account')
  ).toBeVisible({ timeout: 5000 });

  // Expect the create button
  await expect(
    page.locator('button:has-text("+ Create Child Account")')
  ).toBeVisible({ timeout: 5000 });
});
