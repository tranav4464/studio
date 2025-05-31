
'use server';

/**
 * @fileOverview A content repurposing AI agent.
 *
 * - repurposeContent - A function that handles the content repurposing process.
 * - RepurposeContentInput - The input type for the repurposeContent function.
 * - RepurposeContentOutput - The return type for the repurposeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepurposeContentInputSchema = z.object({
  article: z.string().describe('The main article content to repurpose.'),
  tone: z.string().describe('The desired tone for the repurposed content (e.g., professional, witty, informative).'),
});
export type RepurposeContentInput = z.infer<typeof RepurposeContentInputSchema>;

const RepurposeContentOutputSchema = z.object({
  tweetThread: z.string().describe('A concise and engaging tweet thread (2-5 tweets) generated from the article, suitable for Twitter. Each tweet should be clearly separated if possible (e.g. by "--- TWEET ---" or similar, or just numbered).'),
  linkedInPost: z.string().describe('A professional LinkedIn post generated from the article, adapted to the specified tone, suitable for sharing with a business audience. Include relevant hashtags.'),
  instagramPost: z.string().describe('An engaging Instagram post caption generated from the article, optimized for visual storytelling and including relevant hashtags. Keep it concise and compelling for Instagram\'s format.'),
  emailNewsletterSummary: z
    .string()
    .describe('A concise email newsletter summary generated from the article, suitable for including in an email update. It should capture the key takeaways and encourage clicks to the full article.'),
});
export type RepurposeContentOutput = z.infer<typeof RepurposeContentOutputSchema>;

export async function repurposeContent(input: RepurposeContentInput): Promise<RepurposeContentOutput> {
  return repurposeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repurposeContentPrompt',
  input: {schema: RepurposeContentInputSchema},
  output: {schema: RepurposeContentOutputSchema},
  prompt: `You are an expert content repurposing AI.
Your task is to adapt the provided article into different formats suitable for various social media platforms and an email newsletter, while strictly adhering to the specified tone.

Original Article Content:
{{{article}}}

Desired Tone for all Repurposed Content: {{{tone}}}

Please generate the following distinct pieces of content based *only* on the article and tone provided:

1.  **Tweet Thread:** A short, engaging thread (2-5 tweets) that summarizes key points from the article. Ensure it's formatted appropriately for Twitter.
2.  **LinkedIn Post:** A professional post for LinkedIn that discusses the article's main themes. Include relevant hashtags.
3.  **Instagram Post Caption:** A compelling caption for an Instagram post. Make it visually descriptive if appropriate and include relevant hashtags.
4.  **Email Newsletter Summary:** A brief summary for an email newsletter, highlighting the article's value and encouraging readers to view the full piece.

Ensure each generated piece of content is unique and specifically tailored for its platform. Do not add any extra commentary or introductions outside of the requested content.
`,
});

const repurposeContentFlow = ai.defineFlow(
  {
    name: 'repurposeContentFlow',
    inputSchema: RepurposeContentInputSchema,
    outputSchema: RepurposeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if AI returns no output
      return {
        tweetThread: "Error: Could not generate Tweet thread from article.",
        linkedInPost: `Error: Could not generate LinkedIn post for article titled (related to): ${input.article.substring(0,30)}...`,
        instagramPost: `Error: Could not generate Instagram caption for article (related to): ${input.article.substring(0,30)}...`,
        emailNewsletterSummary: `Error: Could not generate email summary for article (related to): ${input.article.substring(0,30)}...`,
      };
    }
    // Ensure all fields are present, even if empty, to match schema
    return {
        tweetThread: output.tweetThread || "AI failed to generate Tweet thread.",
        linkedInPost: output.linkedInPost || "AI failed to generate LinkedIn post.",
        instagramPost: output.instagramPost || "AI failed to generate Instagram post.",
        emailNewsletterSummary: output.emailNewsletterSummary || "AI failed to generate email summary."
    };
  }
);

