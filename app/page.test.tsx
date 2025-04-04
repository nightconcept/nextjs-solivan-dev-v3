import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest'; // Added vi and beforeEach
import Home from './page';
import { PostMetadata } from '@/lib/posts'; // Import type for mock data
// Mock child components to isolate the Home component test
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

// Mock the getAllPosts function from lib/posts
vi.mock('@/lib/posts', () => ({
	getAllPosts: vi.fn()
}));

// Helper to create mock post data
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

// Create mock data to be returned by getAllPosts
const mockPosts: PostMetadata[] = Array.from({ length: 5 }, (_, i) =>
	createMockPost(i + 1, `2024-01-${10 - i}`)
);

describe('Home Page', () => {
	beforeEach(async () => {
		// Make beforeEach async
		// Reset mocks and provide mock data before each test
		vi.resetAllMocks();
		// Provide the mock data for getAllPosts using dynamic import
		const postsModule = await import('@/lib/posts'); // Use await import
		vi.mocked(postsModule.getAllPosts).mockReturnValue([...mockPosts]); // Use the defined mockPosts
	});

	it('renders without crashing', () => {
		render(<Home />);
		// No assertion needed here, the test passes if render doesn't throw
	});

	it('renders the "Recent Posts" heading', () => {
		render(<Home />);
		const heading = screen.getByRole('heading', { name: /recent posts/i });
		expect(heading).toBeInTheDocument();
	});
});
