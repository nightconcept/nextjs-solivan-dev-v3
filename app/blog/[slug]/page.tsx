import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug, PostMetadata } from '@/lib/posts';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Breadcrumb from '@/components/breadcrumb';
import { ChevronLeft, ChevronRight, LinkIcon } from 'lucide-react'; // Assuming LinkIcon is used by rehype-autolink-headings implicitly or we add custom component later
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { format } from 'date-fns'; // Using date-fns for formatting

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPosts(); // Fetch all posts metadata
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Define props structure for the page component
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// The main page component
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await the params promise before accessing its properties
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const post = getPostBySlug(slug);

  // If the post doesn't exist (e.g., invalid slug), show a 404 page
  if (!post) {
    notFound();
    return null; // Explicitly return to prevent further execution, though notFound should handle this
  }

  // Fetch all posts again to find previous/next links (could be optimized later if needed)
  const allPosts = getAllPosts();
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
            {/* Table of Contents could be added here later if needed */}
            {/* Example: <TableOfContents content={post.content} /> */}

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.frontmatter.title}</h1>

            <div className="flex flex-wrap items-center text-sm text-muted-foreground mb-8 gap-x-3 gap-y-1">
              {formattedDate && <span>{formattedDate}</span>}
              {formattedDate && authors && <span className="mx-1">•</span>}
              {authors && <span>By {authors}</span>}
              {/* Read time could be calculated and added here */}
            </div>

            {/* Render the markdown content */}
            <div className="prose dark:prose-invert max-w-none lg:prose-lg prose-headings:scroll-mt-20 prose-a:text-primary hover:prose-a:text-primary/80">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug, // Add IDs to headings
                    [rehypeAutolinkHeadings, { // Add links to headings
                        behavior: 'append', // 'wrap', 'prepend', 'append'
                        properties: { className: ['anchor-link'], ariaHidden: true, tabIndex: -1 },
                        content: () => [ // Use LinkIcon (or similar) - requires custom component mapping or careful CSS
                            {
                                type: 'element',
                                tagName: 'svg', // Placeholder, ideally map to Lucide icon
                                properties: {
                                    className: 'inline-block w-4 h-4 ml-1 text-muted-foreground',
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    viewBox: '0 0 24 24',
                                    fill: 'none',
                                    stroke: 'currentColor',
                                    strokeWidth: '2',
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                },
                                children: [
                                    { type: 'element', tagName: 'path', properties: { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' } },
                                    { type: 'element', tagName: 'path', properties: { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' } }
                                ]
                            }
                        ]
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
            <div className={`flex justify-between mt-8 ${(!post.frontmatter.tags || post.frontmatter.tags.length === 0) ? 'pt-6 border-t border-border' : ''}`}>
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Previous</span>
                </Link>
              ) : (
                // Link to blog index if no previous post
                <Link
                  href="/blog"
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>All Posts</span>
                </Link>
              )}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                // Optional: Add a link back to home or blog index if no next post
                <span /> // Render nothing or a disabled link
              )}
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  );
}