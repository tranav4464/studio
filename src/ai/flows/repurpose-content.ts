
'use server';

/**
 * @fileOverview A content repurposing AI agent.
 *
 * - repurposeContent - A function that handles the content repurposing process.
 * - RepurposeContentInput - The input type for the repurposeContent function.
 * - RepurposeContentOutput - The return type for the repurposeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepurposeContentInputSchema = z.object({
  article: z.string().describe('The main article content to repurpose.'),
  tone: z.string().describe('The desired tone for the repurposed content.'),
});
export type RepurposeContentInput = z.infer<typeof RepurposeContentInputSchema>;

const RepurposeContentOutputSchema = z.object({
  tweetThread: z.string().describe('A tweet thread generated from the article.'),
  linkedInPost: z.string().describe('A LinkedIn post generated from the article, adapted to the specified tone.'),
  instagramPost: z.string().describe('An Instagram post caption generated from the article, optimized for engagement and including relevant hashtags.'),
  emailNewsletterSummary: z
    .string()
    .describe('An email newsletter summary generated from the article.'),
});
export type RepurposeContentOutput = z.infer<typeof RepurposeContentOutputSchema>;

export async function repurposeContent(input: RepurposeContentInput): Promise<RepurposeContentOutput> {
  return repurposeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repurposeContentPrompt',
  input: {schema: RepurposeContentInputSchema},
  output: {schema: RepurposeContentOutputSchema},
  prompt: `You are an expert content repurposer. Given the following article and tone, generate a tweet thread, a LinkedIn post, an Instagram post caption (including relevant hashtags), and an email newsletter summary.

Article: {{{article}}}
Tone: {{{tone}}}

Tweet Thread:
{{#each (split tweetThread "\n")}}{{{this}}}\n{{/each}}

LinkedIn Post:
{{{linkedInPost}}}

Instagram Post:
{{{instagramPost}}}

Email Newsletter Summary:
{{{emailNewsletterSummary}}}`,
});

const repurposeContentFlow = ai.defineFlow(
  {
    name: 'repurposeContentFlow',
    inputSchema: RepurposeContentInputSchema,
    outputSchema: RepurposeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
