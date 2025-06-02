
'use server';
/**
 * @fileOverview Generates hero images for blog posts based on a detailed prompt, tone, and theme.
 *
 * - generateHeroImage - A function that generates hero images.
 * - GenerateHeroImageInput - The input type for the generateHeroImage function.
 * - GenerateHeroImageOutput - The return type for the generateHeroImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeroImageInputSchema = z.object({
  imagePrompt: z.string().describe('The detailed prompt for the image generation model.'),
  tone: z.string().describe('The desired tone or style for the image (e.g., cinematic, vibrant). This can complement the main prompt.'),
  theme: z.string().describe('The visual theme for the image (e.g., Dark, Light, Pastel, General).').optional(),
});
export type GenerateHeroImageInput = z.infer<typeof GenerateHeroImageInputSchema>;

const GenerateHeroImageOutputSchema = z.object({
  imageUrls: z.array(z.string()).describe('An array of URLs for the generated hero images (typically 3 variants).'),
});
export type GenerateHeroImageOutput = z.infer<typeof GenerateHeroImageOutputSchema>;

export async function generateHeroImage(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  return generateHeroImageFlow(input);
}

const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async (input, streamingCallback) => {
    const numImagesToGenerate = 3;
    const imageUrls: string[] = [];
    
    let basePromptText = input.imagePrompt;
    // The tone is already part of the detailed prompt generation usually, 
    // but we can still append it or the theme for more specific control at the image gen stage.
    let finalPromptText = basePromptText;
    if (input.theme && input.theme !== 'General') {
      finalPromptText += ` Visually, the image should have a ${input.theme} theme.`;
    }
    // The input.tone can also be appended if needed, e.g., ` Style: ${input.tone}.`
    // For now, assuming the detailed prompt from generateImageGenerationPromptFlow incorporates tone sufficiently.

    if (streamingCallback) {
       streamingCallback({
        custom: {
          type: 'status',
          message: `Generating ${numImagesToGenerate} image variants... (1/${numImagesToGenerate})`,
        },
      });
    }
    
    for (let i = 0; i < numImagesToGenerate; i++) {
       if (streamingCallback && i > 0) {
        streamingCallback({
          custom: {
            type: 'status',
            message: `Generating image (${i + 1}/${numImagesToGenerate})...`,
          },
        });
      }
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: `${finalPromptText} (Variant ${i + 1})`, 
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
        if (media && media.url) {
          imageUrls.push(media.url);
        } else {
          console.warn(`Image generation failed for variant ${i+1}. Prompt: ${finalPromptText}`);
          imageUrls.push(`https://placehold.co/600x300.png?text=Variant+${i+1}+Failed`);
        }
      } catch (error) {
        console.error(`Error generating image variant ${i+1}:`, error);
        imageUrls.push(`https://placehold.co/600x300.png?text=Error+Variant+${i+1}`);
      }
    }
    
    if (imageUrls.length === 0) {
        imageUrls.push(`https://placehold.co/800x400.png?text=All+Image+Generations+Failed`);
    }

    return {imageUrls};
  }
);
