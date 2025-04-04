import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Breadcrumb from '@/components/breadcrumb';
import TableOfContents from '@/components/table-of-contents';
import { extractHeadings } from '@/lib/toc';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { format, isValid, parseISO } from 'date-fns'; // Using date-fns for formatting and validation

// Type definition for props passed to generateMetadata by Next.js
type MetadataProps = {
	params: { slug: string };
	// searchParams are available but not used here
	// searchParams: { [key: string]: string | string[] | undefined };
};

/**
 * Generates metadata for the blog post page (title, etc.).
 * Executed at build time or request time.
 * @param props Props containing route parameters (slug).
 * @returns Metadata object for the page.
 */
export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
	const { slug } = params;
	const post = getPostBySlug(slug);

	if (!post) {
		// Post not found, return basic metadata. The page component will handle the 404 rendering.
		return {
			title: 'Post Not Found'
		};
	}

	// Return metadata with the post's title.
	// Consider adding description: post.frontmatter.description or an excerpt here.
	return {
		title: post.frontmatter.title
	};
}

/**
 * Generates static paths for all blog posts at build time.
 * This tells Next.js which slugs to pre-render.
 * @returns An array of objects, each containing a slug parameter.
 */
export async function generateStaticParams() {
	// Fetch only slugs and necessary frontmatter, exclude full content for performance.
	const posts = getAllPosts({ includeContent: false });
	return posts.map((post) => ({
		slug: post.slug
	}));
}

// Type definition for props passed to the page component by Next.js
interface BlogPostPageProps {
	params: {
		slug: string;
	};
}

/**
 * Renders a single blog post page.
 * This is an async Server Component.
 * @param props Props containing route parameters (slug).
 * @returns JSX for the blog post page.
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = params;
	const post = getPostBySlug(slug);

	// If the post lookup returns null (invalid slug), trigger the Next.js 404 page.
	if (!post) {
		notFound();
		// Note: notFound() throws an error, so execution stops here.
		// The 'return null' is technically unreachable but satisfies TypeScript.
		return null;
	}

	// Extract headings from the markdown content to build the Table of Contents.
	const tocItems = await extractHeadings(post.content);

	// Fetch metadata for all posts to determine the previous and next posts for navigation.
	// Optimization note: This fetches all posts on every page load. Could be cached or pre-calculated if performance becomes an issue.
	const allPosts = getAllPosts({ includeContent: false });
	const currentIndex = allPosts.findIndex((p) => p.slug === slug);

	const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
	const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

	// Format the post's date for display. Handles potential invalid date strings.
	let formattedDate = 'Date Unavailable'; // Default fallback
	const dateString = post.frontmatter.date;
	if (dateString) {
		// Try parsing as ISO string first, then fall back to direct Date constructor
		let dateObject = parseISO(dateString);
		if (!isValid(dateObject)) {
			dateObject = new Date(dateString); // Attempt direct parsing
		}

		if (isValid(dateObject)) {
			formattedDate = format(dateObject, 'MMMM d, yyyy'); // e.g., January 1, 2024
		} else {
			console.warn(`Invalid date format for post "${slug}": ${dateString}`);
			formattedDate = 'Invalid Date';
		}
	}

	// Format author(s) into a display string. Handles single or multiple authors.
	const authorList = post.frontmatter.author;
	const authorsDisplay = Array.isArray(authorList)
		? authorList.join(', ')
		: authorList || 'Unknown Author'; // Provide a default if author is missing

	return (
		<main className="bg-background text-foreground min-h-screen">
			<div className="container mx-auto px-4">
				<Header />
				<div className="mx-auto mt-8 max-w-3xl">
					<Breadcrumb
						items={[
							{ label: 'Home', href: '/' },
							{ label: 'Blog', href: '/blog' },
							// The current post's title in the breadcrumb is not linked.
							{ label: post.frontmatter.title, href: `/blog/${slug}` }
						]}
					/>

					<article className="relative mt-8">
						<TableOfContents items={tocItems} />

						<h1 className="mb-4 text-3xl font-bold md:text-4xl">{post.frontmatter.title}</h1>

						<div className="text-muted-foreground mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
							{formattedDate && <span>{formattedDate}</span>}
							{formattedDate && authorsDisplay && <span className="mx-1">•</span>}
							{authorsDisplay && <span>By {authorsDisplay}</span>}
						</div>

						{/* Main content area rendered from Markdown */}
						{/* prose-headings:relative/group enables hover effects on heading links */}
						{/* prose-headings:scroll-mt-20 adds top margin when scrolling to headings via links */}
						<div className="prose dark:prose-invert lg:prose-lg prose-headings:scroll-mt-20 prose-headings:relative prose-headings:group prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								rehypePlugins={[
									rehypeSlug, // Add IDs to headings
									[
										rehypeAutolinkHeadings,
										{
											// Configuration for rehype-autolink-headings plugin:
											// Adds clickable anchor links (#) next to headings.
											behavior: 'append', // Places the link *after* the heading text.
											properties: {
												// CSS classes applied to the generated anchor link.
												// Uses Tailwind for styling:
												// - 'anchor-link': Base identifier (optional, for custom CSS).
												// - 'ml-2': Margin to space it from the heading.
												// - 'opacity-0 group-hover:opacity-100': Initially hidden, appears on heading hover (requires 'group' on heading parent).
												// - 'transition-opacity': Smooth fade effect.
												// - 'text-primary': Link color (can be adjusted).
												// - 'group-hover:underline': Underlines on hover for better affordance.
												className: [
													'anchor-link',
													'ml-2',
													'opacity-0',
													'group-hover:opacity-100',
													'transition-opacity',
													'text-primary',
													'group-hover:underline'
												],
												ariaHidden: true,
												tabIndex: -1
											},
											// The content of the anchor link (the visible symbol).
											content: { type: 'text', value: '#' }
										}
									]
								]}
								components={
									{
										// Custom React components can be provided here to override
										// default HTML elements rendered from Markdown.
										// Example: { img: CustomImage, a: CustomLink }
									}
								}
							>
								{post.content}
							</ReactMarkdown>
						</div>

						{/* Display post tags if available */}
						{post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
							<div className="border-border mt-12 border-t pt-6">
								<h3 className="mb-4 text-lg font-medium">Tags</h3>
								<div className="mb-8 flex flex-wrap gap-2">
									{post.frontmatter.tags.map((tag) => (
										<Link
											key={tag}
											href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`} // Basic slug generation for tag links
											className="bg-muted hover:bg-muted/80 text-muted-foreground rounded-md px-3 py-1 text-sm transition-colors"
										>
											{tag}
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Previous/Next Post Navigation */}
						<div
							className={`mt-12 flex items-start justify-between gap-4 ${
								// Add a top border only if there are no tags displayed above
								!post.frontmatter.tags || post.frontmatter.tags.length === 0
									? 'border-border border-t pt-8' // Increased spacing
									: 'pt-2' // Reduced spacing if tags are present
							}`}
						>
							{prevPost ? (
								<Link
									href={`/blog/${prevPost.slug}`}
									className="bg-muted hover:bg-muted/80 text-foreground flex max-w-[calc(50%-0.5rem)] flex-col items-start rounded-md px-4 py-3 font-medium transition-colors"
								>
									{/* Label and Icon */}
									<div className="mb-1 flex items-center text-sm">
										<span aria-hidden="true" className="mr-1">
											«
										</span>
										<span>Previous</span>
									</div>
									{/* Post Title (truncated if necessary, though CSS handles wrapping) */}
									<span className="text-muted-foreground block w-full text-xs break-words">
										{prevPost.title}
									</span>
								</Link>
							) : (
								// If no previous post, link back to the main blog page.
								<Link
									href="/blog"
									className="bg-muted hover:bg-muted/80 text-foreground flex max-w-[calc(50%-0.5rem)] items-center rounded-md px-4 py-3 font-medium transition-colors" // Match styling of prev/next links
								>
									<span aria-hidden="true" className="mr-1">
										«
									</span>
									<span>All Posts</span>
								</Link>
							)}

							{nextPost ? (
								<Link
									href={`/blog/${nextPost.slug}`}
									className="bg-muted hover:bg-muted/80 text-foreground ml-auto flex max-w-[calc(50%-0.5rem)] flex-col items-end rounded-md px-4 py-3 font-medium transition-colors" // ml-auto pushes to the right
								>
									{/* Label and Icon */}
									<div className="mb-1 flex items-center text-sm">
										<span>Next</span>
										<span aria-hidden="true" className="ml-1">
											»
										</span>
									</div>
									{/* Post Title (truncated if necessary, though CSS handles wrapping) */}
									<span className="text-muted-foreground block w-full text-right text-xs break-words">
										{nextPost.title}
									</span>
								</Link>
							) : (
								// If no next post, render an empty div to maintain the flexbox layout alignment.
								<div className="max-w-[calc(50%-0.5rem)]" aria-hidden="true"></div>
							)}
						</div>
					</article>
				</div>
				<Footer />
			</div>
		</main>
	);
}
