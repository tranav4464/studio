
'use server';
/**
 * @fileOverview Simplifies existing blog content for better readability and understanding.
 *
 * - simplifyBlogContent - A function that simplifies blog content.
 * - SimplifyBlogContentInput - The input type for the function.
 * - SimplifyBlogContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SimplifyBlogContentInputSchema = z.object({
  blogContent: z.string().describe('The current content of the blog post in Markdown format.'),
  topic: z.string().describe('The main topic of the blog post for context.'),
  originalTone: z.string().describe('The original tone of the blog post (e.g., formal, casual). Used as context for simplification.'),
  originalStyle: z.string().describe('The original writing style (e.g., academic, journalistic). Used as context for simplification.'),
});
export type SimplifyBlogContentInput = z.infer<typeof SimplifyBlogContentInputSchema>;

export const SimplifyBlogContentOutputSchema = z.object({
  simplifiedContent: z.string().describe('The simplified blog content in Markdown format.'),
});
export type SimplifyBlogContentOutput = z.infer<typeof SimplifyBlogContentOutputSchema>;

export async function simplifyBlogContent(input: SimplifyBlogContentInput): Promise<SimplifyBlogContentOutput> {
  return simplifyBlogContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyBlogContentPrompt',
  input: {schema: SimplifyBlogContentInputSchema},
  output: {schema: SimplifyBlogContentOutputSchema},
  prompt: `You are an expert editor specializing in simplifying complex text.
Context:
- Blog Topic: {{{topic}}}
- Original Tone: {{{originalTone}}}
- Original Style: {{{originalStyle}}}

Current Blog Content (Markdown):
{{{blogContent}}}

Please review the current blog content and rewrite it to:
- Simplify complex language and jargon.
- Shorten long sentences and paragraphs.
- Clarify difficult concepts, making them easier to understand for a broader audience.
- Maintain the original core message, factual information, and overall structure (headings, paragraphs). Do not remove or drastically alter existing sections.
- The output should be the full simplified blog post in Markdown format.
`,
});

const simplifyBlogContentFlow = ai.defineFlow(
  {
    name: 'simplifyBlogContentFlow',
    inputSchema: SimplifyBlogContentInputSchema,
    outputSchema: SimplifyBlogContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.simplifiedContent) {
      // Fallback in case AI returns empty or malformed output
      return { simplifiedContent: `Failed to simplify content. Original:\n\n${input.blogContent}` };
    }
    return output;
  }
);
