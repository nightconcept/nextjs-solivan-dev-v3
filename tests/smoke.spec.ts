import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Page Load Checks', () => {
  test('Homepage loads and shows recent posts heading', async ({ page }) => {
    await page.goto('/');
    // Check for the specific heading identified in app/page.tsx
    await expect(page.locator('h2:has-text("Recent Posts")')).toBeVisible();
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Blog index page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Blog "more" page loads', async ({ page }) => {
    await page.goto('/blog/more');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Individual blog post page (ID: 4) loads', async ({ page }) => {
    await page.goto('/blog/4'); // Using the provided sample ID
    await expect(page.locator('body')).toBeVisible();
  });

  // Skipping tag page test as requested
  // test('Tag page loads', async ({ page }) => { ... });
});