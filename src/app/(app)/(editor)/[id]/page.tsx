'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { OutlinePanel } from '@/components/editor/panels/OutlinePanel';
import { InsightsPanel } from '@/components/editor/panels/InsightsPanel';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Eye, Settings, Share2, MoreVertical, ListChecks, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SuggestionType = 'tone' | 'seo' | 'readability' | 'engagement';
type Severity = 'low' | 'medium' | 'high';

interface Suggestion {
  id: string;
  type: SuggestionType;
  message: string;
  severity: Severity;
  action?: () => void;
}

const RichBlogEditor = dynamic(() => import('@/components/editor/RichBlogEditor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Save logic here
      toast.success('Blog saved successfully');
    } catch (error) {
      toast.error('Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <RichBlogEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your blog post..."
          />
        </div>
      </div>
      <div className="w-80 border-l bg-muted/50">
        <div className="p-4">
          <OutlinePanel />
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
  sections: Array<{
    id: string;
    title: string;
    level: number;
    wordCount: number;
  }>;
}

const RichBlogEditor = dynamic(() => import('@/components/editor/RichBlogEditor'), { ssr: false });

export default function EditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(undefined);
  
  // Mock data - replace with actual data fetching
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blogPost', id],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: id as string,
        title: 'Getting Started with Next.js 14',
        content: '<h1>Getting Started with Next.js 14</h1><p>This is a sample blog post content. Start writing here...</p>',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        wordCount: 250,
        readingTime: 2,
        sections: [
          { id: 'intro', title: 'Introduction', level: 1, wordCount: 100 },
          { id: 'setup', title: 'Setup', level: 1, wordCount: 80 },
          { id: 'conclusion', title: 'Conclusion', level: 1, wordCount: 70 },
        ],
      };
    },
  });

  useEffect(() => {
    if (post) {
      setContent(post.content);
    }
  }, [post]);

  const handleContentChange = useCallback((newContent: string) => {
    console.log('handleContentChange called with:', newContent.substring(0, 50) + '...');
    setContent(newContent);
    // Auto-save could be implemented here with debounce
  }, []);

  const handleSave = useCallback(async () => {
    if (!post) return;
    
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [post]);

  const handlePublish = useCallback(async () => {
    // Implement publish logic
    toast.success('Blog post published successfully!');
  }, []);

  const handleSectionSelect = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    // Scroll to section in editor
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Mock suggestions data
  const suggestions: Suggestion[] = [
    {
      id: 'tone-1',
      type: 'tone',
      message: 'Consider making the introduction more engaging',
      severity: 'medium',
      action: () => {},
    },
    {
      id: 'seo-1',
      type: 'seo',
      message: 'Add more internal links to improve SEO',
      severity: 'high',
      action: () => {},
    },
  ];

  // Mock stats
  const stats = {
    wordCount: 250,
    characterCount: 1250,
    readingTime: 2,
    readabilityScore: 75,
    keywordDensity: 2.5,
  };

  if (isLoading || !post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold">
              {post.title || 'Untitled Document'}
            </h1>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              {post.status}
            </span>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handlePublish}
            >
              Publish
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto">
            {/* Editor Section */}
            <div className="py-8 px-4">
              <RichBlogEditor 
                initialContent={content} 
                onUpdate={handleContentChange} 
              />
            </div>
            
            {/* Stats Panel */}
            <div className="border-t border-border bg-background">
              <div className="p-4">
                <InsightsPanel 
                  stats={stats}
                  suggestions={suggestions}
                  onApplySuggestion={(id) => {
                    // Handle suggestion application
                    toast.info(`Applying suggestion: ${id}`);
                  }}
                  hideComments={true}
                />
              </div>
            </div>
            
            {/* SEO Checklist Section */}
            <div className="border-t border-border bg-background">
              <div className="p-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-medium flex items-center">
                      <ListChecks className="h-4 w-4 mr-2" />
                      SEO Checklist
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span>Title contains focus keyword</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>Meta description could be improved</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Add internal links (recommended: 2-3)</span>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Fix All Issues
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="border-t border-border bg-background pb-8">
              <div className="p-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-medium flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>No comments yet</p>
                        <p className="text-sm mt-1">Add comments to collaborate with your team</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Outline Panel */}
        <div className="w-72 border-l border-border overflow-y-auto flex-shrink-0 bg-background">
          <div className="p-4">
            <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-4 px-2">Document Outline</h3>
            <OutlinePanel 
              sections={post.sections} 
              activeSectionId={activeSection}
              onSectionSelect={handleSectionSelect}
              className="border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
