
import Link from 'next/link';
import { RocketIcon, SparklesIcon, PaintbrushIcon, ShareIcon } from 'lucide-react';
import { FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'; // Example social icons

const features = [
  {
    icon: <SparklesIcon className="w-6 h-6 text-blue-500" />,
    title: 'Blog Generator',
    description: 'Generate high-quality blog posts from a simple topic.',
  },
  {
    icon: <RocketIcon className="w-6 h-6 text-green-500" />,
    title: 'SEO Automation',
    description: 'Optimize your content for search engines effortlessly.',
  },
  {
    icon: <PaintbrushIcon className="w-6 h-6 text-purple-500" />,
    title: 'Hero Images',
    description: 'Create stunning hero images that capture attention.',
  },
  {
    icon: <ShareIcon className="w-6 h-6 text-red-500" />,
    title: 'Social Repurposing',
    description: 'Instantly adapt your blog content for social media.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-40 bg-gradient-to-r from-primary to-accent text-primary-foreground flex items-center justify-center text-center transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <div className="container z-10 px-4 md:px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              From Idea to Influence — AI Blog-to-Everything Engine
            </h1>
            <p className="text-xl opacity-90">
              ContentCraft AI helps you create, optimize, and repurpose your blog content with the power of AI.
            </p>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary-foreground px-8 text-base font-medium text-primary shadow transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32 bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-10 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features to Boost Your Content</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                ContentCraft AI provides a suite of tools to streamline your content creation workflow.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-md transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg">
                  {feature.icon}
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Optional Placeholder) */}
      <section className="w-full py-20 md:py-32 bg-secondary flex items-center justify-center text-center">
         <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Our Users Say</h2>
            <p className="max-w-[700px] mx-auto mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
               (Testimonials Coming Soon!)
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 bg-muted text-muted-foreground text-center">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} ContentCraft AI. All rights reserved.</p>
          <nav className="flex space-x-4">
            <Link href="#" className="text-sm hover:underline hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:underline hover:text-primary">
              Terms of Use
            </Link>
            <Link href="#" className="text-sm hover:underline hover:text-primary">
              Contact
            </Link>
          </nav>
          {/* Social Links */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <FaTwitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <FaLinkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
