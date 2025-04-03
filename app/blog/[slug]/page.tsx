import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata, ResolvingMetadata } from 'next'; // Added for metadata
import { getAllPosts, getPostBySlug, PostMetadata } from '@/lib/posts';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Breadcrumb from '@/components/breadcrumb';
import TableOfContents from '@/components/table-of-contents'; // Added TOC component
import { extractHeadings } from '@/lib/toc'; // Added heading extraction utility
import { Link as LinkIcon } from 'lucide-react'; // Added for potential future icon use, though not directly in rehype content for now
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { format } from 'date-fns'; // Using date-fns for formatting

// Define Props type for generateMetadata
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Generate metadata for the page
export async function generateMetadata(
  props: Props,
  // Optional: Access parent metadata
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const post = getPostBySlug(slug); // Fetch post data

  if (!post) {
    // Optionally handle not found case for metadata, though page itself handles 404
    return {
      title: 'Post Not Found',
    };
  }

  // Return metadata object
  return {
    title: post.frontmatter.title,
    // You could add description: post.excerpt here too
  };
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts({ includeContent: false }); // Fetch posts metadata, exclude content
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Define props structure for the page component
interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// The main page component
export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  // Directly access slug from params
  const { slug } = params;
  const post = getPostBySlug(slug);

  // If the post doesn't exist (e.g., invalid slug), show a 404 page
  if (!post) {
    notFound();
    return null; // Explicitly return to prevent further execution, though notFound should handle this
  }

  // Extract headings for TOC
  const tocItems = await extractHeadings(post.content);
  // Removed console.log for debugging
  // Fetch all posts again to find previous/next links (could be optimized later if needed)
  const allPosts = getAllPosts({ includeContent: false }); // Fetch posts for nav, exclude content
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);

  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Format date for display
  let formattedDate = '';
  try {
    // Ensure date is valid before formatting
    const dateObject = new Date(post.frontmatter.date);
    if (!isNaN(dateObject.getTime())) {
      formattedDate = format(dateObject, 'MMMM d, yyyy'); // Example format: January 1, 2024
    } else {
        console.warn(`Invalid date format for post ${slug}: ${post.frontmatter.date}`);
        formattedDate = 'Invalid Date'; // Fallback display
    }
  } catch (error) {
      console.error(`Error formatting date for post ${slug}:`, error);
      formattedDate = 'Error Formatting Date'; // Fallback display
  }


  // Format author(s)
  const authors = Array.isArray(post.frontmatter.author)
    ? post.frontmatter.author.join(', ')
    : post.frontmatter.author || 'Unknown Author'; // Default if author is missing

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              // Current post title is not linked
              { label: post.frontmatter.title, href: `/blog/${slug}` }, // Removed active: true
            ]}
          />

          <article className="mt-8 relative">
            {/* Add Table of Contents */}
            <TableOfContents items={tocItems} />

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.frontmatter.title}</h1>

            <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8 gap-x-3 gap-y-1">
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && authors && <span className="mx-1">•</span>}
              {authors && <span>By {authors}</span>}
              {/* Read time could be calculated and added here */}
            </div>

            {/* Render the markdown content */}
            {/* Added prose-headings:relative and prose-headings:group for hover effect */}
            <div className="prose dark:prose-invert max-w-none lg:prose-lg prose-headings:scroll-mt-20 prose-headings:relative prose-headings:group prose-a:text-primary hover:prose-a:text-primary/80">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug, // Add IDs to headings
                    [rehypeAutolinkHeadings, { // Add links to headings
                        behavior: 'append', // 'wrap', 'prepend', 'append'
                        // Added Tailwind classes for hover effect and basic styling
                        properties: {
                            // Restored opacity, removed absolute positioning, added margin-left
                            // Added text-primary for color
                            // Removed text-primary to inherit prose link color
                            className: ['anchor-link', 'ml-2', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'text-primary', 'group-hover:underline'],
                            ariaHidden: true,
                            tabIndex: -1
                        },
                        // Using '#' symbol for the link content
                        content: { type: 'text', value: '#' }
                    }]
                ]}
                components={{
                  // Optional: Add custom components for specific markdown elements
                  // e.g., img: CustomImageComponent, a: CustomLinkComponent
                  // Note: Styling the autolink icon might require CSS targeting '.anchor-link svg'
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Tags Section */}
            {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-border">
                <h3 className="text-lg font-medium mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {post.frontmatter.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`} // Simple slugification
                      className="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Section */}
            {/* Navigation Section - Updated Styling & Content */}
            <div className={`flex justify-between items-start mt-8 gap-4 ${(!post.frontmatter.tags || post.frontmatter.tags.length === 0) ? 'pt-6 border-t border-border' : ''}`}>
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-4 py-3 rounded-md font-medium transition-colors flex flex-col items-start max-w-[calc(50%-0.5rem)]" // Added styles, flex-col, max-width
                >
                  <div className="flex items-center text-sm mb-1"> {/* Wrapper for icon and label */}
                    <span className="mr-1">«</span> {/* Replaced ChevronLeft */}
                    <span>Previous</span>
                  </div>
                  <span className="text-xs text-muted-foreground block w-full break-words"> {/* Title below, allows wrapping */}
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                // Link to blog index if no previous post - Updated Styling
                (<Link
                  href="/blog"
                  className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-6 py-2 rounded-md font-medium transition-colors flex items-center max-w-[calc(50%-0.5rem)]" // Added styles, kept items-center
                >
                  <span className="mr-1">«</span> {/* Replaced ChevronLeft */}
                  <span>All Posts</span>
                </Link>)
              )}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-4 py-3 rounded-md font-medium transition-colors flex flex-col items-end ml-auto max-w-[calc(50%-0.5rem)]" // Added styles, flex-col, items-end, ml-auto, max-width
                >
                   <div className="flex items-center text-sm mb-1"> {/* Wrapper for icon and label */}
                    <span>Next</span>
                    <span className="ml-1">»</span> {/* Replaced ChevronRight */}
                  </div>
                  <span className="text-xs text-muted-foreground block w-full text-right break-words"> {/* Title below, allows wrapping */}
                    {nextPost.title}
                  </span>
                </Link>
              ) : (
                 // Placeholder to maintain layout if no next post
                 (<div className="max-w-[calc(50%-0.5rem)]"></div>) // Takes up space
              )}
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  );
}