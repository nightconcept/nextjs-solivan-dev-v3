# Testing Plan for `nextjs-solivan-dev-v3` (Local Development)

**Goal:** Implement a basic testing strategy that verifies page availability and component rendering locally, working around the inability to run Playwright's headless browser in the current environment.

**Strategy:** Combine Component Testing and Basic HTTP Request Checks.

**Steps:**

1.  **Install Testing Dependencies:**

    - Add necessary packages for component testing: React Testing Library (`@testing-library/react`), Jest (`jest`, `jest-environment-jsdom`, `@types/jest`) or Vitest (`vitest`, `@vitest/ui`), and related configuration helpers (`@testing-library/jest-dom`, `ts-node` if using Jest).
    - _(Decision Point: Choose between Jest and Vitest during implementation)._

2.  **Configure Test Runner:**

    - Create and configure the chosen test runner (e.g., `jest.config.js` or `vitest.config.ts`).
    - Ensure it's set up to handle Next.js specifics (like module aliases, CSS modules if used), TypeScript, and JSX.

3.  **Implement Component Tests:**

    - Create test files (e.g., `app/page.test.tsx`, `app/about/page.test.tsx`, etc.) for key page components.
    - Use React Testing Library (`render`, `screen`, `expect`) to:
      - Render the page component.
      - Assert that it renders without throwing errors.
      - Assert the presence of critical static elements (e.g., `<h1>`, specific headings like "Recent Posts").

4.  **Implement HTTP Status Checks:**

    - Create a test file (e.g., `tests/status.test.ts`) using the chosen test runner (Jest/Vitest).
    - Inside this file, use the native `fetch` API to make requests to the locally running development server (`http://localhost:8080` based on `package.json`).
    - Target key page URLs identified in the smoke tests (`/`, `/about`, `/blog`, `/blog/more`, `/blog/[id]`).
    - Assert that the `response.ok` property is true or the `response.status` is 200 for each request.

5.  **Update `package.json` Scripts:**
    - Add new scripts to run these tests easily:
      - `"test:component": "jest"` (or `"vitest"`)
      - `"test:status": "jest tests/status.test.ts"` (or `"vitest run tests/status.test.ts"`)
      - Optionally, a combined script: `"test": "npm run test:component && npm run test:status"`

**Visualization:**

```mermaid
graph TD
    A[Start: Need Basic Tests] --> B{Playwright Blocked};
    B --> C[Strategy: Component Tests (RTL + Jest/Vitest)];
    B --> D[Strategy: HTTP Status Checks (fetch)];

    C --> F[Test: Render Page Components];
    F --> F1[Assert: No Errors];
    F --> F2[Assert: Key Static Elements Present];

    D --> G[Test: Fetch Key Page URLs];
    G --> G1[Assert: HTTP Status 200 OK];

    H[Implementation Plan] --> I[1. Install Dependencies (RTL, Jest/Vitest)];
    I --> J[2. Configure Test Runner (jest.config/vitest.config)];
    J --> K[3. Write Component Tests (*.test.tsx)];
    J --> L[4. Write HTTP Status Tests (status.test.ts)];
    K & L --> M[5. Update package.json Scripts];
    M --> N[Result: Local Testing Suite];
```
