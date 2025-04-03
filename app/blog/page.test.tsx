import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Blog from './page'; // The component under test
import { PostMetadata } from '@/lib/posts';

// --- Mock Dependencies ---

// Mock lib/posts
const mockPosts: PostMetadata[] = Array.from({ length: 5 }, (_, i) => ({
  slug: `mock-post-${i + 1}`,
  title: `Mock Post ${i + 1}`,
  date: `2024-01-${10 - i}`,
  dateObject: new Date(`2024-01-${10 - i}`),
  excerpt: `Excerpt for mock post ${i + 1}.`,
  readTime: `${i + 2} min`,
  author: 'Mock Author',
}));

// Define the mock inside the factory
vi.mock('@/lib/posts', () => ({
  getAllPosts: vi.fn(),
}));

// Mock Child Components
vi.mock('@/components/header', () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>,
}));
vi.mock('@/components/blog-post-list', () => ({
  // Capture props passed to the mocked component
  default: vi.fn((props) => (
    <div data-testid="mock-blog-post-list">
      {/* Optionally render something based on props for easier debugging */}
      <span>Page: {props.page}</span>
      <span>Posts: {props.posts.length}</span>
    </div>
  )),
}));
vi.mock('@/components/footer', () => ({
  default: () => <div data-testid="mock-footer">Mock Footer</div>,
}));

// --- Test Suite ---

describe('Blog Page Component (app/blog/page.tsx)', () => {
  beforeEach(async () => { // Make async
    // Reset mocks before each test
    vi.resetAllMocks();
    // Import the mocked module and set the return value
    const { getAllPosts } = await import('@/lib/posts');
    vi.mocked(getAllPosts).mockReturnValue([...mockPosts]); // Return a copy
  });

  // No afterEach needed for this setup yet

  it('renders core elements (header, footer, heading)', async () => {
    // Render the component - needs props.searchParams (Promise)
    const searchParams = Promise.resolve({});
    await act(async () => {
      // Await the Server Component promise before rendering
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /blog posts/i })).toBeInTheDocument();
    expect(screen.getByTestId('mock-blog-post-list')).toBeInTheDocument(); // Check if the list container is rendered
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('calls getAllPosts with includeContent: false', async () => {
    const searchParams = Promise.resolve({});
    await act(async () => {
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    // Import the mocked module to check calls
    const { getAllPosts } = await import('@/lib/posts');
    expect(vi.mocked(getAllPosts)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(getAllPosts)).toHaveBeenCalledWith({ includeContent: false });
  });

  it('passes correct posts and default page number (1) to BlogPostList when no page param exists', async () => {
    const searchParams = Promise.resolve({}); // No 'page' param
    await act(async () => {
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    // Get the mocked BlogPostList component
    const MockBlogPostList = (await import('@/components/blog-post-list')).default;

    expect(MockBlogPostList).toHaveBeenCalledTimes(1);
    expect(MockBlogPostList).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: mockPosts, // Check if the correct posts array is passed
        page: 1,          // Check if the default page number is 1
      }),
      undefined // Explicitly check for the undefined second argument
    );

    // Also check the rendered output from the mock for confirmation
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(`Posts: ${mockPosts.length}`);
  });

  it('passes correct posts and specific page number to BlogPostList when page param exists', async () => {
    const specificPage = 2;
    const searchParams = Promise.resolve({ page: String(specificPage) });
    await act(async () => {
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    const MockBlogPostList = (await import('@/components/blog-post-list')).default;

    expect(MockBlogPostList).toHaveBeenCalledTimes(1);
    expect(MockBlogPostList).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: mockPosts,
        page: specificPage, // Check for the specific page number
      }),
      undefined
    );

    // Check rendered output
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(`Page: ${specificPage}`);
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(`Posts: ${mockPosts.length}`);
  });

  it('passes page number 1 to BlogPostList when page param is invalid (non-numeric)', async () => {
    const searchParams = Promise.resolve({ page: 'abc' }); // Invalid page
    await act(async () => {
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    const MockBlogPostList = (await import('@/components/blog-post-list')).default;

    expect(MockBlogPostList).toHaveBeenCalledTimes(1);
    expect(MockBlogPostList).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: mockPosts,
        page: 1, // Should default to 1
      }),
      undefined
    );

    // Check rendered output
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
  });

  it('passes page number 1 to BlogPostList when page param is invalid (less than 1)', async () => {
    const searchParams = Promise.resolve({ page: '0' }); // Invalid page
    await act(async () => {
      const blogElement = await Blog({ searchParams });
      render(blogElement);
    });

    const MockBlogPostList = (await import('@/components/blog-post-list')).default;

    expect(MockBlogPostList).toHaveBeenCalledTimes(1);
    expect(MockBlogPostList).toHaveBeenCalledWith(
      expect.objectContaining({
        posts: mockPosts,
        page: 1, // Should default to 1
      }),
      undefined
    );

     // Check rendered output
    expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
  });

});