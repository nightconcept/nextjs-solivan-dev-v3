# Plan for Implementing `app/blog/[slug]/page.tsx`

This document outlines the plan for creating the dynamic blog post page based on markdown files in the `content/blog/` directory.

**Goal:** Create `app/blog/[slug]/page.tsx` to display blog posts using the filename as the slug. Content is sourced from markdown files, parsed for frontmatter and content, and styled similarly to `app/blog/[id]/page.tsx`.

**Decisions Made:**

*   **Markdown Rendering:** Use `gray-matter` for frontmatter and `react-markdown` for rendering content.
*   **Markdown Flavors/Plugins:** Use `remark-gfm` (GitHub Flavored Markdown), `rehype-slug` (adds IDs to headings), and `rehype-autolink-headings` (adds links to headings).
*   **Table of Contents (ToC):** Auto-generate based on markdown headings (using `rehype-slug` and `rehype-autolink-headings`). Specific ToC component rendering can be refined later.
*   **Post Navigation:** Sort posts by the `date` field in the frontmatter (descending) to determine previous/next links.
*   **Styling:** Use `@tailwindcss/typography` (`prose` classes) for styling the rendered markdown content.

**Implementation Steps:**

**Phase 1: Setup & Data Fetching**

1.  **Install Dependencies:** (Completed by user)
    *   `gray-matter`
    *   `react-markdown`
    *   `remark-gfm`
    *   `rehype-slug`
    *   `rehype-autolink-headings`
    *   Ensure `@tailwindcss/typography` is installed and configured.

2.  **Create Utility Functions (`lib/posts.ts`):**
    *   **`getAllPosts()`:**
        *   Reads all `.md` files from `content/blog`.
        *   Parses frontmatter (`data`) and derives `slug` from filename.
        *   Returns an array of `{ slug, ...data }`.
        *   Sorts posts by `date` (descending).
    *   **`getPostBySlug(slug)`:**
        *   Reads `content/blog/${slug}.md`.
        *   Parses frontmatter (`data`) and content (`content`).
        *   Returns `{ slug, frontmatter: data, content }`.
        *   Includes error handling.

**Phase 2: Page Implementation (`app/blog/[slug]/page.tsx`)**

3.  **`generateStaticParams()`:**
    *   Import `getAllPosts`.
    *   Call `getAllPosts()` and map to an array of `{ slug: post.slug }`.
    *   Return the array for static generation.

4.  **Page Component (`BlogPostPage`):**
    *   Create `async function BlogPostPage({ params }: { params: { slug: string } })`.
    *   Import necessary components and utilities.
    *   **Fetch Data:** Call `getPostBySlug(params.slug)`. Handle "not found".
    *   **Metadata:** Extract and format `title`, `date`, `author`, `tags`.
    *   **Navigation:** Call `getAllPosts()`, find `currentIndex`, determine `prevPost` and `nextPost`.
    *   **Render JSX:**
        *   Use `Header`, `Footer`, `Breadcrumb`.
        *   Display post metadata.
        *   Use `ReactMarkdown` with `remarkGfm`, `rehypeSlug`, `rehypeAutolinkHeadings`.
        *   Wrap markdown output in `<div className="prose dark:prose-invert ...">`.
        *   Render `tags` as links.
        *   Render "Previous" / "Next" post links.

**Diagram:**

```mermaid
graph TD
    subgraph Phase 1: Setup & Data
        A[Install Deps: gray-matter, react-markdown, etc.] --> B(Create lib/posts.ts);
        B --> C[Implement getAllPosts()];
        B --> D[Implement getPostBySlug(slug)];
        C -- Reads --> E[content/blog/*.md];
        D -- Reads --> F[content/blog/[slug].md];
        E --> G{Parse Frontmatter & Slug};
        F --> H{Parse Frontmatter & Content};
        C --> I[Sorted Post List (slug, date, title...)];
        D --> J[Single Post Data (slug, frontmatter, content)];
    end

    subgraph Phase 2: Page Implementation
        K(app/blog/[slug]/page.tsx) --> L[generateStaticParams];
        L -- Uses --> I;
        L --> M[Static Paths (/blog/slug1, ...)];
        K --> N[BlogPostPage Component];
        N -- Uses --> J;
        N -- Uses --> I;
        N --> O[Render Header/Footer/Breadcrumb];
        N --> P[Display Metadata (title, date, author)];
        N --> Q[Render Content w/ ReactMarkdown];
        Q -- Plugins --> Q1(remark-gfm);
        Q -- Plugins --> Q2(rehype-slug);
        Q -- Plugins --> Q3(rehype-autolink-headings);
        Q --> R[Apply Tailwind Prose];
        N --> S[Render Tags];
        N --> T[Render Prev/Next Links];
        N --> U[Render Full Page];
    end

    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#ccf,stroke:#333,stroke-width:2px