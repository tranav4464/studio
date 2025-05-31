
'use server';
/**
 * @fileOverview Generates an SEO-friendly meta title for a blog post.
 *
 * - generateMetaTitle - A function that generates a meta title.
 * - GenerateMetaTitleInput - The input type for the function.
 * - GenerateMetaTitleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateMetaTitleInputSchema = z.object({
  blogTitle: z.string().describe('The main title of the blog post.'),
  blogContent: z.string().describe('The full content of the blog post (Markdown).'),
});
export type GenerateMetaTitleInput = z.infer<typeof GenerateMetaTitleInputSchema>;

export const GenerateMetaTitleOutputSchema = z.object({
  suggestedMetaTitle: z.string().describe('The suggested SEO-friendly meta title (target: 50-60 characters).'),
});
export type GenerateMetaTitleOutput = z.infer<typeof GenerateMetaTitleOutputSchema>;

export async function generateMetaTitle(input: GenerateMetaTitleInput): Promise<GenerateMetaTitleOutput> {
  return generateMetaTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMetaTitlePrompt',
  input: {schema: GenerateMetaTitleInputSchema},
  output: {schema: GenerateMetaTitleOutputSchema},
  prompt: `You are an SEO expert. Given the blog post title and its content, generate a concise and compelling meta title.
The meta title should ideally be between 50 and 60 characters long.
It must accurately reflect the blog post's main topic and be optimized for search engine click-through rates.

Blog Title: {{{blogTitle}}}

Blog Content Snippet (for context):
{{{truncate blogContent 500}}}

Generate the meta title.
`,
});

const generateMetaTitleFlow = ai.defineFlow(
  {
    name: 'generateMetaTitleFlow',
    inputSchema: GenerateMetaTitleInputSchema,
    outputSchema: GenerateMetaTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.suggestedMetaTitle) {
      // Fallback in case AI returns empty or malformed output
      return { suggestedMetaTitle: `Meta Title for: ${input.blogTitle.substring(0,40)}` };
    }
    return output;
  }
);
