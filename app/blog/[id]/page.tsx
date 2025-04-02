"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import Breadcrumb from "@/components/breadcrumb"
import TableOfContents from "@/components/table-of-contents"
import { blogPosts } from "@/components/blog-post-list"
import Link from "next/link"
import { ChevronLeft, ChevronRight, LinkIcon } from "lucide-react"
import CodeBlock from "@/components/code-block"
import { Accordion, AccordionItem } from "@/components/accordion"

export default function BlogPost({ params }: { params: { id: string } }) {
  const postId = Number.parseInt(params.id)
  const post = blogPosts.find((post) => post.id === postId)

  // Find previous and next posts
  const currentIndex = blogPosts.findIndex((post) => post.id === postId)
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null

  // Table of contents items - different for each post
  let tocItems = [
    { id: "why-jamstack", title: "Why JAMStack?", level: 2 },
    { id: "getting-started", title: "Getting Started", level: 2 },
  ]

  // For post 4 (Advanced Code Formatting)
  if (postId === 4) {
    tocItems = [
      { id: "code-formatting", title: "Code Formatting", level: 2 },
      { id: "accordion-components", title: "Accordion Components", level: 2 },
      { id: "inline-code", title: "Inline Code", level: 2 },
    ]
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4">
          <Header />
          <div className="mt-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Post Not Found</h1>
            <p>Sorry, the blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="text-primary hover:underline mt-4 inline-block">
              Back to Blog
            </Link>
          </div>
          <Footer />
        </div>
      </main>
    )
  }

  // Render different content based on post ID
  const renderPostContent = () => {
    if (postId === 4) {
      return (
        <>
          <p>
            When writing technical content, proper formatting is essential for readability and comprehension. This post
            demonstrates various UI components and formatting techniques that can enhance your technical blog.
          </p>

          <h2 id="code-formatting" className="group flex items-center">
            Code Formatting
            <a href="#code-formatting" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </a>
          </h2>

          <p>
            Code blocks are essential for technical blogs. Here's an example of a React component with Tokyo Night
            theme:
          </p>

          <CodeBlock language="tsx">
            {`import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({
  initialCount = 0
}) => {
  const [count, setCount] = useState(initialCount);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={decrement}
        className="px-3 py-1 rounded-md bg-red-500 text-white"
      >
        -
      </button>
      <span className="text-xl font-bold">{count}</span>
      <button
        onClick={increment}
        className="px-3 py-1 rounded-md bg-green-500 text-white"
      >
        +
      </button>
    </div>
  );
};`}
          </CodeBlock>

          <p>
            Notice how the code block uses the Tokyo Night theme with proper syntax highlighting. The monospaced font
            also supports ligatures, making arrows (=&gt;) and other operators more readable.
          </p>

          <h2 id="accordion-components" className="group flex items-center">
            Accordion Components
            <a href="#accordion-components" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </a>
          </h2>

          <p>
            Accordions are useful for organizing content in a collapsible manner, saving space while keeping information
            accessible:
          </p>

          <Accordion>
            <AccordionItem title="What is an accordion?">
              An accordion is a vertically stacked set of interactive headings that each reveal a section of content.
              They're useful when you want to toggle between hiding and showing large amounts of content.
            </AccordionItem>
            <AccordionItem title="When should I use accordions?">
              Use accordions when you need to conserve space while dealing with large amounts of content. They're
              particularly useful for FAQs, product details, or any content that can be logically divided into sections.
            </AccordionItem>
            <AccordionItem title="Accessibility considerations">
              Ensure accordions are keyboard navigable and properly announce their state to screen readers. The
              implementation should use appropriate ARIA attributes and follow best practices for interactive
              components.
            </AccordionItem>
          </Accordion>

          <p className="mt-6">
            Accordions can significantly improve the user experience by reducing cognitive load and allowing users to
            focus on specific content.
          </p>

          <h2 id="inline-code" className="group flex items-center">
            Inline Code
            <a href="#inline-code" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </a>
          </h2>

          <p>
            For inline code references, use backticks to highlight variables, function names, or short code snippets.
            For example:
          </p>

          <ul className="list-disc pl-6 my-4">
            <li>Use `useState` to manage component state in React</li>
            <li>The `map()` function creates a new array with the results of calling a function on every element</li>
            <li>Configure your project with `next.config.js`</li>
          </ul>

          <p>
            Inline code should be visually distinct from regular text but not disruptive to the reading flow. The
            monospaced font helps distinguish code from regular text while maintaining readability.
          </p>
        </>
      )
    }

    // Default content for other posts
    return (
      <>
        <p>
          JAMStack is revolutionizing how we build websites by focusing on JavaScript, APIs, and Markup. This approach
          offers numerous benefits including improved performance, higher security, and better developer experience.
        </p>

        <p>
          When you build a JAMStack site, you're essentially pre-building all the pages during a build process. This
          means that instead of generating pages on-demand when users request them (like in traditional server-rendered
          applications), your pages are already built and ready to serve.
        </p>

        <h2 id="why-jamstack" className="group flex items-center">
          Why JAMStack?
          <a href="#why-jamstack" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </a>
        </h2>

        <p>There are several compelling reasons to consider JAMStack for your next project:</p>

        <ul>
          <li>
            <strong>Performance</strong>: Pre-rendered pages can be served directly from a CDN, resulting in extremely
            fast load times.
          </li>
          <li>
            <strong>Security</strong>: With no server-side processes, there's a significantly reduced attack surface.
          </li>
          <li>
            <strong>Scalability</strong>: Static assets can be served from CDNs globally, making scaling effortless.
          </li>
          <li>
            <strong>Developer Experience</strong>: The clear separation of frontend and backend concerns leads to a more
            streamlined development process.
          </li>
        </ul>

        <p>
          If you're interested in learning more, check out{" "}
          <a href="https://jamstack.org" className="text-primary hover:text-primary-dark underline">
            jamstack.org
          </a>{" "}
          for comprehensive resources and examples.
        </p>

        <h2 id="getting-started" className="group flex items-center">
          Getting Started
          <a href="#getting-started" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </a>
        </h2>

        <p>
          To get started with JAMStack, you'll need to choose a static site generator. Some popular options include:
        </p>

        <ul>
          <li>
            <a href="https://nextjs.org" className="text-primary hover:text-primary-dark underline">
              Next.js
            </a>{" "}
            - A React framework with both static and server-rendered capabilities
          </li>
          <li>
            <a href="https://www.gatsbyjs.com" className="text-primary hover:text-primary-dark underline">
              Gatsby
            </a>{" "}
            - A React-based framework focused on static sites
          </li>
          <li>
            <a href="https://nuxtjs.org" className="text-primary hover:text-primary-dark underline">
              Nuxt.js
            </a>{" "}
            - A Vue.js framework similar to Next.js
          </li>
          <li>
            <a href="https://gohugo.io" className="text-primary hover:text-primary-dark underline">
              Hugo
            </a>{" "}
            - A fast static site generator written in Go
          </li>
        </ul>

        <p>
          Once you've chosen your framework, you can start building your site and deploying it to platforms like Vercel,
          Netlify, or GitHub Pages.
        </p>
      </>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
            ]}
          />

          <article className="mt-8 relative">
            <TableOfContents items={tocItems} />

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center text-sm text-muted-foreground mb-8">
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime} read</span>
              <span className="mx-2">•</span>
              <span>By {post.author}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none lg:prose-lg">{renderPostContent()}</div>

            <div className="mt-12 pt-6 border-t border-border">
              <h3 className="text-lg font-medium mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tags/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    className="bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.id}`}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Previous</span>
                  </Link>
                ) : (
                  <Link
                    href="/"
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span>Home</span>
                  </Link>
                )}

                {nextPost && (
                  <Link
                    href={`/blog/${nextPost.id}`}
                    className="flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
        <Footer />
      </div>
    </main>
  )
}

