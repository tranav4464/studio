
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { BlogPost, RepurposedContent, BlogStatus, ExportRecord, RepurposedContentFeedback, Settings } from '@/types';
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
import { 
  generateHeroImageAction, 
  repurposeContentAction, 
  generateBlogTitleSuggestionAction, 
  generateMetaTitleAction, 
  generateMetaDescriptionAction, 
  improveBlogContentAction, 
  simplifyBlogContentAction,
  expandBlogContentAction,
  depthBoostBlogContentAction,
  suggestVisualizationAction,
  analyzeBlogSeoAction, 
  type AnalyzeBlogSeoOutput,
  generateImagePromptHelperAction
} from '@/actions/ai';
import NextImage from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const imageThemes = ["General", "Dark", "Light", "Pastel", "Vibrant", "Monochrome"];
const postStatuses: BlogStatus[] = ["draft", "published", "archived"];
const SOCIAL_PREVIEW_CARD_ID = 'social-preview-card-for-snapshot';
type HtmlExportTemplate = 'basic-pre' | 'styled-article';

const htmlTemplateOptions: Array<{value: HtmlExportTemplate, label: string}> = [
  { value: 'basic-pre', label: 'Basic HTML (Code Block)' },
  { value: 'styled-article', label: 'Styled Article HTML' },
];

type RepurposedContentType = keyof RepurposedContentFeedback;

function basicMarkdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>'); 
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>'); 
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  html = html.replace(/^\s*---\s*$/gim, '<hr />');
  html = html.replace(/^\s*\*\*\*\s*$/gim, '<hr />');
  html = html.replace(/^\s*___\s*$/gim, '<hr />');
  html = html.split(/\n\s*\n/).map(paragraph => {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph === '') return '';
    if (/^<(h[1-6]|hr|pre|ul|ol|li|blockquote|div|table|thead|tbody|tr|td|th)/i.test(trimmedParagraph)) {
      return trimmedParagraph;
    }
    return `<p>${trimmedParagraph.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');
  return html;
}

const scoreDisplayMapping: Array<{
  label: string;
  key: keyof NonNullable<BlogPost['seoScore']>;
  tooltip: string;
}> = [
  { label: 'Readability', key: 'readability', tooltip: 'Flesch Reading Ease (0-100, higher is better).' },
  { label: 'Keyword Relevance', key: 'keywordDensity', tooltip: 'Keyword relevance & usage score (0-100).' },
  { label: 'Overall SEO Score', key: 'quality', tooltip: 'Overall SEO strength based on multiple factors (0-100).' },
];


export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const blogId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [editableTitle, setEditableTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentStatus, setCurrentStatus] = useState<BlogStatus>('draft');
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

  // States for Image Prompt Helper
  const [helperKeywords, setHelperKeywords] = useState('');
  const [helperArtisticStyle, setHelperArtisticStyle] = useState('photorealistic');
  const [helperMood, setHelperMood] = useState('epic');
  const [helperAdditionalDetails, setHelperAdditionalDetails] = useState('');
  const [suggestedHelperPrompt, setSuggestedHelperPrompt] = useState('');
  const [isGeneratingHelperPrompt, setIsGeneratingHelperPrompt] = useState(false);


  const [repurposeTone, setRepurposeTone] = useState('professional');
  const [repurposedContent, setRepurposedContent] = useState<RepurposedContent | null>(null);
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [currentRepurposedFeedback, setCurrentRepurposedFeedback] = useState<RepurposedContentFeedback>({});


  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [suggestedUrlSlug, setSuggestedUrlSlug] = useState<string | null>(null);

  const [isSuggestingBlogTitle, setIsSuggestingBlogTitle] = useState(false);
  const [isSuggestingMetaTitle, setIsSuggestingMetaTitle] = useState(false); 
  const [isSuggestingMetaDescription, setIsSuggestingMetaDescription] = useState(false); 
  const [isImprovingContent, setIsImprovingContent] = useState(false);
  const [isSimplifyingContent, setIsSimplifyingContent] = useState(false);
  const [isExpandingContent, setIsExpandingContent] = useState(false);
  const [isBoostingDepth, setIsBoostingDepth] = useState(false);
  const [isSuggestingVisualization, setIsSuggestingVisualization] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);
  const [htmlExportTemplate, setHtmlExportTemplate] = useState<HtmlExportTemplate>('basic-pre');

  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [seoAnalysisResult, setSeoAnalysisResult] = useState<AnalyzeBlogSeoOutput | null>(null);


  useEffect(() => {
    if (blogId) {
      const fetchedPost = blogStore.getPostById(blogId);
      if (fetchedPost) {
        setPost(fetchedPost);
        setEditableTitle(fetchedPost.title);
        setContent(fetchedPost.content);
        setCurrentStatus(fetchedPost.status); 
        setHeroImagePrompt(fetchedPost.heroImagePrompt || fetchedPost.title);
        setHeroImageTone(fetchedPost.tone || 'cinematic'); 
        setHeroImageTheme(fetchedPost.heroImageTheme || 'General');
        setSelectedHeroImageUrl(fetchedPost.heroImageUrl || null);
        setHeroImageCaption(fetchedPost.heroImageCaption || '');
        setHeroImageAltText(fetchedPost.heroImageAltText || '');
        setMetaTitle(fetchedPost.metaTitle || `Meta title for ${fetchedPost.title}`);
        setMetaDescription(fetchedPost.metaDescription || `Meta description for ${fetchedPost.title}`);
        setExportHistory(fetchedPost.exportHistory || []);
        setCurrentRepurposedFeedback(fetchedPost.repurposedContentFeedback || { tweetThread: null, linkedInPost: null, instagramPost: null, emailNewsletterSummary: null });
        setPrimaryKeyword(fetchedPost.topic); 

      } else {
        toast({ title: "Blog post not found", variant: "destructive" });
        router.push('/dashboard');
      }
      setIsLoading(false);
    }
  }, [blogId, router, toast]);
  
  const addExportRecord = (format: ExportRecord['format']) => {
    if (!post) return;
    const newRecord: ExportRecord = { format, timestamp: new Date().toISOString() };
    const updatedHistory = [...(post.exportHistory || []), newRecord];
    blogStore.updatePost(post.id, { exportHistory: updatedHistory }); 
    setPost(prev => prev ? { ...prev, exportHistory: updatedHistory } : null); 
    setExportHistory(updatedHistory); 
  };

  const handleSave = async () => {
    if (!post) return;
    setIsSaving(true);
    const currentPostData = blogStore.getPostById(post.id); 
    const updatedSeoScore = { 
      readability: post.seoScore?.readability ?? seoAnalysisResult?.readabilityScore ?? 0,
      keywordDensity: post.seoScore?.keywordDensity ?? seoAnalysisResult?.keywordRelevanceScore ?? 0,
      quality: post.seoScore?.quality ?? seoAnalysisResult?.overallSeoScore ?? 0,
    };

    blogStore.updatePost(post.id, {
      title: editableTitle,
      content,
      status: currentStatus, 
      heroImageUrl: selectedHeroImageUrl || undefined,
      heroImageCaption,
      heroImageAltText,
      heroImagePrompt: heroImagePrompt, 
      tone: heroImageTone, 
      heroImageTheme,
      metaTitle,
      metaDescription,
      seoScore: updatedSeoScore, 
      exportHistory: currentPostData?.exportHistory || exportHistory, 
      repurposedContentFeedback: currentRepurposedFeedback,
    });
    setPost(prev => prev ? ({
      ...prev,
      title: editableTitle,
      content,
      status: currentStatus, 
      heroImageUrl: selectedHeroImageUrl || undefined,
      heroImageCaption,
      heroImageAltText,
      heroImagePrompt: heroImagePrompt,
      tone: heroImageTone,
      heroImageTheme,
      metaTitle,
      metaDescription,
      seoScore: updatedSeoScore,
      exportHistory: currentPostData?.exportHistory || exportHistory,
      repurposedContentFeedback: currentRepurposedFeedback,
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
    
    const streamCallback = (data: any) => { 
        if (data.custom && data.custom.type === 'status') {
            setGenerationStatus(data.custom.message);
        }
    };
    
    streamCallback({custom: {type: 'status', message: 'Sending request to AI... (0/3)'}});
    
    try {
      const result = await generateHeroImageAction({ imagePrompt: heroImagePrompt, tone: heroImageTone, theme: heroImageTheme });
      setGeneratedHeroImageUrls(result.imageUrls);
      if (result.imageUrls && result.imageUrls.length > 0) {
        setSelectedHeroImageUrl(result.imageUrls[0]); 
        setHeroImageAltText(`AI generated hero image for: ${heroImagePrompt}, style: ${heroImageTone}, theme: ${heroImageTheme}`);
        setHeroImageCaption(`Hero image for "${editableTitle}" - ${heroImageTone} style, ${heroImageTheme} theme`);
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

  const handleGenerateHelperPrompt = async () => {
    if (!helperKeywords) {
      toast({ title: "Keywords required", description: "Please enter some keywords for the prompt helper.", variant: "destructive" });
      return;
    }
    setIsGeneratingHelperPrompt(true);
    setSuggestedHelperPrompt('');
    try {
      const result = await generateImagePromptHelperAction({
        keywords: helperKeywords,
        artisticStyle: helperArtisticStyle,
        mood: helperMood,
        additionalDetails: helperAdditionalDetails || undefined,
      });
      setSuggestedHelperPrompt(result.suggestedDetailedPrompt);
      toast({ title: "Prompt suggestion generated!", description: "Review and copy the suggestion below." });
    } catch (error: any) {
      toast({ title: "Error suggesting prompt", description: error.message, variant: "destructive" });
    }
    setIsGeneratingHelperPrompt(false);
  };

  const copyHelperPromptToClipboard = () => {
    if (suggestedHelperPrompt) {
      navigator.clipboard.writeText(suggestedHelperPrompt);
      toast({ title: "Copied to clipboard!", description: "Suggested prompt copied." });
    }
  };

  const handleExportImagePng = () => { 
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
        setRepurposedContent({ 
            tweetThread: ["Error generating tweets."],
            linkedInPost: "Error generating LinkedIn post.",
            instagramPost: "Error generating Instagram post.",
            emailNewsletterSummary: "Error generating email summary."
        });
    }
    setIsRepurposing(false);
  };
  
  const handleRepurposedFeedback = (type: RepurposedContentType, feedback: 'liked' | 'disliked') => {
    setCurrentRepurposedFeedback(prev => {
      const newFeedback = { ...prev };
      if (newFeedback[type] === feedback) { 
        newFeedback[type] = null;
      } else {
        newFeedback[type] = feedback;
      }
      return newFeedback;
    });
    const feedbackText = feedback === 'liked' ? 'Liked' : 'Disliked';
    const contentName = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); 
    toast({ title: "Feedback Submitted", description: `${feedbackText} ${contentName}` });
  };

  const handleTweetChange = (index: number, value: string) => {
    setRepurposedContent(prev => {
      if (!prev || !prev.tweetThread) return prev;
      const newTweetThread = [...prev.tweetThread];
      newTweetThread[index] = value;
      return { ...prev, tweetThread: newTweetThread };
    });
  };

  const copyToClipboard = (text: string | string[], type: string) => {
    let textToCopy: string;
    if (Array.isArray(text)) {
        textToCopy = text.join('\n\n---\n\n'); 
    } else {
        textToCopy = text;
    }

    if (navigator.clipboard && textToCopy) {
      navigator.clipboard.writeText(textToCopy);
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

  const handleStandaloneSuggestMetaTitle = async () => {
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

  const handleStandaloneSuggestMetaDescription = async () => {
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

  const handleAnalyzeSeo = async () => {
    if (!editableTitle || !content) {
      toast({ title: "Title and Content needed", description: "Blog title and content are needed for SEO analysis.", variant: "destructive"});
      return;
    }
    setIsAnalyzingSeo(true);
    setSeoAnalysisResult(null); // Clear previous results
    try {
      const result = await analyzeBlogSeoAction({ 
        blogTitle: editableTitle, 
        blogContent: content,
        primaryKeyword: primaryKeyword || undefined 
      });
      setSeoAnalysisResult(result);

      // Update post state directly with new scores from AI
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          seoScore: {
            readability: result.readabilityScore,
            keywordDensity: result.keywordRelevanceScore, 
            quality: result.overallSeoScore,
          }
        };
      });

      setMetaTitle(result.suggestedMetaTitle);
      setMetaDescription(result.suggestedMetaDescription);
      setSuggestedUrlSlug(result.suggestedUrlSlug);

      toast({ title: "SEO Analysis Complete!", description: "Review the suggestions and scores below."});
    } catch (error: any) {
      toast({ title: "Error Analyzing SEO", description: error.message, variant: "destructive" });
       // Reset scores on error to avoid showing stale data
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          seoScore: {
            readability: 0,
            keywordDensity: 0, 
            quality: 0,
          }
        };
      });
    }
    setIsAnalyzingSeo(false);
  };


  const handleImproveContent = async () => {
    if (!post || !content) {
      toast({ title: "Content is empty", description: "Please write some content before trying to improve it.", variant: "destructive"});
      return;
    }
    setIsImprovingContent(true);
    try {
      const result = await improveBlogContentAction({
        blogContent: content,
        topic: post.topic,
        tone: post.tone,
        style: post.style,
      });
      setContent(result.improvedContent);
      toast({ title: "Content Improved!", description: "The AI has enhanced your blog post."});
    } catch (error: any) {
      toast({ title: "Error Improving Content", description: error.message, variant: "destructive" });
    }
    setIsImprovingContent(false);
  };

  const handleSimplifyContent = async () => {
    if (!post || !content) {
      toast({ title: "Content is empty", description: "Please write some content before trying to simplify it.", variant: "destructive"});
      return;
    }
    setIsSimplifyingContent(true);
    try {
      const result = await simplifyBlogContentAction({
        blogContent: content,
        topic: post.topic,
        originalTone: post.tone,
        originalStyle: post.style,
      });
      setContent(result.simplifiedContent);
      toast({ title: "Content Simplified!", description: "The AI has simplified your blog post."});
    } catch (error: any) {
      toast({ title: "Error Simplifying Content", description: error.message, variant: "destructive" });
    }
    setIsSimplifyingContent(false);
  };

  const handleExpandContent = async () => {
    if (!post || !content) {
      toast({ title: "Content is empty", description: "Please write some content before trying to expand it.", variant: "destructive"});
      return;
    }
    setIsExpandingContent(true);
    try {
      const result = await expandBlogContentAction({
        blogContent: content,
        topic: post.topic,
        tone: post.tone,
        style: post.style,
      });
      setContent(result.expandedContent);
      toast({ title: "Content Expanded!", description: "The AI has expanded your blog post."});
    } catch (error: any) {
      toast({ title: "Error Expanding Content", description: error.message, variant: "destructive" });
    }
    setIsExpandingContent(false);
  };

  const handleDepthBoostContent = async () => {
    if (!post || !content) {
      toast({ title: "Content is empty", description: "Please write some content before trying to boost its depth.", variant: "destructive"});
      return;
    }
    setIsBoostingDepth(true);
    try {
      const result = await depthBoostBlogContentAction({
        blogContent: content,
        topic: post.topic,
        tone: post.tone,
        style: post.style,
      });
      setContent(result.boostedContent);
      toast({ title: "Content Depth Boosted!", description: "The AI has added more depth to your blog post."});
    } catch (error: any) {
      toast({ title: "Error Boosting Depth", description: error.message, variant: "destructive" });
    }
    setIsBoostingDepth(false);
  };
  
  const handleSuggestVisualization = async () => {
    if (!post || !content) {
      toast({ title: "Content is empty", description: "Please write some content for visualization suggestions.", variant: "destructive"});
      return;
    }
    setIsSuggestingVisualization(true);
    try {
      const result = await suggestVisualizationAction({
        blogContent: content,
        topic: post.topic,
      });
      if (result.suggestedVisualDescription) {
        const placeholderText = `\n\n<!-- AI Suggested Visual for '${result.sectionToVisualize}': ${result.suggestedVisualDescription} -->\n\n`;
        if (result.insertionMarkerText && content.includes(result.insertionMarkerText)) {
          const parts = content.split(result.insertionMarkerText);
          setContent(parts[0] + result.insertionMarkerText + placeholderText + parts.slice(1).join(result.insertionMarkerText));
          toast({ title: "Visualization Suggestion Added!", description: `A placeholder comment for "${result.suggestedVisualDescription}" has been added to your content.` });
        } else {
          setContent(content + placeholderText); 
          toast({ title: "Visualization Suggestion Appended!", description: `Could not find exact insertion point. "${result.suggestedVisualDescription}" placeholder added at the end.` });
        }
      } else {
        toast({ title: "No Visualization Suggested", description: "The AI did not have a specific visual suggestion for this content at the moment." });
      }
    } catch (error: any) {
      toast({ title: "Error Suggesting Visualization", description: error.message, variant: "destructive" });
    }
    setIsSuggestingVisualization(false);
  };


  const handleExportMarkdown = () => {
    if (!post || !content) {
      toast({ title: "No content to export", description: "Please write some content before exporting.", variant: "destructive" });
      return;
    }
    try {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      const filename = editableTitle.replace(/\s+/g, '-').toLowerCase() || 'blog-post';
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: "Markdown Exported!", description: `${filename}.md has been downloaded.` });
      addExportRecord('markdown');
    } catch (error) {
      console.error("Error exporting Markdown:", error);
      toast({ title: "Export Failed", description: "Could not export as Markdown.", variant: "destructive" });
    }
  };

  const handleExportHtml = () => {
    if (!post || !content) {
      toast({ title: "No content to export", description: "Please write some content before exporting.", variant: "destructive" });
      return;
    }
    try {
      let htmlOutput = '';
      const blogTitle = editableTitle || 'Blog Post';
      const blogMarkdown = content;

      const savedSettingsString = localStorage.getItem('contentCraftAISettings');
      let customCss = '';
      if (savedSettingsString) {
        const savedSettings: Partial<Settings> = JSON.parse(savedSettingsString);
        customCss = savedSettings.customExportCss || '';
      }

      const defaultStyledCss = `
    body { font-family: Inter, sans-serif; line-height: 1.6; padding: 20px; margin: 0 auto; max-width: 800px; background-color: #f9f9f9; color: #333; }
    h1, h2, h3, h4, h5, h6 { color: #1a1a1a; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; font-size: 2em;}
    h2 { font-size: 1.75em; }
    h3 { font-size: 1.5em; }
    p { margin-bottom: 1em; }
    pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f0f0f0; padding: 15px; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto; }
    code { font-family: 'JetBrains Mono', monospace; background-color: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
    pre code { background-color: transparent; padding: 0; } 
    img { max-width: 100%; height: auto; border-radius: 5px; margin: 10px 0; }
    hr { border: 0; height: 1px; background: #ddd; margin: 2em 0; }
    strong { font-weight: bold; }
    em { font-style: italic; }
      `;

      if (htmlExportTemplate === 'basic-pre') {
        htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogTitle}</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; padding: 20px; margin: 0 auto; max-width: 800px; }
    h1 { color: #333; }
    pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f4f4f4; padding: 15px; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto;}
    img { max-width: 100%; height: auto; } 
  </style>
</head>
<body>
  <h1>${blogTitle}</h1>
  <hr>
  <pre>${blogMarkdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
      } else if (htmlExportTemplate === 'styled-article') {
        const formattedHtml = basicMarkdownToHtml(blogMarkdown);
        const finalCss = customCss.trim() !== '' ? customCss : defaultStyledCss;
        htmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogTitle}</title>
  <style>
    ${finalCss}
  </style>
</head>
<body>
  <h1>${blogTitle}</h1>
  <hr>
  <div>${formattedHtml}</div>
</body>
</html>`;
      }

      const blob = new Blob([htmlOutput], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      const filename = (editableTitle.replace(/\s+/g, '-').toLowerCase() || 'blog-post') + `-${htmlExportTemplate}.html`;
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: "HTML Exported!", description: `${filename} has been downloaded.` });
      addExportRecord('html');
    } catch (error) {
      console.error("Error exporting HTML:", error);
      toast({ title: "Export Failed", description: "Could not export as HTML.", variant: "destructive" });
    }
  };
  
  const handleExportPlainText = () => {
    if (!post || !content) {
      toast({ title: "No content to export", description: "Please write some content before exporting.", variant: "destructive" });
      return;
    }
    try {
      const plainTextContent = `${editableTitle}\n\n${content}`;
      const blob = new Blob([plainTextContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      const filename = (editableTitle.replace(/\s+/g, '-').toLowerCase() || 'blog-post') + '.txt';
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({ title: "Text Exported!", description: `${filename}.txt has been downloaded.` });
      addExportRecord('txt');
    } catch (error) {
      console.error("Error exporting Plain Text:", error);
      toast({ title: "Export Failed", description: "Could not export as Plain Text.", variant: "destructive" });
    }
  };


  const handleExportImageSnapshot = async () => {
    const snapshotTarget = document.getElementById(SOCIAL_PREVIEW_CARD_ID);
    if (!snapshotTarget) {
      toast({ title: "Snapshot Error", description: "Could not find the preview card element to snapshot.", variant: "destructive" });
      return;
    }
    setIsTakingSnapshot(true);
    toast({ title: "Generating Snapshot...", description: "Please wait a moment." });

    try {
      const canvas = await html2canvas(snapshotTarget, {
        allowTaint: true,
        useCORS: true, 
        logging: false, 
         onclone: (document) => {
            const clonedTarget = document.getElementById(SOCIAL_PREVIEW_CARD_ID);
            if (clonedTarget) {
            }
        }
      });
      const image = canvas.toDataURL('image/png', 0.9); 
      const link = document.createElement('a');
      const filename = (editableTitle || 'social-preview').replace(/\s+/g, '-').toLowerCase();
      link.download = `${filename}-snapshot.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Snapshot Exported!", description: `${filename}-snapshot.png has been downloaded.` });
      addExportRecord('image');
    } catch (error) {
      console.error("Error generating image snapshot:", error);
      toast({ title: "Snapshot Failed", description: "Could not generate the image snapshot. See console for details.", variant: "destructive" });
    } finally {
      setIsTakingSnapshot(false);
    }
  };

  const anyContentLoading = isImprovingContent || isSimplifyingContent || isExpandingContent || isBoostingDepth || isSuggestingVisualization;


  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Icons.Spinner className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!post) {
    return <div className="text-center py-10">Blog post not found.</div>;
  }
  
  const repurposedContentFields: Array<{key: RepurposedContentType, label: string, icon: React.ReactNode, contentKey: keyof Omit<RepurposedContent, 'tweetThread'> | 'tweetThreadArray'}> = [
    { key: 'tweetThread', label: 'Tweet Thread', icon: <Icons.Tweet className="mr-1 h-4 w-4"/>, contentKey: 'tweetThreadArray' }, 
    { key: 'linkedInPost', label: 'LinkedIn Post', icon: <Icons.LinkedIn className="mr-1 h-4 w-4"/>, contentKey: 'linkedInPost' },
    { key: 'instagramPost', label: 'Instagram Post', icon: <Icons.Instagram className="mr-1 h-4 w-4"/>, contentKey: 'instagramPost' },
    { key: 'emailNewsletterSummary', label: 'Email Summary', icon: <Icons.Email className="mr-1 h-4 w-4"/>, contentKey: 'emailNewsletterSummary' },
  ];

  return (
    <TooltipProvider>
    <div className="container mx-auto">
      <PageHeader
        title={`Edit: ${editableTitle || 'Untitled Post'}`}
        description={`Topic: ${post.topic} | Tone: ${post.tone} | Style: ${post.style} | Length: ${post.length}`}
        actions={
          <div className="flex gap-2 items-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <Icons.ChevronLeft className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Save className="mr-2 h-4 w-4" />}
              Save Post
            </Button>
            {isSaving ? (
                <span className="text-xs text-muted-foreground ml-2">Saving...</span>
            ) : (
                <span className="text-xs text-muted-foreground ml-2">(Auto-Save Enabled - Mock)</span>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader>
              <CardTitle>Blog Post Details</CardTitle>
              <CardDescription>Edit the core details and status of your blog post.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="editableTitle">Blog Title</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="editableTitle" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} placeholder="Your Awesome Blog Title" className="flex-grow"/>
                    <Button variant="outline" size="sm" onClick={handleSuggestBlogTitle} disabled={isSuggestingBlogTitle}>
                      {isSuggestingBlogTitle ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                      Suggest
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postStatus">Status</Label>
                  <Select value={currentStatus} onValueChange={(value: BlogStatus) => setCurrentStatus(value)}>
                    <SelectTrigger id="postStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {postStatuses.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button variant="outline" size="sm" onClick={handleImproveContent} disabled={anyContentLoading || !content}>
                  {isImprovingContent ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                  Improve
                </Button>
                <Button variant="outline" size="sm" onClick={handleSimplifyContent} disabled={anyContentLoading || !content}>
                  {isSimplifyingContent ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Simplify className="mr-2 h-4 w-4" />}
                  Simplify
                </Button>
                <Button variant="outline" size="sm" onClick={handleExpandContent} disabled={anyContentLoading || !content}>
                  {isExpandingContent ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Expand className="mr-2 h-4 w-4" />}
                  Expand
                </Button>
                <Button variant="outline" size="sm" onClick={handleDepthBoostContent} disabled={anyContentLoading || !content}>
                  {isBoostingDepth ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                  Depth Boost
                </Button>
                <Button variant="outline" size="sm" onClick={handleSuggestVisualization} disabled={anyContentLoading || !content}>
                  {isSuggestingVisualization ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Image className="mr-2 h-4 w-4" />}
                  Visualize
                </Button>
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
                <Tabs defaultValue="tweetThread" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    {repurposedContentFields.map(field => (
                       <TabsTrigger key={field.key} value={field.key}>{field.icon}{field.label.split(' ')[0]}</TabsTrigger>
                    ))}
                  </TabsList>
                  {repurposedContentFields.map(field => (
                    <TabsContent key={field.key} value={field.key} className="mt-4">
                      {field.contentKey === 'tweetThreadArray' ? (
                        <div className="space-y-3">
                          {(repurposedContent.tweetThread || []).map((tweet, index) => (
                            <div key={index} className="space-y-1">
                              <Label htmlFor={`tweet-${index}`} className="text-xs text-muted-foreground">Tweet {index + 1} of {(repurposedContent.tweetThread || []).length}</Label>
                              <Textarea
                                id={`tweet-${index}`}
                                value={tweet}
                                onChange={(e) => handleTweetChange(index, e.target.value)}
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Textarea 
                            value={repurposedContent[field.contentKey as keyof Omit<RepurposedContent, 'tweetThread'>] || ''}
                            onChange={(e) => setRepurposedContent(prev => prev ? {...prev, [field.contentKey]: e.target.value} : null)}
                            rows={8}
                            className="text-sm" />
                      )}
                      <div className="mt-2 flex items-center justify-between">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                              field.contentKey === 'tweetThreadArray' ? (repurposedContent.tweetThread || []) : (repurposedContent[field.contentKey as keyof Omit<RepurposedContent, 'tweetThread'>] || ''),
                              field.label
                          )}>
                            <Icons.Copy className="mr-2 h-3 w-3"/>Copy
                          </Button>
                          <div className="flex gap-1">
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={cn("h-8 w-8 hover:bg-green-100 dark:hover:bg-green-800/50", currentRepurposedFeedback[field.key] === 'liked' && "bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400")}
                                  onClick={() => handleRepurposedFeedback(field.key, 'liked')}
                              >
                                  <Icons.ThumbsUp className={cn("h-4 w-4", currentRepurposedFeedback[field.key] === 'liked' ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}/>
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className={cn("h-8 w-8 hover:bg-red-100 dark:hover:bg-red-800/50", currentRepurposedFeedback[field.key] === 'disliked' && "bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400")}
                                  onClick={() => handleRepurposedFeedback(field.key, 'disliked')}
                              >
                                  <Icons.ThumbsDown className={cn("h-4 w-4", currentRepurposedFeedback[field.key] === 'disliked' ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}/>
                              </Button>
                          </div>
                      </div>
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
              <Accordion type="single" collapsible className="w-full" defaultValue="prompt-helper">
                <AccordionItem value="prompt-helper">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Icons.Improve className="h-4 w-4 text-primary" />
                      Need help writing a prompt?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="helperKeywords">Keywords/Subjects</Label>
                      <Input id="helperKeywords" value={helperKeywords} onChange={(e) => setHelperKeywords(e.target.value)} placeholder="e.g., dragon, mountain, forest" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="helperArtisticStyle">Artistic Style</Label>
                      <Input id="helperArtisticStyle" value={helperArtisticStyle} onChange={(e) => setHelperArtisticStyle(e.target.value)} placeholder="e.g., photorealistic, watercolor, pixel art" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="helperMood">Mood/Atmosphere</Label>
                      <Input id="helperMood" value={helperMood} onChange={(e) => setHelperMood(e.target.value)} placeholder="e.g., epic, serene, mysterious" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="helperAdditionalDetails">Additional Details (Optional)</Label>
                      <Textarea id="helperAdditionalDetails" value={helperAdditionalDetails} onChange={(e) => setHelperAdditionalDetails(e.target.value)} placeholder="e.g., cinematic lighting, wide angle" rows={2}/>
                    </div>
                    <Button onClick={handleGenerateHelperPrompt} disabled={isGeneratingHelperPrompt} className="w-full">
                      {isGeneratingHelperPrompt ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                      Suggest Prompt
                    </Button>
                    {suggestedHelperPrompt && (
                      <div className="mt-3 space-y-2">
                        <Label>Suggested Prompt:</Label>
                        <Textarea value={suggestedHelperPrompt} readOnly rows={3} className="bg-muted"/>
                        <Button variant="outline" size="sm" onClick={copyHelperPromptToClipboard} className="w-full"><Icons.Copy className="mr-2 h-3 w-3"/>Copy Suggestion</Button>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator />

              <div className="space-y-1 pt-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="heroPrompt">Image Prompt (User Initiated)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger>
                    <TooltipContent><p>Describe the image you want. You can use the helper above or write your own.</p></TooltipContent>
                  </Tooltip>
                </div>
                <Input id="heroPrompt" value={heroImagePrompt} onChange={(e) => setHeroImagePrompt(e.target.value)} placeholder="e.g., Futuristic cityscape" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="heroTone">Image Tone/Style</Label>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger>
                        <TooltipContent><p>Artistic style, e.g., cinematic, vibrant, minimalist.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Input id="heroTone" value={heroImageTone} onChange={(e) => setHeroImageTone(e.target.value)} placeholder="e.g., cinematic, vibrant" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="heroTheme">Image Theme</Label>
                     <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-4 w-4 text-muted-foreground" /></Button></TooltipTrigger>
                        <TooltipContent><p>Overall visual theme like Dark, Light, Pastel.</p></TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={heroImageTheme} onValueChange={(value: string) => setHeroImageTheme(value)}>
                    <SelectTrigger id="heroTheme"><SelectValue placeholder="Select theme" /></SelectTrigger>
                    <SelectContent>{imageThemes.map(theme => <SelectItem key={theme} value={theme}>{theme}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerateHeroImage} disabled={isGeneratingHeroImage} className="w-full">
                {isGeneratingHeroImage ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Image className="mr-2 h-4 w-4" />}Generate Images
              </Button>
              {isGeneratingHeroImage && <div className="text-center p-4"><Icons.Spinner className="h-6 w-6 animate-spin text-primary" /> <p className="text-sm text-muted-foreground">{generationStatus || "Working on images..."}</p></div>}

              {generatedHeroImageUrls && generatedHeroImageUrls.length > 0 && !isGeneratingHeroImage && (
                <div className="mt-4 space-y-2">
                  <Label>Generated Variants (click to select)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {generatedHeroImageUrls.map((url, index) => (
                      <div key={index}
                           className={`relative aspect-video w-full overflow-hidden rounded-md border cursor-pointer transition-all ${selectedHeroImageUrl === url ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}`}
                           onClick={() => setSelectedHeroImageUrl(url)}>
                        <NextImage src={url} alt={`Variant ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="variant choice"/>
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
                    <Button variant="outline" size="sm" onClick={handleExportImagePng}>Export PNG</Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "Export SVG", description:"SVG export coming soon! Vector generation is complex."})}>Export SVG</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>SEO Metadata & Analysis</CardTitle><CardDescription>Optimize your post for search engines.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="metaTitleInput">Meta Title</Label>
                 <div className="flex gap-2 items-center">
                    <Input id="metaTitleInput" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="e.g., Your Catchy Blog Post Title | SiteName" className="flex-grow"/>
                    <Button variant="outline" size="sm" onClick={handleStandaloneSuggestMetaTitle} disabled={isSuggestingMetaTitle || isAnalyzingSeo}>
                        {isSuggestingMetaTitle ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                 </div>
                <p className="text-xs text-muted-foreground">Recommended: 50-60 characters. Current: {metaTitle.length}</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="metaDescriptionInput">Meta Description</Label>
                <div className="flex gap-2 items-start"> 
                    <Textarea id="metaDescriptionInput" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="A brief summary of your post to attract readers from search results." rows={3} className="flex-grow"/>
                    <Button variant="outline" size="sm" onClick={handleStandaloneSuggestMetaDescription} disabled={isSuggestingMetaDescription || isAnalyzingSeo} className="mt-[1px]"> 
                        {isSuggestingMetaDescription ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Improve className="mr-2 h-4 w-4" />}
                        Suggest
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended: 150-160 characters. Current: {metaDescription.length}</p>
              </div>
              {suggestedUrlSlug && (
                <div className="space-y-1">
                  <Label htmlFor="suggestedUrlSlug">Suggested URL Slug</Label>
                  <Input id="suggestedUrlSlug" value={suggestedUrlSlug} readOnly className="bg-muted"/>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="primaryKeyword">Target Primary Keyword (Optional)</Label>
                <Input 
                  id="primaryKeyword" 
                  value={primaryKeyword} 
                  onChange={(e) => setPrimaryKeyword(e.target.value)} 
                  placeholder="e.g., AI content creation"
                />
              </div>
              <Button onClick={handleAnalyzeSeo} disabled={isAnalyzingSeo || !editableTitle || !content} className="w-full">
                {isAnalyzingSeo ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Analytics className="mr-2 h-4 w-4" />}
                Analyze SEO & Get Suggestions
              </Button>

            </CardContent>
          </Card>
          
          <Card id={SOCIAL_PREVIEW_CARD_ID} className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl bg-card text-card-foreground p-0">
            <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-xl">Social Media Preview (Mock)</CardTitle><CardDescription className="text-xs">A glimpse of your post's appearance.</CardDescription></CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              {selectedHeroImageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md border mb-3">
                  <NextImage src={selectedHeroImageUrl} alt={heroImageAltText || "Preview hero image"} layout="fill" objectFit="cover" data-ai-hint="preview social"/>
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-md mb-3">
                  <Icons.PlaceholderImage className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Title Preview</Label>
                <p className="font-semibold text-sm truncate text-card-foreground">{editableTitle || "Your Blog Title"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description Preview</Label>
                <p className="text-xs text-muted-foreground line-clamp-2">{metaDescription || "Your compelling meta description will appear here, attracting readers."}</p>
              </div>
            </CardContent>
          </Card>


          <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>Optimization Panel</CardTitle><CardDescription>AI-driven SEO scores and content analysis.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="seoScores" className="w-full">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="seoScores">SEO Scores & Feedback</TabsTrigger><TabsTrigger value="gapAnalysis">Gap Analysis</TabsTrigger></TabsList>
                <TabsContent value="seoScores" className="mt-4 space-y-3">
                  {scoreDisplayMapping.map(scoreItem => {
                    const scoreValue = post?.seoScore?.[scoreItem.key] ?? 0;
                    return (
                      <div key={scoreItem.key}>
                        <div className="flex justify-between mb-1 items-center">
                          <div className="flex items-center gap-1">
                              <Label className="text-sm">{scoreItem.label}</Label>
                              <Tooltip>
                                  <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-5 w-5"><Icons.HelpCircle className="h-3 w-3 text-muted-foreground" /></Button></TooltipTrigger>
                                  <TooltipContent side="top"><p className="text-xs">{scoreItem.tooltip}</p></TooltipContent>
                              </Tooltip>
                          </div>
                          <span className="text-sm font-medium">
                            {scoreValue}%
                          </span>
                        </div>
                        <Progress value={scoreValue} aria-label={`${scoreItem.label} score`} />
                      </div>
                    );
                  })}
                  <Separator />
                  
                  {isAnalyzingSeo && (
                    <div className="text-center p-4">
                      <Icons.Spinner className="h-6 w-6 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Analyzing SEO, please wait...</p>
                    </div>
                  )}

                  {seoAnalysisResult && !isAnalyzingSeo && (
                    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Actionable Recommendations</AccordionTrigger>
                        <AccordionContent>
                          {seoAnalysisResult.actionableRecommendations.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {seoAnalysisResult.actionableRecommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                            </ul>
                          ) : <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Readability & Structure Feedback</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-sm">
                          <p><strong>Readability:</strong> {seoAnalysisResult.readabilityFeedback}</p>
                          <p><strong>Structure:</strong> {seoAnalysisResult.contentStructureFeedback}</p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Keyword Analysis Details</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-sm">
                          {seoAnalysisResult.primaryKeywordAnalysis.providedKeyword && <p><strong>Target Keyword:</strong> {seoAnalysisResult.primaryKeywordAnalysis.providedKeyword}</p>}
                          {seoAnalysisResult.primaryKeywordAnalysis.suggestedKeywords && seoAnalysisResult.primaryKeywordAnalysis.suggestedKeywords.length > 0 && (
                            <p><strong>Suggested Primary Keywords:</strong> {seoAnalysisResult.primaryKeywordAnalysis.suggestedKeywords.join(', ')}</p>
                          )}
                          {seoAnalysisResult.primaryKeywordAnalysis.densityFeedback && <p><strong>Density:</strong> {seoAnalysisResult.primaryKeywordAnalysis.densityFeedback}</p>}
                           {seoAnalysisResult.primaryKeywordAnalysis.placementFeedback && <p><strong>Placement:</strong> {seoAnalysisResult.primaryKeywordAnalysis.placementFeedback}</p>}
                          {seoAnalysisResult.secondaryKeywordSuggestions.length > 0 && (
                             <p><strong>Secondary Keyword Suggestions:</strong> {seoAnalysisResult.secondaryKeywordSuggestions.join(', ')}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </TabsContent>
                <TabsContent value="gapAnalysis" className="mt-4">
                  <Alert>
                    <Icons.SEO className="h-4 w-4" />
                    <AlertTitle>Gap Analysis - Coming Soon!</AlertTitle>
                    <AlertDescription>
                      This feature will help you compare your content against top-ranking articles to find opportunities.
                      Stay tuned for updates!
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
             <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" onClick={handleExportMarkdown}>Export as Markdown</Button>
                
                <div className="flex w-full gap-2 items-center">
                    <Select value={htmlExportTemplate} onValueChange={(value: HtmlExportTemplate) => setHtmlExportTemplate(value)} >
                        <SelectTrigger className="flex-grow h-10"> 
                            <SelectValue placeholder="HTML Template" />
                        </SelectTrigger>
                        <SelectContent>
                            {htmlTemplateOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportHtml} className="flex-shrink-0 h-10">Export HTML</Button>
                </div>
                <Button variant="outline" className="w-full" onClick={handleExportPlainText}>Export as Plain Text (.txt)</Button>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Export PDF", description:"Coming soon!"})}>Export as PDF</Button>
                <Button variant="outline" className="w-full" onClick={handleExportImageSnapshot} disabled={isTakingSnapshot}>
                  {isTakingSnapshot ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Image className="mr-2 h-4 w-4" />}
                  Export as Image (Snapshot)
                </Button>
                <Separator className="my-2" />
                <div className="w-full space-y-2">
                  <Label className="text-xs text-muted-foreground">Export History:</Label>
                  {exportHistory.length > 0 ? (
                    <ul className="text-xs text-muted-foreground list-disc list-inside max-h-20 overflow-y-auto">
                      {exportHistory.slice(-5).reverse().map((record, index) => (
                        <li key={index}>{format(parseISO(record.timestamp), "MMM d, HH:mm")} - {record.format.toUpperCase()}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No exports yet.</p>
                  )}
                </div>
                <Separator className="my-2" />
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Copy All Content", description:"Feature to copy all kit elements coming soon!"})}>Copy All Kit Content</Button>
                <Button variant="outline" className="w-full" onClick={() => toast({ title: "Download as ZIP", description:"Feature to download kit as ZIP coming soon!"})}>Download Kit as ZIP</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}

    

    