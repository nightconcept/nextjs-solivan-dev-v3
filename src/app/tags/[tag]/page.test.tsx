// app/tags/[tag]/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TagPage from './page'; // The component to test
import { getAllPosts, PostMetadata } from '@/lib/posts'; // To mock

// Mock dependencies
vi.mock('@/components/header', () => ({
	default: () => <header>Mock Header</header>
}));
vi.mock('@/components/footer', () => ({
	default: () => <footer>Mock Footer</footer>
}));
vi.mock('@/components/breadcrumb', () => ({
	default: ({ items }: { items: { label: string; href?: string }[] }) => (
		<nav aria-label="breadcrumb">
			<ol>
				{items.map((item, index) => (
					<li key={index}>{item.href ? <a href={item.href}>{item.label}</a> : item.label}</li>
				))}
			</ol>
		</nav>
	)
}));
vi.mock('@/lib/posts'); // Mock the entire posts module

// Mock Next.js Link component behavior if necessary (often handled by testing-library)
vi.mock('next/link', () => ({
	default: ({ href, children }: { href: string; children: React.ReactNode }) => (
		<a href={href}>{children}</a>
	)
}));

// Mock siteMetadataConfig if needed for generateMetadata (usually tested separately)
// vi.mock('@/lib/metadata.config', () => ({
//   siteMetadataConfig: {
//     tagPageTitleTemplate: (tag: string) => `Posts tagged with ${tag}`,
//   },
// }));

// Helper function to create mock post data
const createMockPost = (slug: string, title: string, tags: string[]): PostMetadata => ({
	slug,
	title,
	tags,
	date: '2024-01-01', // Example date string
	dateObject: new Date('2024-01-01T00:00:00Z'), // Example Date object
	excerpt: `Excerpt for ${title}`,
	readTime: '5 min',
	author: 'Test Author',
	content: '' // Not needed for this page test
	// Add other required fields from PostMetadata if necessary
});

describe('TagPage', () => {
	const mockTag = 'test-tag';
	const formattedTag = 'Test Tag';

	it('renders the header, footer, and breadcrumbs correctly', async () => {
		// Arrange
		const mockPosts: PostMetadata[] = [];
		vi.mocked(getAllPosts).mockReturnValue(mockPosts);
		const props = { params: Promise.resolve({ tag: mockTag }) };

		// Act
		render(await TagPage(props));

		// Assert
		await waitFor(() => {
			expect(screen.getByText('Mock Header')).toBeInTheDocument();
			expect(screen.getByText('Mock Footer')).toBeInTheDocument();
			expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument();
			expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
			expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
			// The last breadcrumb item might not be a link depending on implementation
			expect(screen.getByText(`Tag: ${formattedTag}`)).toBeInTheDocument();
		});
	});

	it('renders the correct heading for the tag', async () => {
		// Arrange
		const mockPosts: PostMetadata[] = [];
		vi.mocked(getAllPosts).mockReturnValue(mockPosts);
		const props = { params: Promise.resolve({ tag: mockTag }) };

		// Act
		render(await TagPage(props));

		// Assert
		await waitFor(() => {
			expect(
				screen.getByRole('heading', {
					level: 1,
					name: `Posts tagged with "${formattedTag}"`
				})
			).toBeInTheDocument();
		});
	});

	it.todo('displays posts correctly when posts with the tag exist', async () => {
		// Arrange
		const mockPosts = [
			createMockPost('post-1', 'Post One', ['test-tag', 'another-tag']),
			createMockPost('post-2', 'Post Two', ['test-tag']),
			createMockPost('post-3', 'Post Three', ['different-tag']) // Should not be displayed
		];
		vi.mocked(getAllPosts).mockReturnValue(mockPosts);
		const props = { params: Promise.resolve({ tag: mockTag }) };

		// Act
		render(await TagPage(props));

		// Assert
		await waitFor(() => {
			// Check for post titles (within links)
			expect(screen.getByRole('link', { name: 'Post One' })).toBeInTheDocument();
			expect(screen.getByRole('link', { name: 'Post Two' })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: 'Post Three' })).not.toBeInTheDocument();

			// Check for excerpts
			expect(screen.getByText('Excerpt for Post One')).toBeInTheDocument();
			expect(screen.getByText('Excerpt for Post Two')).toBeInTheDocument();

			// Check for dates (adjust format as needed)
			expect(screen.getAllByText('December 31, 2023')).toHaveLength(2); // Check formatted date (adjust for timezone)

			// Check for read times
			expect(screen.getAllByText('5 min read')).toHaveLength(2); // Check read time

			// Check for authors
			expect(screen.getAllByText('By Test Author')).toHaveLength(2); // Check author

			// Check links
			expect(screen.getByRole('link', { name: 'Post One' })).toHaveAttribute(
				'href',
				'/blog/post-1'
			);
			expect(screen.getByRole('link', { name: 'Post Two' })).toHaveAttribute(
				'href',
				'/blog/post-2'
			);
		});
	});

	it('displays "No posts found" message when no posts match the tag', async () => {
		// Arrange
		const mockPosts = [createMockPost('post-3', 'Post Three', ['different-tag'])];
		vi.mocked(getAllPosts).mockReturnValue(mockPosts);
		const props = { params: Promise.resolve({ tag: mockTag }) }; // Tag 'test-tag'

		// Act
		render(await TagPage(props));

		// Assert
		await waitFor(() => {
			expect(screen.getByText('No posts found with this tag.')).toBeInTheDocument();
			expect(screen.queryByRole('article')).not.toBeInTheDocument(); // No articles should be rendered
		});
	});

	it('handles tags with hyphens correctly', async () => {
		// Arrange
		const hyphenatedTag = 'another-cool-tag';
		const formattedHyphenatedTag = 'Another Cool Tag';
		const mockPosts = [createMockPost('post-4', 'Post Four', ['another-cool-tag'])];
		vi.mocked(getAllPosts).mockReturnValue(mockPosts);
		const props = { params: Promise.resolve({ tag: hyphenatedTag }) };

		// Act
		render(await TagPage(props));

		// Assert
		await waitFor(() => {
			// Check heading
			expect(
				screen.getByRole('heading', {
					level: 1,
					name: `Posts tagged with "${formattedHyphenatedTag}"`
				})
			).toBeInTheDocument();
			// Check breadcrumb
			expect(screen.getByText(`Tag: ${formattedHyphenatedTag}`)).toBeInTheDocument();
			// Check post is displayed
			expect(screen.getByRole('link', { name: 'Post Four' })).toBeInTheDocument();
		});
	});
});
