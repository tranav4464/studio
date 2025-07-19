'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Twitter, Linkedin, Mail, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentRepurposingProps {
  content: string;
  title: string;
}

type ContentType = 'tweet' | 'linkedin' | 'newsletter';

interface RepurposedContent {
  type: ContentType;
  content: string;
}

export function ContentRepurposing({ content, title }: ContentRepurposingProps) {
  const [activeTab, setActiveTab] = useState<ContentType>('tweet');
  const [isGenerating, setIsGenerating] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState<RepurposedContent[]>([]);
  const { toast } = useToast();

  const generateContent = async (type: ContentType) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/repurpose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      const newContent = {
        type,
        content: data.content,
      };

      setRepurposedContent(prev => {
        const filtered = prev.filter(item => item.type !== type);
        return [...filtered, newContent];
      });

      toast({
        title: 'Success',
        description: 'Content generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentEdit = (type: ContentType, newContent: string) => {
    setRepurposedContent(prev =>
      prev.map(item =>
        item.type === type ? { ...item, content: newContent } : item
      )
    );
  };

  const getCurrentContent = () => {
    return repurposedContent.find(item => item.type === activeTab)?.content || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Repurposing</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="tweet">
                <Twitter className="mr-2 h-4 w-4" />
                Tweet Thread
              </TabsTrigger>
              <TabsTrigger value="linkedin">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn Post
              </TabsTrigger>
              <TabsTrigger value="newsletter">
                <Mail className="mr-2 h-4 w-4" />
                Newsletter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tweet" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Tweet Thread</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent('tweet')}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={getCurrentContent()}
                onChange={(e) => handleContentEdit('tweet', e.target.value)}
                placeholder="Your tweet thread will appear here..."
                className="min-h-[200px]"
              />
            </TabsContent>

            <TabsContent value="linkedin" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">LinkedIn Post</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent('linkedin')}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={getCurrentContent()}
                onChange={(e) => handleContentEdit('linkedin', e.target.value)}
                placeholder="Your LinkedIn post will appear here..."
                className="min-h-[200px]"
              />
            </TabsContent>

            <TabsContent value="newsletter" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Newsletter</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent('newsletter')}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={getCurrentContent()}
                onChange={(e) => handleContentEdit('newsletter', e.target.value)}
                placeholder="Your newsletter content will appear here..."
                className="min-h-[200px]"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 