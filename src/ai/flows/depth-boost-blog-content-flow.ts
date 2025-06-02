
'use server';
/**
 * @fileOverview Enhances the depth of existing blog content.
 *
 * - depthBoostBlogContent - A function that enhances blog content depth.
 * - DepthBoostBlogContentInput - The input type for the function.
 * - DepthBoostBlogContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const DepthBoostBlogContentInputSchema = z.object({
  blogContent: z.string().describe('The current content of the blog post in Markdown format.'),
  topic: z.string().describe('The main topic of the blog post for context.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic).'),
});
export type DepthBoostBlogContentInput = z.infer<typeof DepthBoostBlogContentInputSchema>;

const DepthBoostBlogContentOutputSchema = z.object({
  boostedContent: z.string().describe('The blog content with enhanced depth, in Markdown format.'),
});
export type DepthBoostBlogContentOutput = z.infer<typeof DepthBoostBlogContentOutputSchema>;

export async function depthBoostBlogContent(input: DepthBoostBlogContentInput): Promise<DepthBoostBlogContentOutput> {
  return depthBoostBlogContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'depthBoostBlogContentPrompt',
  input: {schema: DepthBoostBlogContentInputSchema},
  output: {schema: DepthBoostBlogContentOutputSchema},
  prompt: `You are an expert blog editor specializing in adding depth and insight.
Context:
- Blog Topic: {{{topic}}}
- Desired Tone: {{{tone}}}
- Desired Style: {{{style}}}

Current Blog Content (Markdown):
{{{blogContent}}}

Please review the current blog content and rewrite it to:
- Enhance its depth by adding more detailed explanations, technical insights, advanced concepts, or nuanced perspectives.
- Explore underlying principles or implications related to the topic.
- Ensure the new, deeper content is well-integrated and maintains the specified tone and style.
- Maintain the original core message and overall structure where possible, augmenting sections with deeper information.
- The output should be the full blog post with boosted depth, in Markdown format.
`,
});

const depthBoostBlogContentFlow = ai.defineFlow(
  {
    name: 'depthBoostBlogContentFlow',
    inputSchema: DepthBoostBlogContentInputSchema,
    outputSchema: DepthBoostBlogContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.boostedContent) {
      // Fallback in case AI returns empty or malformed output
      return { boostedContent: `Failed to boost depth. Original:\n\n${input.blogContent}` };
    }
    return output;
  }
);
