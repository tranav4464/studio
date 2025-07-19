"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, RefreshCw, GripVertical, ArrowRight, History } from "lucide-react";
import Link from "next/link";

interface OutlineItem {
  title: string;
  content: string;
  description: string;
  tag?: string;
  length?: 'short' | 'medium' | 'long';
}

const sampleOutline: OutlineItem[] = [
  {
    title: 'Introduction',
    content: 'Introduction content...',
    description: 'An opening section that introduces the topic and provides context for the reader.',
    tag: 'intro',
    length: 'short'
  },
  {
    title: 'Main Content',
    content: 'Main content goes here...',
    description: 'The core section containing detailed information, analysis, and supporting points about the topic.',
    tag: 'main',
    length: 'long'
  },
  {
    title: 'Conclusion',
    content: 'Conclusion content...',
    description: 'A summary of key points and final thoughts that tie everything together.',
    tag: 'conclusion',
    length: 'short'
  }
];

export default function OutlineGeneratorPage() {
  // State
  const [outline, setOutline] = useState<OutlineItem[]>(sampleOutline);
  const [versions, setVersions] = useState<OutlineItem[][]>([sampleOutline]);
  const [currentVersion, setCurrentVersion] = useState<number>(0);
  const [userEdited, setUserEdited] = useState<boolean>(false);
  const [promptOverwrite, setPromptOverwrite] = useState<boolean>(false);
  const [tempEnhanced, setTempEnhanced] = useState<OutlineItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSection, setLoadingSection] = useState<number | null>(null);
  const [loadingEnhance, setLoadingEnhance] = useState<boolean>(false);
  const [loadingGenerate, setLoadingGenerate] = useState<boolean>(false);

  // Handler functions
  const generateDescription = useCallback((title: string): string => {
    // This is a simple implementation - in a real app, you might want to call an AI API here
    const descriptions: Record<string, string> = {
      'introduction': 'An opening section that introduces the topic and provides context for the reader.',
      'main content': 'The core section containing detailed information, analysis, and supporting points about the topic.',
      'conclusion': 'A summary of key points and final thoughts that tie everything together.',
      'methodology': 'A description of the research methods, tools, and approaches used in the content.',
      'results': 'Presentation and analysis of the findings or outcomes discussed in the content.',
      'discussion': 'An analysis and interpretation of the results in the context of the broader topic.',
      'background': 'Contextual information and history relevant to the main topic.',
      'case study': 'A detailed examination of a specific instance or example related to the topic.',
      'faq': 'Answers to frequently asked questions about the topic.',
      'summary': 'A brief overview of the main points covered in the content.'
    };

    const lowerTitle = title.toLowerCase();
    return descriptions[lowerTitle] || `This section will cover ${title.toLowerCase()}.`;
  }, []);

  const handleEditSection = useCallback((index: number, field: keyof OutlineItem, value: string) => {
    setOutline(prevOutline => {
      const updatedOutline = [...prevOutline];
      const updatedSection = { ...updatedOutline[index], [field]: value };
      
      // If title is being updated, generate a new description
      if (field === 'title') {
        updatedSection.description = generateDescription(value);
      }
      
      updatedOutline[index] = updatedSection;
      return updatedOutline;
    });
    setUserEdited(true);
  }, [generateDescription]);

  const handleRegenerateSection = useCallback(async (index: number) => {
    setLoadingSection(index);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutline(prevOutline => {
        const updatedOutline = [...prevOutline];
        updatedOutline[index] = {
          ...updatedOutline[index],
          content: `Regenerated content for ${updatedOutline[index].title}...`
        };
        return updatedOutline;
      });
      setUserEdited(true);
    } catch (error) {
      console.error('Error regenerating section:', error);
    } finally {
      setLoadingSection(null);
    }
  }, []);

  const handleDeleteSection = useCallback((index: number) => {
    setOutline(prevOutline => prevOutline.filter((_, i) => i !== index));
    setUserEdited(true);
  }, []);

  const handleAddSection = useCallback(() => {
    setOutline(prevOutline => [
      ...prevOutline,
      { 
        title: 'New Section', 
        content: 'Content goes here...',
        description: 'This is a new section. Update the title to generate a relevant description.'
      }
    ]);
    setUserEdited(true);
  }, []);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(outline);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOutline(items);
    setUserEdited(true);
  }, [outline]);

  const handleGenerateOutline = useCallback(async () => {
    setLoadingGenerate(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Add descriptions to the sample outline
      const outlineWithDescriptions = sampleOutline.map(section => ({
        ...section,
        description: generateDescription(section.title)
      }));
      setOutline(outlineWithDescriptions);
      setUserEdited(false);
    } catch (error) {
      console.error('Error generating outline:', error);
    } finally {
      setLoadingGenerate(false);
    }
  }, [generateDescription]);

  const handleEnhanceOutline = useCallback(async () => {
    setLoadingEnhance(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTempEnhanced(sampleOutline.map(section => ({
        ...section,
        content: `Enhanced ${section.content}`,
        description: section.description
      })));
      setPromptOverwrite(true);
    } catch (error) {
      console.error('Error enhancing outline:', error);
    } finally {
      setLoadingEnhance(false);
    }
  }, []);
  
  const handleSaveAsNew = useCallback(() => {
    setVersions((vs: OutlineItem[][]) => [outline, ...vs]);
    setCurrentVersion(0);
    setPromptOverwrite(false);
    setUserEdited(false);
  }, [outline]);

  const handleOverwrite = useCallback(() => {
    setOutline(tempEnhanced);
    setTempEnhanced([]);
    setPromptOverwrite(false);
    setUserEdited(true);
  }, [tempEnhanced]);

  const handleSwitchVersion = useCallback((idx: number) => {
    setOutline(versions[idx]);
    setCurrentVersion(idx);
    setUserEdited(false);
  }, [versions]);

  const exportOutline = useCallback((format: 'txt' | 'md' | 'json') => {
    if (typeof window === 'undefined') return;
    
    try {
      let content = '';
      
      if (format === 'json') {
        content = JSON.stringify(outline, null, 2);
      } else {
        outline.forEach((section: OutlineItem) => {
          if (format === 'md') {
            content += `## ${section.title}\n\n${section.description}\n\n${section.content}\n\n`;
          } else {
            content += `${section.title}\n${'='.repeat(section.title.length)}\n${section.description}\n\n${section.content}\n\n`;
          }
        });
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outline.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [outline]);

  // Effects
  useEffect(() => {
    const s: string[] = [];
    if (outline.length < 4) s.push("• Add more supporting sections");
    if (outline.some((sec: OutlineItem) => !sec.content.trim())) s.push("• Fill in all section contents");
    if (outline.length > 0 && !outline.some((sec: OutlineItem) => sec.title.toLowerCase().includes('conclusion'))) {
      s.push("• Add a conclusion section");
    }
    setSuggestions(s);
  }, [outline]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="outline">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {outline.map((section, index) => (
                    <Draggable key={index} draggableId={`section-${index}`} index={index}>
                      {(provided) => (
                        <Card className="mb-4" ref={provided.innerRef} {...provided.draggableProps}>
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input
                                value={section.title}
                                onChange={(e) => handleEditSection(index, 'title', e.target.value)}
                                className="font-semibold"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRegenerateSection(index)}
                                disabled={loadingSection === index}
                              >
                                <RefreshCw className={`h-4 w-4 ${loadingSection === index ? 'animate-spin' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSection(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                              </div>
                              <Textarea
                                value={section.content}
                                onChange={(e) => handleEditSection(index, 'content', e.target.value)}
                                className="min-h-[100px]"
                                placeholder="Enter the content for this section..."
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button variant="outline" className="w-full" aria-label="Add Section" onClick={handleAddSection} disabled={loadingEnhance}>
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>

          {/* Export & Version History */}
          <div className="flex flex-wrap gap-2 mt-4 justify-end items-center">
            <div className="flex items-center gap-1 bg-accent/50 rounded-md px-2 py-1">
              <span className="text-sm text-muted-foreground">Export:</span>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1"
                onClick={() => exportOutline('txt')}
                title="Export as plain text"
              >
                <span>📄</span>
                <span className="text-xs">TXT</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1"
                onClick={() => exportOutline('md')}
                title="Export as Markdown"
              >
                <span>📝</span>
                <span className="text-xs">MD</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="gap-1"
                onClick={() => exportOutline('json')}
                title="Export as JSON data"
              >
                <span>🔢</span>
                <span className="text-xs">JSON</span>
              </Button>
            </div>
            {versions.length > 1 && (
              <div className="flex items-center gap-2 bg-accent/50 rounded-md px-3 py-1">
                <History className="h-4 w-4 text-muted-foreground" />
                <select
                  className="bg-transparent text-sm outline-none cursor-pointer"
                  value={currentVersion}
                  onChange={(e) => handleSwitchVersion(Number(e.target.value))}
                  aria-label="Select outline version"
                >
                  {versions.map((_, idx) => (
                    <option key={idx} value={idx}>
                      {idx === 0 ? 'Current' : `Version ${versions.length - idx}`} {idx === 0 ? '(Latest)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {outline.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No outline sections yet. Start by generating one!</p>
              <Button onClick={handleGenerateOutline} disabled={loadingGenerate}>
                {loadingGenerate ? 'Generating...' : 'Generate Outline'}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {promptOverwrite && (
                <div className="mt-4 p-4 bg-blue-50 rounded text-blue-900 border border-blue-200">
                  <b>AI generated a new outline.</b> Overwrite current or save as new version?
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleOverwrite}>Overwrite</Button>
                    <Button size="sm" onClick={handleSaveAsNew}>Save as New Version</Button>
                    <Button size="sm" variant="outline" onClick={() => setPromptOverwrite(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Outline Quality Rating</Label>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      ★
                    </Button>
                  ))}
                </div>
                <Textarea placeholder="Optional feedback for AI (improves future suggestions)" className="mt-2" />
              </div>

              <div>
                <Label>Suggested Improvements</Label>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <Button variant="outline" className="w-full" onClick={handleEnhanceOutline} disabled={loadingEnhance}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingEnhance ? 'animate-spin' : ''}`} />
                {loadingEnhance ? 'Enhancing...' : 'Enhance Outline'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}