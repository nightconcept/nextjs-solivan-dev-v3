import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import { getAllMarkdownPages, getMarkdownPageBySlug } from '@/lib/content'; // Import new functions
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from '@/components/breadcrumb';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Define Props type for generateMetadata and the Page component
export type Props = { // Export the type
  params: Promise<{ page: string }> // Changed 'slug' to 'page'
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Generate metadata for the page dynamically
export async function generateMetadata(
  props: Props,
  // Optional: Access parent metadata
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;

  const {
    page: pageSlug
  } = params;

  // const pageSlug = params.page; // No longer needed
  const pageData = getMarkdownPageBySlug(pageSlug); // Use the new function

  if (!pageData) {
    // Return default metadata or handle as needed if page not found
    return {
      title: 'Page Not Found',
    };
  }

  // Return metadata object using frontmatter title
  return {
    title: pageData.frontmatter.title,
    description: pageData.frontmatter.description || '', // Use description from frontmatter if available
    // Add other metadata fields from frontmatter if desired
  };
}

// Generate static paths for all top-level markdown pages
export async function generateStaticParams() {
  const pages = getAllMarkdownPages(); // Use the new function
  return pages.map((page) => ({
    page: page.slug, // Parameter name must match the directory name [page]
  }));
}

// The main page component
export default async function Page(props: Props) {
  const params = await props.params;

  const {
    page: pageSlug
  } = params;

  // Destructure page directly
  // const pageSlug = params.page; // No longer needed
  const pageData = await getMarkdownPageBySlug(pageSlug); // Await the async function call

  // If the page data doesn't exist (e.g., invalid slug), show a 404 page
  if (!pageData) {
    notFound();
    // return null; // notFound() should handle this
  }

  // Capitalize the page slug for the breadcrumb label if title is missing (fallback)
  const pageTitle = pageData.frontmatter.title || pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              // Use dynamic title and path
              { label: pageTitle, href: `/${pageSlug}` }
            ]}
          />
          <article className="mt-8 relative">
            <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>
            {/* Render the markdown content */}
            <div className="prose dark:prose-invert max-w-none lg:prose-lg prose-headings:scroll-mt-20 prose-a:text-primary hover:prose-a:text-primary/80">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug, // Add IDs to headings
                    [rehypeAutolinkHeadings, { // Add links to headings
                        behavior: 'append',
                        properties: { className: ['anchor-link'], ariaHidden: true, tabIndex: -1 },
                        content: () => [
                          {
                            type: 'element',
                            tagName: 'span',
                            properties: { className: 'heading-link-icon', 'aria-hidden': 'true' },
                            children: []
                          }
                        ]
                    }]
                ]}
              >
                {pageData.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </div>
  );
}
