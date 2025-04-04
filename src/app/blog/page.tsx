import Header from '@/components/header';
import BlogPostList from '@/components/blog-post-list';
import Footer from '@/components/footer';
import { getAllPosts } from '@/lib/posts';
import { Metadata } from 'next';
import { siteMetadataConfig } from '@/lib/metadata.config';

// Set static metadata for the blog list page (used for SEO and browser tab title)
export const metadata: Metadata = {
	title: siteMetadataConfig.blogListTitle
};

// Define the expected props for the Blog page component.
// 'searchParams' is optional and comes from Next.js routing for URL query parameters.
// It's a Promise because Server Components can stream props.
interface BlogPageProps {
	searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Renders the main blog listing page at the '/blog' route.
 * Fetches all blog posts (metadata only, not full content) and displays them
 * using the BlogPostList component, handling pagination based on the 'page'
 * query parameter in the URL (e.g., /blog?page=2).
 *
 * @param props - Component props including potential search parameters.
 * @returns The rendered blog page component.
 */
export default async function BlogPage({ searchParams: searchParamsProp }: BlogPageProps) {
	// Resolve the searchParams promise if it exists, otherwise use an empty object.
	const searchParams = (await searchParamsProp) ?? {};

	// Get the 'page' query parameter from the URL.
	const pageQueryParam = searchParams?.page as string | undefined;
	// Parse the page number, defaulting to '1' if it's missing or empty.
	const parsedPage = parseInt(pageQueryParam || '1', 10);
	// Validate the parsed page number. If it's not a number (NaN) or less than 1,
	// default to page 1. Otherwise, use the parsed number.
	const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	// Fetch metadata for all posts server-side.
	// We exclude the full 'content' here for performance, as it's not needed for the list view.
	const allPosts = getAllPosts({ includeContent: false });

	return (
		// Using Tailwind CSS classes for styling. 'min-h-screen' ensures the background covers the full viewport height.
		<div className="bg-background text-foreground min-h-screen">
			{/* 'container' centers content and 'mx-auto px-4' adds horizontal padding */}
			<div className="container mx-auto px-4">
				<Header />
				{/* 'main' tag denotes the primary content area of the page */}
				{/* 'max-w-3xl' limits content width for readability, 'mt-8' adds top margin */}
				<main className="mx-auto mt-8 max-w-3xl">
					<h1 className="mb-8 text-3xl font-bold">Blog Posts</h1>
					{/* Pass the fetched posts and the calculated current page number to the list component */}
					<BlogPostList posts={allPosts} page={currentPage} />
				</main>
				<Footer />
			</div>
		</div>
	);
}
