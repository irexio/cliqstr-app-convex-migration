import { test, expect } from '@playwright/test';

test('Parents HQ loads after parent approval', async ({ page }) => {
  // Replace with a real user flow OR simulate post-approval redirect
  await page.goto('http://localhost:3000/parents-hq');

  // Check that the route did not 404 or error
  await expect(page).not.toHaveURL(/404|500/);

  // Expect some key element that proves the page loaded correctly
  await expect(
    page.locator('text=Set child password') // Update if your UI uses different text
  ).toBeVisible({ timeout: 10000 });
});
