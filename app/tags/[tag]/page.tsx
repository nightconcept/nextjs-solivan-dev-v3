import Header from "@/components/header"
import Footer from "@/components/footer"
import Breadcrumb from "@/components/breadcrumb"
import { blogPosts } from "@/components/blog-post-list"
import Link from "next/link"

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const tag = params.tag.replace(/-/g, " ")
  const formattedTag = tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const filteredPosts = blogPosts.filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))

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
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-card dark:bg-card rounded-lg shadow-md p-6">
                  <Link href={`/blog/${post.id}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-primary/80 dark:hover:text-primary/80 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
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
          ) : (
            <p>No posts found with this tag.</p>
          )}
        </div>
        <Footer />
      </div>
    </div>
  )
}

