import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - Page Load Checks", () => {
  test("Homepage loads and shows recent posts heading", async ({ page }) => {
    await page.goto("/");
    // Check for the specific heading identified in app/page.tsx
    await expect(page.locator('h2:has-text("Recent Posts")')).toBeVisible();
  });

  test("About page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Blog index page loads", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("body")).toBeVisible();
  });

  test('Blog "more" page loads', async ({ page }) => {
    await page.goto("/blog?page=2");
    await expect(page.locator("body")).toBeVisible();
  });

  test("Individual blog post page migrating-to-hugo loads", async ({
    page,
  }) => {
    await page.goto("/blog/migrating-to-hugo"); // Using the provided sample ID
    await expect(page.locator("body")).toBeVisible();
  });

  test('Tag page (e.g., "nextjs") loads', async ({ page }) => {
    await page.goto("/blog/tags/nextjs"); // Assuming 'nextjs' is a valid tag
    await expect(page.locator("body")).toBeVisible();
  });
});
