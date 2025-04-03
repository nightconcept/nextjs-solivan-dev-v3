import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getAllMarkdownPages, getMarkdownPageBySlug } from './content'; // Import functions to test

// Mock the 'fs' module
vi.mock('fs');

// Define the mock content directory path
const MOCK_CONTENT_DIR = '/mock/project/content';

// Mock the 'path' module to intercept the specific join for contentDirectory
// We need to do this carefully to avoid infinite loops and keep other joins working.
const realProcessCwd = process.cwd(); // Capture the real CWD *once* before mocks

vi.mock('path', async () => {
 // Move the importActual *inside* the async factory function
 const actual = await vi.importActual<typeof path>('path');
 return {
   ...actual, // Keep other path functions (like basename) working
   join: vi.fn((...args: string[]) => {
     // Check if this is the specific call defining contentDirectory in lib/content.ts
     // It joins the *real* process.cwd() with 'content'
     if (args.length === 2 && args[0] === realProcessCwd && args[1] === 'content') {
       return MOCK_CONTENT_DIR; // Return our mock path for this specific case
     }
     // Otherwise, use the actual path.join implementation for all other calls
     return actual.join(...args);
   }),
 };
});
describe('lib/content', () => {
 // No longer mocking process.cwd()
 beforeEach(() => {
   vi.resetAllMocks(); // Reset mocks before each test
   // We might need to reset the path.join mock's call count if needed per test
   // vi.mocked(path.join).mockClear(); // Uncomment if needed
 });

 // No afterEach needed for process.cwd()

  // --- Tests for getAllMarkdownPages ---
  describe('getAllMarkdownPages', () => {
   it('should return slugs for top-level markdown files and filter others', () => {
     // Use the mocked constant now
     const expectedDir = MOCK_CONTENT_DIR;
     const mockEntries = [
       { name: 'about.md', isFile: () => true, isDirectory: () => false },
       { name: 'archives.md', isFile: () => true, isDirectory: () => false },
       { name: 'image.png', isFile: () => true, isDirectory: () => false }, // Non-markdown file
       { name: 'blog', isFile: () => false, isDirectory: () => true },      // Directory
       { name: 'data.json', isFile: () => true, isDirectory: () => false }, // Non-markdown file
     ];

     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     // Mock implementation should now receive the MOCK_CONTENT_DIR
     mockedFs.readdirSync.mockImplementation((dirPath, options) => {
       if (dirPath === MOCK_CONTENT_DIR && options?.withFileTypes) {
         return mockEntries as any;
       }
       // Log the received path for debugging if it fails
       console.error(`readdirSync mock received unexpected path: ${dirPath}, expected: ${MOCK_CONTENT_DIR}`);
       throw new Error(`Unexpected path or options in readdirSync mock: ${dirPath}`);
     });

     const pages = getAllMarkdownPages();

     // Assertions
     expect(pages).toHaveLength(2); // Only 'about.md' and 'archives.md'
     expect(pages).toEqual([
       { slug: 'about' },
       { slug: 'archives' },
     ]);
     // Assert based on the dynamically calculated path
     expect(mockedFs.readdirSync).toHaveBeenCalledWith(expectedDir, { withFileTypes: true });
     // Ensure readFileSync was NOT called, as this function only lists slugs
     expect(mockedFs.readFileSync).not.toHaveBeenCalled();
   });

    // The previous test already covers ignoring subdirectories and non-markdown files implicitly.
    // We can add more specific tests if needed, but let's keep the todos for now.
    it.todo('should ignore files in subdirectories (like blog)'); // Can be refined if needed
   it('should handle directory read errors gracefully', () => {
     // Use the mocked constant now
     const expectedDir = MOCK_CONTENT_DIR;
     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     const readError = new Error("Simulated EACCES error reading directory");
     mockedFs.readdirSync.mockImplementation((dirPath) => {
       // Check the path before throwing
       if (dirPath === MOCK_CONTENT_DIR) {
         throw readError;
       }
       console.error(`readdirSync (error test) mock received unexpected path: ${dirPath}, expected: ${MOCK_CONTENT_DIR}`);
       throw new Error(`Unexpected path in readdirSync mock: ${dirPath}`);
     });

     // Suppress console.error expected during this test
     const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

     const pages = getAllMarkdownPages();

     expect(pages).toEqual([]); // Should return empty array on error
     // Assert based on the dynamically calculated path
     expect(mockedFs.readdirSync).toHaveBeenCalledWith(expectedDir, { withFileTypes: true });
     expect(consoleErrorSpy).toHaveBeenCalledWith("Error reading content directory:", expectedDir, readError);

     consoleErrorSpy.mockRestore(); // Restore console.error
   });
    // Parsing/filtering based on frontmatter is NOT done by this function.
    // Note: Frontmatter tests removed as they are not applicable to getAllMarkdownPages
    it.todo('should handle directory read errors gracefully');
    it.todo('should parse frontmatter correctly');
    it.todo('should handle frontmatter parsing errors gracefully');
    it.todo('should filter out pages with missing required frontmatter (title)');
  });

  // --- Tests for getMarkdownPageBySlug ---
  describe('getMarkdownPageBySlug', () => {
    it('should return page data including content for a valid slug', () => {
      const slug = 'about';
      const mockFilename = `${slug}.md`;
     const mockFileContent = `---
title: Mock About Page
description: A test page.
---

This is the content of the about page.
`;
     // Use the mocked constant now
     const expectedPath = path.join(MOCK_CONTENT_DIR, mockFilename);

     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     // Mock implementations should receive path based on MOCK_CONTENT_DIR
     mockedFs.existsSync.mockImplementation((p) => p === expectedPath);
     mockedFs.readFileSync.mockImplementation((p) => {
       if (p === expectedPath) {
         return mockFileContent;
       }
       console.error(`readFileSync (valid slug) mock received unexpected path: ${p}, expected: ${expectedPath}`);
       throw new Error(`Unexpected path requested in readFileSync mock: ${p}`);
     });

     const pageData = getMarkdownPageBySlug(slug);

     expect(pageData).not.toBeNull();
     expect(pageData?.slug).toBe(slug);
     expect(pageData?.frontmatter.title).toBe('Mock About Page');
     expect(pageData?.frontmatter.description).toBe('A test page.');
     expect(pageData?.content.trim()).toBe('This is the content of the about page.');
     expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedPath);
     expect(mockedFs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
    });

   it('should return null if the page file does not exist', () => {
     const slug = 'non-existent-page';
     // Use the mocked constant now
     const expectedPath = path.join(MOCK_CONTENT_DIR, `${slug}.md`);

     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     // Mock implementation should receive path based on MOCK_CONTENT_DIR
     mockedFs.existsSync.mockImplementation((p) => {
         if (p === expectedPath) return false; // Simulate not found for the specific path
         console.warn(`existsSync (not found test) mock received unexpected path: ${p}, expected: ${expectedPath}`);
         return true; // Assume other paths exist for simplicity if needed elsewhere
     });

     const pageData = getMarkdownPageBySlug(slug);

     expect(pageData).toBeNull();
     expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedPath);
     expect(mockedFs.readFileSync).not.toHaveBeenCalled(); // Should not attempt read
    });

   it('should return null on file read error', () => {
     const slug = 'read-error-page';
     // Use the mocked constant now
     const expectedPath = path.join(MOCK_CONTENT_DIR, `${slug}.md`);

     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     // Mock implementations should receive path based on MOCK_CONTENT_DIR
     mockedFs.existsSync.mockImplementation((p) => p === expectedPath); // File exists...
     mockedFs.readFileSync.mockImplementation((p) => {
       if (p === expectedPath) {
         throw new Error('Simulated EACCES error'); // ...but cannot be read
       }
       console.error(`readFileSync (read error test) mock received unexpected path: ${p}, expected: ${expectedPath}`);
       throw new Error(`Unexpected path requested in readFileSync mock: ${p}`);
     });

     // Suppress console.error expected during this test
     const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

     const pageData = getMarkdownPageBySlug(slug);

     expect(pageData).toBeNull();
     expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedPath);
     expect(mockedFs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
     expect(consoleErrorSpy).toHaveBeenCalled(); // Check if error was logged

     consoleErrorSpy.mockRestore(); // Restore console.error
    });
   it('should return null on frontmatter parsing error', () => {
     const slug = 'bad-fm-page';
     const mockFilename = `${slug}.md`;
     const mockFileContent = `---
title: Bad Frontmatter" // Missing closing quote
date: 2024-01-05
invalid_yaml: : :
---

Content here.
`;
     // Use the mocked constant now
     const expectedPath = path.join(MOCK_CONTENT_DIR, mockFilename);

     // Configure fs mocks
     const mockedFs = vi.mocked(fs);
     // Mock implementations should receive path based on MOCK_CONTENT_DIR
     mockedFs.existsSync.mockImplementation((p) => p === expectedPath);
     mockedFs.readFileSync.mockImplementation((p) => {
       if (p === expectedPath) {
         return mockFileContent; // Return content with bad frontmatter
       }
       console.error(`readFileSync (bad fm test) mock received unexpected path: ${p}, expected: ${expectedPath}`);
       throw new Error(`Unexpected path requested in readFileSync mock: ${p}`);
     });

     // Suppress console.error expected during this test
     const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

     const pageData = getMarkdownPageBySlug(slug);

     expect(pageData).toBeNull(); // Should fail gracefully
     expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedPath);
     expect(mockedFs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
     expect(consoleErrorSpy).toHaveBeenCalled(); // Check if error was logged

     consoleErrorSpy.mockRestore(); // Restore console.error
    });
    // Note: 'should correctly parse frontmatter and content' is covered by the first test.
  });
});