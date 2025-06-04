
"use client";

import { useState, type ChangeEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import type { BlogTone, BlogStyle, BlogLength, Persona, ExpertiseLevel, Intent } from '@/types';
import { blogStore } from '@/lib/blog-store';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateBlogOutlineAction, generateFullBlogAction, generateTopicIdeasAction } from '@/actions/ai';
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
    {value: "journalistic", label: "Journalistic", description: "Factual, news-like.", icon: "Edit"}, // Placeholder icon
    {value: "storytelling", label: "Storytelling", description: "Narrative-driven.", icon: "FileText"}, // Placeholder icon
    {value: "technical", label: "Technical", description: "Detailed, precise.", icon: "Settings"}, // Placeholder icon
    {value: "academic", label: "Academic", description: "Formal, research-oriented.", icon: "MyBlogs"}, // Placeholder icon
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
  
  const [persona, setPersona] = useState<Persona>('General Audience');
  const [expertiseLevelValue, setExpertiseLevelValue] = useState<number[]>([1]); // 0: Beginner, 1: Intermediate, 2: Advanced
  const [intent, setIntent] = useState<Intent>('Inform');
  const [topicIdeas, setTopicIdeas] = useState<string[]>([]);
  const [isSparkingIdeas, setIsSparkingIdeas] = useState(false);


  const [generatedOutline, setGeneratedOutline] = useState<OutlineItem[] | null>(null);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [uiStep, setUiStep] = useState<UiStep>('defineDetails');
  const fileInputRef = useRef<HTMLInputElement>(null); 


  const getExpertiseLevelFromSlider = (value: number): ExpertiseLevel => {
    if (value === 0) return "Beginner";
    if (value === 2) return "Advanced";
    return "Intermediate";
  };
  const currentExpertiseLevel = getExpertiseLevelFromSlider(expertiseLevelValue[0]);


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
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setReferenceText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    toast({ title: "File Removed", description: "Uploaded file and its reference text have been cleared." });
  };

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
          // Store new audience params if needed
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
    setGeneratedOutline(null);
    setCustomInstructions('');
    if (uploadedFileName) { 
      setUploadedFileName(null);
      setReferenceText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const pageTitle = uiStep === 'defineDetails' 
    ? "Create New Blog Post" 
    : "Create New Blog Post - Step 2: Refine Outline & Generate";
  
  const pageDescription = uiStep === 'defineDetails'
    ? "Define your blog's topic, tone, and style to get started."
    : "Customize the AI-generated outline and add specific instructions for the full blog post generation.";

  const selectedToneEmoji = tones.find(t => t.value === tone)?.emoji || '';

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
          
          <Card className={cn(
            "shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl",
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
                  <Label htmlFor="topic">Blog Topic / Keywords <span className="text-destructive">*</span></Label>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent side="top"><p>Main subject or keywords for your post.</p></TooltipContent></Tooltip>
                </div>
                <div className="flex gap-2">
                    <Input id="topic" placeholder="e.g., The Future of Renewable Energy" value={topic} onChange={(e) => setTopic(e.target.value)} className="flex-grow"/>
                    <Button onClick={handleSparkIdeas} disabled={isSparkingIdeas} variant="outline" className="flex-shrink-0">
                        {isSparkingIdeas ? <Icons.Spinner className="animate-spin mr-2" /> : <Icons.Improve className="mr-2"/>}
                        Spark Ideas
                    </Button>
                </div>
                {topicIdeas.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">Suggestions (click to use):</Label>
                        <div className="flex flex-wrap gap-2">
                            {topicIdeas.map((idea, idx) => (
                                <Button key={idx} variant="outline" size="sm" onClick={() => { setTopic(idea); setTopicIdeas([]); }} className="text-xs">
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
                    {styles.map(s => (
                        <Button 
                            key={s.value} 
                            variant={style === s.value ? "default" : "outline"} 
                            onClick={() => setStyle(s.value)}
                            className="h-auto py-3 flex flex-col items-start text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Icons.Logo className="h-4 w-4" /> {/* Replace with s.icon when available */}
                                <span className="font-semibold">{s.label}</span>
                            </div>
                            <p className={cn(
                                "text-xs font-normal mt-1",
                                style === s.value ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                                {s.description}
                            </p>
                        </Button>
                    ))}
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
              
              <Separator />

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="referenceText">Initial Reference Text / Notes (Optional)</Label>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent side="top" className="max-w-xs"><p>Used for initial outline generation. Paste text, notes, or key points. Replaced by .txt upload.</p></TooltipContent></Tooltip>
                </div>
                <Textarea id="referenceText" placeholder="Paste any reference material or key points here..." value={referenceText} onChange={(e) => setReferenceText(e.target.value)} rows={5} />
              </div>
              
              <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="reference-files">Upload Reference File (Optional .txt)</Label>
                    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent side="top" className="max-w-xs"><p>Upload a .txt file. Its content will replace text in 'Initial Reference Text'. PDF/DOCX copy/paste for now.</p></TooltipContent></Tooltip>
                  </div>
                  <Input 
                    id="reference-files" 
                    type="file" 
                    accept=".txt"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                  />
                  {uploadedFileName && (
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                            <Icons.Check className="h-4 w-4 text-green-600" />
                            <p className="text-xs text-muted-foreground">Uploaded: {uploadedFileName}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="text-xs text-destructive hover:text-destructive/80">Remove</Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    For PDF/DOCX, please paste content into 'Initial Reference Text' above.
                  </p>
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
                              className="flex-grow" 
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
                          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger><TooltipContent side="top" className="max-w-xs"><p>Guide the AI for full blog generation (e.g., "Focus on practical examples"). This guides AI when writing from the outline, supplementing initial references for this step.</p></TooltipContent></Tooltip>
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

