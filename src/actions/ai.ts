
"use server";

import { generateHeroImage, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { repurposeContent, type RepurposeContentInput, type RepurposeContentOutput } from '@/ai/flows/repurpose-content';
import { generateBlogOutline, type GenerateBlogOutlineInput, type GenerateBlogOutlineOutput } from '@/ai/flows/generate-blog-outline-flow';

export async function generateHeroImageAction(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  try {
    // Add a small delay to simulate network latency for better UX feedback
    // For actual streaming or progress updates, Genkit's streaming capabilities would be used.
    // The flow itself can use streamingCallback for intermediate updates if needed.
    const result = await generateHeroImage(input);
    
    if (!result.imageUrls || result.imageUrls.length === 0) {
      console.warn("AI did not return any image URLs. Input:", input, "Output:", result);
      return { imageUrls: [`https://placehold.co/800x400.png?text=Image+Generation+Failed`] };
    }
    return result;
  } catch (error) {
    console.error("Error generating hero image:", error);
    return { imageUrls: [`https://placehold.co/800x400.png?text=Error+Generating+Images`] };
  }
}

export async function repurposeContentAction(input: RepurposeContentInput): Promise<RepurposeContentOutput> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await repurposeContent(input);
    return result;
  } catch (error) {
    console.error("Error repurposing content:", error);
    throw new Error("Failed to repurpose content. Please try again.");
  }
}

export async function generateBlogOutlineAction(input: GenerateBlogOutlineInput): Promise<GenerateBlogOutlineOutput> {
  try {
    // Simulate a short delay for UX, Genkit itself handles the AI call.
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const result = await generateBlogOutline(input);
    if (!result.outline || result.outline.length === 0) {
        // This case should ideally be handled within the flow's fallback,
        // but as an extra safety net:
        return { outline: [`Introduction to ${input.topic}`, `Exploring ${input.topic}`, `Conclusion on ${input.topic}`] };
    }
    return result;
  } catch (error) {
    console.error("Error generating blog outline:", error);
    // Provide a generic fallback outline on error
    return { outline: [`Failed to generate outline for ${input.topic}`, `Please try again or manually create sections.`] };
  }
}


// Mock action for blog generation
export async function generateFullBlogAction(params: { topic: string, outline: string[], tone: string, style: string, length: string }): Promise<{ content: string }> {
  console.log("Mock generateFullBlogAction called with:", params);
  await new Promise(resolve => setTimeout(resolve, 2000)); 
  
  const generatedContent = `
# ${params.topic} - A ${params.style} take with a ${params.tone} tone (${params.length})

## Introduction
This is an AI generated blog post about ${params.topic}. The chosen tone is ${params.tone}, style is ${params.style}, and preferred length is ${params.length}.

${params.outline.map(item => `### ${item}\nSome placeholder content for this section. We should elaborate on this point with relevant details, examples, and insights to create a comprehensive and engaging piece for the readers. This part is crucial for developing the core message related to '${item}'.\n`).join('\n')}

## Conclusion
This concludes our ${params.length} exploration of ${params.topic}. We hope this provides valuable insights and encourages further discussion.
  `;
  return { content: generatedContent };
}


// Mock action for suggesting a blog title
export async function generateBlogTitleSuggestionAction(params: { currentContent: string; originalTopic: string }): Promise<{ suggestedTitle: string }> {
  console.log("Mock generateBlogTitleSuggestionAction called with:", params.originalTopic, params.currentContent.substring(0,50) + "...");
  await new Promise(resolve => setTimeout(resolve, 1200)); 
  return { suggestedTitle: `AI Suggested Title for: ${params.originalTopic}` };
}

// Mock action for generating a meta title
export async function generateMetaTitleAction(params: { blogTitle: string; blogContent: string }): Promise<{ suggestedMetaTitle: string }> {
  console.log("Mock generateMetaTitleAction called with:", params.blogTitle, params.blogContent.substring(0,50) + "...");
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  return { suggestedMetaTitle: `Meta Title: ${params.blogTitle} | AI Optimized` };
}

// Mock action for generating a meta description
export async function generateMetaDescriptionAction(params: { blogTitle: string; blogContent: string }): Promise<{ suggestedMetaDescription: string }> {
  console.log("Mock generateMetaDescriptionAction called with:", params.blogTitle, params.blogContent.substring(0,50) + "...");
  await new Promise(resolve => setTimeout(resolve, 1500)); 
  return { suggestedMetaDescription: `This is an AI-generated meta description for the blog post titled "${params.blogTitle}". It summarizes the key points from the content.` };
}
