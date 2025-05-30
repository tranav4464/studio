
'use server';
/**
 * @fileOverview Generates hero images for blog posts based on the title, tone, and theme.
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

// Note: The prompt to the image model is kept simple for clarity.
// More complex prompting could be used for better theme/style adherence.
const generateHeroImageFlow = ai.defineFlow(
  {
    name: 'generateHeroImageFlow',
    inputSchema: GenerateHeroImageInputSchema,
    outputSchema: GenerateHeroImageOutputSchema,
  },
  async (input, streamingCallback) => {
    const numImagesToGenerate = 3;
    const imageUrls: string[] = [];
    let promptText = `Generate a hero image for a blog post titled "${input.blogTitle}" with a ${input.tone} tone.`;
    if (input.theme && input.theme !== 'General') {
      promptText += ` The desired visual theme is ${input.theme}.`;
    }

    // Inform the client that generation is starting
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
          prompt: `${promptText} (Variant ${i + 1})`, 
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
             // Add safety settings if needed, e.g.,
            // safetySettings: [{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }],
          },
        });
        if (media && media.url) {
          imageUrls.push(media.url);
        } else {
          // Push a placeholder if a specific image generation fails
          console.warn(`Image generation failed for variant ${i+1}. Prompt: ${promptText}`);
          imageUrls.push(`https://placehold.co/600x300.png?text=Variant+${i+1}+Failed`);
        }
      } catch (error) {
        console.error(`Error generating image variant ${i+1}:`, error);
        imageUrls.push(`https://placehold.co/600x300.png?text=Error+Variant+${i+1}`);
      }
    }
    
    if (imageUrls.length === 0) {
        // Fallback if all generations fail
        imageUrls.push(`https://placehold.co/800x400.png?text=All+Image+Generations+Failed`);
    }

    return {imageUrls};
  }
);
