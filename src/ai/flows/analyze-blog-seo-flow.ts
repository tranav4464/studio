
'use server';
/**
 * @fileOverview Analyzes blog content for SEO and provides recommendations.
 *
 * - analyzeBlogSeo - A function that performs SEO analysis.
 * - AnalyzeBlogSeoInput - The input type for the function.
 * - AnalyzeBlogSeoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBlogSeoInputSchema = z.object({
  blogTitle: z.string().describe('The title of the blog post.'),
  blogContent: z.string().describe('The full content of the blog post in Markdown format.'),
  primaryKeyword: z.string().optional().describe('The primary target keyword for the blog post. If not provided, AI will suggest some.'),
  // targetAudience: z.string().optional().describe('The target audience for the blog post.'), // Consider adding later
});
export type AnalyzeBlogSeoInput = z.infer<typeof AnalyzeBlogSeoInputSchema>;

const AnalyzeBlogSeoOutputSchema = z.object({
  overallSeoScore: z.number().min(0).max(100).describe("Overall SEO score from 0-100 based on various factors."),
  readabilityScore: z.number().min(0).max(100).describe("Flesch Reading Ease score (0-100, higher is easier)."),
  keywordRelevanceScore: z.number().min(0).max(100).describe("Keyword relevance/usage score (0-100). If no target keyword provided, this reflects topic focus strength."),
  suggestedMetaTitle: z.string().describe("Optimized meta title (aim for 50-60 characters)."),
  suggestedMetaDescription: z.string().describe("Optimized meta description (aim for 150-160 characters)."),
  suggestedUrlSlug: z.string().describe("SEO-friendly URL slug (short, keyword-rich, hyphenated)."),
  primaryKeywordAnalysis: z.object({
    providedKeyword: z.string().optional().describe("The primary keyword provided by the user, if any."),
    suggestedKeywords: z.array(z.string()).optional().describe("Suggested primary keywords if none was provided by the user (2-3 suggestions)."),
    densityFeedback: z.string().optional().describe("Feedback on the density of the primary keyword (e.g., 'Good', 'A bit low', 'Approx X%')."),
    placementFeedback: z.string().optional().describe("Feedback on the placement of the primary keyword (e.g., 'Found in title and H2s. Consider adding to first paragraph.')."),
  }).describe("Analysis related to the primary keyword."),
  secondaryKeywordSuggestions: z.array(z.string()).describe("Suggestions for 3-5 related LSI or secondary keywords."),
  readabilityFeedback: z.string().describe("Qualitative feedback on readability aspects like sentence length, passive voice, complex vocabulary, etc."),
  contentStructureFeedback: z.string().describe("Feedback on content structure, heading usage (H1-H6 hierarchy), paragraph length, and flow."),
  actionableRecommendations: z.array(z.string()).max(5).describe("A list of 3-5 top priority actionable recommendations to improve SEO."),
});
export type AnalyzeBlogSeoOutput = z.infer<typeof AnalyzeBlogSeoOutputSchema>;

export async function analyzeBlogSeo(input: AnalyzeBlogSeoInput): Promise<AnalyzeBlogSeoOutput> {
  return analyzeBlogSeoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBlogSeoPrompt',
  input: {schema: AnalyzeBlogSeoInputSchema},
  output: {schema: AnalyzeBlogSeoOutputSchema},
  prompt: `You are an expert SEO analyzer. Analyze the following blog content for SEO optimization.
Blog Title: {{{blogTitle}}}
Blog Content (Markdown):
---
{{{blogContent}}}
---
{{#if primaryKeyword}}Target Primary Keyword: {{{primaryKeyword}}}{{else}}Target Primary Keyword: Not provided. Please suggest 2-3 main keywords based on the title and content, and base your keyword-specific analysis on the most likely one.{{/if}}
Target Audience: General Audience

Word count of content is approximately: {{blogContent.length}} characters.

Provide a comprehensive SEO analysis structured according to the output schema.
Focus on actionable feedback. For scores (overall, readability, keyword relevance), provide a number between 0 and 100.
Meta title should be 50-60 characters. Meta description 150-160 characters.
URL slug should be short, hyphenated, and keyword-rich.
Primary keyword analysis should comment on density and placement if a keyword is provided; otherwise, suggest keywords.
Secondary keywords should be related and useful.
Readability feedback should highlight specific issues (long sentences, passive voice).
Content structure feedback should check H1 (should be one, matching title intent), H2-H6 hierarchy, and paragraph lengths.
Actionable recommendations should be the top 3-5 most impactful changes the user can make.
`,
});

const analyzeBlogSeoFlow = ai.defineFlow(
  {
    name: 'analyzeBlogSeoFlow',
    inputSchema: AnalyzeBlogSeoInputSchema,
    outputSchema: AnalyzeBlogSeoOutputSchema,
  },
  async (input: AnalyzeBlogSeoInput) => {
    // Truncate content if too long to prevent exceeding token limits, focusing on the start.
    const contentSnippet = input.blogContent.length > 8000
        ? input.blogContent.substring(0, 8000) + "\n...(Content Truncated for Analysis)..."
        : input.blogContent;

    const {output} = await prompt({
        ...input,
        blogContent: contentSnippet,
    });

    if (!output) {
      // Fallback in case AI returns empty or malformed output
      return {
        overallSeoScore: 10,
        readabilityScore: 20,
        keywordRelevanceScore: 15,
        suggestedMetaTitle: `Error: Could not generate meta title for "${input.blogTitle.substring(0, 30)}"`,
        suggestedMetaDescription: "Error: Could not generate meta description. Please try again.",
        suggestedUrlSlug: "error-generating-slug",
        primaryKeywordAnalysis: {
          suggestedKeywords: ["analysis error"],
          densityFeedback: "Could not analyze.",
          placementFeedback: "Could not analyze."
        },
        secondaryKeywordSuggestions: ["analysis error"],
        readabilityFeedback: "Could not analyze readability. Ensure content is substantial.",
        contentStructureFeedback: "Could not analyze content structure.",
        actionableRecommendations: ["SEO analysis failed. Please try again with sufficient content."],
      };
    }
    return output;
  }
);
