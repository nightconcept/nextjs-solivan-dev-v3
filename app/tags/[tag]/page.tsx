import Header from "@/components/header"
import Footer from "@/components/footer"
import Breadcrumb from "@/components/breadcrumb";
import { getAllPosts, PostMetadata } from "@/lib/posts"; // Import from lib/posts
import Link from "next/link";
import { notFound } from "next/navigation"; // Import notFound if needed
import { Metadata, ResolvingMetadata } from 'next'; // Added for metadata
import { siteMetadataConfig } from '@/lib/metadata.config'; // Import the config

// Define Props type for generateMetadata
type Props = {
  params: { tag: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Generate metadata for the tag page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata // Optional: Access parent metadata
): Promise<Metadata> {
  const tagSlug = params.tag;

  // Use the template function from the config
  const title = siteMetadataConfig.tagPageTitleTemplate(tagSlug);

  return {
    title: title,
  };
}

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const tag = params.tag.replace(/-/g, " ")
  const formattedTag = tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const allPosts = getAllPosts({ includeContent: false }); // Fetch all posts, exclude content
  const filteredPosts = allPosts.filter((post: PostMetadata) => // Add type annotation
    post.tags?.some((t: string) => t.toLowerCase() === params.tag.toLowerCase()) // Compare with original param tag
  );

  // Optional: Handle case where no posts match the tag
  // if (!filteredPosts.length) {
  //   notFound(); // Or render a message component
  // }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: `Tag: ${formattedTag}`, href: `/tags/${params.tag}` },
            ]}
          />

          <h1 className="text-3xl font-bold mt-8 mb-6">Posts tagged with "{formattedTag}"</h1>

          {filteredPosts.length > 0 ? (
            <div className="space-y-8">
              {filteredPosts.map((post: PostMetadata) => ( // Add type annotation
                <article key={post.slug} className="bg-card dark:bg-card rounded-lg shadow-md p-6"> {/* Use slug for key */}
                  <Link href={`/blog/${post.slug}`}> {/* Use slug for link */}
                    <h3 className="text-xl font-bold mb-2 hover:text-primary/80 dark:hover:text-primary/80 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-card-foreground dark:text-card-foreground mb-4">{post.excerpt}</p> {/* Use generated excerpt */}
                  <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                    {/* Format dateObject */}
                    <span>{post.dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime} read</span> {/* Use calculated readTime */}
                    {post.author && ( // Conditionally render author
                      <>
                        <span className="mx-2">•</span>
                        <span>By {Array.isArray(post.author) ? post.author.join(', ') : post.author}</span>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>No posts found with this tag.</p>
          )}
        </div>
        <Footer />
      </div>
    </div>
  )
}

