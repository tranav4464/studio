
'use server';
/**
 * @fileOverview Generates blog topic/title ideas based on keywords.
 *
 * - generateTopicIdeas - A function that generates a list of topic ideas.
 * - GenerateTopicIdeasInput - The input type for the function.
 * - GenerateTopicIdeasOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTopicIdeasInputSchema = z.object({
  keywords: z.string().describe('Keywords or a base topic to generate ideas from.'),
});
export type GenerateTopicIdeasInput = z.infer<typeof GenerateTopicIdeasInputSchema>;

const GenerateTopicIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).length(5).describe('An array of 5 distinct blog topic or title ideas.'),
});
export type GenerateTopicIdeasOutput = z.infer<typeof GenerateTopicIdeasOutputSchema>;

export async function generateTopicIdeas(input: GenerateTopicIdeasInput): Promise<GenerateTopicIdeasOutput> {
  return generateTopicIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicIdeasPrompt',
  input: {schema: GenerateTopicIdeasInputSchema},
  output: {schema: GenerateTopicIdeasOutputSchema},
  prompt: `You are a creative blog title and topic generator.
Given the following keywords or base topic: "{{keywords}}"

Brainstorm 5 distinct, engaging, and SEO-friendly blog title or topic ideas.
The ideas should be varied.
Return the ideas as a list of strings.
`,
});

const generateTopicIdeasFlow = ai.defineFlow(
  {
    name: 'generateTopicIdeasFlow',
    inputSchema: GenerateTopicIdeasInputSchema,
    outputSchema: GenerateTopicIdeasOutputSchema,
  },
  async (input: GenerateTopicIdeasInput) => {
    const {output} = await prompt(input);
    if (!output || !output.ideas || output.ideas.length !== 5) {
      // Fallback in case AI returns empty or malformed output
      return { ideas: [
        `Exploring ${input.keywords}`,
        `Deep Dive into ${input.keywords}`,
        `The Impact of ${input.keywords}`,
        `${input.keywords}: A Complete Guide`,
        `Unlocking the Potential of ${input.keywords}`,
      ] };
    }
    return output;
  }
);
