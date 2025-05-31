
'use server';
/**
 * @fileOverview Generates a blog post outline using AI.
 *
 * - generateBlogOutline - A function that generates a blog post outline.
 * - GenerateBlogOutlineInput - The input type for the generateBlogOutline function.
 * - GenerateBlogOutlineOutput - The return type for the generateBlogOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlogOutlineInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual, informative).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic, storytelling).'),
  length: z.string().describe('The desired length of the blog post (e.g., short, medium, long).'),
  referenceText: z.string().optional().describe('Optional reference text or notes to guide the outline generation.'),
});
export type GenerateBlogOutlineInput = z.infer<typeof GenerateBlogOutlineInputSchema>;

const GenerateBlogOutlineOutputSchema = z.object({
  outline: z.array(z.string().describe('A main section or heading for the blog post.')).describe('A list of suggested outline sections for the blog post.'),
});
export type GenerateBlogOutlineOutput = z.infer<typeof GenerateBlogOutlineOutputSchema>;

export async function generateBlogOutline(input: GenerateBlogOutlineInput): Promise<GenerateBlogOutlineOutput> {
  return generateBlogOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogOutlinePrompt',
  input: {schema: GenerateBlogOutlineInputSchema},
  output: {schema: GenerateBlogOutlineOutputSchema},
  prompt: `You are an expert blog writer and content strategist.
Given the following parameters:
- Blog Topic: {{{topic}}}
- Desired Tone: {{{tone}}}
- Desired Style: {{{style}}}
- Desired Length: {{{length}}}
{{#if referenceText}}- Reference Material: {{{referenceText}}}{{/if}}

Generate a concise, logical, and comprehensive blog post outline. The outline should consist of 5-7 main sections or headings that would form a well-structured {{length}} blog post.
Each item in the outline should be a clear and actionable heading.
Return the outline as a list of strings.
`,
});

const generateBlogOutlineFlow = ai.defineFlow(
  {
    name: 'generateBlogOutlineFlow',
    inputSchema: GenerateBlogOutlineInputSchema,
    outputSchema: GenerateBlogOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.outline || output.outline.length === 0) {
      // Fallback in case AI returns empty or malformed output
      return { outline: [`Introduction to ${input.topic}`, `Exploring ${input.topic}`, `Key aspects of ${input.topic}`, `Challenges related to ${input.topic}`, `Conclusion on ${input.topic}`] };
    }
    return output;
  }
);

