"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, X, UploadCloud, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const tones = [
  "Professional",
  "Conversational",
  "Technical",
  "Educational",
  "Entertaining",
  "Persuasive",
];

const lengths = [
  { value: "short", label: "Short (500-1000 words)" },
  { value: "medium", label: "Medium (1000-2000 words)" },
  { value: "long", label: "Long (2000+ words)" },
];

const blogGoals = [
  "Inform",
  "Educate",
  "Entertain",
  "Persuade",
  "Promote a product"
];

const readingLevels = [
  { value: "beginner", label: "Beginner (Simple language, basic concepts)" },
  { value: "intermediate", label: "Intermediate (Some technical terms, balanced)" },
  { value: "expert", label: "Expert (Technical, in-depth analysis)" }
];

const writingStyles = [
  "Storytelling",
  "Listicle",
  "Analytical",
  "Journalistic",
  "Conversational"
];

const CreateBlogPage = () => {
  // State for all fields
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [audiences, setAudiences] = useState<string[]>([]);
  const [length, setLength] = useState("");
  const [description, setDescription] = useState("");
  const [showAudienceWarning, setShowAudienceWarning] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // New fields
  const [topicTags, setTopicTags] = useState<string[]>([]);
  const [topicTagInput, setTopicTagInput] = useState("");
  const [blogGoal, setBlogGoal] = useState("");
  const [cta, setCta] = useState("");
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [referenceUrlInput, setReferenceUrlInput] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [primaryMention, setPrimaryMention] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [authorVoice, setAuthorVoice] = useState("");

  // Refs
  const audienceInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Helper functions for tag management
  const addTag = (tag: string, tags: string[], setTags: React.Dispatch<React.SetStateAction<string[]>>, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (tag.trim()) {
      if (!tags.includes(tag.trim())) {
        setTags([...tags, tag.trim()]);
      }
      setInput("");
      return true;
    }
    return false;
  };

  const removeTag = (tag: string, tags: string[], setTags: React.Dispatch<React.SetStateAction<string[]>>) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Add audience tag
  const handleAddAudience = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && audienceInput.trim()) {
      e.preventDefault();
      if (!audiences.includes(audienceInput.trim())) {
        setAudiences([...audiences, audienceInput.trim()]);
      }
      setAudienceInput("");
      setShowAudienceWarning(false);
    }
  };

  // Remove audience tag
  const handleRemoveAudience = (audienceToRemove: string) => {
    setAudiences(audiences.filter((a) => a !== audienceToRemove));
  };

  // Add topic tag
  const handleAddTopicTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && topicTagInput.trim()) {
      e.preventDefault();
      if (!topicTags.includes(topicTagInput.trim())) {
        setTopicTags([...topicTags, topicTagInput.trim()]);
      }
      setTopicTagInput("");
    }
  };

  // Remove topic tag
  const handleRemoveTopicTag = (tagToRemove: string) => {
    setTopicTags(topicTags.filter((tag) => tag !== tagToRemove));
  };

  // Add reference URL
  const handleAddReferenceUrl = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && referenceUrlInput.trim()) {
      e.preventDefault();
      try {
        new URL(referenceUrlInput); // Validate URL
        if (!referenceUrls.includes(referenceUrlInput.trim())) {
          setReferenceUrls([...referenceUrls, referenceUrlInput.trim()]);
          setReferenceUrlInput("");
        }
      } catch (err) {
        // Invalid URL
      }
    }
  };

  // Remove reference URL
  const handleRemoveReferenceUrl = (urlToRemove: string) => {
    setReferenceUrls(referenceUrls.filter((url) => url !== urlToRemove));
  };

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert(`File ${file.name} exceeds the 10MB limit`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds the 10MB limit`);
          return false;
        }
        return true;
      });
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    // TODO: Connect to your backend API
    const formData = {
      title,
      tone,
      audiences,
      length,
      description: description || null,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    };
    
    console.log('Form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to outline generator on success
      // router.push('/new-blog/outline');
    }, 1500);
  };

  // Validation
  const isFormValid = title.trim() && tone && audiences.length > 0 && length;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-1">Create New Blog</h1>
        <p className="text-muted-foreground">
          Fill in the details below to start creating your blog post
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Main Form */}
        <div className="flex-1 min-w-[320px] space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Blog Topic */}
                <div className="space-y-2">
                  <Label htmlFor="title">Blog Topic <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="What is your blog post about?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about the main topic or question your blog will address
                  </p>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label>Target Audience <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
                    {audiences.map((audience) => (
                      <span
                        key={audience}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {audience}
                        <button
                          type="button"
                          onClick={() => handleRemoveAudience(audience)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      ref={audienceInputRef}
                      value={audienceInput}
                      onChange={(e) => setAudienceInput(e.target.value)}
                      onKeyDown={handleAddAudience}
                      placeholder="Add target audience (e.g., Marketers, Developers, Parents)..."
                      className="flex-1 min-w-[100px] bg-transparent border-none focus:ring-0 focus:outline-none text-sm"
                    />
                  </div>
                  {showAudienceWarning && (
                    <p className="text-sm text-destructive">Please add at least one target audience</p>
                  )}
                </div>

                {/* Blog Length */}
                <div className="space-y-2">
                  <Label>Blog Length <span className="text-destructive">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    {lengths.map((len) => (
                      <button
                        key={len.value}
                        type="button"
                        onClick={() => setLength(len.value)}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${
                          length === len.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'hover:border-primary/50'
                        }`}
                      >
                        <span className="font-medium">{len.label.split(' ')[0]}</span>
                        <span className="text-xs text-muted-foreground">
                          {len.label.split('(')[1].replace(')', '')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Writing Tone */}
                <div className="space-y-2">
                  <Label>Writing Tone <span className="text-destructive">*</span></Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.toLowerCase()} value={t.toLowerCase()}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The overall voice and style of your content
                  </p>
                </div>

                {/* Advanced Options Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm font-medium text-primary flex items-center gap-1"
                  >
                    {showAdvanced ? (
                      <>
                        <span>Hide advanced options</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Show advanced options</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-6 border-t pt-6">
                    {/* Blog Goal */}
                    <div className="space-y-2">
                      <Label>Blog Goal</Label>
                      <Select value={blogGoal} onValueChange={setBlogGoal}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a goal..." />
                        </SelectTrigger>
                        <SelectContent>
                          {blogGoals.map((goal) => (
                            <SelectItem key={goal.toLowerCase()} value={goal.toLowerCase()}>
                              {goal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        What's the main purpose of this blog post?
                      </p>
                    </div>

                    {/* Reading Level */}
                    <div className="space-y-2">
                      <Label>Reading Level</Label>
                      <Select value={readingLevel} onValueChange={setReadingLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reading level..." />
                        </SelectTrigger>
                        <SelectContent>
                          {readingLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Writing Style */}
                    <div className="space-y-2">
                      <Label>Writing Style</Label>
                      <Select value={writingStyle} onValueChange={setWritingStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a writing style..." />
                        </SelectTrigger>
                        <SelectContent>
                          {writingStyles.map((style) => (
                            <SelectItem key={style.toLowerCase()} value={style.toLowerCase()}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Topic Tags */}
                    <div className="space-y-2">
                      <Label>Topic Tags</Label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
                        {topicTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/50 text-secondary-foreground"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTopicTag(tag)}
                              className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-secondary"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          value={topicTagInput}
                          onChange={(e) => setTopicTagInput(e.target.value)}
                          onKeyDown={handleAddTopicTag}
                          placeholder="Add tags (e.g., AI, Marketing, Technology)..."
                          className="flex-1 min-w-[100px] bg-transparent border-none focus:ring-0 focus:outline-none text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add keywords or topics to focus your content
                      </p>
                    </div>

                    {/* Author Voice / Persona */}
                    <div className="space-y-2">
                      <Label>Author Voice / Persona</Label>
                      <Textarea
                        placeholder="Describe the author's voice, tone, or persona for this post..."
                        value={authorVoice}
                        onChange={(e) => setAuthorVoice(e.target.value)}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe the writing style or perspective
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide any additional context, key points, or specific requirements for your blog post..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include any specific instructions, outline, or structure you'd like to follow
                  </p>
                </div>

                {/* Reference Materials */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Reference Materials (Optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="mr-2 h-3.5 w-3.5" />
                      Upload Files
                    </Button>
                  </div>
                  
                  {/* Drag and Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer hover:border-primary/50 ${
                      isDragging ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Drag and drop files here</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOCX, or TXT (max 10MB each)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Blog Post'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="md:sticky md:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Blog Post Preview</CardTitle>
                <CardDescription>Preview how your blog post will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-bold">{title || 'Your Blog Topic'}</h2>
                  
                  {description ? (
                    <p className="text-muted-foreground">{description}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {audiences.length > 0
                        ? `Targeting: ${audiences.join(', ')}`
                        : 'Add target audience to see preview'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tone ? `Tone: ${tone}` : 'Add a tone to see preview'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {length ? `Length: ${length}` : 'Select a length to see preview'}
                    </p>
                    {showAdvanced && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        {blogGoal && <p className="text-xs text-muted-foreground">Goal: {blogGoal}</p>}
                        {readingLevel && <p className="text-xs text-muted-foreground mt-1">Reading Level: {readingLevel}</p>}
                        {writingStyle && <p className="text-xs text-muted-foreground mt-1">Style: {writingStyle}</p>}
                        {topicTags.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Tags: {topicTags.join(', ')}
                          </p>
                        )}
                        {primaryMention && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Product: {primaryMention}
                          </p>
                        )}
                        {cta && <p className="text-xs text-muted-foreground mt-1">CTA: {cta}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;