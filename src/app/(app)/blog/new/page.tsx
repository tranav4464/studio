"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';

// Pre-written content
const SAMPLE_OUTLINE = `# The Future of AI in Web Development

## Introduction
- Brief overview of AI's current role in web development
- The growing importance of AI tools in modern development workflows

## Current State of AI in Web Development
- Popular AI tools and their capabilities
- How developers are using AI in their daily work
- Case studies of successful AI integration

## Emerging Trends
- AI-powered code generation
- Automated testing and debugging
- Smart UI/UX design assistance
- Performance optimization

## Benefits and Challenges
- Increased productivity and efficiency
- Learning curve and adaptation
- Quality control and human oversight
- Ethical considerations

## Future Predictions
- AI's role in future development frameworks
- Impact on developer roles and skills
- Integration with emerging technologies

## Conclusion
- Summary of key points
- Call to action for developers
- Future outlook`;

const SAMPLE_CONTENT = `# The Future of AI in Web Development

The landscape of web development is undergoing a profound transformation, driven by the rapid advancement of artificial intelligence. As we stand at the cusp of this technological revolution, it's crucial to understand how AI is reshaping the way we build and maintain web applications.

## Current State of AI in Web Development

The integration of AI into web development has already begun to show promising results. Tools like GitHub Copilot and ChatGPT have become indispensable for many developers, offering intelligent code suggestions and solutions to complex problems. These AI assistants can:

- Generate boilerplate code
- Suggest optimizations
- Help debug issues
- Provide documentation

## Emerging Trends

### AI-Powered Code Generation
Modern AI models can now generate entire components and functions based on natural language descriptions. This capability is revolutionizing how developers approach coding tasks, allowing them to focus on higher-level architecture and problem-solving.

### Automated Testing and Debugging
AI systems are becoming increasingly sophisticated at identifying potential bugs and suggesting fixes. They can analyze code patterns, predict potential issues, and even generate test cases automatically.

### Smart UI/UX Design Assistance
AI tools are now capable of:
- Generating responsive layouts
- Suggesting color schemes
- Optimizing user flows
- Creating accessible designs

## Benefits and Challenges

### Benefits
- Increased development speed
- Reduced boilerplate code
- Improved code quality
- Enhanced learning opportunities

### Challenges
- Maintaining code quality
- Ensuring security
- Managing AI dependencies
- Adapting to new workflows

## Future Predictions

The future of AI in web development looks promising, with several key trends emerging:

1. **Intelligent Development Environments**
   - Context-aware coding assistance
   - Automated refactoring
   - Real-time optimization suggestions

2. **Enhanced Collaboration**
   - AI-powered code review
   - Automated documentation
   - Smart version control

3. **New Development Paradigms**
   - Natural language programming
   - Visual development with AI
   - Automated deployment strategies

## Conclusion

As AI continues to evolve, its role in web development will only grow more significant. Developers who embrace these tools while maintaining a strong foundation in traditional programming concepts will be best positioned for success in this new era of development.

The key is to view AI as a powerful ally rather than a replacement for human developers. By leveraging AI's capabilities while maintaining human oversight and creativity, we can create more efficient, innovative, and maintainable web applications.`;

export default function NewBlogPage() {
  const [activeTab, setActiveTab] = useState('outline');
  const [title, setTitle] = useState('The Future of AI in Web Development');
  const [tone, setTone] = useState('informative');
  const [style, setStyle] = useState('technical');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState(SAMPLE_OUTLINE);
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Blog Post</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Icons.Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button>
            <Icons.Share className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="journalistic">Journalistic</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Length</Label>
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="outline" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Content Outline</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateOutline}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Icons.Regenerate className="mr-2 h-4 w-4" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={outline}
                readOnly
                className="min-h-[400px] font-mono"
              />
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Content Editor</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icons.Regenerate className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icons.Improve className="mr-2 h-4 w-4" />
                    Enhance
                  </Button>
                </div>
              </div>
              <Textarea
                value={SAMPLE_CONTENT}
                readOnly
                className="min-h-[600px] font-mono"
              />
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                <Button variant="outline" size="sm">
                  <Icons.Expand className="mr-2 h-4 w-4" />
                  Full Screen
                </Button>
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: SAMPLE_CONTENT }} />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  async function generateOutline() {
    setIsGenerating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use the sample outline
      let updatedOutline = SAMPLE_OUTLINE;
      
      // Only replace title if it's not empty
      if (title.trim()) {
        updatedOutline = SAMPLE_OUTLINE.replace(
          '# The Future of AI in Web Development',
          `# ${title}`
        );
      }
      
      setOutline(updatedOutline);
      
      // Switch to the editor tab
      setActiveTab('editor');
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  }
} 