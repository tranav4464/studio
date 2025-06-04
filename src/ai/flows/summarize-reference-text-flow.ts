
'use server';
/**
 * @fileOverview Summarizes provided reference text into key points.
 *
 * - summarizeReferenceText - A function that extracts key points from text.
 * - SummarizeReferenceTextInput - The input type for the function.
 * - SummarizeReferenceTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReferenceTextInputSchema = z.object({
  textToSummarize: z.string().describe('The text content to be summarized.'),
});
export type SummarizeReferenceTextInput = z.infer<typeof SummarizeReferenceTextInputSchema>;

const SummarizeReferenceTextOutputSchema = z.object({
  keyPoints: z.array(z.string()).min(2).max(4).describe('An array of 2 to 4 concise key points extracted from the text. Each key point should be a short phrase or sentence.'),
});
export type SummarizeReferenceTextOutput = z.infer<typeof SummarizeReferenceTextOutputSchema>;

export async function summarizeReferenceText(input: SummarizeReferenceTextInput): Promise<SummarizeReferenceTextOutput> {
  return summarizeReferenceTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeReferenceTextPrompt',
  input: {schema: SummarizeReferenceTextInputSchema},
  output: {schema: SummarizeReferenceTextOutputSchema},
  prompt: `You are an expert summarizer. Your task is to analyze the provided text and extract 2 to 4 concise key points.
Each key point should be a short, impactful phrase or sentence that captures a core idea from the text.
Focus on the most important information.

Text to Summarize:
---
{{{textToSummarize}}}
---

Extract the key points.
`,
});

const summarizeReferenceTextFlow = ai.defineFlow(
  {
    name: 'summarizeReferenceTextFlow',
    inputSchema: SummarizeReferenceTextInputSchema,
    outputSchema: SummarizeReferenceTextOutputSchema,
  },
  async (input) => {
    // Truncate input if it's too long to prevent issues with token limits
    const snippet = input.textToSummarize.length > 4000 
        ? input.textToSummarize.substring(0, 4000) + "\n...(Text Truncated for Summarization)..." 
        : input.textToSummarize;

    const {output} = await prompt({ textToSummarize: snippet });
    
    if (!output || !output.keyPoints || output.keyPoints.length === 0) {
      // Fallback in case AI returns empty or malformed output
      return { keyPoints: [
        "Summary extraction failed for the provided text.",
        "Please ensure the text is clear and sufficiently long for summarization.",
      ] };
    }
    return output;
  }
);
