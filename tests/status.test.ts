import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:8080'; // As defined in package.json dev script

const pathsToTest = [
  '/',
  '/about',
  '/blog',
  '/blog?page=2',
  '/blog/a-new-path', // Test a valid slug-based route
];

describe('HTTP Status Checks (requires dev server running)', () => {
  // Increase timeout for network requests, default is 5000ms
  const testTimeout = 10000; // 10 seconds

  pathsToTest.forEach((path) => {
    it(`should return 200 OK for ${path}`, async () => {
      const url = `${BASE_URL}${path}`;
      try {
        const response = await fetch(url);
        expect(response.ok, `Expected status 2xx for ${url}, but got ${response.status}`).toBe(true);
        // Optionally check the exact status code
        // expect(response.status, `Expected status 200 for ${url}, but got ${response.status}`).toBe(200);
      } catch (error) {
        // Make fetch errors fail the test clearly
        throw new Error(`Fetch failed for ${url}: ${error}`);
      }
    }, testTimeout); // Apply timeout to each test case
  });
});