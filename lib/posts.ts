import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the structure of the frontmatter we expect
interface PostFrontmatter {
  title: string;
  date: string; // Keep as string for now, convert to Date for sorting
  author?: string | string[]; // Allow single or multiple authors
  tags?: string[];
  description?: string;
  // Add other fields from your frontmatter if needed
  [key: string]: any; // Allow other arbitrary fields
}

// Define the structure of the post metadata returned by getAllPosts
export interface PostMetadata extends PostFrontmatter {
  slug: string;
  dateObject: Date; // Add a Date object for reliable sorting
}

// Define the structure of the full post data returned by getPostBySlug
export interface PostData {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

export function getAllPosts(): PostMetadata[] {
  let filenames: string[];
  try {
    filenames = fs.readdirSync(postsDirectory);
  } catch (error) {
    console.error("Error reading posts directory:", postsDirectory, error);
    return []; // Return empty array if directory doesn't exist or isn't readable
  }

  const allPostsData = filenames
    .filter((filename) => filename.endsWith('.md')) // Only process markdown files
    .map((filename): PostMetadata | null => {
      // Remove ".md" from file name to get slug
      const slug = filename.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, filename);
      let fileContents: string;
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
      } catch (error) {
        console.error(`Error reading file: ${fullPath}`, error);
        return null; // Skip this file if unreadable
      }


      // Use gray-matter to parse the post metadata section
      try {
        const { data, content } = matter(fileContents);

        // Validate required frontmatter fields
        if (!data.title || !data.date) {
            console.warn(`Skipping ${filename}: Missing required frontmatter (title, date).`);
            return null;
        }

        const dateObject = new Date(data.date);
        if (isNaN(dateObject.getTime())) {
            console.warn(`Skipping ${filename}: Invalid date format (${data.date}).`);
            return null;
        }

        // Combine the data with the slug
        return {
          slug,
          dateObject, // Use Date object for sorting
          ...(data as PostFrontmatter), // Type assertion
        };
      } catch (error) {
          console.error(`Error parsing frontmatter for ${filename}:`, error);
          return null; // Skip file if frontmatter parsing fails
      }
    })
    .filter((post): post is PostMetadata => post !== null); // Filter out null values from errors/skips

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => b.dateObject.getTime() - a.dateObject.getTime());
}

export function getPostBySlug(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`Post file not found for slug: ${slug} at path: ${fullPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const { data, content } = matter(fileContents);

    // Validate required frontmatter fields
    if (!data.title || !data.date) {
        console.warn(`Post ${slug}.md: Missing required frontmatter (title, date). Content might still be loaded.`);
        // Decide if you want to return null or proceed without full metadata
    }

    return {
      slug,
      frontmatter: data as PostFrontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error processing post for slug ${slug}:`, error);
    return null; // Return null on any processing error
  }
}