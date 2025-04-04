import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BlogPostPage from './page'; // Adjust the import path if necessary
import { getAllPosts, getPostBySlug } from '@/lib/posts'; // Adjust the import path if necessary
import React from 'react';

// Mock the lib/posts functions
vi.mock('@/lib/posts', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('@/lib/posts');
	return {
		...actual, // Keep other exports if any, though we primarily mock these two
		getAllPosts: vi.fn(),
		getPostBySlug: vi.fn()
	};
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
	notFound: vi.fn(() => {
		throw new Error('Mocked notFound called');
	}) // Throw error to check if it's called unexpectedly
}));

// Helper to mock console warning/error to avoid cluttering test output
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('BlogPostPage - /blog/[slug]', () => {
	it('should render the "a-new-path" post correctly', async () => {
		const slug = 'a-new-path';
		const mockPostData = {
			slug: slug,
			frontmatter: {
				title: 'A New Path',
				date: '2024-11-06T10:28:03-08:00',
				author: ['Danny'],
				tags: ['opinion'],
				description: ''
				// Add other frontmatter fields if needed by the component
			},
			// Provide the actual markdown content
			content: `So, the election happened. Ignoring policy differences, I think my biggest grievance is we chose an angry, immature man to run the most powerful country in the world. I do not want to be in a world where this is OK especially for my children. We should be able to respectfully disagree with each other and move on. However, the ballots showed that as long as he delivers the economy this is OK. Sorry, but I can't accept creating a toxic workplace in exchange for supposed gains for people. I have a high level of certainty that my family and I will be fine, but I do worry for those around us who are not as fortunate. I will be living in a community with those who may not be as fortunate and if they are pushed down, well my quality of life will suffer. It *is* important to take care of everyone around us. A rising tide raises all boats as they say.

So what am *I* doing? Well, I've chosen to take this opportunity to disengage with the toxic doom scrolling and internet. The election season is over so now I do not have to "care" as much. I can't do anything until the next cycle. So here's what's changing:
- I have a family who needs me to be present with them.
- My family deserves my energy and not the incoming toxic cycle of news that will inevitably flood all news sites. I do not regularly view The New York Times and The Hill anymore, but I definitely will not during the next four years.
- I will be focused on viewing only local news that affects my life. I am fortunate to live in a blue state that lines up with most of my ideals so I will generally be shielded from crazy-goings-ons of DC.
- I will be removing the Reddit front page from most of my browsing. It wastes time.
- I have other hobbies I want to do. This is a good opportunity to get on that.
- I will read more instead of aimlessly browsing my phone. My phone is just for communication.
- I will not actively seek news, but if someone tells me about it, I can look it up. I will not seek out opportunities to get fed news to make the excuse I need to look it up. This is meant to allow me to look at things that happen that are truly relevant to me.
- I will make less jokes about certain individuals I despise. It's not worth it anymore to say anything. It doesn't get me anywhere. It doesn't make me happy. That said, I do need to find an outlet for this anger. I can't bottle it up inside.

All in all, I want to take these next four years as a chance to grow and do something productive for me. I will not wallow in loss.`
		};

		const mockAllPosts = [
			// Add another post if you want to test prev/next links more thoroughly
			{
				slug: 'another-post',
				title: 'Another Post',
				date: '2024-11-07T00:00:00-08:00',
				dateObject: new Date('2024-11-07T00:00:00-08:00')
			},
			{
				slug: slug,
				title: 'A New Path',
				date: '2024-11-06T10:28:03-08:00',
				dateObject: new Date('2024-11-06T10:28:03-08:00')
			},
			{
				slug: 'older-post',
				title: 'Older Post',
				date: '2024-11-05T00:00:00-08:00',
				dateObject: new Date('2024-11-05T00:00:00-08:00')
			}
		];

		// Setup mocks
		// Use mockReturnValue since getPostBySlug is synchronous
		vi.mocked(getPostBySlug).mockReturnValue(mockPostData);
		vi.mocked(getAllPosts).mockReturnValue(mockAllPosts);

		// Render the component - It's an async Server Component, so we await the promise it returns
		const PagePromise = BlogPostPage({ params: { slug } });
		const { container } = render(await PagePromise);

		// Wait for potential async operations within the component if necessary
		// (ReactMarkdown might have some, though often rendering is synchronous after await)
		// await waitFor(() => { /* assertions */ });

		// Assertions
		// Check Title
		expect(screen.getByRole('heading', { level: 1, name: /A New Path/i })).toBeInTheDocument();

		// Check Date (using formatted date)
		expect(screen.getByText('November 6, 2024')).toBeInTheDocument();

		// Check Author
		expect(screen.getByText(/By Danny/i)).toBeInTheDocument();

		// Check some content snippet
		expect(screen.getByText(/toxic doom scrolling and internet/i)).toBeInTheDocument();

		// Check Tag
		const tagLink = screen.getByRole('link', { name: /opinion/i });
		expect(tagLink).toBeInTheDocument();
		expect(tagLink).toHaveAttribute('href', '/tags/opinion');

		// Check Navigation Links
		const prevLink = screen.getByRole('link', { name: /Previous/i });
		expect(prevLink).toBeInTheDocument();
		expect(prevLink).toHaveAttribute('href', '/blog/another-post'); // Previous post is the newer one in the sorted list

		const nextLink = screen.getByRole('link', { name: /Next/i });
		expect(nextLink).toBeInTheDocument();
		expect(nextLink).toHaveAttribute('href', '/blog/older-post'); // Next post is the older one in the sorted list

		// Optional: Snapshot test (uncomment if desired)
		// expect(container).toMatchSnapshot();
	});

	it('should call notFound if post does not exist', async () => {
		const slug = 'non-existent-slug';

		// Setup mocks
		// Use mockReturnValue since getPostBySlug is synchronous
		vi.mocked(getPostBySlug).mockReturnValue(null); // Simulate post not found
		vi.mocked(getAllPosts).mockReturnValue([]); // Return empty array for this case

		// Render the component and expect the mocked notFound to throw
		await expect(BlogPostPage({ params: { slug } })).rejects.toThrow('Mocked notFound called');

		// Verify notFound was indeed called (implicitly checked by the rejection)
	});
});
