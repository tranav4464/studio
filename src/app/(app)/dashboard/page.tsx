
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { BlogCard } from '@/components/dashboard/blog-card';
import { PageHeader } from '@/components/shared/page-header';
import { blogStore } from '@/lib/blog-store';
import type { BlogPost } from '@/types';
import { useState, useEffect } from 'react';
import { BlogCardSkeleton } from '@/components/dashboard/blog-card-skeleton';


export default function DashboardPage() {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [postsToShow, setPostsToShow] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const userName = "Creator";

  const loadMorePosts = () => {
    setPostsToShow(prev => prev + 5);
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchPosts = () => {
      // Simulate API call delay
      setTimeout(() => {
        setRecentPosts(blogStore.getPosts().slice(0, postsToShow));
        setIsLoading(false);
      }, 500);
    };

    fetchPosts();

    // Subscribe to changes in the blogStore
    const unsubscribe = blogStore.subscribe(fetchPosts);

    return () => {
      unsubscribe(); // Clean up the subscription
    }
  }, [postsToShow]);

  return (
    <>
      <div className="flex h-full">
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-[#e0e1dd] p-8 rounded-lg shadow-xl mb-10 flex flex-col sm:flex-row items-center justify-between transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-2xl dark:text-[hsl(222_47%_11.2%)]">
            <div className="text-foreground dark:text-[hsl(222_47%_11.2%)]">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#061D1C] dark:text-[hsl(222_47%_11.2%)]">Hi {userName}, ready to create?</h1>
              <p className="text-lg opacity-90 mt-2">Turn your ideas into full content in minutes with AI.</p>
            </div>
            <Link href="/new-blog" passHref>
              <Button
                size="lg"
                className="mt-6 sm:mt-0 shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl 
                           bg-[#1A936F] text-white hover:bg-[#167d60] 
                           dark:bg-[#0B2C39] dark:text-white dark:hover:bg-[#1D3F4E]"
              >
                <Icons.NewBlog className="mr-2 h-5 w-5 animate-pulse" />
                Generate a New Blog
              </Button>
            </Link>
          </div>

          <PageHeader
            title="Recent Blogs"
            description="Your latest creations."
          />

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {Array.from({ length: postsToShow > 0 ? Math.min(postsToShow, 3) : 3 }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg shadow-inner border border-dashed border-muted-foreground/20 flex flex-col items-center justify-center transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
               <Icons.MyBlogs className="h-16 w-16 text-muted-foreground/40 mb-6" />
               <h3 className="text-xl font-semibold text-foreground mb-2">No blogs yet.</h3>
               <p className="text-muted-foreground mb-6">Let’s create one and see your masterpieces here!</p>
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
              {recentPosts.length < blogStore.getPosts().length && (
                <div className="text-center">
                  <Button onClick={loadMorePosts} disabled={isLoading}>
                    {isLoading ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
