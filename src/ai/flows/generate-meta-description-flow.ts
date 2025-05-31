
'use server';
/**
 * @fileOverview Generates an SEO-friendly meta description for a blog post.
 *
 * - generateMetaDescription - A function that generates a meta description.
 * - GenerateMetaDescriptionInput - The input type for the function.
 * - GenerateMetaDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateMetaDescriptionInputSchema = z.object({
  blogTitle: z.string().describe('The main title of the blog post.'),
  blogContent: z.string().describe('The full content of the blog post (Markdown).'),
});
export type GenerateMetaDescriptionInput = z.infer<typeof GenerateMetaDescriptionInputSchema>;

export const GenerateMetaDescriptionOutputSchema = z.object({
  suggestedMetaDescription: z.string().describe('The suggested SEO-friendly meta description (target: 150-160 characters), incorporating relevant keywords naturally.'),
});
export type GenerateMetaDescriptionOutput = z.infer<typeof GenerateMetaDescriptionOutputSchema>;

export async function generateMetaDescription(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  return generateMetaDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaDescriptionPrompt',
  input: {schema: GenerateMetaDescriptionInputSchema},
  output: {schema: GenerateMetaDescriptionOutputSchema},
  prompt: `You are an SEO expert. Given the blog post title and its content, generate a compelling and informative meta description.
The meta description should ideally be between 150 and 160 characters long.
It must summarize the blog post effectively, entice users to click, and naturally incorporate 2-3 relevant keywords from the content.

Blog Title: {{{blogTitle}}}

Blog Content Snippet (for context):
{{{truncate blogContent 1000}}}

Generate the meta description.
`,
});

const generateMetaDescriptionFlow = ai.defineFlow(
  {
    name: 'generateMetaDescriptionFlow',
    inputSchema: GenerateMetaDescriptionInputSchema,
    outputSchema: GenerateMetaDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.suggestedMetaDescription) {
      // Fallback in case AI returns empty or malformed output
      return { suggestedMetaDescription: `Learn more about "${input.blogTitle}". This post covers key aspects of the topic based on the provided content.` };
    }
    return output;
  }
);
