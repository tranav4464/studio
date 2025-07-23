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
import { BlogCreationForm } from '@/components/blog/BlogCreationForm';
import { OutlineEditor } from '@/components/blog/OutlineEditor';
import Link from "next/link";
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";

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

interface OutlineSection {
  id: string;
  title: string;
  description: string;
}

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Blog</h1>
        <p className="text-muted-foreground mt-2">
          Start your content creation journey with our AI-powered tools
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Start from Scratch
            </CardTitle>
            <CardDescription>
              Create a new blog post from the ground up with our AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/new-blog/create">
              <Button className="w-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Use Template
            </CardTitle>
            <CardDescription>
              Choose from our pre-designed templates to jumpstart your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/templates">
              <Button variant="outline" className="w-full">
                Browse Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Create
            </CardTitle>
            <CardDescription>
              Generate a complete blog post with a single prompt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/new-blog/quick-create">
              <Button variant="secondary" className="w-full">
                Quick Create
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
