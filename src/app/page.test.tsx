import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';
import { PostMetadata } from '@/lib/posts';

// Mock child components to isolate the Home component during testing.
// This prevents testing the implementation details of child components.
vi.mock('@/components/header', () => ({
	default: () => <div>Mock Header</div>
}));
vi.mock('@/components/profile-card', () => ({
	default: () => <div>Mock Profile Card</div>
}));
vi.mock('@/components/blog-post-list', () => ({
	default: () => <div>Mock Blog Post List</div>
}));
vi.mock('@/components/footer', () => ({
	default: () => <div>Mock Footer</div>
}));

// Mock the data fetching function to provide controlled data for tests.
vi.mock('@/lib/posts', () => ({
	getAllPosts: vi.fn()
}));

// Factory function to generate consistent mock post metadata for testing.
const createMockPost = (id: number, date: string): PostMetadata => ({
	slug: `post-${id}`,
	title: `Test Post ${id}`,
	date: date,
	dateObject: new Date(date),
	excerpt: `Excerpt for post ${id}`,
	readTime: `${(id % 5) + 3} min`,
	author: 'Test Author',
	tags: ['test', `tag${id}`],
	content: `Full content for post ${id}`
});

// Generate a list of mock posts to be used in tests.
const mockPosts: PostMetadata[] = Array.from({ length: 5 }, (_, i) =>
	createMockPost(i + 1, `2024-01-${10 - i}`)
);

describe('Home Page', () => {
	// Before each test, reset mocks and set up the mock return value for getAllPosts.
	// Using async/await because dynamic import() returns a promise.
	beforeEach(async () => {
		vi.resetAllMocks(); // Ensure mocks are clean between tests.
		// Dynamically import the mocked module to configure its behavior.
		const postsModule = await import('@/lib/posts');
		// Set the mock implementation to return our predefined mock data.
		vi.mocked(postsModule.getAllPosts).mockReturnValue([...mockPosts]);
	});

	it('renders without crashing', () => {
		render(<Home />);
		// This test primarily checks if the component renders without throwing errors.
		// Implicitly verifies that data fetching and component structure are functional at a basic level.
	});

	it('renders the "Recent Posts" heading', () => {
		render(<Home />);
		const heading = screen.getByRole('heading', { name: /recent posts/i });
		expect(heading).toBeInTheDocument();
	});
});
