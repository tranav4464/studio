'use server';
/**
 * @fileOverview Generates hero images for blog posts based on the title and selected tone.
 *
 * - generateHeroImage - A function that generates hero images.
 * - GenerateHeroImageInput - The input type for the generateHeroImage function.
 * - GenerateHeroImageOutput - The return type for the generateHeroImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeroImageInputSchema = z.object({
  blogTitle: z.string().describe('The title of the blog post.'),
  tone: z.string().describe('The desired tone or style for the image.'),
});
export type GenerateHeroImageInput = z.infer<typeof GenerateHeroImageInputSchema>;

const GenerateHeroImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated hero image.'),
});
export type GenerateHeroImageOutput = z.infer<typeof GenerateHeroImageOutputSchema>;

export async function generateHeroImage(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  return generateHeroImageFlow(input);
}

const generateHeroImagePrompt = ai.definePrompt({
  name: 'generateHeroImagePrompt',
  input: {schema: GenerateHeroImageInputSchema},
  output: {schema: GenerateHeroImageOutputSchema},
  prompt: `Generate a hero image for a blog post with the title "{{blogTitle}}" and the tone "{{tone}}". Return the image URL as a data URI.`, // Keep prompt simple
});

const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate a hero image for a blog post with the title "${input.blogTitle}" and the tone "${input.tone}".`, // Simple prompt for image generation
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    return {imageUrl: media.url!};
  }
);
