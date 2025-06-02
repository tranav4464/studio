
'use server';
/**
 * @fileOverview Generates detailed image prompt suggestions based on user keywords and preferences.
 *
 * - generateImagePromptHelper - Generates a detailed prompt for image generation.
 * - GenerateImagePromptHelperInput - Input type.
 * - GenerateImagePromptHelperOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImagePromptHelperInputSchema = z.object({
  keywords: z.string().describe('Main keywords or subjects for the image (e.g., "futuristic city, flying cars").'),
  artisticStyle: z.string().describe('Desired artistic style (e.g., "photorealistic", "impressionistic", "anime", "concept art").'),
  mood: z.string().describe('Desired mood or atmosphere (e.g., "dramatic", "serene", "energetic", "mysterious").'),
  additionalDetails: z.string().optional().describe('Any other specific elements, camera angles, lighting, or details to include (e.g., "cinematic lighting, wide angle, vibrant colors").'),
});
export type GenerateImagePromptHelperInput = z.infer<typeof GenerateImagePromptHelperInputSchema>;

const GenerateImagePromptHelperOutputSchema = z.object({
  suggestedDetailedPrompt: z.string().describe('A detailed and visually descriptive prompt suitable for an image generation model, incorporating all provided inputs.'),
});
export type GenerateImagePromptHelperOutput = z.infer<typeof GenerateImagePromptHelperOutputSchema>;

export async function generateImagePromptHelper(input: GenerateImagePromptHelperInput): Promise<GenerateImagePromptHelperOutput> {
  return generateImagePromptHelperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImagePromptHelperPrompt',
  input: {schema: GenerateImagePromptHelperInputSchema},
  output: {schema: GenerateImagePromptHelperOutputSchema},
  prompt: `You are an expert prompt engineer for AI image generation models.
Based on the following user inputs, craft a single, highly detailed, and visually descriptive prompt that combines all elements effectively. The goal is to create a prompt that will lead to a compelling and accurate image.

User Inputs:
- Keywords/Subjects: {{{keywords}}}
- Artistic Style: {{{artisticStyle}}}
- Mood/Atmosphere: {{{mood}}}
{{#if additionalDetails}}- Additional Details: {{{additionalDetails}}}{{/if}}

Combine these into a cohesive and rich prompt. Focus on visual language. Do not add any conversational fluff, just output the generated prompt.

Example of a good output for inputs like "dragon, mountain, epic, photorealistic":
"Epic photorealistic scene of a majestic dragon perched atop a craggy mountain peak, scales shimmering in the dramatic sunlight, ancient ruins visible in the background, volumetric clouds, cinematic lighting."

Generate the detailed image prompt.
`,
});

const generateImagePromptHelperFlow = ai.defineFlow(
  {
    name: 'generateImagePromptHelperFlow',
    inputSchema: GenerateImagePromptHelperInputSchema,
    outputSchema: GenerateImagePromptHelperOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.suggestedDetailedPrompt) {
      // Fallback if AI fails
      return { suggestedDetailedPrompt: `A visual representation of: ${input.keywords}, in a ${input.artisticStyle} style with a ${input.mood} mood. Consider adding: ${input.additionalDetails || 'no specific details'}.` };
    }
    return output;
  }
);

