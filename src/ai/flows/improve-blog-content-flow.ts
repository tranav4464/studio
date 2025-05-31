
'use server';
/**
 * @fileOverview Improves existing blog content for clarity, engagement, and flow.
 *
 * - improveBlogContent - A function that enhances blog content.
 * - ImproveBlogContentInput - The input type for the function.
 * - ImproveBlogContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ImproveBlogContentInputSchema = z.object({
  blogContent: z.string().describe('The current content of the blog post in Markdown format.'),
  topic: z.string().describe('The main topic of the blog post for context.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic).'),
});
export type ImproveBlogContentInput = z.infer<typeof ImproveBlogContentInputSchema>;

export const ImproveBlogContentOutputSchema = z.object({
  improvedContent: z.string().describe('The improved blog content in Markdown format.'),
});
export type ImproveBlogContentOutput = z.infer<typeof ImproveBlogContentOutputSchema>;

export async function improveBlogContent(input: ImproveBlogContentInput): Promise<ImproveBlogContentOutput> {
  return improveBlogContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveBlogContentPrompt',
  input: {schema: ImproveBlogContentInputSchema},
  output: {schema: ImproveBlogContentOutputSchema},
  prompt: `You are an expert blog editor. Your task is to improve the provided blog post content.
Context:
- Blog Topic: {{{topic}}}
- Desired Tone: {{{tone}}}
- Desired Style: {{{style}}}

Current Blog Content (Markdown):
{{{blogContent}}}

Please review the current blog content and rewrite it to:
- Enhance clarity and readability.
- Improve engagement and flow between sections.
- Correct any grammatical errors or awkward phrasing.
- Ensure it aligns well with the specified topic, tone, and style.
- Maintain the original core message, factual information, and overall structure (headings, paragraphs). Do not remove or drastically alter existing sections unless absolutely necessary for clarity.
- The output should be the full improved blog post in Markdown format.
`,
});

const improveBlogContentFlow = ai.defineFlow(
  {
    name: 'improveBlogContentFlow',
    inputSchema: ImproveBlogContentInputSchema,
    outputSchema: ImproveBlogContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.improvedContent) {
      // Fallback in case AI returns empty or malformed output
      return { improvedContent: `Failed to improve content. Original:\n\n${input.blogContent}` };
    }
    return output;
  }
);
