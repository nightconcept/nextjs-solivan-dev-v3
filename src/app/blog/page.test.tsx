import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides custom DOM matchers for expect (e.g., .toBeInTheDocument())
import Blog from './page'; // The actual Blog page component we are testing
import { PostMetadata } from '@/lib/posts'; // Type definition for post metadata

// --- Mock Dependencies ---
// We mock external dependencies (modules and components) to isolate the Blog component
// and ensure our tests focus solely on its logic, not the logic of its dependencies.

// Mock data for the 'getAllPosts' function.
// This provides consistent, predictable data for our tests without needing real posts.
const mockPosts: PostMetadata[] = Array.from({ length: 5 }, (_, i) => ({
	slug: `mock-post-${i + 1}`,
	title: `Mock Post ${i + 1}`,
	date: `2024-01-${10 - i}`, // Example dates
	dateObject: new Date(`2024-01-${10 - i}`),
	excerpt: `Excerpt for mock post ${i + 1}.`,
	readTime: `${i + 2} min`,
	author: 'Mock Author',
	draft: i === 1 // Example: Mark the second post (index 1) as a draft for potential future tests
}));

// Mock the '@lib/posts' module.
// We replace the actual 'getAllPosts' function with a Vitest mock function (vi.fn()).
// This allows us to control what 'getAllPosts' returns and check if/how it was called.
vi.mock('@/lib/posts', () => ({
	getAllPosts: vi.fn() // Replace getAllPosts with an empty mock function initially
}));

// Mock Child Components (Header, BlogPostList, Footer)
// We replace the actual child components with simple placeholder divs.
// This speeds up tests and prevents errors if the child components have their own complex logic or dependencies.
vi.mock('@/components/header', () => ({
	// The 'default' export is mocked because Header is likely exported as default
	default: () => <div data-testid="mock-header">Mock Header</div> // data-testid allows easy selection in tests
}));

vi.mock('@/components/blog-post-list', () => ({
	// Mock the default export of BlogPostList
	default: vi.fn(
		(
			props // Use vi.fn() here to track calls and passed props
		) => (
			<div data-testid="mock-blog-post-list">
				{/* Render received props within the mock for easier debugging */}
				{/* This helps verify that the Blog component passes the correct data down */}
				<span>Page: {props.page}</span>
				<span>Posts: {props.posts.length}</span>
			</div>
		)
	)
}));

vi.mock('@/components/footer', () => ({
	default: () => <div data-testid="mock-footer">Mock Footer</div>
}));

// --- Test Suite ---
// Groups related tests for the Blog Page Component.
describe('Blog Page Component (app/blog/page.tsx)', () => {
	// 'beforeEach' runs before every 'it' test block within this 'describe' block.
	// Used here to reset mocks and set up common test conditions.
	beforeEach(async () => {
		// Reset all mocks to ensure test isolation. Clears call history, return values, etc.
		vi.resetAllMocks();

		// Import the mocked 'getAllPosts' function *after* vi.mock has been processed.
		// We need to do this inside beforeEach/it because vi.mock is hoisted.
		const { getAllPosts } = await import('@/lib/posts');

		// Configure the mocked 'getAllPosts' to return our predefined 'mockPosts' data for this test run.
		// We use vi.mocked() to get type safety on the mock function.
		// Return a shallow copy ([...mockPosts]) to prevent tests from accidentally modifying the base mock data.
		vi.mocked(getAllPosts).mockReturnValue([...mockPosts]);
	});

	// Test case: Verifies that the main structural elements are rendered.
	it('renders core elements (header, footer, heading)', async () => {
		// Prepare props for the component. searchParams needs to be a Promise.
		const searchParams = Promise.resolve({}); // Empty params for this test

		// Use 'act' to wrap rendering and state updates for async components.
		// This ensures React processes updates before we make assertions.
		await act(async () => {
			// The Blog component is an async Server Component, so we await its result.
			const blogElement = await Blog({ searchParams });
			// Render the resulting element.
			render(blogElement);
		});

		// Assertions: Check if the mocked components and the heading exist in the rendered output.
		expect(screen.getByTestId('mock-header')).toBeInTheDocument(); // Check using data-testid
		expect(screen.getByRole('heading', { name: /blog posts/i })).toBeInTheDocument(); // Check for heading by role and accessible name
		expect(screen.getByTestId('mock-blog-post-list')).toBeInTheDocument(); // Check if the list container is rendered
		expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
	});

	// Test case: Verifies that the data fetching function is called correctly.
	it('calls getAllPosts with includeContent: false', async () => {
		const searchParams = Promise.resolve({});
		await act(async () => {
			const blogElement = await Blog({ searchParams });
			render(blogElement);
		});

		// Import the mocked function again to access its mock properties.
		const { getAllPosts } = await import('@/lib/posts');

		// Assertion: Check if the mock function was called exactly once.
		expect(vi.mocked(getAllPosts)).toHaveBeenCalledTimes(1);
		// Assertion: Check if it was called with the specific arguments we expect ({ includeContent: false }).
		expect(vi.mocked(getAllPosts)).toHaveBeenCalledWith({
			includeContent: false
		});
	});

	// Test case: Verifies props passed to BlogPostList when no page parameter is in the URL.
	it('passes correct posts and default page number (1) to BlogPostList when no page param exists', async () => {
		const searchParams = Promise.resolve({}); // No 'page' param
		await act(async () => {
			const blogElement = await Blog({ searchParams });
			render(blogElement);
		});

		// Get the mocked BlogPostList component constructor/function.
		// We need to await the dynamic import here as well.
		const MockBlogPostList = (await import('@/components/blog-post-list')).default;

		// Assertion: Check if the mock component function was called once.
		expect(MockBlogPostList).toHaveBeenCalledTimes(1);
		// Assertion: Check if it was called with the expected props object.
		// 'expect.objectContaining' checks if the first argument (props) contains these key-value pairs.
		expect(MockBlogPostList).toHaveBeenCalledWith(
			expect.objectContaining({
				posts: mockPosts, // Should pass the mock posts data
				page: 1 // Should default to page 1
			}),
			undefined // The second argument (context) is typically undefined/empty in basic component renders
		);

		// Optional: Check the rendered output of the mock component itself for confirmation.
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(
			`Posts: ${mockPosts.length}` // Check if the correct number of posts was rendered in the mock
		);
	});

	// Test case: Verifies props passed to BlogPostList when a specific page parameter is present.
	it('passes correct posts and specific page number to BlogPostList when page param exists', async () => {
		const specificPage = 2;
		const searchParams = Promise.resolve({ page: String(specificPage) }); // Pass 'page=2'
		await act(async () => {
			const blogElement = await Blog({ searchParams });
			render(blogElement);
		});

		const MockBlogPostList = (await import('@/components/blog-post-list')).default;

		expect(MockBlogPostList).toHaveBeenCalledTimes(1);
		// Assertion: Check if the component received the correct page number from the params.
		expect(MockBlogPostList).toHaveBeenCalledWith(
			expect.objectContaining({
				posts: mockPosts,
				page: specificPage // Should pass the specific page number
			}),
			undefined
		);

		// Check rendered output of the mock
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(`Page: ${specificPage}`);
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent(
			`Posts: ${mockPosts.length}`
		);
	});

	// Test case: Verifies behavior with an invalid (non-numeric) page parameter.
	it('passes page number 1 to BlogPostList when page param is invalid (non-numeric)', async () => {
		const searchParams = Promise.resolve({ page: 'abc' }); // Invalid page value
		await act(async () => {
			const blogElement = await Blog({ searchParams });
			render(blogElement);
		});

		const MockBlogPostList = (await import('@/components/blog-post-list')).default;

		expect(MockBlogPostList).toHaveBeenCalledTimes(1);
		// Assertion: Check if the component correctly defaulted to page 1.
		expect(MockBlogPostList).toHaveBeenCalledWith(
			expect.objectContaining({
				posts: mockPosts,
				page: 1 // Should default to 1
			}),
			undefined
		);

		// Check rendered output
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
	});

	// Test case: Verifies behavior with an invalid (out-of-range) page parameter.
	it('passes page number 1 to BlogPostList when page param is invalid (less than 1)', async () => {
		const searchParams = Promise.resolve({ page: '0' }); // Invalid page value (0)
		await act(async () => {
			const blogElement = await Blog({ searchParams });
			render(blogElement);
		});

		const MockBlogPostList = (await import('@/components/blog-post-list')).default;

		expect(MockBlogPostList).toHaveBeenCalledTimes(1);
		// Assertion: Check if the component correctly defaulted to page 1.
		expect(MockBlogPostList).toHaveBeenCalledWith(
			expect.objectContaining({
				posts: mockPosts,
				page: 1 // Should default to 1
			}),
			undefined
		);

		// Check rendered output
		expect(screen.getByTestId('mock-blog-post-list')).toHaveTextContent('Page: 1');
	});
});
