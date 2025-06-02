
'use server';
/**
 * @fileOverview Expands existing blog content to be more comprehensive.
 *
 * - expandBlogContent - A function that expands blog content.
 * - ExpandBlogContentInput - The input type for the function.
 * - ExpandBlogContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandBlogContentInputSchema = z.object({
  blogContent: z.string().describe('The current content of the blog post in Markdown format.'),
  topic: z.string().describe('The main topic of the blog post for context.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic).'),
});
export type ExpandBlogContentInput = z.infer<typeof ExpandBlogContentInputSchema>;

const ExpandBlogContentOutputSchema = z.object({
  expandedContent: z.string().describe('The expanded blog content in Markdown format.'),
});
export type ExpandBlogContentOutput = z.infer<typeof ExpandBlogContentOutputSchema>;

export async function expandBlogContent(input: ExpandBlogContentInput): Promise<ExpandBlogContentOutput> {
  return expandBlogContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expandBlogContentPrompt',
  input: {schema: ExpandBlogContentInputSchema},
  output: {schema: ExpandBlogContentOutputSchema},
  prompt: `You are an expert blog editor. Your task is to expand the provided blog post content to make it more comprehensive.
Context:
- Blog Topic: {{{topic}}}
- Desired Tone: {{{tone}}}
- Desired Style: {{{style}}}

Current Blog Content (Markdown):
{{{blogContent}}}

Please review the current blog content and rewrite it to:
- Add more relevant information, examples, or details to key sections.
- Elaborate on existing points to provide fuller explanations.
- Ensure the expanded content naturally integrates with the existing flow.
- Maintain the original core message, factual information, and overall structure (headings, paragraphs). Do not remove or drastically alter existing sections unless it's to integrate new, expanded material smoothly.
- The output should be the full expanded blog post in Markdown format.
`,
});

const expandBlogContentFlow = ai.defineFlow(
  {
    name: 'expandBlogContentFlow',
    inputSchema: ExpandBlogContentInputSchema,
    outputSchema: ExpandBlogContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.expandedContent) {
      // Fallback in case AI returns empty or malformed output
      return { expandedContent: `Failed to expand content. Original:\n\n${input.blogContent}` };
    }
    return output;
  }
);
