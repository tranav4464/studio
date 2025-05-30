
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { BlogCard } from '@/components/dashboard/blog-card';
import type { BlogPost } from '@/types';
import { PageHeader } from '@/components/shared/page-header';
import { blogStore } from '@/lib/blog-store';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setPosts(blogStore.getPosts()); // Initial load
    const unsubscribe = blogStore.subscribe(() => {
      setPosts(blogStore.getPosts());
    });
    return () => unsubscribe();
  }, []);

  const handlePostDeleted = useCallback((deletedPostId: string) => {
    blogStore.deletePost(deletedPostId); 
    // The subscription will update the posts state
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <PageHeader
        title="My Blogs"
        description="Manage your blog posts or create a new one."
        actions={
          <Link href="/new-blog" passHref>
            <Button>
              <Icons.NewBlog className="mr-2 h-4 w-4" />
              Create New Blog
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Input 
          placeholder="Search blogs by title or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm h-9"
        />
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid" className="px-3 py-1.5 h-9"><Icons.Grid className="h-4 w-4 mr-2" />Grid</TabsTrigger>
            <TabsTrigger value="list" className="px-3 py-1.5 h-9"><Icons.List className="h-4 w-4 mr-2" />List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow">
          <Icons.MyBlogs className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-xl font-medium text-foreground">No blog posts found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchTerm ? "Try adjusting your search or " : "Get started by "}
            <Link href="/new-blog" className="text-primary hover:underline">creating a new blog post</Link>.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {filteredPosts.map((post) => (
            viewMode === 'grid' ? (
              <BlogCard key={post.id} post={post} onDelete={() => handlePostDeleted(post.id)} />
            ) : (
              <Card key={post.id} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow rounded-lg">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">Status: {post.status} | Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/blogs/${post.id}/edit`} passHref>
                    <Button variant="outline" size="icon" className="h-8 w-8"><Icons.Edit className="h-4 w-4" /></Button>
                  </Link>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8"><Icons.Delete className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the blog post "{post.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { handlePostDeleted(post.id); toast({title: "Blog post deleted"}); }} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}
