
'use server';
/**
 * @fileOverview Generates a blog title suggestion using AI.
 *
 * - generateBlogTitleSuggestion - A function that suggests a blog title.
 * - GenerateBlogTitleSuggestionInput - The input type for the function.
 * - GenerateBlogTitleSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogTitleSuggestionInputSchema = z.object({
  currentContent: z.string().describe('The current content of the blog post (Markdown).'),
  originalTopic: z.string().describe('The original topic or keyword for the blog post.'),
});
export type GenerateBlogTitleSuggestionInput = z.infer<typeof GenerateBlogTitleSuggestionInputSchema>;

const GenerateBlogTitleSuggestionOutputSchema = z.object({
  suggestedTitle: z.string().describe('A compelling and relevant blog title suggested by the AI.'),
});
export type GenerateBlogTitleSuggestionOutput = z.infer<typeof GenerateBlogTitleSuggestionOutputSchema>;

export async function generateBlogTitleSuggestion(input: GenerateBlogTitleSuggestionInput): Promise<GenerateBlogTitleSuggestionOutput> {
  return generateBlogTitleSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogTitleSuggestionPrompt',
  input: {schema: GenerateBlogTitleSuggestionInputSchema},
  output: {schema: GenerateBlogTitleSuggestionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating engaging blog titles.
Based on the original topic and the current content of the blog post, suggest one compelling and relevant blog title.
The title should be concise, attention-grabbing, and accurately reflect the main theme of the content.

Original Topic/Keywords: {{{originalTopic}}}

Current Blog Content (for context):
---
{{{currentContent}}}
---

Suggest a blog title.
`,
});

const generateBlogTitleSuggestionFlow = ai.defineFlow(
  {
    name: 'generateBlogTitleSuggestionFlow',
    inputSchema: GenerateBlogTitleSuggestionInputSchema,
    outputSchema: GenerateBlogTitleSuggestionOutputSchema,
  },
  async (input: GenerateBlogTitleSuggestionInput) => {
    // Truncate content if too long for the prompt, to avoid issues.
    const contentSnippet = input.currentContent.length > 2000 
        ? input.currentContent.substring(0, 2000) + "..." 
        : input.currentContent;

    const {output} = await prompt({
        ...input,
        currentContent: contentSnippet,
    });
    
    if (!output || !output.suggestedTitle) {
      return { suggestedTitle: `Ideas for: ${input.originalTopic}` };
    }
    return output;
  }
);
