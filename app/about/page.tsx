import Header from "@/components/header"
import Footer from "@/components/footer"

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4">
        <Header />
        <div className="mt-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">About Me</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg">
              I'm an engineer by day, gamer, developer, writer, poet, and Stoic by night. I'm passionate about
              technology, writing, and continuous learning.
            </p>
            <p className="text-lg mt-4">
              This space is where I share my thoughts, projects, and experiences. Feel free to explore my blog posts or
              connect with me on social media.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}

