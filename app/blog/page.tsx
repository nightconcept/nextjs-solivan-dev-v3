import Header from "@/components/header";
import BlogPostList from "@/components/blog-post-list";
import Footer from "@/components/footer";
import { getAllPosts } from "@/lib/posts"; // Import the data fetching function
import { Metadata } from 'next'; // Added for metadata
import { siteMetadataConfig } from '@/lib/metadata.config'; // Import the config

// Set static metadata for the blog list page
export const metadata: Metadata = {
  title: siteMetadataConfig.blogListTitle,
};

export default function Blog() {
  const allPosts = getAllPosts({ includeContent: false }); // Fetch posts server-side, exclude content
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
          <BlogPostList posts={allPosts} /> {/* Pass posts data */}
        </div>
        <Footer />
      </div>
    </div>
  )
}

