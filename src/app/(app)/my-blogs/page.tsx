
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blogStore } from '@/lib/blog-store';
import type { BlogPost, BlogStatus } from '@/types';
import { BlogCard } from '@/components/dashboard/blog-card';
import { BlogCardSkeleton } from '@/components/dashboard/blog-card-skeleton'; // Import skeleton
import { format, parseISO } from 'date-fns';

type SortOption = 'date-newest' | 'date-oldest' | 'title-az' | 'title-za';

const statusOptions: Array<{value: BlogStatus | 'all', label: string}> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const sortOptions: Array<{value: SortOption, label: string}> = [
  { value: 'date-newest', label: 'Date: Newest First' },
  { value: 'date-oldest', label: 'Date: Oldest First' },
  { value: 'title-az', label: 'Title: A-Z' },
  { value: 'title-za', label: 'Title: Z-A' },
];

export default function MyBlogsPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = () => {
      setAllPosts(blogStore.getPosts());
      setIsLoading(false);
    };
    // Simulate a short delay for loading effect, remove if blogStore is async in future
    const timer = setTimeout(fetchPosts, 500); 
    
    const unsubscribe = blogStore.subscribe(fetchPosts);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    }
  }, []);

  const handleDeletePost = (id: string) => {
    blogStore.deletePost(id);
  };

  const filteredAndSortedPosts = useMemo(() => {
    let posts = [...allPosts];

    if (searchTerm) {
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      posts = posts.filter(post => post.status === statusFilter);
    }

    switch (sortBy) {
      case 'date-newest':
        posts.sort((a, b) => parseISO(b.updatedAt).getTime() - parseISO(a.updatedAt).getTime());
        break;
      case 'date-oldest':
        posts.sort((a, b) => parseISO(a.updatedAt).getTime() - parseISO(b.updatedAt).getTime());
        break;
      case 'title-az':
        posts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-za':
        posts.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    return posts;
  }, [allPosts, searchTerm, statusFilter, sortBy]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Blogs"
        description="Manage and view all your blog posts."
      />

      <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
        <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-center md:justify-between gap-4">
          <div className="relative flex-grow sm:max-w-xs">
            <Icons.SEO className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search blogs by title or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(value: BlogStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="capitalize">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[200px] h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Show a few skeletons, e.g., 4 */}
          {Array.from({ length: 4 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAndSortedPosts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader>
            <CardTitle>{searchTerm || statusFilter !== 'all' ? 'No blogs match your criteria.' : "You haven't created any blogs yet."}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/new-blog">
                <Icons.NewBlog className="mr-2 h-4 w-4" /> Generate Your First Blog
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedPosts.map((post) => (
            <BlogCard key={post.id} post={post} onDelete={handleDeletePost} />
          ))}
        </div>
      )}
    </div>
  );
}
