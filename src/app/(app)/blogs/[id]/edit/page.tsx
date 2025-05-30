
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BlogPost, RepurposedContent } from '@/types';
import { blogStore } from '@/lib/blog-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { generateHeroImageAction, repurposeContentAction } from '@/actions/ai';
import NextImage from 'next/image'; // Renamed to avoid conflict
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const blogId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [heroImagePrompt, setHeroImagePrompt] = useState('');
  const [heroImageTone, setHeroImageTone] = useState('cinematic');
  const [generatedHeroImageUrl, setGeneratedHeroImageUrl] = useState<string | null>(null);
  const [heroImageCaption, setHeroImageCaption] = useState('');
  const [heroImageAltText, setHeroImageAltText] = useState('');
  const [isGeneratingHeroImage, setIsGeneratingHeroImage] = useState(false);

  const [repurposeTone, setRepurposeTone] = useState('professional');
  const [repurposedContent, setRepurposedContent] = useState<RepurposedContent | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);

  useEffect(() => {
    if (blogId) {
      const fetchedPost = blogStore.getPostById(blogId);
      if (fetchedPost) {
        setPost(fetchedPost);
        setContent(fetchedPost.content);
        setHeroImagePrompt(fetchedPost.heroImagePrompt || fetchedPost.title);
        setHeroImageTone(fetchedPost.tone || 'cinematic'); // Use blog tone as default for image
        setHeroImageCaption(fetchedPost.heroImageCaption || '');
        setHeroImageAltText(fetchedPost.heroImageAltText || '');
        setGeneratedHeroImageUrl(fetchedPost.heroImageUrl || null);
      } else {
        toast({ title: "Blog post not found", variant: "destructive" });
        router.push('/dashboard');
      }
      setIsLoading(false);
    }
  }, [blogId, router, toast]);

  const handleSave = async () => {
    if (!post) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    blogStore.updatePost(post.id, { 
      content,
      heroImageUrl: generatedHeroImageUrl || undefined,
      heroImageCaption,
      heroImageAltText,
      heroImagePrompt 
    });
    setPost(prev => prev ? ({...prev, content, heroImageUrl: generatedHeroImageUrl || undefined, heroImageCaption, heroImageAltText, heroImagePrompt}) : null);
    setIsSaving(false);
    toast({ title: "Blog post saved!", description: `"${post.title}" has been updated.` });
  };

  const handleGenerateHeroImage = async () => {
    if (!heroImagePrompt) {
      toast({ title: "Prompt required", description: "Please enter a prompt for the hero image.", variant: "destructive" });
      return;
    }
    setIsGeneratingHeroImage(true);
    setGeneratedHeroImageUrl(null);
    try {
      const result = await generateHeroImageAction({ blogTitle: heroImagePrompt, tone: heroImageTone });
      setGeneratedHeroImageUrl(result.imageUrl);
      toast({ title: "Hero image generated!", description: "Review the image below." });
    } catch (error: any) {
      toast({ title: "Error generating image", description: error.message, variant: "destructive" });
    }
    setIsGeneratingHeroImage(false);
  };

  const handleRepurposeContent = async () => {
    if (!content) {
        toast({ title: "Blog content is empty", description: "Please write some content before repurposing.", variant: "destructive" });
        return;
    }
    setIsRepurposing(true);
    setRepurposedContent(null);
    try {
        const result = await repurposeContentAction({ article: content, tone: repurposeTone });
        setRepurposedContent(result);
        toast({ title: "Content repurposed!", description: "Check the generated snippets."});
    } catch (error: any) {
        toast({ title: "Error repurposing content", description: error.message, variant: "destructive" });
    }
    setIsRepurposing(false);
  };
  
  const copyToClipboard = (text: string, type: string) => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!", description: `${type} content copied.` });
    } else {
      toast({ title: "Failed to copy", description: "Content might be empty or clipboard unavailable.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Icons.Spinner className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!post) {
    return <div className="text-center py-10">Blog post not found.</div>;
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title={`Edit: ${post.title}`}
        description={`Topic: ${post.topic} | Tone: ${post.tone} | Style: ${post.style} | Length: ${post.length}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <Icons.ChevronLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Save className="mr-2 h-4 w-4" />}
              Save Post
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Blog Content Editor</CardTitle><CardDescription>Edit your blog post. Use AI tools for assistance.</CardDescription></CardHeader>
            <CardContent>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={25} className="text-base p-4 border rounded-md shadow-inner focus:ring-primary focus:border-primary" placeholder="Start writing..."/>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Improve' feature coming soon!" })}><Icons.Improve className="mr-2 h-4 w-4"/>Improve</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Expand' feature coming soon!" })}><Icons.Expand className="mr-2 h-4 w-4"/>Expand</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Simplify' feature coming soon!" })}><Icons.Simplify className="mr-2 h-4 w-4"/>Simplify</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader><CardTitle>Content Repurposing</CardTitle><CardDescription>Generate social media snippets and summaries.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-4">
                <div className="flex-grow space-y-1">
                  <Label htmlFor="repurposeTone">Tone for Repurposed Content</Label>
                  <Input id="repurposeTone" value={repurposeTone} onChange={(e) => setRepurposeTone(e.target.value)} placeholder="e.g., witty, professional" />
                </div>
                <Button onClick={handleRepurposeContent} disabled={isRepurposing}>
                  {isRepurposing && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}Repurpose
                </Button>
              </div>
              {isRepurposing && <div className="text-center p-4"><Icons.Spinner className="h-6 w-6 animate-spin text-primary" /> <p className="text-sm text-muted-foreground">Generating snippets...</p></div>}
              {repurposedContent && (
                <Tabs defaultValue="tweet" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tweet"><Icons.Tweet className="mr-1 h-4 w-4"/>Tweet</TabsTrigger>
                    <TabsTrigger value="linkedin"><Icons.LinkedIn className="mr-1 h-4 w-4"/>LinkedIn</TabsTrigger>
                    <TabsTrigger value="email"><Icons.Email className="mr-1 h-4 w-4"/>Email</TabsTrigger>
                  </TabsList>
                  {(['tweet', 'linkedin', 'email'] as const).map(type => (
                    <TabsContent key={type} value={type} className="mt-4">
                      <Textarea value={repurposedContent[type === 'tweet' ? 'tweetThread' : type === 'linkedin' ? 'linkedInPost' : 'emailNewsletterSummary']} 
                                onChange={(e) => setRepurposedContent(prev => prev ? {...prev, [type === 'tweet' ? 'tweetThread' : type === 'linkedin' ? 'linkedInPost' : 'emailNewsletterSummary']: e.target.value} : null)} 
                                rows={8} 
                                className="text-sm" />
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => copyToClipboard(repurposedContent[type === 'tweet' ? 'tweetThread' : type === 'linkedin' ? 'linkedInPost' : 'emailNewsletterSummary'], type)}><Icons.Copy className="mr-2 h-3 w-3"/>Copy</Button>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Hero Image Generator</CardTitle><CardDescription>Create a hero image for your post.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label htmlFor="heroPrompt">Image Prompt</Label><Input id="heroPrompt" value={heroImagePrompt} onChange={(e) => setHeroImagePrompt(e.target.value)} placeholder="e.g., Futuristic cityscape" /></div>
              <div className="space-y-1"><Label htmlFor="heroTone">Image Tone/Style</Label><Input id="heroTone" value={heroImageTone} onChange={(e) => setHeroImageTone(e.target.value)} placeholder="e.g., cinematic, vibrant" /></div>
              <Button onClick={handleGenerateHeroImage} disabled={isGeneratingHeroImage} className="w-full">
                {isGeneratingHeroImage ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Image className="mr-2 h-4 w-4" />}Generate Image
              </Button>
              {isGeneratingHeroImage && <div className="text-center p-4"><Icons.Spinner className="h-6 w-6 animate-spin text-primary" /> <p className="text-sm text-muted-foreground">Generating image...</p></div>}
              {generatedHeroImageUrl && (
                <div className="mt-4 space-y-2">
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <NextImage src={generatedHeroImageUrl} alt={heroImageAltText || "Generated hero image"} layout="fill" objectFit="cover" data-ai-hint="illustration abstract"/>
                  </div>
                  <div className="space-y-1"><Label htmlFor="heroCaption">Caption</Label><Input id="heroCaption" value={heroImageCaption} onChange={(e) => setHeroImageCaption(e.target.value)} placeholder="Image caption" /></div>
                  <div className="space-y-1"><Label htmlFor="heroAltText">Alt Text</Label><Input id="heroAltText" value={heroImageAltText} onChange={(e) => setHeroImageAltText(e.target.value)} placeholder="Accessibility alt text" /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Export PNG", description:"Coming soon!"})}>Export PNG</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Export SVG", description:"Coming soon!"})}>Export SVG</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Optimization Panel</CardTitle><CardDescription>SEO scores and content analysis.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="seo" className="w-full">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="seo">SEO Scores</TabsTrigger><TabsTrigger value="analysis">Gap Analysis</TabsTrigger></TabsList>
                <TabsContent value="seo" className="mt-4 space-y-3">
                  {(['Readability', 'Keyword Density', 'Overall Quality'] as const).map(scoreType => (
                    <div key={scoreType}>
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm">{scoreType}</Label>
                        <span className="text-sm font-medium">
                          {scoreType === 'Readability' ? post.seoScore?.readability || 70 : scoreType === 'Keyword Density' ? post.seoScore?.keywordDensity || 55 : post.seoScore?.quality || 78}%
                        </span>
                      </div>
                      <Progress value={scoreType === 'Readability' ? post.seoScore?.readability || 70 : scoreType === 'Keyword Density' ? post.seoScore?.keywordDensity || 55 : post.seoScore?.quality || 78} aria-label={`${scoreType} score`} />
                    </div>
                  ))}
                  <Separator />
                   <Alert>
                    <Icons.Plagiarism className="h-4 w-4" />
                    <AlertTitle>Content Integrity</AlertTitle>
                    <AlertDescription className="text-xs"><p>Repetitions: Low</p><p>Vague Wording: Minimal</p><p>Plagiarism Risk: Not Detected (Mock)</p></AlertDescription>
                  </Alert>
                </TabsContent>
                <TabsContent value="analysis" className="mt-4">
                   <Label>Top Search Results Comparison (Mock)</Label>
                   <Textarea readOnly value="Top result 1 focuses on X, Y, Z. Your article covers X, Y well but could expand on Z. Consider adding a section on A and B which are common in top ranking pages." rows={5} className="text-sm" />
                   <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary" onClick={() => toast({title: "Rewrite suggestions coming soon!"})}>Rewrite suggestions (mock)</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
             <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Export Markdown", description:"Coming soon!"})}>Export as Markdown</Button>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Export HTML", description:"Coming soon!"})}>Export as HTML</Button>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Export PDF", description:"Coming soon!"})}>Export as PDF</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
