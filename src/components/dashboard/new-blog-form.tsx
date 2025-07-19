'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { aiService } from '@/lib/ai-service';
import { toast } from 'sonner';

interface NewBlogFormProps {
  // Add any necessary props here
}

const NewBlogForm: React.FC<NewBlogFormProps> = () => {
  const [blogTopic, setBlogTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('medium');
  const [blogLength, setBlogLength] = useState('long');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  const generateTopicSuggestions = async () => {
    if (!blogTopic.trim()) {
      toast.error('Please enter a topic first');
      return;
    }

    setIsGeneratingTopics(true);
    setSuggestedTopics([]);

    try {
      const prompt = `Generate 3 engaging blog post topics about "${blogTopic}" for a ${targetAudience} audience. 
      Make them specific, interesting, and SEO-friendly. Return only the topics as a numbered list.`;

      const response = await aiService.generateText(prompt, {
        maxTokens: 300,
        temperature: 0.8,
      });

      // Extract topics from the response
      const topics = response
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);

      setSuggestedTopics(topics);
      toast.success('Generated topic suggestions!');
    } catch (error) {
      console.error('Error generating topics:', error);
      toast.error('Failed to generate topics. Please try again.');
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!blogTopic.trim()) {
      toast.error('Please enter a blog topic');
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Write a ${blogLength} blog post about "${blogTopic}" for a ${targetAudience} audience. 
      Make it engaging, informative, and well-structured.`;

      const blogContent = await aiService.generateText(prompt, {
        maxTokens: 2000,
        temperature: 0.7,
      });

      // Here you would typically save the generated blog post
      console.log('Generated blog post:', blogContent);
      toast.success('Blog post generated successfully!');

      // TODO: Add logic to save the blog post

    } catch (error) {
      console.error('Error generating blog post:', error);
      toast.error('Failed to generate blog post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Blog</h2>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="blogTopic" className="block text-sm font-medium text-gray-700">Blog Topic</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateTopicSuggestions}
            disabled={isGeneratingTopics || !blogTopic.trim()}
            className="text-xs"
          >
            {isGeneratingTopics ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-3 w-3" />
                Suggest Topics
              </>
            )}
          </Button>
        </div>
        <input
          type="text"
          id="blogTopic"
          value={blogTopic}
          onChange={(e) => setBlogTopic(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Future of Remote Work"
        />

        {suggestedTopics.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600">Suggested topics:</p>
            <div className="space-y-2">
              {suggestedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => {
                    setBlogTopic(topic);
                    setSuggestedTopics([]);
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Target Audience</h3>
        <div className="flex space-x-2">
          {['casual', 'medium', 'professional'].map((audience) => (
            <button
              key={audience}
              type="button"
              className={`px-4 py-2 rounded-md text-sm capitalize ${
                targetAudience === audience
                  ? 'bg-blue-500 text-white border border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setTargetAudience(audience)}
            >
              {audience}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Blog Length</h3>
        <div className="flex space-x-2">
          {['short', 'medium', 'long'].map((length) => (
            <button
              key={length}
              type="button"
              className={`px-4 py-2 rounded-md text-sm capitalize ${
                blogLength === length
                  ? 'bg-blue-500 text-white border border-blue-500'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setBlogLength(length)}
            >
              {length}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          onClick={handleGenerateBlog}
          disabled={isGenerating || !blogTopic.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Blog Post...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Blog Post
            </>
          )}
        </Button>

        <p className="mt-3 text-xs text-center text-gray-500">
          {isGenerating ? 'This may take a moment. Please wait...' : 'Click to generate your blog post'}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Blog Outline</h3>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Your generated blog outline will appear here
          </p>
        </div>
      </div>

      {/* Placeholder for Create Blog section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Create Blog</h3>
        <div className="p-4 bg-gray-100 rounded-md">
          <h4 className="font-semibold">The Future of Remote Work</h4>
          <p className="text-sm text-gray-700">Emerging shirttly rise to recentures the winer es working, and consequences</p>
        </div>
      </div>
    </div>
  );
};

export default NewBlogForm;