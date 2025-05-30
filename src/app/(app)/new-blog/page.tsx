
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import type { BlogTone, BlogStyle, BlogLength } from '@/types';
import { blogStore } from '@/lib/blog-store';
import { useToast } from '@/hooks/use-toast';

const tones: BlogTone[] = ["formal", "casual", "informative", "persuasive", "humorous"];
const styles: BlogStyle[] = ["academic", "journalistic", "storytelling", "technical"];
const lengths: BlogLength[] = ["short", "medium", "long"];

export default function NewBlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [tone, setTone] = useState<BlogTone>('informative');
  const [style, setStyle] = useState<BlogStyle>('journalistic');
  const [length, setLength] = useState<BlogLength>('medium');
  const [referenceText, setReferenceText] = useState(''); 
  const [generatedOutline, setGeneratedOutline] = useState<string[] | null>(null);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  const handleGenerateOutline = async () => {
    if (!topic) {
      toast({ title: "Topic is required", description: "Please enter a blog topic.", variant: "destructive" });
      return;
    }
    setIsLoadingOutline(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock AI call
    setGeneratedOutline([
      `Introduction to ${topic}`,
      `Key aspect 1 of ${topic}`,
      `Exploring ${topic} further`,
      `Challenges and opportunities with ${topic}`,
      `Conclusion about ${topic}`,
    ]);
    setIsLoadingOutline(false);
    toast({ title: "Outline Generated", description: "Review and customize the outline below." });
  };

  const handleGeneratePost = async () => {
    if (!topic || !generatedOutline) {
      toast({ title: "Topic and Outline Required", description: "Please generate an outline first.", variant: "destructive" });
      return;
    }
    if (!title) {
      toast({ title: "Title is required", description: "Please enter a blog title.", variant: "destructive" });
      return;
    }
    setIsLoadingPost(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Mock creating post
    
    const newPost = blogStore.addPost({
        title,
        topic,
        tone,
        style,
        length,
    });
    // The outline in blogStore.addPost is a generic one, we could update it here with generatedOutline
    blogStore.updatePost(newPost.id, { outline: generatedOutline });

    setIsLoadingPost(false);
    toast({ title: "Blog Post Created!", description: "Redirecting to the editor..." });
    router.push(`/blogs/${newPost.id}/edit`);
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Create New Blog Post"
        description="Define your blog's topic, tone, and style to get started."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-xl">
          <CardHeader>
            <CardTitle>Blog Details</CardTitle>
            <CardDescription>Fill in the specifics for your new blog post.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Blog Title <span className="text-destructive">*</span></Label>
              <Input id="title" placeholder="e.g., My Awesome Blog Post" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Topic <span className="text-destructive">*</span></Label>
              <Input id="topic" placeholder="e.g., The Future of Renewable Energy" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value: BlogTone) => setTone(value)}>
                  <SelectTrigger id="tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                  <SelectContent>{tones.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={(value: BlogStyle) => setStyle(value)}>
                  <SelectTrigger id="style"><SelectValue placeholder="Select style" /></SelectTrigger>
                  <SelectContent>{styles.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select value={length} onValueChange={(value: BlogLength) => setLength(value)}>
                  <SelectTrigger id="length"><SelectValue placeholder="Select length" /></SelectTrigger>
                  <SelectContent>{lengths.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceText">Reference Text (Optional)</Label>
              <Textarea id="referenceText" placeholder="Paste any reference material or key points here..." value={referenceText} onChange={(e) => setReferenceText(e.target.value)} rows={5} />
              <p className="text-xs text-muted-foreground">You can also upload reference files (feature coming soon).</p>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="reference-files">Reference Files (Optional)</Label>
                <Input id="reference-files" type="file" disabled className="cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                <p className="text-xs text-muted-foreground">File upload functionality is currently disabled.</p>
            </div>

          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateOutline} disabled={isLoadingOutline || isLoadingPost}>
              {isLoadingOutline && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Generate Outline
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1 shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-xl">
          <CardHeader>
            <CardTitle>Blog Outline</CardTitle>
            <CardDescription>Generated outline will appear here. You can customize it before generating the full post.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {isLoadingOutline && (
              <div className="flex items-center justify-center p-8"><Icons.Spinner className="h-8 w-8 animate-spin text-primary" /></div>
            )}
            {generatedOutline && !isLoadingOutline && (
              <div className="space-y-3">
                {generatedOutline.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Input defaultValue={item} className="flex-grow" onChange={(e) => { const newOutline = [...generatedOutline]; newOutline[index] = e.target.value; setGeneratedOutline(newOutline); }}/>
                  </div>
                ))}
                <Textarea placeholder="Add custom notes or instructions for the AI regarding the outline..." rows={3}/>
              </div>
            )}
            {!generatedOutline && !isLoadingOutline && (
              <p className="text-sm text-muted-foreground text-center py-8">Click "Generate Outline" to start.</p>
            )}
          </CardContent>
          {generatedOutline && (
            <CardFooter>
              <Button onClick={handleGeneratePost} disabled={isLoadingPost || isLoadingOutline} className="w-full">
                {isLoadingPost && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Generate Full Blog Post
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
