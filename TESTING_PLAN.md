# Playwright Smoke Testing Plan

## 1. Goal

Create a set of basic "smoke tests" using Playwright to verify that the main pages of the Next.js application load correctly without critical errors. This provides a safety net during ongoing development.

## 2. Key Routes to Test

-   Homepage: `/`
-   About Page: `/about`
-   Blog Index: `/blog`
-   Blog "More" Page: `/blog/more`
-   Individual Blog Post: `/blog/4` (using sample ID `4`)
-   Tag Page (`/tags/[tag]`): Skipped for now as requested.

## 3. Testing Tool

-   Playwright (`@playwright/test`) - Already installed as a dev dependency.

## 4. Test Implementation Strategy

-   Create a new directory named `tests` in the project root.
-   Inside `tests`, create a test file named `smoke.spec.ts`.
-   For each key route:
    -   Write a Playwright test case.
    -   Navigate to the page's URL.
    -   Assert that a fundamental element is visible to confirm rendering:
        -   Homepage (`/`): Assert the `h2` heading "Recent Posts" is visible.
        -   Other pages (`/about`, `/blog`, `/blog/more`, `/blog/4`): Assert the `body` element is visible.

## 5. Test File (`tests/smoke.spec.ts`) Outline

```typescript
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
```

## 6. Configuration (Optional but Recommended)

-   Consider adding a `playwright.config.ts` file if more specific configurations (like base URL) are needed later. For now, the defaults should work.
-   Add a script to `package.json` to easily run the tests, e.g., `"test:e2e": "playwright test"`.

## 7. Plan Diagram

```mermaid
graph TD
    A[Start: Add Smoke Tests] --> B{Identify Key Routes};
    B --> C[/, /about, /blog, /blog/more, /blog/4];
    C --> D{Choose Tool};
    D --> E[Playwright];
    E --> F{Define Test Strategy};
    F --> G[Create tests/smoke.spec.ts];
    G --> H[Test Each Route: Navigate & Assert];
    H --> I{Assertions};
    I --> J[Homepage: h2 'Recent Posts' visible];
    I --> K[Other Pages: body visible];
    J --> L[Finalize Test Code];
    K --> L;
    L --> M{Optional Config};
    M --> N[Add package.json script];
    N --> O[End: Plan Complete];