import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // Import afterEach
import { render, screen, fireEvent, act, within } from '@testing-library/react'; // Import act and within
import '@testing-library/jest-dom';
import BlogPostList from './blog-post-list';
import { PostMetadata } from '@/lib/posts';

// Mock the getAllPosts function
vi.mock('@/lib/posts', () => ({
  getAllPosts: vi.fn(),
}));

// Mock next/navigation
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Helper to create mock post data
const createMockPost = (id: number, date: string, draft: boolean = false): PostMetadata => ({
  slug: `post-${id}`,
  title: `Test Post ${id}`,
  date: date, // Original date string
  dateObject: new Date(date), // Date object for sorting/display
  excerpt: `This is the excerpt for test post ${id}. It should be around 150 characters long to test the truncation properly. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  readTime: `${id % 5 + 3} min`, // Example read time
  author: 'Test Author',
  tags: ['test', `tag${id}`],
  content: `Full content for post ${id}`, // Add content field
  draft, // Add draft property
});

// Create a list of mock posts
// Create a list of mock posts, mark posts 3, 6, 9 as drafts
const mockPosts: PostMetadata[] = Array.from({ length: 10 }, (_, i) =>
  createMockPost(i + 1, `2024-01-${10 - i}`, (i + 1) % 3 === 0) // Posts 3, 6, 9 are drafts
);
// Published posts: 1, 2, 4, 5, 7, 8, 10 (total 7)


describe('BlogPostList Component', () => {
  beforeEach(async () => { // Make beforeEach async
    // Reset mocks before each test
    vi.resetAllMocks();
    // Provide the mock data for getAllPosts - Ensure mock is set up before tests run
    const postsModule = await import('@/lib/posts');
    vi.mocked(postsModule.getAllPosts).mockReturnValue([...mockPosts]); // Return a copy
    // This line was duplicated and is incorrect, removing it.
    vi.useFakeTimers(); // Use fake timers for setTimeout in handlePostClick
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
  });

  it('renders the correct number of published posts per page', () => {
    const postsPerPage = 3;
    render(<BlogPostList posts={mockPosts} postsPerPage={postsPerPage} />);

    // Should render posts 1, 2, 4 (post 3 is draft)
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(postsPerPage); // Still 3 per page
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 3')).not.toBeInTheDocument(); // Draft
    expect(screen.getByText('Test Post 4')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 5')).not.toBeInTheDocument();
  });

  it('displays the correct published posts for a specific page', () => {
    const postsPerPage = 3;
    const page = 2; // Page 2 should show posts 5, 7, 8 (posts 3 & 6 are drafts)
    render(<BlogPostList posts={mockPosts} postsPerPage={postsPerPage} page={page} />);

    expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Post 3')).not.toBeInTheDocument(); // Draft
    expect(screen.queryByText('Test Post 4')).not.toBeInTheDocument();
    expect(screen.getByText('Test Post 5')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 6')).not.toBeInTheDocument(); // Draft
    expect(screen.getByText('Test Post 7')).toBeInTheDocument();
    expect(screen.getByText('Test Post 8')).toBeInTheDocument();
    expect(screen.queryByText('Test Post 9')).not.toBeInTheDocument(); // Draft
    expect(screen.queryByText('Test Post 10')).not.toBeInTheDocument();
  });

  it('renders post details correctly (title, excerpt, date, read time, author)', () => {
    // Render with only 1 post per page to easily test the first *published* post (Post 1)
    render(<BlogPostList posts={mockPosts} postsPerPage={1} />);
    const post1 = mockPosts.find(p => p.slug === 'post-1')!; // Find the specific published post data

    // Find the single article rendered (since postsPerPage = 1)
    const article = screen.getByRole('article');
    expect(article).toBeInTheDocument();

    // Query within the article for the title and other details
    const { getByText } = within(article); // Use testing-library's within helper

    expect(getByText(post1.title)).toBeInTheDocument();
    // Check for truncated excerpt (first 150 chars + ...)
    expect(getByText(post1.excerpt)).toBeInTheDocument();
    // Ensure content exists before checking it's not present in the excerpt element
    if (post1.content) {
      expect(getByText(post1.excerpt)).not.toHaveTextContent(post1.content);
    }
    expect(getByText(post1.dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))).toBeInTheDocument();
    expect(getByText(`${post1.readTime} read`)).toBeInTheDocument();
    expect(getByText(`By ${post1.author}`)).toBeInTheDocument();
  });

  it('navigates to the correct post slug on click (using a published post)', async () => {
    render(<BlogPostList posts={mockPosts} postsPerPage={3} />); // Renders 1, 2, 4
    const postToClick = screen.getByText('Test Post 2'); // Post 2 is published

    // Wrap state updates and async operations in act
    await act(async () => {
      fireEvent.click(postToClick);
      // Advance timers to allow setTimeout to complete
      vi.advanceTimersByTime(300);
    });

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/blog/post-2'); // Correct slug
  });

  it('shows "See More" link when showSeeMore is true and there are more published posts than postsPerPage', () => {
    // 7 published posts, 3 per page. Should show "See More".
    render(<BlogPostList posts={mockPosts} postsPerPage={3} showSeeMore={true} />);
    expect(screen.getByText('See More')).toBeInTheDocument();
    expect(screen.getByText('See More').closest('a')).toHaveAttribute('href', '/blog');
  });

  it('does not show "See More" link when showSeeMore is false', () => {
    render(<BlogPostList posts={mockPosts} postsPerPage={3} showSeeMore={false} />);
    expect(screen.queryByText('See More')).not.toBeInTheDocument();
  });

  it('does not show "See More" link when showSeeMore is true but not enough published posts', () => {
    // 7 published posts. postsPerPage = 7. Should not show "See More".
    render(<BlogPostList posts={mockPosts} postsPerPage={7} showSeeMore={true} />);
    expect(screen.queryByText('See More')).not.toBeInTheDocument();
  });

  it('shows "Next" button when not on the last page of published posts', () => {
    // 7 published posts, 3 per page. Page 1 should have Next.
    render(<BlogPostList posts={mockPosts} postsPerPage={3} page={1} />);
    expect(screen.getByText('Next »')).toBeInTheDocument();
    expect(screen.getByText('Next »').closest('a')).toHaveAttribute('href', '/blog?page=2');
  });

  it('does not show "Next" button on the last page of published posts', () => {
    const postsPerPage = 3;
    // 7 published posts / 3 per page = 2.33 -> 3 total pages
    const totalPublishedPages = Math.ceil(mockPosts.filter(p => !p.draft).length / postsPerPage); // Should be 3
    render(<BlogPostList posts={mockPosts} postsPerPage={postsPerPage} page={totalPublishedPages} />);
    expect(screen.queryByText('Next »')).not.toBeInTheDocument();
  });

  it('shows "Prev" button when not on the first page (using published posts)', () => {
    // Page 2 should have Prev button
    render(<BlogPostList posts={mockPosts} postsPerPage={3} page={2} />);
    expect(screen.getByText('« Prev')).toBeInTheDocument();
    expect(screen.getByText('« Prev').closest('a')).toHaveAttribute('href', '/blog'); // Page 2 links back to /blog (page 1)
  });

   it('shows "Prev" button linking to correct page number for page > 2 (using published posts)', () => {
    // Page 3 should link back to page 2
    render(<BlogPostList posts={mockPosts} postsPerPage={3} page={3} />);
    expect(screen.getByText('« Prev')).toBeInTheDocument();
    expect(screen.getByText('« Prev').closest('a')).toHaveAttribute('href', '/blog?page=2');
  });


  it('does not show "Prev" button on the first page', () => {
    render(<BlogPostList posts={mockPosts} postsPerPage={3} page={1} />);
    expect(screen.queryByText('« Prev')).not.toBeInTheDocument();
  });

  it('handles empty post list gracefully', async () => { // Make test async
     // Access the already mocked module
     const postsModule = await import('@/lib/posts');
     vi.mocked(postsModule.getAllPosts).mockReturnValue([]); // Set return value for this test

     render(<BlogPostList posts={[]} />); // Pass empty array for this test case
     expect(screen.queryByRole('article')).not.toBeInTheDocument();
     expect(screen.queryByText('Next »')).not.toBeInTheDocument();
     expect(screen.queryByText('« Prev')).not.toBeInTheDocument();
  });

});