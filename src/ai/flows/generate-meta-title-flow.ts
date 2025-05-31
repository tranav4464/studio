
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

const GenerateMetaTitleInputSchema = z.object({
  blogTitle: z.string().describe('The main title of the blog post.'),
  blogContent: z.string().describe('The full content of the blog post (Markdown).'),
});
export type GenerateMetaTitleInput = z.infer<typeof GenerateMetaTitleInputSchema>;

const GenerateMetaTitleOutputSchema = z.object({
  suggestedMetaTitle: z.string().describe('The suggested SEO-friendly meta title (target: 50-60 characters).'),
});
export type GenerateMetaTitleOutput = z.infer<typeof GenerateMetaTitleOutputSchema>;

export async function generateMetaTitle(input: GenerateMetaTitleInput): Promise<GenerateMetaTitleOutput> {
  return generateMetaTitleFlow(input);
}

// Define an internal schema for the prompt that includes the snippet
const MetaTitlePromptInputSchema = GenerateMetaTitleInputSchema.extend({
  blogContentSnippet: z.string().describe('A truncated snippet of the blog content for context (max 500 chars).'),
});

const prompt = ai.definePrompt({
  name: 'generateMetaTitlePrompt',
  input: {schema: MetaTitlePromptInputSchema},
  output: {schema: GenerateMetaTitleOutputSchema},
  prompt: `You are an SEO expert. Given the blog post title and its content, generate a concise and compelling meta title.
The meta title should ideally be between 50 and 60 characters long.
It must accurately reflect the blog post's main topic and be optimized for search engine click-through rates.

Blog Title: {{{blogTitle}}}

Blog Content Snippet (for context):
{{{blogContentSnippet}}}

Generate the meta title.
`,
});

const generateMetaTitleFlow = ai.defineFlow(
  {
    name: 'generateMetaTitleFlow',
    inputSchema: GenerateMetaTitleInputSchema, // External schema remains the same
    outputSchema: GenerateMetaTitleOutputSchema,
  },
  async (input: GenerateMetaTitleInput) => {
    const blogContentSnippet = input.blogContent.length > 500
        ? input.blogContent.substring(0, 500) + '...'
        : input.blogContent;
        
    const {output} = await prompt({
        ...input, // Pass original blogTitle and full blogContent
        blogContentSnippet, // Pass the generated snippet
    });

    if (!output || !output.suggestedMetaTitle) {
      return { suggestedMetaTitle: `Meta Title for: ${input.blogTitle.substring(0,40)}` };
    }
    return output;
  }
);

