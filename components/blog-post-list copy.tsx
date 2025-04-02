"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronRight } from "lucide-react"

// Mock data for blog posts
const blogPosts = [
  {
    id: 1,
    title: "Getting Started with JAMStack",
    excerpt:
      "JAMStack is a modern web development architecture based on client-side JavaScript, reusable APIs, and prebuilt Markup. In this post, we'll explore how to get started with JAMStack and why it might be the right choice for your next project.",
    date: "November 15, 2023",
    readTime: "5 min",
    author: "Danny",
    tags: ["JAMStack", "Web Development", "JavaScript"],
  },
  {
    id: 2,
    title: "The Power of Stoicism in Software Engineering",
    excerpt:
      "Stoicism, an ancient Greek philosophy, has surprising applications in modern software engineering. Learn how principles like focusing on what you can control and embracing challenges can make you a better developer.",
    date: "November 1, 2023",
    readTime: "7 min",
    author: "Danny",
    tags: ["Philosophy", "Software Engineering", "Productivity"],
  },
  {
    id: 3,
    title: "Building a Personal Blog with Next.js",
    excerpt:
      "Next.js is a powerful React framework that makes building static and server-rendered applications a breeze. In this tutorial, I'll walk through how I built this very blog using Next.js, Tailwind CSS, and more.",
    date: "October 20, 2023",
    readTime: "10 min",
    author: "Danny",
    tags: ["Next.js", "React", "Tailwind CSS", "Tutorial"],
  },
  {
    id: 4,
    title: "Advanced Code Formatting and UI Components",
    excerpt:
      "Learn how to implement beautiful code blocks with syntax highlighting, create interactive accordions, and style inline code. This post demonstrates various UI components and formatting techniques for technical blogs.",
    date: "October 5, 2023",
    readTime: "8 min",
    author: "Danny",
    tags: ["UI Design", "Code Formatting", "Web Development", "Accessibility"],
  },
]

export default function BlogPostList({ page = 1, postsPerPage = 3, showSeeMore = false }) {
  const router = useRouter()
  const [clickedPostId, setClickedPostId] = useState<number | null>(null)

  // Calculate pagination
  const totalPosts = blogPosts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const startIndex = (page - 1) * postsPerPage
  const endIndex = startIndex + postsPerPage
  const currentPosts = blogPosts.slice(startIndex, endIndex)
  const hasMorePosts = totalPosts > postsPerPage

  const handlePostClick = (postId: number) => {
    setClickedPostId(postId)
    setTimeout(() => {
      router.push(`/blog/${postId}`)
    }, 300) // Small delay for the zoom effect
  }

  return (
    <div>
      <div className="space-y-8">
        {currentPosts.map((post) => (
          <article
            key={post.id}
            className={`bg-card dark:bg-card rounded-lg shadow-md p-6 cursor-pointer transition-transform duration-300 ${
              clickedPostId === post.id ? "scale-[0.98]" : ""
            }`}
            onClick={() => handlePostClick(post.id)}
          >
            <h3 className="text-xl font-bold mb-2 hover:text-primary/80 dark:hover:text-primary/80 transition-colors">
              {post.title}
            </h3>
            <p className="text-card-foreground dark:text-card-foreground mb-4">{post.excerpt}</p>
            <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime} read</span>
              <span className="mx-2">•</span>
              <span>By {post.author}</span>
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
              href={page === 2 ? "/blog" : `/blog/page/${page - 1}`}
              className="bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/80 text-foreground dark:text-foreground px-6 py-2 rounded-md font-medium transition-colors"
            >
              « Prev
            </Link>
          ) : (
            <div></div>
          )}

          {page < totalPages && (
            <Link
              href={`/blog/page/${page + 1}`}
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

// Export blog posts data for use in other components
export { blogPosts }

