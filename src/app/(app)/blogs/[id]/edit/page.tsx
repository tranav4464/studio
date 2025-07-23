'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BlogEditor from '@/components/blog/BlogEditor';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface HeroImage {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

interface PageProps {
  params: { id: string };
}

export default function EditBlogPage({ params }: PageProps) {
  const { id } = params;
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    console.log('useEffect triggered with ID:', id);
    let isMounted = true;
    
    const fetchBlog = async () => {
      if (!id) {
        console.error('No blog ID provided');
        setError('No blog ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching blog post with ID:', id);
        const response = await fetch(`/api/blogs/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received blog data:', data);
        
        if (isMounted) {
          setContent(data.content || '');
          setTitle(data.title || 'Untitled');
          setHeroImage(data.heroImage || null);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          toast({
            title: 'Error',
            description: 'Failed to load blog post. Please try again later.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchBlog();
    
    return () => {
      isMounted = false;
    };
  }, [id, toast]);

  const handleSave = async (newContent: string, newHeroImage?: HeroImage) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          heroImage: newHeroImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save blog');
      }

      toast({
        title: 'Success',
        description: 'Blog saved successfully!',
      });

      router.push('/blogs');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save blog. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    console.log('Loading blog data...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading blog post...</span>
      </div>
    );
  }

  // If we have no content and we're not loading, show an error
  if ((!content || !title) && !isLoading) {
    console.warn('No content loaded, but not in loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-4">
          We couldn't load the blog post content. It may have been moved or deleted.
        </p>
        <button
          onClick={() => router.push('/blogs')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit Blog Post</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push('/blogs')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(content, heroImage || undefined)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-muted/40">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-6xl">
          <BlogEditor
            content={content}
            title={title}
            onSave={handleSave}
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

    