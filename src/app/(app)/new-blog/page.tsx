
"use client";

import React, { useState, type ChangeEvent, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Icons } from "@/components/icons";
import { X, Loader2, Upload } from "lucide-react";
import { IntelligentTopicInput } from "@/components/blog/intelligent-topic-input";
import { PageHeader } from '@/components/shared/page-header';
import type { BlogTone, BlogStyle, BlogLength, Persona, ExpertiseLevel, Intent } from '@/types';
import { blogStore } from '@/lib/blog-store';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { generateBlogOutlineAction, generateFullBlogAction, generateTopicIdeasAction, summarizeReferenceTextAction } from '@/actions/ai';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const tones: Array<{value: BlogTone, label: string, emoji: string}> = [
  {value: "formal", label: "Formal", emoji: "💼"},
  {value: "casual", label: "Casual", emoji: "😊"},
  {value: "informative", label: "Informative", emoji: "🧠"},
  {value: "persuasive", label: "Persuasive", emoji: "📢"},
  {value: "humorous", label: "Humorous", emoji: "😂"},
];

const styles: Array<{value: BlogStyle, label: string, description: string, icon: keyof typeof Icons}> = [
    {value: "journalistic", label: "Journalistic", description: "Factual, news-like.", icon: "FileText"},
    {value: "storytelling", label: "Storytelling", description: "Narrative-driven.", icon: "FileText"}, // Changed icon to FileText for consistency if BookOpen is not available
    {value: "technical", label: "Technical", description: "Detailed, precise.", icon: "Settings"},
    {value: "academic", label: "Academic", description: "Formal, research-oriented.", icon: "MyBlogs"}, // Assuming MyBlogs is a valid icon like BookText or similar
];
const lengths: BlogLength[] = ["short", "medium", "long"];

const personas: Persona[] = ["General Audience", "Developers", "Marketing Managers", "Executives"];
const expertiseLevels: ExpertiseLevel[] = ["Beginner", "Intermediate", "Advanced"];
const intents: Intent[] = ["Inform", "Convert", "Entertain", "Engage", "Educate"];


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
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [persona, setPersona] = useState<Persona>('General Audience');
  const [expertiseLevelValue, setExpertiseLevelValue] = useState<number[]>([1]);
  const [intent, setIntent] = useState<Intent>('Inform');
  const [topicIdeas, setTopicIdeas] = useState<string[]>([]);
  const [isSparkingIdeas, setIsSparkingIdeas] = useState(false);

  const [referenceSummaryPoints, setReferenceSummaryPoints] = useState<string[]>([]);
  const [isSummarizingRefText, setIsSummarizingRefText] = useState(false);


  const [generatedOutline, setGeneratedOutline] = useState<OutlineItem[] | null>(null);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [uiStep, setUiStep] = useState<UiStep>('defineDetails');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAttachPopoverOpen, setIsAttachPopoverOpen] = useState(false);


  const getExpertiseLevelFromSlider = (value: number): ExpertiseLevel => {
    if (value === 0) return "Beginner";
    if (value === 2) return "Advanced";
    return "Intermediate";
  };
  const currentExpertiseLevel = getExpertiseLevelFromSlider(expertiseLevelValue[0]);

  const handleSummarizeReferenceText = async (text: string) => {
    if (!text.trim()) return;
    setIsSummarizingRefText(true);
    setReferenceSummaryPoints([]); // Clear previous points
    try {
      const result = await summarizeReferenceTextAction({ textToSummarize: text });
      setReferenceSummaryPoints(result.keyPoints);
    } catch (error: any) {
      toast({ title: "Error Summarizing Text", description: error.message || "Could not summarize reference material.", variant: "destructive" });
    }
    setIsSummarizingRefText(false);
  };


  const processFile = useCallback(async (file: File) => {
    if (!file) return false;
    
    // Reset any previous state
    setIsProcessingFile(true);
    setUploadedFileName(null);
    setReferenceText('');
    setReferenceSummaryPoints([]);
    
    try {
      if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
        throw new Error('Only .txt files are supported');
      }
      
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });
      
      setReferenceText(content);
      setUploadedFileName(file.name);
      toast({ 
        title: 'File Uploaded', 
        description: `Processing ${file.name}...`,
        action: (
          <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
            Undo
          </Button>
        )
      });
      
      // Start summarization in the background
      handleSummarizeReferenceText(content);
      return true;
      
    } catch (error: any) {
      console.error('File processing error:', error);
      toast({ 
        title: 'Error Processing File', 
        description: error.message || 'Could not process the file', 
        variant: 'destructive' 
      });
      return false;
    } finally {
      setIsProcessingFile(false);
    }
  }, [handleSummarizeReferenceText]);
  
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset the file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFile]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragOver) {
      setIsDragOver(false);
    }
  }, [isDragOver]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUploadedFileName(null);
    setReferenceText('');
    setReferenceSummaryPoints([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({ 
      title: 'File Removed', 
      description: 'Uploaded file and its reference text have been cleared.',
      action: (
        <Button variant="ghost" size="sm" onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}>
          Upload New
        </Button>
      )
    });
  }, []);

  const handleSparkIdeas = async () => {
    if (!topic.trim()) {
        toast({ title: "Enter Keywords", description: "Please enter some keywords in the topic field to spark ideas.", variant: "destructive"});
        return;
    }
    setIsSparkingIdeas(true);
    setTopicIdeas([]);
    try {
        const result = await generateTopicIdeasAction({ keywords: topic.trim() });
        setTopicIdeas(result.ideas);
    } catch (error: any) {
        toast({ title: "Error Sparking Ideas", description: error.message || "Could not fetch topic ideas.", variant: "destructive"});
    }
    setIsSparkingIdeas(false);
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
        persona,
        expertiseLevel: currentExpertiseLevel,
        intent,
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
        referenceText: referenceText || undefined,
        persona,
        expertiseLevel: currentExpertiseLevel,
        intent,
        customInstructions: customInstructions || undefined,
      });

      const newPost = blogStore.addPost({
          title: topic,
          topic,
          tone,
          style,
          length,
          persona,
          expertiseLevel: currentExpertiseLevel,
          intent,
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

  const handleBackToDetails = () => {
    setUiStep('defineDetails');
    // If a file was uploaded, clear its related states
    if (uploadedFileName) {
      handleRemoveFile(); // This also clears referenceText and summaryPoints
    } else {
      // If no file was uploaded, preserve manually typed referenceText but clear outline.
      // For consistency, let's clear summary points too, to ensure a fresh state for outline generation if details change.
      setReferenceSummaryPoints([]);
    }
    setGeneratedOutline(null); // Always clear outline when going back
    setCustomInstructions(''); // Clear custom instructions
  };


  const pageTitle = uiStep === 'defineDetails'
    ? "Create New Blog Post"
    : "Create New Blog Post - Step 2: Refine Outline & Generate";

  const pageDescription = uiStep === 'defineDetails'
    ? "Define your blog's topic, tone, and style to get started."
    : "Customize the AI-generated outline and add specific instructions for the full blog post generation.";

  const selectedToneEmoji = tones.find(t => t.value === tone)?.emoji || '';

  // Function to safely copy to clipboard with user interaction
  const copyToClipboard = async (text: string) => {
    try {
      // Ensure the document has focus
      if (!document.hasFocus()) {
        window.focus();
      }
      
      // Request permission
      const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      if (permission.state === 'granted' || permission.state === 'prompt') {
        await navigator.clipboard.writeText(text);
        // Show success toast or feedback
        toast({
          title: 'Copied to clipboard!',
          variant: 'default',
        });
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for browsers that don't support the Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: 'Copied to clipboard!',
          variant: 'default',
        });
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast({
          title: 'Failed to copy',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />
      <div className={cn(
        "gap-8",
        uiStep === 'defineDetails'
          ? "flex flex-col items-center" // Center content for defineDetails step
          : "grid grid-cols-1 md:grid-cols-3" // Grid for editOutline step
      )}>
        {/* Main content */}
        <div className="w-full">
          {/* Card for Blog Details - always visible, but its width/position changes */}
          <Card className={cn(
            "shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl",
            uiStep === 'defineDetails' ? "w-full md:max-w-3xl" : "md:col-span-1" // Spans 1 column in grid, or full width if centered
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
                  <Label htmlFor="topic">Blog Topic / Keywords <span className="text-destructive">*</span></Label>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent side="top"><p>Start typing to get AI-powered topic suggestions</p></TooltipContent></Tooltip>
                </div>
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <IntelligentTopicInput
                      value={topic}
                      onChange={setTopic}
                      placeholder="e.g., The Future of Renewable Energy"
                      className={cn(
                        isSparkingIdeas && "ring-4 ring-primary/70 ring-offset-2 ring-offset-background bg-primary/10 shadow-2xl shadow-primary/30"
                      )}
                    />
                  </div>
                  <Button 
                    onClick={handleSparkIdeas} 
                    disabled={isSparkingIdeas || !topic.trim()} 
                    variant="outline" 
                    className="flex-shrink-0"
                  >
                    {isSparkingIdeas ? (
                      <Icons.Spinner className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <Icons.Improve className="mr-2 h-4 w-4" />
                    )}
                    Spark Ideas
                  </Button>
                </div>
                {topicIdeas.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <Label className="text-xs text-muted-foreground">Topic Suggestions:</Label>
                        <div className="flex flex-wrap gap-2">
                            {topicIdeas.map((idea, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setTopic(idea); setTopicIdeas([]); }}
                                  className="text-xs py-1 px-2 rounded-full bg-muted/50 hover:bg-primary/10 hover:border-primary/50 border-border text-foreground"
                                >
                                    {idea}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone {selectedToneEmoji}</Label>
                  <Select value={tone} onValueChange={(value: BlogTone) => setTone(value)}>
                    <SelectTrigger id="tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
                    <SelectContent>{tones.map(t => <SelectItem key={t.value} value={t.value} className="capitalize">{t.emoji} {t.label}</SelectItem>)}</SelectContent>
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

              <div className="space-y-3">
                <Label>Style</Label>
                <div className="grid grid-cols-2 gap-3">
                    {styles.map(s => {
                        const IconElement = Icons[s.icon] || Icons.HelpCircle; // Fallback icon
                        return (
                            <Button
                                key={s.value}
                                variant={style === s.value ? "default" : "outline"}
                                onClick={() => setStyle(s.value)}
                                className="h-auto py-3 flex flex-col items-start text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <IconElement className="h-4 w-4" />
                                    <span className="font-semibold">{s.label}</span>
                                </div>
                                <p className={cn(
                                    "text-xs font-normal mt-1",
                                    style === s.value ? "text-primary-foreground/80" : "text-muted-foreground"
                                )}>
                                    {s.description}
                                </p>
                            </Button>
                        );
                    })}
                </div>
              </div>

              <Separator />
              <CardTitle className="text-lg pt-2">Audience Targeting</CardTitle>

              <div className="space-y-2">
                <Label htmlFor="persona">Target Persona</Label>
                <Select value={persona} onValueChange={(value: Persona) => setPersona(value)}>
                  <SelectTrigger id="persona"><SelectValue /></SelectTrigger>
                  <SelectContent>{personas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise Level: <span className="font-semibold text-primary">{currentExpertiseLevel}</span></Label>
                <Slider
                    id="expertise"
                    min={0} max={2} step={1}
                    value={expertiseLevelValue}
                    onValueChange={setExpertiseLevelValue}
                    className="my-3"
                />
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Intent</Label>
                <RadioGroup value={intent} onValueChange={(value: Intent) => setIntent(value)} className="flex flex-wrap gap-x-4 gap-y-2">
                    {intents.map(i => (
                        <div key={i} className="flex items-center space-x-2">
                            <RadioGroupItem value={i} id={`intent-${i}`} />
                            <Label htmlFor={`intent-${i}`} className="font-normal">{i}</Label>
                        </div>
                    ))}
                </RadioGroup>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="referenceText">Reference Material (Optional)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Icons.HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>Paste text or drag & drop a .txt file. This material is used for initial outline generation and can be summarized for key points.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                 <div 
                    className={cn(
                        'relative border-2 border-dashed rounded-lg transition-colors',
                        isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                        isProcessingFile && 'opacity-70 cursor-wait'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <Textarea
                        id="referenceText"
                        placeholder={
                            isProcessingFile 
                                ? 'Processing file...' 
                                : 'Paste text or drag & drop a .txt file here...'
                        }
                        value={referenceText}
                        onChange={(e) => {
                            setReferenceText(e.target.value);
                            // If user types manually, clear uploaded file and its summary
                            if (uploadedFileName) setUploadedFileName(null);
                            if (referenceSummaryPoints.length > 0) setReferenceSummaryPoints([]);
                        }}
                        rows={5}
                        className={cn(
                            'resize-none border-0 bg-transparent',
                            'focus-visible:ring-0 focus-visible:ring-offset-0',
                            isDragOver && 'opacity-70',
                            isProcessingFile && 'cursor-wait'
                        )}
                        disabled={isProcessingFile}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        {uploadedFileName && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-md">
                                <Icons.FileText className="h-3 w-3 text-muted-foreground" />
                                <span className="max-w-[120px] truncate">{uploadedFileName}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4 text-muted-foreground hover:text-destructive"
                                    onClick={handleRemoveFile}
                                    disabled={isProcessingFile}
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove file</span>
                                </Button>
                            </div>
                        )}
                        <Popover open={isAttachPopoverOpen} onOpenChange={setIsAttachPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:bg-muted"
                                    disabled={isProcessingFile}
                                >
                                    {isProcessingFile ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Icons.Paperclip className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Attach file</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="end">
                                <div className="flex flex-col gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="justify-start" 
                                        onClick={triggerFileInput}
                                        disabled={isProcessingFile}
                                    >
                                        <Upload className="mr-2 h-4 w-4" /> Upload File
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="justify-start" 
                                        onClick={() => toast({
                                            title: "Coming Soon", 
                                            description: "PDF/DOCX upload support is planned. For now, please paste content or upload a .txt file."
                                        })}
                                        disabled={isProcessingFile}
                                    >
                                        <Icons.FileText className="mr-2 h-4 w-4" /> More Formats
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileChange}
                  disabled={isProcessingFile}
                />
                {uploadedFileName && (
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md mt-2">
                    <div className="flex items-center gap-2">
                      <Icons.Check className="h-4 w-4 text-green-600" />
                      <p className="text-xs text-muted-foreground">File: {uploadedFileName}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-xs text-destructive hover:text-destructive/80 h-7 px-2">Remove</Button>
                  </div>
                )}
                {isSummarizingRefText && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Icons.Spinner className="animate-spin h-4 w-4" />
                        <span>Summarizing reference text...</span>
                    </div>
                )}
                {referenceSummaryPoints.length > 0 && !isSummarizingRefText && (
                    <div className="mt-3 space-y-2">
                        <Label className="text-xs text-muted-foreground">Key Points from Reference (click to append to reference text):</Label>
                        <div className="flex flex-wrap gap-2">
                            {referenceSummaryPoints.map((point, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setReferenceText(prev => prev.trim() ? `${prev}\n\n${point}` : point);
                                        toast({ title: "Point Appended", description: "Key point added to your reference material."});
                                    }}
                                    className="text-xs py-1 px-3 rounded-md bg-background hover:bg-muted/80 border-dashed border-primary/50 text-foreground"
                                >
                                    <Icons.Improve className="mr-1.5 h-3 w-3 text-primary/70" />
                                    {point}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
            </CardContent>
            {uiStep === 'defineDetails' && (
              <CardFooter>
                <Button onClick={handleGenerateOutline} disabled={isLoadingOutline || isLoadingPost || !topic} className="w-full">
                  {isLoadingOutline && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Outline & Proceed
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Card for Outline Editing - only visible in 'editOutline' step */}
          {uiStep === 'editOutline' && (
            <Card className="md:col-span-2 shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
              <CardHeader>
                 <div className="flex justify-between items-center">
                    <CardTitle>Blog Outline & Instructions</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackToDetails}
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
                    <Label className="font-medium text-base">Generated Outline:</Label>
                    <div className="space-y-2">
                        {generatedOutline.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md bg-background hover:shadow-sm">
                            <Input
                              value={item.value}
                              className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0" // Minimalist input inside section
                              onChange={(e) => handleOutlineItemChange(item.id, e.target.value)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOutlineSection(item.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 flex-shrink-0">
                              <Icons.Delete className="h-4 w-4" />
                              <span className="sr-only">Remove section</span>
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddOutlineSection} className="w-full mt-3">
                      <Icons.FilePlus className="mr-2 h-4 w-4" /> Add Section
                    </Button>
                    <div className="pt-4 space-y-2">
                      <div className="flex items-center gap-1">
                          <Label htmlFor="customInstructions">Specific Instructions for Blog Generation (Optional)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5">
                                <Icons.HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p>Guide the AI for full blog generation (e.g., "Focus on practical examples"). This guides AI when writing from the outline, supplementing initial references for this step.</p>
                            </TooltipContent>
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
    </div>
  );
}
