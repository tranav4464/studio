'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { IntelligentTopicInput } from './intelligent-topic-input';
import { ReferenceUpload } from './reference-upload';
import { useToast } from '@/components/ui/use-toast';

interface ReferenceFile {
  id: string;
  name: string;
  type: string;
  content: string;
}

export function BlogCreationForm() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const [template, setTemplate] = useState('modern');
  const [references, setReferences] = useState<ReferenceFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateOutline = async () => {
    if (!topic) {
      toast({
        title: 'Error',
        description: 'Please enter a blog topic',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
          template,
          references: references.map(ref => ({
            name: ref.name,
            content: ref.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      router.push(`/new-blog/outline?outline=${encodeURIComponent(JSON.stringify(data.outline))}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate outline. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Blog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Blog Topic</Label>
            <IntelligentTopicInput
              value={topic}
              onChange={setTopic}
              placeholder="Enter your blog topic..."
            />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Length</Label>
            <RadioGroup value={length} onValueChange={setLength} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short">Short (~500 words)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium (~1000 words)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long">Long (~1500 words)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reference Materials (Optional)</Label>
            <ReferenceUpload onFilesUploaded={setReferences} />
          </div>

          <Button
            onClick={handleGenerateOutline}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? 'Generating Outline...' : 'Generate Outline'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 