
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import { useToast } from '@/hooks/use-toast';
import { generateHeroImageAction, repurposeContentAction, generateBlogTitleSuggestionAction, generateMetaTitleAction, generateMetaDescriptionAction } from '@/actions/ai';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const imageThemes = ["General", "Dark", "Light", "Pastel", "Vibrant", "Monochrome"];

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const blogId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [heroImagePrompt, setHeroImagePrompt] = useState('');
  const [heroImageTone, setHeroImageTone] = useState('cinematic');
  const [heroImageTheme, setHeroImageTheme] = useState('General');
  const [generatedHeroImageUrls, setGeneratedHeroImageUrls] = useState<string[] | null>(null);
  const [selectedHeroImageUrl, setSelectedHeroImageUrl] = useState<string | null>(null);
  const [heroImageCaption, setHeroImageCaption] = useState('');
  const [heroImageAltText, setHeroImageAltText] = useState('');
  const [isGeneratingHeroImage, setIsGeneratingHeroImage] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');


  const [repurposeTone, setRepurposeTone] = useState('professional');
  const [repurposedContent, setRepurposedContent] = useState<RepurposedContent | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);

  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [isSuggestingBlogTitle, setIsSuggestingBlogTitle] = useState(false);
  const [isSuggestingMetaTitle, setIsSuggestingMetaTitle] = useState(false);
  const [isSuggestingMetaDescription, setIsSuggestingMetaDescription] = useState(false);


  useEffect(() => {
    if (blogId) {
      const fetchedPost = blogStore.getPostById(blogId);
      if (fetchedPost) {
        setPost(fetchedPost);
        setEditableTitle(fetchedPost.title);
        setContent(fetchedPost.content);
        setHeroImagePrompt(fetchedPost.heroImagePrompt || fetchedPost.title);
        setHeroImageTone(fetchedPost.tone || 'cinematic');
        setHeroImageTheme(fetchedPost.heroImageTheme || 'General');
        setSelectedHeroImageUrl(fetchedPost.heroImageUrl || null);
        setHeroImageCaption(fetchedPost.heroImageCaption || '');
        setHeroImageAltText(fetchedPost.heroImageAltText || '');
        setMetaTitle(fetchedPost.metaTitle || `Meta title for ${fetchedPost.title}`);
        setMetaDescription(fetchedPost.metaDescription || `Meta description for ${fetchedPost.title}`);
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
      title: editableTitle,
      content,
      heroImageUrl: selectedHeroImageUrl || undefined,
      heroImageCaption,
      heroImageAltText,
      heroImagePrompt,
      heroImageTheme,
      metaTitle,
      metaDescription,
    });
    setPost(prev => prev ? ({
      ...prev,
      title: editableTitle,
      content,
      heroImageUrl: selectedHeroImageUrl || undefined,
      heroImageCaption,
      heroImageAltText,
      heroImagePrompt,
      heroImageTheme,
      metaTitle,
      metaDescription,
    }) : null);
    setIsSaving(false);
    toast({ title: "Blog post saved!", description: `"${editableTitle}" has been updated.` });
  };

  const handleGenerateHeroImage = async () => {
    if (!heroImagePrompt) {
      toast({ title: "Prompt required", description: "Please enter a prompt for the hero image.", variant: "destructive" });
      return;
    }
    setIsGeneratingHeroImage(true);
    setGeneratedHeroImageUrls(null);
    setSelectedHeroImageUrl(null);
    setGenerationStatus("Initializing generation...");
    try {
      const result = await generateHeroImageAction({ blogTitle: heroImagePrompt, tone: heroImageTone, theme: heroImageTheme });
      setGeneratedHeroImageUrls(result.imageUrls);
      if (result.imageUrls && result.imageUrls.length > 0) {
        setSelectedHeroImageUrl(result.imageUrls[0]); 
        toast({ title: "Hero images generated!", description: "Select your favorite variant below." });
      } else {
        toast({ title: "No images generated", description: "The AI could not generate images for this prompt.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error generating images", description: error.message, variant: "destructive" });
      setGeneratedHeroImageUrls([`https://placehold.co/600x300.png?text=Error`]);
    }
    setIsGeneratingHeroImage(false);
    setGenerationStatus('');
  };

  const handleExportPng = () => {
    if (!selectedHeroImageUrl) {
      toast({ title: "No image selected", description: "Please generate and select an image to export.", variant: "destructive" });
      return;
    }
    if (!selectedHeroImageUrl.startsWith('data:image')) {
      toast({ title: "Export Error", description: "Selected image is not a data URI and cannot be directly downloaded.", variant: "destructive" });
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = selectedHeroImageUrl;
      const filename = post?.title ? post.title.replace(/\s+/g, '-').toLowerCase() : 'hero-image';
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Image downloading...", description: "Check your downloads folder."});
    } catch (error) {
      console.error("Error downloading image:", error);
      toast({ title: "Download Failed", description: "Could not download the image.", variant: "destructive" });
    }
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

  const handleSuggestBlogTitle = async () => {
    if (!content || !post?.topic) {
      toast({ title: "Content and Topic needed", description: "Blog content and original topic are needed to suggest a title.", variant: "destructive"});
      return;
    }
    setIsSuggestingBlogTitle(true);
    try {
      const result = await generateBlogTitleSuggestionAction({ currentContent: content, originalTopic: post.topic });
      setEditableTitle(result.suggestedTitle);
      toast({ title: "Blog title suggested!", description: "Review and edit the new title."});
    } catch (error: any) {
      toast({ title: "Error suggesting title", description: error.message, variant: "destructive" });
    }
    setIsSuggestingBlogTitle(false);
  };

  const handleSuggestMetaTitle = async () => {
    if (!editableTitle || !content) {
      toast({ title: "Title and Content needed", description: "Blog title and content are needed to suggest a meta title.", variant: "destructive"});
      return;
    }
    setIsSuggestingMetaTitle(true);
    try {
      const result = await generateMetaTitleAction({ blogTitle: editableTitle, blogContent: content });
      setMetaTitle(result.suggestedMetaTitle);
      toast({ title: "Meta title suggested!", description: "Review and edit the new meta title."});
    } catch (error: any) {
      toast({ title: "Error suggesting meta title", description: error.message, variant: "destructive" });
    }
    setIsSuggestingMetaTitle(false);
  };

  const handleSuggestMetaDescription = async () => {
     if (!editableTitle || !content) {
      toast({ title: "Title and Content needed", description: "Blog title and content are needed to suggest a meta description.", variant: "destructive"});
      return;
    }
    setIsSuggestingMetaDescription(true);
    try {
      const result = await generateMetaDescriptionAction({ blogTitle: editableTitle, blogContent: content });
      setMetaDescription(result.suggestedMetaDescription);
      toast({ title: "Meta description suggested!", description: "Review and edit the new meta description."});
    } catch (error: any) {
      toast({ title: "Error suggesting meta description", description: error.message, variant: "destructive" });
    }
    setIsSuggestingMetaDescription(false);
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
        title={`Edit: ${editableTitle || 'Untitled Post'}`}
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
          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader>
              <CardTitle>Blog Post Details</CardTitle>
              <CardDescription>Edit the core details of your blog post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="editableTitle">Blog Title</Label>
                <div className="flex gap-2 items-center">
                  <Input id="editableTitle" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} placeholder="Your Awesome Blog Title" className="flex-grow"/>
                  <Button variant="outline" size="sm" onClick={handleSuggestBlogTitle} disabled={isSuggestingBlogTitle}>
                    {isSuggestingBlogTitle ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                    Suggest
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>Blog Content Editor</CardTitle><CardDescription>Edit your blog post. Use AI tools for assistance.</CardDescription></CardHeader>
            <CardContent>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={25} className="text-base p-4 border rounded-md shadow-inner focus:ring-primary focus:border-primary" placeholder="Start writing..."/>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Improve' feature coming soon!" })}><Icons.Improve className="mr-2 h-4 w-4"/>Improve</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Expand' feature coming soon!" })}><Icons.Expand className="mr-2 h-4 w-4"/>Expand</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Simplify' feature coming soon!" })}><Icons.Simplify className="mr-2 h-4 w-4"/>Simplify</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Depth Boost' feature coming soon!" })}><Icons.Improve className="mr-2 h-4 w-4"/>Depth Boost</Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "AI Suggestion", description: "'Visualize' feature coming soon!" })}><Icons.Image className="mr-2 h-4 w-4"/>Visualize</Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
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
                    <TabsContent key={type} value={type} forceMount className="mt-4">
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
          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>Hero Image Generator</CardTitle><CardDescription>Create hero images for your post.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1"><Label htmlFor="heroPrompt">Image Prompt</Label><Input id="heroPrompt" value={heroImagePrompt} onChange={(e) => setHeroImagePrompt(e.target.value)} placeholder="e.g., Futuristic cityscape" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label htmlFor="heroTone">Image Tone/Style</Label><Input id="heroTone" value={heroImageTone} onChange={(e) => setHeroImageTone(e.target.value)} placeholder="e.g., cinematic, vibrant" /></div>
                <div className="space-y-1">
                  <Label htmlFor="heroTheme">Image Theme</Label>
                  <Select value={heroImageTheme} onValueChange={(value: string) => setHeroImageTheme(value)}>
                    <SelectTrigger id="heroTheme"><SelectValue placeholder="Select theme" /></SelectTrigger>
                    <SelectContent>{imageThemes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerateHeroImage} disabled={isGeneratingHeroImage} className="w-full">
                {isGeneratingHeroImage ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Image className="mr-2 h-4 w-4" />}Generate Images
              </Button>
              {isGeneratingHeroImage && <div className="text-center p-4"><Icons.Spinner className="h-6 w-6 animate-spin text-primary" /> <p className="text-sm text-muted-foreground">{generationStatus || "Generating images..."}</p></div>}

              {generatedHeroImageUrls && generatedHeroImageUrls.length > 0 && !isGeneratingHeroImage && (
                <div className="mt-4 space-y-2">
                  <Label>Generated Variants (click to select)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {generatedHeroImageUrls.map((url, index) => (
                      <div key={index}
                           className={`relative aspect-video w-full overflow-hidden rounded-md border cursor-pointer transition-all ${selectedHeroImageUrl === url ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}`}
                           onClick={() => setSelectedHeroImageUrl(url)}>
                        <NextImage src={url} alt={`Variant ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="variant choice" />
                        {selectedHeroImageUrl === url && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                <Icons.Check className="h-6 w-6 text-white"/>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedHeroImageUrl && (
                <div className="mt-4 space-y-3 pt-3 border-t">
                  <Label className="font-semibold">Selected Image:</Label>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                    <NextImage src={selectedHeroImageUrl} alt={heroImageAltText || "Selected hero image"} layout="fill" objectFit="cover" data-ai-hint="illustration abstract"/>
                  </div>
                  <div className="space-y-1"><Label htmlFor="heroCaption">Caption</Label><Input id="heroCaption" value={heroImageCaption} onChange={(e) => setHeroImageCaption(e.target.value)} placeholder="Image caption" /></div>
                  <div className="space-y-1"><Label htmlFor="heroAltText">Alt Text</Label><Input id="heroAltText" value={heroImageAltText} onChange={(e) => setHeroImageAltText(e.target.value)} placeholder="Accessibility alt text" /></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportPng}>Export PNG</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Export SVG", description:"SVG export coming soon! Vector generation is complex."})}>Export SVG</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>SEO Metadata</CardTitle><CardDescription>Optimize your post for search engines.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="metaTitle">Meta Title</Label>
                 <div className="flex gap-2 items-center">
                    <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="e.g., Your Catchy Blog Post Title | SiteName" className="flex-grow"/>
                    <Button variant="outline" size="sm" onClick={handleSuggestMetaTitle} disabled={isSuggestingMetaTitle}>
                        {isSuggestingMetaTitle ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                 </div>
                <p className="text-xs text-muted-foreground">Recommended: 50-60 characters.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <div className="flex gap-2 items-start"> {/* Use items-start for Textarea alignment */}
                    <Textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A brief summary of your post to attract readers from search results." rows={3} className="flex-grow"/>
                    <Button variant="outline" size="sm" onClick={handleSuggestMetaDescription} disabled={isSuggestingMetaDescription} className="mt-[1px]"> {/* Slight top margin for alignment */}
                        {isSuggestingMetaDescription ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended: 150-160 characters.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>Optimization Panel</CardTitle><CardDescription>SEO scores and content analysis.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="seo" className="w-full">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="seo">SEO Scores</TabsTrigger><TabsTrigger value="analysis">Gap Analysis</TabsTrigger></TabsList>
                <TabsContent value="seo" forceMount className="mt-4 space-y-3">
                  {(['Readability', 'Keyword Density', 'Overall Quality'] as const).map(scoreType => (
                    <div key={scoreType}>
                      <div className="flex justify-between mb-1">
                        <Label className="text-sm">{scoreType}</Label>
                        <span className="text-sm font-medium">
                          {scoreType === 'Readability' ? (post.seoScore?.readability || 70) : scoreType === 'Keyword Density' ? (post.seoScore?.keywordDensity || 55) : (post.seoScore?.quality || 78)}%
                        </span>
                      </div>
                      <Progress
                        value={scoreType === 'Readability' ? (post.seoScore?.readability || 70) : scoreType === 'Keyword Density' ? (post.seoScore?.keywordDensity || 55) : (post.seoScore?.quality || 78)}
                        aria-label={`${scoreType} score`} />
                    </div>
                  ))}
                  <Separator />
                   <Alert>
                    <Icons.Plagiarism className="h-4 w-4" />
                    <AlertTitle>Content Integrity</AlertTitle>
                    <AlertDescription className="text-xs"><p>Repetitions: Low</p><p>Vague Wording: Minimal</p><p>Plagiarism Risk: Not Detected (Mock)</p></AlertDescription>
                  </Alert>
                </TabsContent>
                <TabsContent value="analysis" forceMount className="mt-4">
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

