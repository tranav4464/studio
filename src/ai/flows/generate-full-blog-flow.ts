
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
import type { Persona, ExpertiseLevel, Intent } from '@/types'; // Import new types

// Define enums for Zod validation if not already globally available for Zod
const PersonaEnum = z.enum(["General Audience", "Developers", "Marketing Managers", "Executives"]);
const ExpertiseLevelEnum = z.enum(["Beginner", "Intermediate", "Advanced"]);
const IntentEnum = z.enum(["Inform", "Convert", "Entertain", "Engage", "Educate"]);

const GenerateFullBlogInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual, informative).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic, storytelling).'),
  length: z.string().describe('The desired length of the blog post (e.g., short, medium, long).'),
  outline: z.array(z.string().describe('A main section or heading from the blog post outline.')).describe('The structured outline for the blog post.'),
  referenceText: z.string().optional().describe('Optional reference text or notes to guide the blog post generation.'),
  persona: PersonaEnum.optional().describe('The target audience persona (e.g., Developers, Marketing Managers).'),
  expertiseLevel: ExpertiseLevelEnum.optional().describe('The expertise level of the target audience (e.g., Beginner, Advanced).'),
  intent: IntentEnum.optional().describe('The primary goal of the blog post (e.g., Inform, Convert, Engage, Educate).'),
  customInstructions: z.string().optional().describe('Specific instructions for the AI for full blog generation (e.g., focus on specific examples, maintain a particular narrative).'),
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
{{#if persona}}- Target Persona: {{{persona}}}{{/if}}
{{#if expertiseLevel}}- Expertise Level: {{{expertiseLevel}}}{{/if}}
{{#if intent}}- Content Intent: {{{intent}}}
  {{#if (eq intent "Inform")}}(Ensure the content is factual, clear, and answers key questions like who, what, when, where, why, and how. Structure for easy understanding and comprehensive coverage.){{/if}}
  {{#if (eq intent "Convert")}}(Craft persuasive content that guides the reader towards a specific action. Emphasize benefits, address potential concerns, and include or lead into strong calls-to-action.){{/if}}
  {{#if (eq intent "Entertain")}}(Create an enjoyable reading experience. Use storytelling, humor, vivid descriptions, or engaging narratives as appropriate for the topic and tone.){{/if}}
  {{#if (eq intent "Engage")}}(Foster reader interaction. Consider incorporating questions, discussion points, or calls for comments/shares naturally within the content.){{/if}}
  {{#if (eq intent "Educate")}}(Provide clear, structured instruction. Break down complex topics, explain concepts thoroughly, and offer actionable steps or learning takeaways. Aim to teach the reader something specific.){{/if}}
{{/if}}
{{#if referenceText}}- General Reference Material (use for context if no specific instructions contradict): {{{referenceText}}}{{/if}}
{{#if customInstructions}}- Specific Instructions for this post: {{{customInstructions}}}{{/if}}

And the following outline:
{{#each outline}}
- {{{this}}}
{{/each}}

Please write a comprehensive and engaging {{length}} blog post.
The post should follow the provided outline, using each outline item as a major heading or section (e.g., using H2 or H3 Markdown for headings).
Tailor the language, depth, and examples to the specified Target Persona and their Expertise Level.
Ensure the content aligns with the Content Intent.
Ensure the content flows logically, adheres to the specified tone and style, and thoroughly covers the topic.
If 'Specific Instructions' are provided, prioritize them.
The output should be a single string containing the full blog post in Markdown format.
Start directly with the content, for example, if the first outline item is "Introduction", start with "## Introduction".
`,
  config: { 
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
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
      let fallbackContent = `# ${input.topic}\n\n## Introduction\nFailed to generate AI content for this section for ${input.persona || 'general audience'} with intent to ${input.intent || 'inform'}. Please write manually.\n\n`;
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

