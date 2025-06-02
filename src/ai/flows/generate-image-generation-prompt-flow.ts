
'use server';
/**
 * @fileOverview Generates a detailed image prompt for hero image creation.
 *
 * - generateImageGenerationPrompt - Generates a detailed prompt for image generation.
 * - GenerateImageGenerationPromptInput - Input type.
 * - GenerateImageGenerationPromptOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageGenerationPromptInputSchema = z.object({
  blogTitle: z.string().describe('The title of the blog post.'),
  blogTopic: z.string().describe('The main topic of the blog post.'),
  blogTone: z.string().describe('The desired tone of the blog post (e.g., formal, casual).'),
  blogStyle: z.string().describe('The desired writing style of the blog post (e.g., academic, journalistic).'),
});
export type GenerateImageGenerationPromptInput = z.infer<typeof GenerateImageGenerationPromptInputSchema>;

const GenerateImageGenerationPromptOutputSchema = z.object({
  detailedImagePrompt: z.string().describe('A detailed and visually descriptive prompt suitable for an image generation model.'),
});
export type GenerateImageGenerationPromptOutput = z.infer<typeof GenerateImageGenerationPromptOutputSchema>;

export async function generateImageGenerationPrompt(input: GenerateImageGenerationPromptInput): Promise<GenerateImageGenerationPromptOutput> {
  return generateImageGenerationPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImageGenerationPrompt',
  input: {schema: GenerateImageGenerationPromptInputSchema},
  output: {schema: GenerateImageGenerationPromptOutputSchema},
  prompt: `Based on a blog post titled "{{blogTitle}}" about "{{blogTopic}}", which has a "{{blogTone}}" tone and a "{{blogStyle}}" writing style, create a single, highly detailed, and visually descriptive prompt for an image generation model.

This prompt should be used to generate a compelling hero image that captures the essence of the blog post's topic.
The prompt should focus on visual elements and artistic direction. Avoid asking for text to be rendered in the image.
The prompt should be creative and aim to inspire an impactful image.

Example of a good detailed prompt:
"Epic fantasy landscape, a lone warrior stands on a clifftop overlooking a vast, mist-filled valley with ancient ruins. Majestic mountains pierce the stormy sky, lit by a dramatic sunset. Cinematic lighting, hyperrealistic, octane render style. Keywords: adventure, mystery, solitude."

Generate the detailed image prompt.
`,
});

const generateImageGenerationPromptFlow = ai.defineFlow(
  {
    name: 'generateImageGenerationPromptFlow',
    inputSchema: GenerateImageGenerationPromptInputSchema,
    outputSchema: GenerateImageGenerationPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.detailedImagePrompt) {
      // Fallback if AI fails
      return { detailedImagePrompt: `A compelling visual representation of the blog topic: ${input.blogTopic}, with a ${input.blogTone} feel.` };
    }
    return output;
  }
);
