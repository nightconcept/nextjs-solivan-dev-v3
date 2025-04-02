import Header from "@/components/header";
import BlogPostList from "@/components/blog-post-list";
import Footer from "@/components/footer";
import { getAllPosts } from "@/lib/posts"; // Import the data fetching function

export default function MorePosts() {
  const allPosts = getAllPosts(); // Fetch posts server-side
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">More Posts</h1>
          <BlogPostList posts={allPosts} /> {/* Pass posts data */}
        </div>
        <Footer />
      </div>
    </div>
  )
}

