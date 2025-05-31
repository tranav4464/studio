
"use server";

import { generateHeroImage, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { repurposeContent, type RepurposeContentInput, type RepurposeContentOutput } from '@/ai/flows/repurpose-content';
import { generateBlogOutline, type GenerateBlogOutlineInput, type GenerateBlogOutlineOutput } from '@/ai/flows/generate-blog-outline-flow';
import { generateFullBlog, type GenerateFullBlogInput, type GenerateFullBlogOutput } from '@/ai/flows/generate-full-blog-flow';
import { improveBlogContent, type ImproveBlogContentInput, type ImproveBlogContentOutput } from '@/ai/flows/improve-blog-content-flow'; // Import the new flow

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

export async function generateFullBlogAction(input: GenerateFullBlogInput): Promise<GenerateFullBlogOutput> {
  console.log("generateFullBlogAction called with:", input);
  try {
    // Simulate a short delay for UX, Genkit itself handles the AI call.
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = await generateFullBlog(input);
    if (!result.blogContent) {
      // Fallback, though the flow itself should handle this
      return { blogContent: `# ${input.topic}\n\nError: AI failed to generate blog content. Please try again.` };
    }
    return result;
  } catch (error) {
    console.error("Error generating full blog:", error);
    // Provide a generic fallback content on error
    return { blogContent: `# ${input.topic}\n\nAn error occurred while generating the blog content. Please try again or write manually.` };
  }
}

export async function improveBlogContentAction(input: ImproveBlogContentInput): Promise<ImproveBlogContentOutput> {
  console.log("improveBlogContentAction called for topic:", input.topic);
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    const result = await improveBlogContent(input);
    if (!result.improvedContent) {
      return { improvedContent: `Error: AI failed to improve blog content. Original content preserved.\n\n${input.blogContent}` };
    }
    return result;
  } catch (error) {
    console.error("Error improving blog content:", error);
    return { improvedContent: `An error occurred while improving the blog content. Original content preserved.\n\n${input.blogContent}` };
  }
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
