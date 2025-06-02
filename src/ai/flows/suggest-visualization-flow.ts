
'use server';
/**
 * @fileOverview Suggests a visualization for blog content.
 *
 * - suggestVisualization - A function that suggests a visual aid.
 * - SuggestVisualizationInput - The input type for the function.
 * - SuggestVisualizationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVisualizationInputSchema = z.object({
  blogContent: z.string().describe('The current content of the blog post in Markdown format.'),
  topic: z.string().describe('The main topic of the blog post for context.'),
});
export type SuggestVisualizationInput = z.infer<typeof SuggestVisualizationInputSchema>;

const SuggestVisualizationOutputSchema = z.object({
  sectionToVisualize: z.string().describe('A brief description of the section or concept in the content that would benefit from a visual.'),
  suggestedVisualDescription: z.string().describe('A detailed description of the suggested visual (e.g., "a bar chart comparing X and Y", "an infographic of the process"). This could serve as a prompt for an image generator.'),
  insertionMarkerText: z.string().optional().describe('A short, unique snippet of text (e.g., a sentence or part of a sentence) from the blog content AFTER which the visualization placeholder should be inserted. Make this snippet as unique as possible within the content.'),
});
export type SuggestVisualizationOutput = z.infer<typeof SuggestVisualizationOutputSchema>;

export async function suggestVisualization(input: SuggestVisualizationInput): Promise<SuggestVisualizationOutput> {
  return suggestVisualizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVisualizationPrompt',
  input: {schema: SuggestVisualizationInputSchema},
  output: {schema: SuggestVisualizationOutputSchema},
  prompt: `You are an expert content strategist. Analyze the following blog content and suggest a single, impactful visualization.
Blog Topic: {{{topic}}}
Blog Content (Markdown):
---
{{{blogContent}}}
---

Your task is to:
1. Identify one specific section or concept within the blog content that would be significantly enhanced by a visual aid (e.g., chart, diagram, infographic, illustrative image).
2. Describe the suggested visual in detail. This description should be good enough to guide a designer or to be used as a prompt for an AI image generator.
3. Identify a short, unique snippet of text (a sentence or a significant phrase, ideally 5-15 words) from the blog content. The visualization placeholder comment should be inserted *immediately after* this snippet. Choose a snippet that is unlikely to be repeated elsewhere in the document.

Provide your response according to the output schema.
If no specific visual seems highly beneficial, you can state that in the 'suggestedVisualDescription' and leave 'insertionMarkerText' empty.
`,
});

const suggestVisualizationFlow = ai.defineFlow(
  {
    name: 'suggestVisualizationFlow',
    inputSchema: SuggestVisualizationInputSchema,
    outputSchema: SuggestVisualizationOutputSchema,
  },
  async (input: SuggestVisualizationInput) => {
    // Truncate content if too long to prevent exceeding token limits, focusing on the start.
    const contentSnippet = input.blogContent.length > 6000
        ? input.blogContent.substring(0, 6000) + "\n...(Content Truncated for Analysis)..."
        : input.blogContent;

    const {output} = await prompt({
        ...input,
        blogContent: contentSnippet,
    });

    if (!output) {
      return {
        sectionToVisualize: "General content",
        suggestedVisualDescription: "No specific visualization suggested by AI. Consider adding a relevant stock photo.",
      };
    }
    return output;
  }
);
