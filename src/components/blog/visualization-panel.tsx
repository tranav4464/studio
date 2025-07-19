'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface VisualizationPanelProps {
  content: string;
  onVisualizationGenerated: (imageUrl: string) => void;
}

type DiagramType = 'flowchart' | 'mindmap' | 'timeline' | 'comparison';

export function VisualizationPanel({ content, onVisualizationGenerated }: VisualizationPanelProps) {
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateVisualization = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          diagramType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate visualization');
      }

      const data = await response.json();
      onVisualizationGenerated(data.imageUrl);
      
      toast({
        title: 'Success',
        description: 'Visualization generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate visualization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Diagram Type</label>
          <Select value={diagramType} onValueChange={(value: DiagramType) => setDiagramType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select diagram type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flowchart">Flowchart</SelectItem>
              <SelectItem value="mindmap">Mind Map</SelectItem>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="comparison">Comparison</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generateVisualization}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Visualization
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 