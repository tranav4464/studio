"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demonstration
const mockBlogs = [
  {
    id: '1',
    title: 'My First Blog Post',
    lastEdited: '2023-10-27',
    status: 'Published',
  },
  {
    id: '2',
    title: 'Draft Idea for a New Article',
    lastEdited: '2023-10-26',
    status: 'Draft',
  },
  {
    id: '3',
    title: 'Another Published Blog',
    lastEdited: '2023-10-25',
    status: 'Published',
  },
];

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState([]); // Replace with actual data fetching
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchBlogs = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setBlogs(mockBlogs as any); // Replace with actual API call
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="My Blogs"
        description="Manage and view all your blog posts."
      />

      {/* Optional: Search Bar, Status Filters, Sort Options */}
      {/* Add components here for filtering, searching, and sorting */}
      {/* <div className="flex justify-between items-center">
        <input type="text" placeholder="Search blogs..." className="border p-2 rounded" />
        <div>Filter/Sort Options</div>
      </div> */}

      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <CardHeader>
            <CardTitle>You haven't written any blogs yet.</CardTitle>
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
        // Blog listing table/grid
        // Replace with a proper table or grid component
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog: any) => ( // Use actual blog type
            <Card key={blog.id}>
              <CardHeader>
                <CardTitle>{blog.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Last Edited: {blog.lastEdited}</p>
                <p>Status: {blog.status}</p>
                <div className="flex gap-2 mt-2">
                  <Link href={`/blogs/${blog.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Icons.Edit className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  {/* Add Export and Delete buttons */}
                  {/* <Button variant="outline" size="sm">Export</Button> */}
                  {/* <Button variant="destructive" size="sm">Delete</Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Optional: Pagination or Infinite Scroll */}
      {/* Add pagination or infinite scroll logic here */}
      {/* <div>Pagination Controls</div> */}

      {/* Optional: Bulk Actions (Advanced) */}
      {/* Add bulk action options here */}
      {/* <div className="mt-4">Bulk Actions</div> */}
    </div>
  );
}
