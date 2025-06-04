
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
import type { Persona, ExpertiseLevel, Intent } from '@/types'; // Import new types

// Define enums for Zod validation if not already globally available for Zod
const PersonaEnum = z.enum(["General Audience", "Developers", "Marketing Managers", "Executives"]);
const ExpertiseLevelEnum = z.enum(["Beginner", "Intermediate", "Advanced"]);
const IntentEnum = z.enum(["Inform", "Convert", "Entertain"]);


const GenerateBlogOutlineInputSchema = z.object({
  topic: z.string().describe('The main topic of the blog post.'),
  tone: z.string().describe('The desired tone for the blog post (e.g., formal, casual, informative).'),
  style: z.string().describe('The desired writing style (e.g., academic, journalistic, storytelling).'),
  length: z.string().describe('The desired length of the blog post (e.g., short, medium, long).'),
  referenceText: z.string().optional().describe('Optional reference text or notes to guide the outline generation.'),
  persona: PersonaEnum.optional().describe('The target audience persona (e.g., Developers, Marketing Managers).'),
  expertiseLevel: ExpertiseLevelEnum.optional().describe('The expertise level of the target audience (e.g., Beginner, Advanced).'),
  intent: IntentEnum.optional().describe('The primary goal of the blog post (e.g., Inform, Convert).'),
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
{{#if persona}}- Target Persona: {{{persona}}}{{/if}}
{{#if expertiseLevel}}- Expertise Level: {{{expertiseLevel}}}{{/if}}
{{#if intent}}- Content Intent: {{{intent}}}{{/if}}
{{#if referenceText}}- Reference Material: {{{referenceText}}}{{/if}}

Generate a concise, logical, and comprehensive blog post outline. The outline should consist of 5-7 main sections or headings that would form a well-structured {{length}} blog post.
Consider the target persona, their expertise level, and the content intent when crafting the outline.
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
      return { outline: [`Introduction to ${input.topic}`, `Exploring ${input.topic} for ${input.persona || 'a general audience'}`, `Key aspects of ${input.topic}`, `Challenges related to ${input.topic}`, `Conclusion on ${input.topic}`] };
    }
    return output;
  }
);
