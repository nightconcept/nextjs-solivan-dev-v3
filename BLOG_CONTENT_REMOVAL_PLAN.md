# Plan: Resolve Intermittent TypeError by Optimizing Post Metadata

## Problem

An intermittent `TypeError: Cannot read properties of undefined (reading 'length')` occurs, often after successful page loads (`GET /blog/... 200 OK`). The error digest suggests it might be related to internal Next.js processes.

## Investigation Summary

- Initial hypothesis (missing `length` in frontmatter for `readTime`) was incorrect. `readTime` is calculated from content word count in `lib/posts.ts`.
- Components (`blog-post-list.tsx`, `[slug]/page.tsx`, `[tag]/page.tsx`) appear to handle optional frontmatter fields (`author`, `tags`) safely.

## Revised Hypothesis

The error might stem from serializing the large `PostMetadata` array returned by `getAllPosts`. This array currently includes the full markdown `content` string for *every* post. Passing this large data structure to list pages (`/blog`, `/tags/[tag]`) could trigger internal Next.js serialization issues or memory limits, manifesting as the observed `TypeError`.

## Proposed Plan

1.  **Refine Data Structure:** Modify `getAllPosts` in `lib/posts.ts` so that the `PostMetadata` objects it returns for list pages **do not** include the full `content` string. The `excerpt` and `readTime` are already calculated and sufficient for list views.
2.  **Verify Components:** Ensure components consuming `getAllPosts` output only rely on the remaining metadata fields (e.g., `slug`, `title`, `dateObject`, `excerpt`, `readTime`, `tags`, `author`). (Current review suggests this is already the case).
3.  **Testing:** After implementation, thoroughly test the blog index, tag pages, and individual post pages to confirm functionality and monitor if the `TypeError` is resolved.

## Visual Plan (Mermaid Diagram)

```mermaid
graph TD
    A[Markdown Files] --> B(lib/posts.ts);

    subgraph B [lib/posts.ts Processing]
        direction LR
        B1[Read Files & Parse Frontmatter/Content]
        B1 --> B2{Calculate Excerpt & ReadTime};
        B2 --> B3[getAllPosts];
        B1 --> B4[getPostBySlug];

        B3 -- Returns --> B5[PostMetadata Array\n(slug, title, date, excerpt, readTime, tags?, author?, ...)];
        B4 -- Returns --> B6[PostData Object\n(slug, frontmatter, content)];
    end

    B5 --> C[List Pages\n(/blog, /tags/[tag])];
    B6 --> D[Individual Post Page\n(/blog/[slug])];

    C -- Displays --> E[List of Posts using Excerpts];
    D -- Displays --> F[Full Post Content];

    style B fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:1px
    style D fill:#ccf,stroke:#333,stroke-width:1px
    style B5 fill:#efe,stroke:#333,stroke-width:1px
    style B6 fill:#efe,stroke:#333,stroke-width:1px
```

## Rationale

This approach simplifies the data flow for list pages, reducing the amount of data serialized and passed around. This minimizes potential conflicts with Next.js internals and adheres to the principle of components only receiving the data they strictly need. The full `content` remains available via `getPostBySlug` for individual post pages where it is required.