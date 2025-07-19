'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface OptimizationPanelProps {
  content: string;
  title: string;
}

interface OptimizationMetrics {
  seoScore: number;
  readability: {
    score: number;
    grade: string;
  };
  keywordDensity: {
    [key: string]: number;
  };
  sectionQuality: {
    [key: string]: number;
  };
  plagiarism: {
    score: number;
    matches: Array<{
      text: string;
      source: string;
      similarity: number;
    }>;
  };
  gapAnalysis: {
    missingKeywords: string[];
    suggestedImprovements: string[];
  };
}

export function OptimizationPanel({ content, title }: OptimizationPanelProps) {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/blog/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      
      toast({
        title: 'Success',
        description: 'Content analysis completed!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (content && title) {
      analyzeContent();
    }
  }, [content, title]);

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            {isAnalyzing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <p className="text-muted-foreground">Start writing to see optimization metrics</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Optimization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SEO Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">SEO Score</h3>
            <span className="text-sm font-medium">{metrics.seoScore}%</span>
          </div>
          <Progress value={metrics.seoScore} className="h-2" />
        </div>

        {/* Readability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Readability</h3>
            <span className="text-sm font-medium">{metrics.readability.grade}</span>
          </div>
          <Progress value={metrics.readability.score} className="h-2" />
        </div>

        {/* Keyword Density */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Keyword Density</h3>
          <div className="space-y-1">
            {Object.entries(metrics.keywordDensity).map(([keyword, density]) => (
              <div key={keyword} className="flex items-center justify-between text-sm">
                <span>{keyword}</span>
                <span>{density.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Quality */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Section Quality</h3>
          <div className="space-y-1">
            {Object.entries(metrics.sectionQuality).map(([section, score]) => (
              <div key={section} className="flex items-center justify-between text-sm">
                <span>{section}</span>
                <span>{score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plagiarism Check */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Plagiarism Check</h3>
            <span className="text-sm font-medium">{metrics.plagiarism.score}% Original</span>
          </div>
          {metrics.plagiarism.matches.length > 0 && (
            <div className="space-y-2 text-sm">
              {metrics.plagiarism.matches.map((match, index) => (
                <div key={index} className="flex items-start space-x-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-1" />
                  <div>
                    <p>{match.text}</p>
                    <p className="text-xs">Source: {match.source} ({match.similarity}% similar)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gap Analysis */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Gap Analysis</h3>
          {metrics.gapAnalysis.missingKeywords.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Missing Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {metrics.gapAnalysis.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-muted rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          {metrics.gapAnalysis.suggestedImprovements.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Suggested Improvements:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {metrics.gapAnalysis.suggestedImprovements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          onClick={analyzeContent}
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Reanalyze Content'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 