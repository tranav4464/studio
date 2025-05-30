
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { BlogCard } from '@/components/dashboard/blog-card';
import { PageHeader } from '@/components/shared/page-header';
import { blogStore } from '@/lib/blog-store';
import type { BlogPost } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function DashboardPage() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [postsToShow, setPostsToShow] = useState(5); // State to track number of posts to show
  // Placeholder for user name - replace with actual user data
  const userName = "Creator";

  const loadMorePosts = () => {
    setPostsToShow(prev => prev + 5);
  };

  useEffect(() => {
    const fetchPosts = () => {
      // Fetch all posts and then slice based on postsToShow
      setRecentPosts(blogStore.getPosts().slice(0, postsToShow));
    };

    fetchPosts(); // Initial fetch

    const unsubscribe = blogStore.subscribe(fetchPosts); // Subscribe to changes in blogStore

    return () => unsubscribe();
    // Re-run effect when postsToShow changes
  }, [postsToShow]);

  return (
    <>
      <div className="flex h-full">
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-8 rounded-lg shadow-xl mb-10 flex flex-col sm:flex-row items-center justify-between animate-gradient-shift transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-2xl">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Hi {userName}, ready to create?</h1>
              <p className="text-lg opacity-90 mt-2">Turn your ideas into full content in minutes with AI.</p>
            </div>
            <Link href="/new-blog" passHref>
              <Button size="lg" variant="secondary" className="mt-6 sm:mt-0 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl">
                <Icons.NewBlog className="mr-2 h-5 w-5 animate-pulse" />
                Generate a New Blog
              </Button>
            </Link>
          </div>

          <PageHeader
            title="Recent Blogs"
            description="Your latest creations."
          />

          {recentPosts.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-lg shadow-inner border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center animate-fade-in transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
               <p className="text-muted-foreground mb-4">No recent blogs to display.</p>
              <Link href="/new-blog" passHref>
                <Button>
                  <Icons.NewBlog className="mr-2 h-4 w-4" />
                  Create Your First Blog
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {recentPosts.map((post) => (
                  <BlogCard key={post.id} post={post} onDelete={(id) => blogStore.deletePost(id)} />
                ))}
              </div>
              {/* Load More Button */}
              {recentPosts.length < blogStore.getPosts().length && (
                <div className="text-center">
                  <Button onClick={loadMorePosts}>Load More</Button>
                </div>
              )}
            </>
          )} 
        </main>
      </div>
    </>
  );
}
