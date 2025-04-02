# Blog Pagination and Navigation Update Plan

## Objective

Fix the pagination on the blog list page (`/blog`) to use query parameters and update the previous/next post navigation on individual blog post pages (`/blog/[slug]`) to match the list page styling and include post titles.

## Part 1: Fix Blog List Page (`/blog`) Pagination

*   **Strategy:** Switch from using path parameters (`/blog/page/N`) to query parameters (`/blog?page=N`) for pagination.
*   **Files to Modify:**
    *   `app/blog/page.tsx`
    *   `components/blog-post-list.tsx`
*   **Steps:**
    1.  **Modify `app/blog/page.tsx`:**
        *   Read the `page` query parameter from the `searchParams` prop.
        *   Parse the `page` parameter (defaulting to 1).
        *   Pass the parsed `page` number as a prop to `BlogPostList`.
    2.  **Modify `components/blog-post-list.tsx`:**
        *   Update `href` for "Previous" link: `/blog` (for page 1) or `/blog?page={page - 1}`.
        *   Update `href` for "Next" link: `/blog?page={page + 1}`.

## Part 2: Update Blog Post Page (`/blog/[slug]`) Navigation

*   **Strategy:** Update the previous/next link section in `app/blog/[slug]/page.tsx` to match the styling of the list page pagination and include post titles.
*   **File to Modify:**
    *   `app/blog/[slug]/page.tsx`
*   **Steps:**
    1.  **Styling:** Apply button styles (e.g., `bg-muted hover:bg-muted/80 ... px-6 py-2 rounded-md font-medium`) to "Previous" and "Next" links.
    2.  **Content:** Add `prevPost.title` and `nextPost.title` to the respective links.
    3.  **Text Wrapping:** Ensure titles wrap correctly using appropriate CSS (e.g., `block` or flexbox).
    4.  **"All Posts" Link:** Update styling to match the new button style.

## Diagram

```mermaid
graph TD
    subgraph Blog List Page (/blog)
        direction LR
        A[app/blog/page.tsx] -- Reads page query param --> B(Pass page prop);
        B --> C[components/blog-post-list.tsx];
        C -- Generates links --> D{Links: /blog?page=N};
    end

    subgraph Blog Post Page (/blog/[slug])
        direction LR
        E[app/blog/[slug]/page.tsx] -- Fetches prev/next post --> F(Render Nav Links);
        F -- Applies styles & adds titles --> G{Styled Links with Titles};
    end

    Start --> A;
    Start --> E;
    D --> End;
    G --> End;

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px