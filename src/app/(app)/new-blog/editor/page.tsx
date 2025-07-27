'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import OptimizeCTA from '@/components/editor/OptimizeCTA';

const RichBlogEditor = dynamic(() => import('@/components/editor/RichBlogEditor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div></div>
});

export default function NewBlogEditorPage() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState('');
  const [optimizeEnabled, setOptimizeEnabled] = useState(true);

  // Get initial content from URL params if available
  useEffect(() => {
    const initialContent = searchParams.get('content');
    
    if (initialContent) {
      setContent(decodeURIComponent(initialContent));
    }
  }, [searchParams]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleOptimize = useCallback(() => {
    // Implement optimization logic
    toast.info('Optimizing content...');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Editor Section */}
          <div className="py-8 px-4">
            <RichBlogEditor 
              initialContent={content} 
              onUpdate={handleContentChange}
            />
          </div>

          {/* Outline Panel (below editor) */}
          <div className="mt-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border p-6">
              <h3 className="text-lg font-semibold mb-4">Document Outline</h3>
              <div className="text-muted-foreground text-sm">
                Your document outline will appear here as you add headings to your content.
              </div>
            </div>
          </div>
        </div>

        {/* Optimize CTA */}
        <OptimizeCTA enabled={optimizeEnabled} onClick={handleOptimize} />
      </main>
    </div>
  );
}