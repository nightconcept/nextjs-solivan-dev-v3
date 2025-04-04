import Header from "@/components/header";
import BlogPostList from "@/components/blog-post-list";
import Footer from "@/components/footer";
import { getAllPosts } from "@/lib/posts"; // Import the data fetching function
import { Metadata } from "next"; // Added for metadata
import { siteMetadataConfig } from "@/lib/metadata.config"; // Import the config

// Set static metadata for the blog list page
export const metadata: Metadata = {
  title: siteMetadataConfig.blogListTitle,
};

// Define props to accept searchParams
interface BlogPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Blog(props: BlogPageProps) {
  const searchParams = await props.searchParams;
  // Get page number from query parameters, default to 1
  const page = parseInt((searchParams?.page as string) || "1", 10);
  const currentPage = isNaN(page) || page < 1 ? 1 : page;

  const allPosts = getAllPosts({ includeContent: false }); // Fetch posts server-side, exclude content
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
          <BlogPostList posts={allPosts} page={currentPage} />{" "}
          {/* Pass posts data and current page */}
        </div>
        <Footer />
      </div>
    </div>
  );
}
