import Header from '@/components/header';
import ProfileCard from '@/components/profile-card';
import BlogPostList from '@/components/blog-post-list';
import Footer from '@/components/footer';
import { getAllPosts } from '@/lib/posts';

export default function Home() {
	// Fetch all blog posts during server-side rendering
	const allPosts = getAllPosts();
	return (
		<div className="bg-background text-foreground min-h-screen">
			<div className="container mx-auto px-4">
				<Header />
				<div className="mx-auto mt-8 max-w-3xl">
					<ProfileCard />
					<div className="mt-16">
						<h2 className="mb-8 text-2xl font-bold">Recent Posts</h2>
						{/* Display the first 3 posts with a link to see more */}
						<BlogPostList posts={allPosts} postsPerPage={3} showSeeMore={true} />
					</div>
				</div>
				<Footer />
			</div>
		</div>
	);
}
