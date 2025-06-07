import { useState, useCallback } from 'react';
import { generateBlogContent } from '@/lib/gemini';

type UseAIAssistantProps = {
  onContentGenerated?: (content: string) => void;
  onImageGenerated?: (imageData: string) => void;
  onError?: (error: Error) => void;
};

export function useAIAssistant({
  onContentGenerated,
  onImageGenerated,
  onError,
}: UseAIAssistantProps = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateContent = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      setIsGenerating(true);
      setError(null);

      try {
        const content = await generateBlogContent(prompt);
        onContentGenerated?.(content);
        return content;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate content');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onContentGenerated, onError]
  );

  const generateImage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;

      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const { imageData } = await response.json();
        onImageGenerated?.(imageData);
        return imageData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate image');
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [onImageGenerated, onError]
  );

  return {
    generateContent,
    generateImage,
    isGenerating,
    error,
  };
}
