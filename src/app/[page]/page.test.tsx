import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Page, { generateMetadata, generateStaticParams } from './page';
import { getAllMarkdownPages, getMarkdownPageBySlug } from '@/lib/content';
import { notFound } from 'next/navigation';

// Mock the lib/content functions
vi.mock('@/lib/content', async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import('@/lib/content');
	return {
		...actual, // Keep other exports if any
		getAllMarkdownPages: vi.fn(),
		getMarkdownPageBySlug: vi.fn()
	};
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
	notFound: vi.fn(() => {
		// Throw an error to simulate stopping render and allow catching in tests
		throw new Error('Mocked notFound called');
	})
}));

// Helper to mock console warning/error to avoid cluttering test output
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

// --- Test Data ---
const MOCK_ABOUT_PAGE = {
	slug: 'about',
	frontmatter: {
		title: 'About Me',
		description: 'A little bit about the author.'
		// Add other frontmatter fields if your component uses them
	},
	content: '# About Me\n\nThis is the content of the about page.'
};

const MOCK_USES_PAGE = {
	slug: 'uses',
	frontmatter: {
		title: 'Uses',
		description: 'Hardware and software I use.'
	},
	content: '# Uses\n\nDetails about my setup.'
};

const MOCK_ALL_PAGES = [MOCK_ABOUT_PAGE, MOCK_USES_PAGE];

describe('Page Component - /app/[page]/page.tsx', () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks();
		// Setup default mocks for successful cases, can be overridden in specific tests
		vi.mocked(getMarkdownPageBySlug).mockResolvedValue(MOCK_ABOUT_PAGE); // Default to resolving 'about'
		vi.mocked(getAllMarkdownPages).mockReturnValue(MOCK_ALL_PAGES);
	});

	it('should render the page content correctly when found', async () => {
		const slug = 'about';
		vi.mocked(getMarkdownPageBySlug).mockResolvedValue(MOCK_ABOUT_PAGE); // Explicitly set for this test

		// Render the async component
		const PagePromise = Page({
			params: Promise.resolve({ page: slug }),
			searchParams: Promise.resolve({})
		});
		render(await PagePromise);

		// Check Title (H1) - Scope the search within the article to distinguish from markdown H1
		const article = screen.getByRole('article');
		// Use getAllByRole and check the first element, as both the page title H1
		// and the markdown H1 are within the article
		const headings = within(article).getAllByRole('heading', {
			level: 1,
			name: MOCK_ABOUT_PAGE.frontmatter.title
		});
		expect(headings[0]).toBeInTheDocument(); // Check the first H1 found (the page title)

		// Check Breadcrumb
		expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: MOCK_ABOUT_PAGE.frontmatter.title })).toHaveAttribute(
			'href',
			`/${slug}`
		);

		// Check some content snippet (ReactMarkdown renders the content)
		expect(screen.getByText('This is the content of the about page.')).toBeInTheDocument();

		// Check Header and Footer are present (assuming they have identifiable roles or text)
		expect(screen.getByRole('banner')).toBeInTheDocument(); // Assuming Header has role="banner"
		expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Assuming Footer has role="contentinfo"

		// Ensure notFound was NOT called
		expect(notFound).not.toHaveBeenCalled();
	});

	it('should call notFound if page data is not found', async () => {
		const slug = 'non-existent-page';
		vi.mocked(getMarkdownPageBySlug).mockResolvedValue(null); // Simulate page not found

		// Expect the component promise to reject because notFound throws
		await expect(
			Page({ params: Promise.resolve({ page: slug }), searchParams: Promise.resolve({}) })
		).rejects.toThrow('Mocked notFound called');

		// Verify notFound was called
		expect(notFound).toHaveBeenCalledTimes(1);
	});

	it('should use capitalized slug as title if frontmatter title is missing', async () => {
		const slug = 'missing-title';
		const mockPageWithoutTitle = {
			slug: slug,
			frontmatter: {
				title: '', // Use empty string to test fallback, satisfying the type
				description: 'Test description'
			},
			content: 'Page content here'
		};
		vi.mocked(getMarkdownPageBySlug).mockResolvedValue(mockPageWithoutTitle);

		const PagePromise = Page({
			params: Promise.resolve({ page: slug }),
			searchParams: Promise.resolve({})
		});
		render(await PagePromise);

		// Expect H1 to be the capitalized slug
		expect(screen.getByRole('heading', { level: 1, name: 'Missing-title' })).toBeInTheDocument();
		// Expect breadcrumb to also use capitalized slug
		expect(screen.getByRole('link', { name: 'Missing-title' })).toHaveAttribute('href', `/${slug}`);
	});
});

describe('generateMetadata - /app/[page]/page.tsx', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getMarkdownPageBySlug).mockReturnValue(MOCK_ABOUT_PAGE); // Use sync mock for sync function
	});

	it('should generate correct metadata for an existing page', async () => {
		const slug = 'about';
		vi.mocked(getMarkdownPageBySlug).mockReturnValue(MOCK_ABOUT_PAGE);

		const metadata = await generateMetadata({
			params: Promise.resolve({ page: slug }),
			searchParams: Promise.resolve({})
		});

		expect(metadata).toEqual({
			title: MOCK_ABOUT_PAGE.frontmatter.title,
			description: MOCK_ABOUT_PAGE.frontmatter.description
		});
		expect(getMarkdownPageBySlug).toHaveBeenCalledWith(slug);
	});

	it('should generate "Page Not Found" metadata if page data is not found', async () => {
		const slug = 'non-existent-page';
		vi.mocked(getMarkdownPageBySlug).mockReturnValue(null); // Simulate page not found

		const metadata = await generateMetadata({
			params: Promise.resolve({ page: slug }),
			searchParams: Promise.resolve({})
		});

		expect(metadata).toEqual({
			title: 'Page Not Found'
		});
		expect(getMarkdownPageBySlug).toHaveBeenCalledWith(slug);
	});

	it('should handle missing description in frontmatter', async () => {
		const slug = 'no-description';
		const mockPageWithoutDesc = {
			slug: slug,
			frontmatter: {
				title: 'No Description Page'
				// description is missing
			},
			content: 'Content...'
		};
		vi.mocked(getMarkdownPageBySlug).mockReturnValue(mockPageWithoutDesc);

		const metadata = await generateMetadata({
			params: Promise.resolve({ page: slug }),
			searchParams: Promise.resolve({})
		});

		expect(metadata).toEqual({
			title: 'No Description Page',
			description: '' // Expect empty string as fallback
		});
	});
});

describe('generateStaticParams - /app/[page]/page.tsx', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAllMarkdownPages).mockReturnValue(MOCK_ALL_PAGES);
	});

	it('should generate static params based on all markdown pages', async () => {
		const staticParams = await generateStaticParams();

		expect(staticParams).toEqual([{ page: MOCK_ABOUT_PAGE.slug }, { page: MOCK_USES_PAGE.slug }]);
		expect(getAllMarkdownPages).toHaveBeenCalledTimes(1);
	});

	it('should return an empty array if there are no markdown pages', async () => {
		vi.mocked(getAllMarkdownPages).mockReturnValue([]); // Simulate no pages

		const staticParams = await generateStaticParams();

		expect(staticParams).toEqual([]);
		expect(getAllMarkdownPages).toHaveBeenCalledTimes(1);
	});
});
