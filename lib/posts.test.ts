import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Import afterEach
import fs from 'fs';
import path from 'path';
import { getAllPosts, PostMetadata } from './posts'; // Import the function and type

// Mock the 'fs' module
vi.mock('fs');

// No longer mocking 'path' module directly here

// Define the posts directory relative to the mocked process.cwd()
const MOCK_POSTS_DIR = '/mock/project/content/blog';

describe('lib/posts', () => {
  // Mock process.cwd()
  const originalCwd = process.cwd;
  beforeEach(() => {
    vi.resetAllMocks(); // Reset mocks at the beginning
    process.cwd = vi.fn(() => '/mock/project'); // Mock CWD

    // Mock fs functions used by getAllPosts
    // Note: We configure fs mocks within each test or beforeEach as needed,
    // path.join is handled by the vi.mock factory above.
  });

  afterEach(() => {
    process.cwd = originalCwd; // Restore original CWD
  });


  describe('getAllPosts', () => {
    it('should prioritize filename slug over frontmatter slug', () => {
      const mockFilename = 'filename-slug.md';
      const mockFrontmatterSlug = 'frontmatter-slug';
      const mockFileContent = `---
title: Test Post Title
date: 2024-01-01
slug: ${mockFrontmatterSlug}
author: Test Author
---

Post content here.
`;

      // Configure fs mocks for this specific test
      const mockedFs = vi.mocked(fs);
      mockedFs.readdirSync.mockReturnValue([mockFilename] as any);
      mockedFs.readFileSync.mockImplementation((filePath) => {
        // Calculate the path getAllPosts *should* be requesting based on mocked cwd
        const expectedPath = path.join(process.cwd(), 'content/blog', mockFilename);
        if (filePath === expectedPath) {
          return mockFileContent;
        }
        // Log expected vs actual for debugging
        console.error(`readFileSync Mock Error: Expected ${expectedPath}, Received ${filePath}`);
        throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
      });

      const posts = getAllPosts();

      expect(posts).toHaveLength(1);
      expect(posts[0].slug).toBe('filename-slug'); // Assert filename slug is used
      expect(posts[0].slug).not.toBe(mockFrontmatterSlug); // Assert frontmatter slug is NOT used
      expect(posts[0].title).toBe('Test Post Title'); // Verify other frontmatter loaded
    });

    it('should generate correct excerpt and read time', () => {
        const mockFilename = 'another-post.md';
        const longContent = 'This is the beginning. '.repeat(20) + 'This is the end.'; // ~260 words
        const mockFileContent = `---
title: Long Content Post
date: 2024-01-02
author: Test Author
---

${longContent}
`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([mockFilename] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedPath = path.join(process.cwd(), 'content/blog', mockFilename);
            if (filePath === expectedPath) {
              return mockFileContent;
            }
            console.error(`readFileSync Mock Error: Expected ${expectedPath}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });

        const posts = getAllPosts();
        expect(posts).toHaveLength(1);
        expect(posts[0].excerpt).toHaveLength(150 + 3); // 150 chars + '...'
        expect(posts[0].excerpt.endsWith('...')).toBe(true);
        // Read time: ceil(84 / 200) = ceil(0.42) = 1
        expect(posts[0].readTime).toBe('1 min'); // Corrected expectation
    });

     it('should handle read errors gracefully', () => {
        const mockFilename = 'readable.md';
        const errorFilename = 'unreadable.md';
        const mockFileContent = `---
title: Readable Post
date: 2024-01-03
---
Content`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([mockFilename, errorFilename] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedReadablePath = path.join(process.cwd(), 'content/blog', mockFilename);
            const expectedErrorPath = path.join(process.cwd(), 'content/blog', errorFilename);
            if (filePath === expectedReadablePath) {
              return mockFileContent;
            }
            if (filePath === expectedErrorPath) {
              throw new Error('Permission denied'); // Simulate read error
            }
            console.error(`readFileSync Mock Error: Expected ${expectedReadablePath} or ${expectedErrorPath}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });

        const posts = getAllPosts();
        expect(posts).toHaveLength(1); // Only the readable post should be returned
        expect(posts[0].title).toBe('Readable Post');
     });

     it('should handle frontmatter parsing errors gracefully', () => {
        const mockFilename = 'good-fm.md';
        const errorFilename = 'bad-fm.md';
        const goodFileContent = `---
title: Good Frontmatter
date: 2024-01-04
---
Content`;
        const badFileContent = `---
title: Bad Frontmatter
date: 2024-01-05
invalid_yaml: : :
---
Content`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([mockFilename, errorFilename] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedGoodPath = path.join(process.cwd(), 'content/blog', mockFilename);
            const expectedErrorPath = path.join(process.cwd(), 'content/blog', errorFilename);
            if (filePath === expectedGoodPath) return goodFileContent;
            if (filePath === expectedErrorPath) return badFileContent; // Return content with bad frontmatter
             console.error(`readFileSync Mock Error: Expected ${expectedGoodPath} or ${expectedErrorPath}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });

        const posts = getAllPosts();
        expect(posts).toHaveLength(1); // Only the post with good frontmatter
        expect(posts[0].title).toBe('Good Frontmatter');
     });

     it('should filter out posts with missing required frontmatter (title)', () => {
        const goodFilename = 'good.md';
        const badFilename = 'no-title.md';
        const goodContent = `---
title: Has Title
date: 2024-01-06
---
Content`;
        const badContent = `---
date: 2024-01-07
---
Content`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([goodFilename, badFilename] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedGoodPath = path.join(process.cwd(), 'content/blog', goodFilename);
            const expectedBadPath = path.join(process.cwd(), 'content/blog', badFilename);
            if (filePath === expectedGoodPath) return goodContent;
            if (filePath === expectedBadPath) return badContent;
             console.error(`readFileSync Mock Error: Expected ${expectedGoodPath} or ${expectedBadPath}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });
        const posts = getAllPosts();
        expect(posts).toHaveLength(1);
        expect(posts[0].title).toBe('Has Title');
     });

     it('should filter out posts with invalid date format', () => {
        const goodFilename = 'good-date.md';
        const badFilename = 'bad-date.md';
        const goodContent = `---
title: Good Date
date: 2024-01-08
---
Content`;
        const badContent = `---
title: Bad Date
date: Not A Real Date
---
Content`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([goodFilename, badFilename] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedGoodPath = path.join(process.cwd(), 'content/blog', goodFilename);
            const expectedBadPath = path.join(process.cwd(), 'content/blog', badFilename);
            if (filePath === expectedGoodPath) return goodContent;
            if (filePath === expectedBadPath) return badContent;
            console.error(`readFileSync Mock Error: Expected ${expectedGoodPath} or ${expectedBadPath}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });
        const posts = getAllPosts();
        expect(posts).toHaveLength(1);
        expect(posts[0].title).toBe('Good Date');
     });

     it('should sort posts by date descending', () => {
        const file1 = 'post-jan.md';
        const file2 = 'post-mar.md';
        const file3 = 'post-feb.md';
        const content1 = `---
title: Jan Post
date: 2024-01-15
---`;
        const content2 = `---
title: Mar Post
date: 2024-03-10
---`;
        const content3 = `---
title: Feb Post
date: 2024-02-20
---`;
        // Configure fs mocks
        const mockedFs = vi.mocked(fs);
        mockedFs.readdirSync.mockReturnValue([file1, file2, file3] as any);
        mockedFs.readFileSync.mockImplementation((filePath) => {
            const expectedPath1 = path.join(process.cwd(), 'content/blog', file1);
            const expectedPath2 = path.join(process.cwd(), 'content/blog', file2);
            const expectedPath3 = path.join(process.cwd(), 'content/blog', file3);
            if (filePath === expectedPath1) return content1;
            if (filePath === expectedPath2) return content2;
            if (filePath === expectedPath3) return content3;
            console.error(`readFileSync Mock Error: Expected ${expectedPath1} or ${expectedPath2} or ${expectedPath3}, Received ${filePath}`);
            throw new Error(`Unexpected path requested in readFileSync mock: ${filePath}`);
        });

        const posts = getAllPosts();
        expect(posts).toHaveLength(3);
        expect(posts[0].title).toBe('Mar Post');
        expect(posts[1].title).toBe('Feb Post');
        expect(posts[2].title).toBe('Jan Post');
     });

  });

  // Add tests for getPostBySlug if needed
});