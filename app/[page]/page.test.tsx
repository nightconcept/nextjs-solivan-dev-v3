import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from './page'; // Import the default export
import { getMarkdownPageBySlug } from '@/lib/content'; // Import the function to mock
import { notFound } from 'next/navigation'; // Import notFound for mocking reference

// Mock the content fetching function
vi.mock('@/lib/content', async (importOriginal) => {
	const original = (await importOriginal()) as typeof import('@/lib/content');
	return {
		...original, // Keep other exports if any
		getMarkdownPageBySlug: vi.fn(), // Mock the specific function
		getAllMarkdownPages: vi.fn(() => [{ slug: 'about' }, { slug: 'archives' }]) // Mock for generateStaticParams if needed by test setup
	};
});

// Mock child components
vi.mock('@/components/header', () => ({
	default: () => <div>Mock Header</div>
}));
vi.mock('@/components/footer', () => ({
	default: () => <div>Mock Footer</div>
}));
// Define a type for the breadcrumb items used in the mock
interface MockBreadcrumbItem {
	label: string;
	href?: string; // Optional href if needed
}
vi.mock('@/components/breadcrumb', () => ({
	default: ({ items }: { items: MockBreadcrumbItem[] }) => (
		<nav>Mock Breadcrumb: {items.map((item) => item.label).join(' > ')}</nav>
	)
}));

// Mock next/navigation - Keep the actual import above for vi.mocked typing
vi.mock('next/navigation', () => ({
	// Mock only the functions needed by the component under test
	notFound: vi.fn(() => {
		throw new Error('Test Not Found');
	})
	// Add mocks for other navigation functions if they were used (e.g., useRouter, usePathname)
}));

// Define a local type for the props expected by the component in this test context
// Import the actual Props type from the component file
import { type Props as PageProps } from './page';

// Use the imported Props type or a compatible one for testing
// If PageProps is exactly what we need, we can use it directly.
// If we need a slightly different shape for testing, define a specific test type.
// Here, PageProps seems suitable.

describe('Dynamic Page ([page]/page.tsx)', () => {
	// Cast the mock function to the correct type for TypeScript
	const mockedGetMarkdownPageBySlug = vi.mocked(getMarkdownPageBySlug);

	beforeEach(() => {
		// Reset mocks before each test
		mockedGetMarkdownPageBySlug.mockReset();
		vi.mocked(notFound).mockClear(); // Clear notFound mock calls
	});

	it.todo('renders the page title and content when data is found', async () => {
		// Setup mock return value for 'about' slug
		const mockPageData = {
			slug: 'about',
			frontmatter: {
				title: 'Mock About Title',
				description: 'Mock description'
			},
			content: 'This is the mock about page content.'
		};
		mockedGetMarkdownPageBySlug.mockResolvedValue(mockPageData); // Use mockResolvedValue for async simulation

		// Render the component for the 'about' page
		// Provide props matching the PageProps type (wrapped in Promises)
		const props: PageProps = {
			params: Promise.resolve({ page: 'about' }),
			searchParams: Promise.resolve({})
		};
		// Render is async for async components
		// Resolve the async component before rendering
		// Render the async component directly using JSX
		// No need to cast anymore, props match the expected type
		render(<Page {...props} />);

		// Wait for the heading based on the mocked title to appear
		const heading = await screen.findByRole('heading', {
			name: /mock about title/i
		});
		expect(heading).toBeInTheDocument();

		// Check if mock content is present (use findByText for consistency with async nature)
		expect(await screen.findByText(/this is the mock about page content/i)).toBeInTheDocument();

		// Check if breadcrumb is rendered with correct data (use findByText)
		expect(
			await screen.findByText(/Mock Breadcrumb: Home > Mock About Title/i)
		).toBeInTheDocument();

		// Ensure the mock function was called correctly
		expect(mockedGetMarkdownPageBySlug).toHaveBeenCalledWith('about');
	});

	it('calls notFound() when page data is not found', async () => {
		// Setup mock to return null (page not found)
		mockedGetMarkdownPageBySlug.mockReturnValue(null);

		// Expect the notFound function (mocked to throw) to be called
		// Use waitFor to handle the async nature and potential state updates before notFound is called
		const props: PageProps = {
			params: Promise.resolve({ page: 'nonexistent' }),
			searchParams: Promise.resolve({})
		};
		// Render the component, it might complete even if notFound is called internally
		render(<Page {...props} />); // render is sync

		// Assert that notFound was called after rendering and async operations
		// Use waitFor to ensure we wait for the possibility of notFound being called asynchronously
		await waitFor(() => {
			// This assertion is now inside the waitFor block above
		});

		expect(mockedGetMarkdownPageBySlug).toHaveBeenCalledWith('nonexistent');
		expect(vi.mocked(notFound)).toHaveBeenCalledTimes(1);
	});

	// Add more tests as needed, e.g., for different slugs, missing frontmatter fields, etc.
});
