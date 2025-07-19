'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  FileText,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosticMetrics {
  wordCount: number;
  readingTime: number;
  seoScore: number;
  issues: {
    type: 'warning' | 'error' | 'success';
    message: string;
  }[];
}

interface RealTimeDiagnosticsProps {
  content: string;
}

export function RealTimeDiagnostics({ content }: RealTimeDiagnosticsProps) {
  const [metrics, setMetrics] = useState<DiagnosticMetrics>({
    wordCount: 0,
    readingTime: 0,
    seoScore: 0,
    issues: [],
  });

  useEffect(() => {
    const calculateMetrics = () => {
      // Word count
      const words = content.trim().split(/\s+/).length;
      
      // Reading time (assuming 200 words per minute)
      const readingTime = Math.ceil(words / 200);
      
      // SEO score (simplified example)
      const seoScore = calculateSEOScore(content);
      
      // Issues
      const issues = analyzeContent(content);

      setMetrics({
        wordCount: words,
        readingTime,
        seoScore,
        issues,
      });
    };

    calculateMetrics();
  }, [content]);

  const calculateSEOScore = (text: string): number => {
    let score = 0;
    
    // Check for headings
    if (text.includes('# ')) score += 20;
    if (text.includes('## ')) score += 10;
    
    // Check for paragraphs
    const paragraphs = text.split('\n\n').length;
    score += Math.min(paragraphs * 5, 20);
    
    // Check for links
    const links = (text.match(/\[.*?\]\(.*?\)/g) || []).length;
    score += Math.min(links * 10, 20);
    
    // Check for images
    const images = (text.match(/!\[.*?\]\(.*?\)/g) || []).length;
    score += Math.min(images * 10, 20);
    
    return Math.min(score, 100);
  };

  const analyzeContent = (text: string): { type: 'warning' | 'error' | 'success'; message: string; }[] => {
    const issues: { type: 'warning' | 'error' | 'success'; message: string; }[] = [];
    
    // Check for minimum word count
    if (metrics.wordCount < 300) {
      issues.push({
        type: 'warning',
        message: 'Content is too short. Aim for at least 300 words.',
      });
    }
    
    // Check for headings
    if (!text.includes('# ')) {
      issues.push({
        type: 'error',
        message: 'Missing main heading (H1).',
      });
    }
    
    // Check for paragraphs
    if (text.split('\n\n').length < 3) {
      issues.push({
        type: 'warning',
        message: 'Consider adding more paragraphs for better readability.',
      });
    }
    
    // Check for links
    if (!text.match(/\[.*?\]\(.*?\)/g)) {
      issues.push({
        type: 'warning',
        message: 'No links found. Consider adding relevant links.',
      });
    }
    
    // Check for images
    if (!text.match(/!\[.*?\]\(.*?\)/g)) {
      issues.push({
        type: 'warning',
        message: 'No images found. Consider adding relevant images.',
      });
    }
    
    // If no issues, add a success message
    if (issues.length === 0) {
      issues.push({
        type: 'success',
        message: 'Content looks good!',
      });
    }
    
    return issues;
  };

  const getIssueIcon = (type: 'warning' | 'error' | 'success') => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.wordCount}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.readingTime} min</p>
              <p className="text-xs text-muted-foreground">Reading time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{metrics.seoScore}%</p>
              <p className="text-xs text-muted-foreground">SEO Score</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">SEO Score</p>
          <Progress value={metrics.seoScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Issues</p>
          <AnimatePresence mode="popLayout">
            {metrics.issues.map((issue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-sm"
              >
                {getIssueIcon(issue.type)}
                <span className={cn(
                  'text-sm',
                  issue.type === 'error' && 'text-red-500',
                  issue.type === 'warning' && 'text-yellow-500',
                  issue.type === 'success' && 'text-green-500'
                )}>
                  {issue.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
} 