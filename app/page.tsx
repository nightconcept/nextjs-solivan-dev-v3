import Header from "@/components/header"
import ProfileCard from "@/components/profile-card"
import BlogPostList from "@/components/blog-post-list";
import Footer from "@/components/footer";
import { getAllPosts } from "@/lib/posts"; // Import the data fetching function

export default function Home() {
  const allPosts = getAllPosts(); // Fetch posts server-side
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <ProfileCard />
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Recent Posts</h2>
            <BlogPostList posts={allPosts} postsPerPage={3} showSeeMore={true} /> {/* Pass posts data */}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

