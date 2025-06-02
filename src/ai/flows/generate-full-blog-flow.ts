
'use server';
/**
 * @fileOverview Generates a full blog post using AI based on a topic, outline, and other parameters.
 *
 * - generateFullBlog - A function that generates a complete blog post.
 * - GenerateFullBlogInput - The input type for the generateFullBlog function.
 * - GenerateFullBlogOutput - The return type for the generateFullBlog function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFullBlogInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual, informative).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic, storytelling).'),
  length: z.string().describe('The desired length of the blog post (e.g., short, medium, long).'),
  outline: z.array(z.string().describe('A main section or heading from the blog post outline.')).describe('The structured outline for the blog post.'),
  referenceText: z.string().optional().describe('Optional reference text or notes to guide the blog post generation.'),
});
export type GenerateFullBlogInput = z.infer<typeof GenerateFullBlogInputSchema>;

const GenerateFullBlogOutputSchema = z.object({
  blogContent: z.string().describe('The full content of the generated blog post, formatted in Markdown.'),
});
export type GenerateFullBlogOutput = z.infer<typeof GenerateFullBlogOutputSchema>;

export async function generateFullBlog(input: GenerateFullBlogInput): Promise<GenerateFullBlogOutput> {
  return generateFullBlogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFullBlogPrompt',
  input: {schema: GenerateFullBlogInputSchema},
  output: {schema: GenerateFullBlogOutputSchema},
  prompt: `You are an expert blog writer tasked with generating a complete blog post.
Given the following parameters:
- Blog Topic: {{{topic}}}
- Desired Tone: {{{tone}}}
- Desired Style: {{{style}}}
- Desired Length: {{{length}}}
{{#if referenceText}}- Reference Material: {{{referenceText}}}{{/if}}

And the following outline:
{{#each outline}}
- {{{this}}}
{{/each}}

Please write a comprehensive and engaging {{length}} blog post.
The post should follow the provided outline, using each outline item as a major heading or section (e.g., using H2 or H3 Markdown for headings).
Ensure the content flows logically, adheres to the specified tone and style, and thoroughly covers the topic.
The output should be a single string containing the full blog post in Markdown format.
Start directly with the content, for example, if the first outline item is "Introduction", start with "## Introduction".
`,
  config: { // Added safety settings configuration
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', // Was BLOCK_ONLY_HIGH, trying medium
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const generateFullBlogFlow = ai.defineFlow(
  {
    name: 'generateFullBlogFlow',
    inputSchema: GenerateFullBlogInputSchema,
    outputSchema: GenerateFullBlogOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.blogContent) {
      // Fallback in case AI returns empty or malformed output
      let fallbackContent = `# ${input.topic}\n\n## Introduction\nFailed to generate AI content for this section. Please write manually.\n\n`;
      input.outline.forEach(section => {
        if (section.toLowerCase() !== 'introduction' && section.toLowerCase() !== 'conclusion') {
          fallbackContent += `## ${section}\nContent generation failed for this section. Please fill in manually.\n\n`;
        }
      });
      fallbackContent += `## Conclusion\nFailed to generate AI content for this section. Please write manually.\n`;
      return { blogContent: fallbackContent };
    }
    return output;
  }
);

