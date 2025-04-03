"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { PostMetadata } from "@/lib/posts" // Only import the type
import { ChevronRight } from "lucide-react"

// Define props interface
interface BlogPostListProps {
  posts: PostMetadata[]; // Add posts prop
  page?: number;
  postsPerPage?: number;
  showSeeMore?: boolean;
}

// Removed top-level getAllPosts() call

export default function BlogPostList({ posts, page = 1, postsPerPage = 5, showSeeMore = false }: BlogPostListProps) { // Accept posts prop
  const router = useRouter()
  const [clickedPostSlug, setClickedPostSlug] = useState<string | null>(null) // Use slug (string) instead of id (number)
// Filter out draft posts BEFORE pagination/rendering
const publishedPosts = posts.filter(post => post.draft !== true); // Keep if draft is false or undefined

// Calculate pagination based on the *filtered* posts
const totalPosts = publishedPosts.length // Use filtered list length
const totalPages = Math.ceil(totalPosts / postsPerPage)
const startIndex = (page - 1) * postsPerPage
const endIndex = startIndex + postsPerPage
const currentPosts = publishedPosts.slice(startIndex, endIndex) // Slice the filtered list
  const hasMorePosts = totalPosts > postsPerPage && currentPosts.length > 0 // Check if there are actually posts to show more of

  const handlePostClick = (slug: string) => {
    console.log("Clicked post with slug:", slug); // Add console log
    setClickedPostSlug(slug)
    // Navigate after a short delay for visual feedback
    setTimeout(() => {
      router.push(`/blog/${slug}`) // Use slug in the URL
    }, 300)
  }

  return (
    <div>
      <div className="space-y-8">
        {currentPosts.map((post) => (
          <article
            key={post.slug} // Use slug as the key
            className={`bg-card dark:bg-card rounded-lg shadow-md p-6 cursor-pointer transition-transform duration-300 ${
              clickedPostSlug === post.slug ? "scale-[0.98]" : "" // Compare with clickedPostSlug
            }`}
            onClick={() => handlePostClick(post.slug)} // Pass slug to handler
          >
            <h3 className="text-xl font-bold mb-2 hover:text-primary/80 dark:hover:text-primary/80 transition-colors">
              {post.title}
            </h3>
            <p className="text-card-foreground dark:text-card-foreground mb-4">{post.excerpt}</p>
            <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
              {/* Format dateObject for display */}
              <span>{post.dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime} read</span>
              {post.author && ( // Conditionally render author if available
                <>
                  <span className="mx-2">•</span>
                  <span>By {Array.isArray(post.author) ? post.author.join(', ') : post.author}</span>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {showSeeMore && hasMorePosts ? (
        <div className="mt-8">
          <Link
            href="/blog"
            className="bg-card dark:bg-card rounded-lg shadow-md p-6 flex justify-between items-center hover:bg-card/90 dark:hover:bg-card/90 transition-colors w-full"
          >
            <span className="font-medium">See More</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      ) : (
        <div className="flex justify-between mt-8">
          {page > 1 ? (
            <Link
              href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
              className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-6 py-2 rounded-md font-medium transition-colors"
            >
              « Prev
            </Link>
          ) : (
            <div></div>
          )}

          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-6 py-2 rounded-md font-medium transition-colors ml-auto"
            >
              Next »
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// Removed export { blogPosts } as mock data is no longer used
