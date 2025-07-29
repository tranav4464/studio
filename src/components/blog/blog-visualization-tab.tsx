'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  Monitor, 
  Smartphone, 
  Code, 
  FileText, 
  Download, 
  Copy, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  FileDown,
  Palette,
  Type,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogVisualizationTabProps {
  title?: string;
  content?: string;
  heroImage?: {
    url: string;
    caption?: string;
    altText?: string;
  };
  author?: {
    name: string;
    bio?: string;
    avatar?: string;
  };
  publishDate?: Date;
  tags?: string[];
  className?: string;
}

type ViewMode = 'desktop' | 'mobile' | 'html' | 'markdown';
type ZoomLevel = 'small' | 'medium' | 'large';

export function BlogVisualizationTab({
  title = "Your Blog Preview",
  content = `# Welcome to Your Blog Preview

This is where your formatted blog post will appear. The content will be rendered exactly as it will look when published.

## Key Features

- **Live Preview**: See your content as readers will
- **Multiple View Modes**: Desktop, Mobile, HTML, and Markdown
- **Export Options**: PDF, HTML, Markdown formats
- **Customizable Display**: Toggle sections on/off

## Sample Content

Your blog content will be displayed here with proper formatting, styling, and layout. This preview shows exactly how your readers will see your published blog post.

### Subsection Example

This demonstrates how your headings and content structure will appear in the final output.

> This is a blockquote example that shows how quoted content will be displayed with premium styling.

**Bold text** and *italic text* formatting is preserved and styled appropriately with the teal and yellow theme.`,
  heroImage,
  author = { name: "Author Name" },
  publishDate = new Date(),
  tags = ["Blog", "Content", "Writing"],
  className
}: BlogVisualizationTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('medium');
  const [darkMode, setDarkMode] = useState(false);
  const [showSections, setShowSections] = useState({
    title: true,
    heroImage: true,
    authorByline: true,
    dateAndTags: true,
    summary: true,
    content: true,
    cta: true
  });
  
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'm':
            e.preventDefault();
            setViewMode('markdown');
            break;
          case 'h':
            e.preventDefault();
            setViewMode('html');
            break;
          case 'e':
            e.preventDefault();
            handleExport('pdf');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = async (format: 'pdf' | 'html' | 'markdown') => {
    try {
      toast({
        title: "Export Started",
        description: `Generating ${format.toUpperCase()} file...`,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${publishDate.toISOString().split('T')[0]}.${format}`;

      toast({
        title: "Export Complete",
        description: `Your blog has been exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your blog. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = viewMode === 'html' ? generateHTML() : generateMarkdown();
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to Clipboard",
        description: `${viewMode.toUpperCase()} content copied successfully.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.7; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            color: #1f2937;
            background: #ffffff;
        }
        h1 { 
            color: #0d9488; 
            border-bottom: 3px solid #fbbf24; 
            padding-bottom: 16px; 
            margin-bottom: 32px;
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
        }
        h2 { 
            color: #0d9488; 
            margin-top: 3rem; 
            margin-bottom: 1.5rem;
            font-size: 1.875rem;
            font-weight: 600;
        }
        h3 { 
            color: #059669; 
            margin-top: 2.5rem; 
            margin-bottom: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
        }
        p {
            margin-bottom: 1.5rem;
            font-size: 1.125rem;
            line-height: 1.75;
            color: #374151;
        }
        blockquote { 
            border-left: 4px solid #0d9488; 
            margin: 2rem 0; 
            padding: 1.5rem; 
            font-style: italic;
            background: rgba(13, 148, 136, 0.05);
            border-radius: 0 8px 8px 0;
            color: #4b5563;
        }
        code { 
            background: #f3f4f6; 
            padding: 4px 8px; 
            border-radius: 6px; 
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.875rem;
            color: #1f2937;
        }
        .hero-image { 
            width: 100%; 
            height: 400px; 
            object-fit: cover; 
            border-radius: 12px; 
            margin: 32px 0; 
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .meta { 
            color: #6b7280; 
            font-size: 0.875rem; 
            margin: 20px 0; 
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .tags { 
            display: flex; 
            gap: 8px; 
            margin: 24px 0; 
            flex-wrap: wrap;
        }
        .tag { 
            background: linear-gradient(135deg, #0d9488, #059669); 
            color: white; 
            padding: 6px 14px; 
            border-radius: 20px; 
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.025em;
        }
        .author-bio {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid #fbbf24;
        }
        ul, ol {
            padding-left: 1.5rem;
            margin-bottom: 1.5rem;
        }
        li {
            margin-bottom: 0.5rem;
            font-size: 1.125rem;
            line-height: 1.75;
            color: #374151;
        }
        strong {
            color: #0d9488;
            font-weight: 600;
        }
        em {
            color: #059669;
        }
    </style>
</head>
<body>
    ${showSections.title ? `<h1>${title}</h1>` : ''}
    ${showSections.heroImage && heroImage ? `
        <img src="${heroImage.url}" alt="${heroImage.altText || title}" class="hero-image" />
        ${heroImage.caption ? `<p style="text-align: center; font-style: italic; color: #6b7280; margin-top: -16px; font-size: 0.875rem;">${heroImage.caption}</p>` : ''}
    ` : ''}
    ${showSections.authorByline || showSections.dateAndTags ? `
        <div class="meta">
            ${showSections.authorByline ? `<span><strong>By:</strong> ${author.name}</span>` : ''}
            ${showSections.dateAndTags ? `<span><strong>Published:</strong> ${publishDate.toLocaleDateString()}</span>` : ''}
        </div>
    ` : ''}
    ${showSections.dateAndTags && tags.length > 0 ? `
        <div class="tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    ` : ''}
    ${author.bio && showSections.authorByline ? `
        <div class="author-bio">
            <strong style="color: #0d9488;">About the Author:</strong> ${author.bio}
        </div>
    ` : ''}
    ${showSections.content ? content.split('\n').map(line => {
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
      if (line.startsWith('> ')) return `<blockquote>${line.substring(2)}</blockquote>`;
      if (line.trim() === '') return '<br>';
      return `<p>${line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')}</p>`;
    }).join('\n') : ''}
</body>
</html>`;
  };

  const generateMarkdown = () => {
    let markdown = '';
    if (showSections.title) markdown += `# ${title}\n\n`;
    if (showSections.heroImage && heroImage) {
      markdown += `![${heroImage.altText || title}](${heroImage.url})\n`;
      if (heroImage.caption) markdown += `*${heroImage.caption}*\n\n`;
    }
    if (showSections.authorByline) markdown += `**Author:** ${author.name}\n`;
    if (author.bio && showSections.authorByline) markdown += `**Bio:** ${author.bio}\n`;
    if (showSections.dateAndTags) markdown += `**Date:** ${publishDate.toLocaleDateString()}\n`;
    if (showSections.dateAndTags && tags.length > 0) markdown += `**Tags:** ${tags.join(', ')}\n\n`;
    if (showSections.content) markdown += content;
    return markdown;
  };

  const getZoomClass = () => {
    switch (zoomLevel) {
      case 'small': return 'text-sm scale-90';
      case 'large': return 'text-lg scale-110';
      default: return 'text-base scale-100';
    }
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile': return 'max-w-sm mx-auto';
      case 'desktop': return 'max-w-5xl mx-auto';
      default: return 'max-w-full';
    }
  };

  const renderPreviewContent = () => {
    if (viewMode === 'html') {
      return (
        <div className="h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700">
            HTML Source Code
          </div>
          <ScrollArea className="h-full">
            <pre className="p-6 text-sm font-mono leading-relaxed">
              <code className="text-gray-800">{generateHTML()}</code>
            </pre>
          </ScrollArea>
        </div>
      );
    }

    if (viewMode === 'markdown') {
      return (
        <div className="h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700">
            Markdown Source
          </div>
          <ScrollArea className="h-full">
            <pre className="p-6 text-sm font-mono leading-relaxed">
              <code className="text-gray-800">{generateMarkdown()}</code>
            </pre>
          </ScrollArea>
        </div>
      );
    }

    return (
      <div className={cn(
        "transition-all duration-300 origin-top",
        getZoomClass(),
        getViewportClass()
      )}>
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {showSections.title && (
            <header className="px-8 pt-8 pb-6 border-b border-gray-100">
              <h1 className="text-4xl font-bold text-teal-700 leading-tight mb-4">
                {title}
              </h1>
              {(showSections.authorByline || showSections.dateAndTags) && (
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  {showSections.authorByline && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-teal-600">By</span>
                      <span className="font-medium">{author.name}</span>
                    </div>
                  )}
                  {showSections.dateAndTags && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-teal-600">Published</span>
                      <span>{publishDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {showSections.dateAndTags && tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-700 rounded-full text-xs font-medium border border-teal-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </header>
          )}
          
          <div className="px-8 py-6">
            {showSections.heroImage && heroImage && (
              <div className="mb-8">
                <img 
                  src={heroImage.url} 
                  alt={heroImage.altText || title}
                  className="w-full h-80 object-cover rounded-xl shadow-lg border border-gray-200"
                />
                {heroImage.caption && (
                  <p className="text-sm text-gray-500 mt-3 text-center italic font-medium">
                    {heroImage.caption}
                  </p>
                )}
              </div>
            )}

            {author.bio && showSections.authorByline && (
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                <h4 className="text-lg font-semibold text-teal-700 mb-2">About the Author</h4>
                <p className="text-gray-700 leading-relaxed">{author.bio}</p>
              </div>
            )}

            {showSections.content && (
              <div className="prose prose-lg max-w-none">
                <div 
                  className="rich-content"
                  dangerouslySetInnerHTML={{ 
                    __html: content
                      .split('\n')
                      .map(line => {
                        // Headings
                        if (line.startsWith('# ')) return `<h1 class="text-3xl font-bold text-teal-700 mt-12 mb-6 leading-tight">${line.substring(2)}</h1>`;
                        if (line.startsWith('## ')) return `<h2 class="text-2xl font-semibold text-teal-600 mt-10 mb-4 leading-tight">${line.substring(3)}</h2>`;
                        if (line.startsWith('### ')) return `<h3 class="text-xl font-medium text-teal-600 mt-8 mb-3 leading-tight">${line.substring(4)}</h3>`;
                        
                        // Blockquotes
                        if (line.startsWith('> ')) return `<blockquote class="border-l-4 border-teal-500 pl-6 italic my-6 text-gray-600 bg-teal-50 py-4 rounded-r-lg">${line.substring(2)}</blockquote>`;
                        
                        // Code blocks (basic support)
                        if (line.startsWith('```')) {
                          const lang = line.substring(3).trim();
                          return `<div class="bg-gray-900 rounded-lg p-4 my-4"><div class="text-gray-300 text-xs mb-2">${lang || 'code'}</div><pre class="text-gray-100 font-mono text-sm overflow-x-auto">`;
                        }
                        if (line === '```') return `</pre></div>`;
                        
                        // Horizontal rules
                        if (line.trim() === '---' || line.trim() === '***') {
                          return `<hr class="my-8 border-t-2 border-gray-200" />`;
                        }
                        
                        // Empty lines
                        if (line.trim() === '') return '<br>';
                        
                        // Lists - Enhanced support for different types
                        if (line.startsWith('- ') || line.startsWith('* ')) {
                          return `<li class="mb-2 leading-relaxed text-gray-700 text-lg list-disc ml-6">${line.substring(2)
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-700">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="italic text-emerald-600">$1</em>')
                            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')}</li>`;
                        }
                        
                        // Numbered lists
                        if (/^\d+\.\s/.test(line)) {
                          const match = line.match(/^\d+\.\s(.*)$/);
                          if (match) {
                            return `<li class="mb-2 leading-relaxed text-gray-700 text-lg list-decimal ml-6">${match[1]
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-700">$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em class="italic text-emerald-600">$1</em>')
                              .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')}</li>`;
                          }
                        }
                        
                        // Regular paragraphs with rich formatting
                        return `<p class="mb-6 leading-relaxed text-gray-700 text-lg">${line
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-700">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="italic text-emerald-600">$1</em>')
                          .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal-600 hover:text-teal-800 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')}</p>`;
                      })
                      .join('')
                  }}
                />
                
                {/* Support for images and videos from rich editor */}
                <style jsx>{`
                  .rich-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    margin: 24px auto;
                    display: block;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  }
                  
                  .rich-content video {
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    margin: 24px auto;
                    display: block;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  }
                  
                  .rich-content iframe {
                    max-width: 100%;
                    border-radius: 12px;
                    margin: 24px auto;
                    display: block;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  }
                  
                  .rich-content ul {
                    list-style: none;
                    padding-left: 0;
                  }
                  
                  .rich-content ol {
                    list-style: none;
                    padding-left: 0;
                  }
                  
                  .rich-content li.list-disc::before {
                    content: "•";
                    color: #0d9488;
                    font-weight: bold;
                    display: inline-block;
                    width: 1em;
                    margin-left: -1em;
                  }
                  
                  .rich-content li.list-decimal {
                    counter-increment: list-counter;
                  }
                  
                  .rich-content li.list-decimal::before {
                    content: counter(list-counter) ".";
                    color: #0d9488;
                    font-weight: bold;
                    display: inline-block;
                    width: 1.5em;
                    margin-left: -1.5em;
                  }
                  
                  .rich-content ol {
                    counter-reset: list-counter;
                  }
                `}</style>
              </div>
            )}

            {showSections.cta && (
              <div className="mt-12 p-8 bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 rounded-xl border border-teal-200 text-center">
                <h3 className="text-2xl font-bold text-teal-700 mb-4">Ready to get started?</h3>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                  Take the next step and explore more content like this. Join thousands of readers who trust our insights.
                </p>
                <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg rounded-lg">
                  Learn More
                </Button>
              </div>
            )}
          </div>
        </article>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex flex-col">
      {/* Header Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left: View Mode Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-gray-300" />
            
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'mobile', 'html', 'markdown'] as ViewMode[]).map((mode) => {
                const Icon = mode === 'desktop' ? Monitor : mode === 'mobile' ? Smartphone : mode === 'html' ? Code : FileText;
                return (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "gap-2 px-3 py-1.5 rounded-md font-medium transition-all duration-200 text-sm capitalize border-2",
                      viewMode === mode 
                        ? "bg-teal-600 text-white shadow-lg border-teal-600" 
                        : "hover:bg-white text-gray-600 hover:text-gray-800 border-transparent hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {mode}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Right: Export Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('pdf')}
              className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors"
            >
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('html')}
              className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              HTML
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('markdown')}
              className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors"
            >
              <Download className="h-4 w-4" />
              MD
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {/* Section Controls */}
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-3 text-gray-800">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Eye className="h-4 w-4 text-teal-700" />
                      </div>
                      Show/Hide Sections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(showSections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Label htmlFor={key} className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Switch
                          id={key}
                          checked={value}
                          onCheckedChange={(checked) => 
                            setShowSections(prev => ({ ...prev, [key]: checked }))
                          }
                          className="data-[state=checked]:bg-teal-600 data-[state=unchecked]:bg-yellow-500 border-2 border-yellow-600 data-[state=checked]:border-teal-600 scale-110 [&>span]:bg-gray-800"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Display Settings */}
                <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-3 text-gray-800">
                      <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg shadow-sm">
                        <Palette className="h-4 w-4 text-yellow-700" />
                      </div>
                      Display Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Type className="h-3 w-3" />
                        Zoom Level
                      </Label>
                      <Select value={zoomLevel} onValueChange={(value: ZoomLevel) => setZoomLevel(value)}>
                        <SelectTrigger className="border-gray-200 bg-white shadow-sm hover:border-teal-300 transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (90%)</SelectItem>
                          <SelectItem value="medium">Medium (100%)</SelectItem>
                          <SelectItem value="large">Large (110%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Actions */}
                <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-3 text-gray-800">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg shadow-sm">
                        <Zap className="h-4 w-4 text-blue-700" />
                      </div>
                      Export & Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-3 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all duration-200 shadow-sm" 
                      onClick={() => handleExport('pdf')}
                    >
                      <FileDown className="h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-3 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm" 
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Content
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-3 border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-300 transition-all duration-200 shadow-sm"
                      onClick={() => handleExport('html')}
                    >
                      <Code className="h-4 w-4" />
                      Export HTML
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </aside>
        )}

        {/* Preview Area */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8">
              {content ? renderPreviewContent() : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center space-y-4 max-w-md">
                    <div className="w-24 h-24 mx-auto bg-teal-100 rounded-full flex items-center justify-center">
                      <FileText className="h-12 w-12 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Your blog preview will appear here</h3>
                      <p className="text-gray-600">Once content is ready, you'll see a live preview exactly as readers will experience your published blog post.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Floating Export Toolbar */}
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="shadow-xl border-gray-200 bg-white/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                onClick={() => handleExport('pdf')} 
                className="gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
              >
                <FileDown className="h-4 w-4" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('html')} 
                className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <Code className="h-4 w-4" />
                HTML
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('markdown')} 
                className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <FileText className="h-4 w-4" />
                Markdown
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}