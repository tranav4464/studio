
"use client";

import { useState, type ChangeEvent } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateBlogOutlineAction, generateFullBlogAction } from '@/actions/ai';
import { cn } from '@/lib/utils';

const tones: BlogTone[] = ["formal", "casual", "informative", "persuasive", "humorous"];
const styles: BlogStyle[] = ["academic", "journalistic", "storytelling", "technical"];
const lengths: BlogLength[] = ["short", "medium", "long"];

interface OutlineItem {
  id: string;
  value: string;
}

type UiStep = 'defineDetails' | 'editOutline';

export default function NewBlogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<BlogTone>('informative');
  const [style, setStyle] = useState<BlogStyle>('journalistic');
  const [length, setLength] = useState<BlogLength>('medium');
  const [referenceText, setReferenceText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [generatedOutline, setGeneratedOutline] = useState<OutlineItem[] | null>(null);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [uiStep, setUiStep] = useState<UiStep>('defineDetails');


  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setReferenceText(content);
          setUploadedFileName(file.name);
          toast({ title: "File Uploaded", description: `${file.name} content loaded into reference text.` });
        };
        reader.onerror = () => {
          toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
          setUploadedFileName(null);
        };
        reader.readAsText(file);
      } else {
        toast({ title: "Invalid File Type", description: "Only .txt files are currently supported for direct content extraction. PDF/DOCX support coming soon.", variant: "destructive" });
        setUploadedFileName(null);
        event.target.value = ""; 
      }
    }
  };

  const handleGenerateOutline = async () => {
    if (!topic) {
      toast({ title: "Topic is required", description: "Please enter a blog topic.", variant: "destructive" });
      return;
    }
    setIsLoadingOutline(true);
    setGeneratedOutline(null);

    try {
      const result = await generateBlogOutlineAction({
        topic,
        tone,
        style,
        length,
        referenceText: referenceText || undefined,
      });

      if (result.outline && result.outline.length > 0) {
        setGeneratedOutline(result.outline.map((item, index) => ({ id: Date.now().toString() + index, value: item })));
        toast({ title: "Outline Generated", description: "Review and customize the outline below." });
        setUiStep('editOutline');
      } else {
        toast({ title: "Outline Generation Failed", description: "Could not generate an outline. Please try again or create one manually.", variant: "destructive" });
        setGeneratedOutline([
          { id: Date.now().toString() + '1', value: `Introduction to ${topic}`},
          { id: Date.now().toString() + '2', value: `Key aspect 1 of ${topic}`},
          { id: Date.now().toString() + '3', value: `Conclusion about ${topic}`},
        ]);
        setUiStep('editOutline'); 
      }
    } catch (error: any) {
      toast({ title: "Error Generating Outline", description: error.message || "An unexpected error occurred.", variant: "destructive" });
       setGeneratedOutline([
          { id: Date.now().toString() + '1', value: `Error: Could not generate outline for ${topic}`},
          { id: Date.now().toString() + '2', value: `Please try again or manually create sections.`},
        ]);
       setUiStep('editOutline');
    } finally {
      setIsLoadingOutline(false);
    }
  };

  const handleAddOutlineSection = () => {
    setGeneratedOutline(prev => prev ? [...prev, {id: Date.now().toString(), value: "New Section"}] : [{id: Date.now().toString(), value: "New Section"}]);
  };

  const handleRemoveOutlineSection = (idToRemove: string) => {
    setGeneratedOutline(prev => prev ? prev.filter(item => item.id !== idToRemove) : null);
  };

  const handleOutlineItemChange = (id: string, newValue: string) => {
    setGeneratedOutline(prev => prev ? prev.map(item => item.id === id ? {...item, value: newValue} : item) : null);
  }

  const handleGeneratePost = async () => {
    if (!topic || !generatedOutline || generatedOutline.length === 0) {
      toast({ title: "Topic and Outline Required", description: "Please generate and define an outline first.", variant: "destructive" });
      return;
    }
    setIsLoadingPost(true);
    
    const outlineStrings = generatedOutline.map(item => item.value);

    try {
      const result = await generateFullBlogAction({
        topic,
        tone,
        style,
        length,
        outline: outlineStrings,
        referenceText: customInstructions || referenceText || undefined,
      });

      const newPost = blogStore.addPost({
          title: topic, 
          topic,
          tone,
          style,
          length,
      });
      
      blogStore.updatePost(newPost.id, { 
        content: result.blogContent,
        outline: outlineStrings,
      });

      toast({ title: "Blog Post Generated!", description: "Redirecting to the editor..." });
      router.push(`/blogs/${newPost.id}/edit`);

    } catch (error: any) {
      toast({ title: "Error Generating Blog Post", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoadingPost(false);
    }
  };
  
  const pageTitle = uiStep === 'defineDetails' 
    ? "Create New Blog Post" 
    : "Create New Blog Post - Step 2: Refine Outline & Generate";
  
  const pageDescription = uiStep === 'defineDetails'
    ? "Define your blog's topic, tone, and style to get started."
    : "Customize the AI-generated outline and add specific instructions for the full blog post generation.";


  return (
    <TooltipProvider>
      <div className="container mx-auto">
        <PageHeader
          title={pageTitle}
          description={pageDescription}
        />
        <div className={cn(
            "gap-8",
            uiStep === 'defineDetails'
              ? "flex flex-col items-center" 
              : "grid grid-cols-1 md:grid-cols-3" 
          )}>
          
          {/* Blog Details Card */}
          <Card className={cn(
            "shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-xl",
            uiStep === 'defineDetails' ? "w-full md:max-w-3xl" : "md:col-span-1"
          )}>
            <CardHeader>
              <CardTitle>Blog Details</CardTitle>
              <CardDescription>
                {uiStep === 'defineDetails' 
                  ? "Fill in the specifics for your new blog post."
                  : "Review or adjust blog details if needed."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="topic">Blog Topic <span className="text-destructive">*</span></Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>The main subject or theme of your blog post.</p></TooltipContent>
                  </Tooltip>
                </div>
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
                <div className="flex items-center gap-1">
                  <Label htmlFor="referenceText">Initial Reference Text / Notes (Optional)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button>
                    </TooltipTrigger>
                    <TooltipContent side="top"><p>Paste any existing text, notes, or key points for the AI to consider for outline generation. This will be replaced if you upload a .txt file.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Textarea id="referenceText" placeholder="Paste any reference material or key points here, or upload a .txt file below..." value={referenceText} onChange={(e) => setReferenceText(e.target.value)} rows={5} />
              </div>
              
              <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="reference-files">Upload Reference File (Optional)</Label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs"><p>Upload a .txt file. Its content will replace the text in the 'Initial Reference Text' box above. Support for PDF/DOCX coming soon.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input 
                    id="reference-files" 
                    type="file" 
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                  />
                  {uploadedFileName && <p className="text-xs text-muted-foreground">Uploaded: {uploadedFileName}</p>}
                  <p className="text-xs text-muted-foreground">
                    Currently, only .txt files are directly processed. For PDF/DOCX, please paste content into the 'Initial Reference Text' box above. Full PDF/DOCX upload support coming soon.
                  </p>
              </div>
            </CardContent>
            {uiStep === 'defineDetails' && (
              <CardFooter>
                <Button onClick={handleGenerateOutline} disabled={isLoadingOutline || isLoadingPost || !topic}>
                  {isLoadingOutline && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Outline
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Blog Outline & Instructions Card - only shown in 'editOutline' step */}
          {uiStep === 'editOutline' && (
            <Card className="md:col-span-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-xl">
              <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle>Blog Outline & Instructions</CardTitle>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                            setGeneratedOutline(null); // Clear previous outline
                            setCustomInstructions(''); // Clear custom instructions
                            setUiStep('defineDetails'); 
                        }}
                        disabled={isLoadingPost || isLoadingOutline}
                    >
                        <Icons.ChevronLeft className="mr-2 h-4 w-4" /> Back to Details
                    </Button>
                </div>
                <CardDescription>Customize the AI-generated outline and add specific instructions for the full blog post generation.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[200px] space-y-3">
                {isLoadingOutline && (
                  <div className="flex items-center justify-center p-8"><Icons.Spinner className="h-8 w-8 animate-spin text-primary" /></div>
                )}
                {generatedOutline && !isLoadingOutline && (
                  <>
                    <Label className="font-medium">Generated Outline:</Label>
                    {generatedOutline.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Input 
                          value={item.value} 
                          className="flex-grow" 
                          onChange={(e) => handleOutlineItemChange(item.id, e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveOutlineSection(item.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                          <Icons.Delete className="h-4 w-4" />
                          <span className="sr-only">Remove section</span>
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddOutlineSection} className="w-full mt-2">
                      <Icons.FilePlus className="mr-2 h-4 w-4" /> Add Section
                    </Button>
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center gap-1">
                          <Label htmlFor="customInstructions">Additional Instructions for Full Blog (Optional)</Label>
                          <Tooltip>
                              <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs"><p>Provide specific instructions for the AI for the full blog generation stage (e.g., "Focus on practical examples in section 2", "Maintain a very optimistic tone throughout"). This will be combined with or override the initial reference text for this step.</p></TooltipContent>
                          </Tooltip>
                      </div>
                      <Textarea 
                          id="customInstructions"
                          placeholder="e.g., Emphasize the impact on small businesses. Include a call to action to visit our website." 
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          rows={3} 
                          className="mt-1"
                      />
                    </div>
                  </>
                )}
                {!generatedOutline && !isLoadingOutline && (
                  <p className="text-sm text-muted-foreground text-center py-8">Outline will appear here after generation.</p>
                )}
              </CardContent>
              {generatedOutline && generatedOutline.length > 0 && !isLoadingOutline && (
                <CardFooter>
                  <Button onClick={handleGeneratePost} disabled={isLoadingPost || isLoadingOutline} className="w-full">
                    {isLoadingPost && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Full Blog Post
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

