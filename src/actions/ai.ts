
"use server";

import { generateHeroImage, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { repurposeContent, type RepurposeContentInput, type RepurposeContentOutput } from '@/ai/flows/repurpose-content';
import { generateBlogOutline, type GenerateBlogOutlineInput, type GenerateBlogOutlineOutput } from '@/ai/flows/generate-blog-outline-flow';
import { generateFullBlog, type GenerateFullBlogInput, type GenerateFullBlogOutput } from '@/ai/flows/generate-full-blog-flow';
import { improveBlogContent, type ImproveBlogContentInput, type ImproveBlogContentOutput } from '@/ai/flows/improve-blog-content-flow';
import { simplifyBlogContent, type SimplifyBlogContentInput, type SimplifyBlogContentOutput } from '@/ai/flows/simplify-blog-content-flow';
import { generateMetaTitle, type GenerateMetaTitleInput, type GenerateMetaTitleOutput } from '@/ai/flows/generate-meta-title-flow';
import { generateMetaDescription, type GenerateMetaDescriptionInput, type GenerateMetaDescriptionOutput } from '@/ai/flows/generate-meta-description-flow';

export async function generateHeroImageAction(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  try {
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay for UX
    const result = await repurposeContent(input);
    return result;
  } catch (error) {
    console.error("Error repurposing content:", error);
    // Provide a structured error response matching the expected output type
    return {
      tweetThread: "Error: Could not generate Tweet thread.",
      linkedInPost: "Error: Could not generate LinkedIn post.",
      instagramPost: "Error: Could not generate Instagram post.",
      emailNewsletterSummary: "Error: Could not generate email summary."
    };
  }
}

export async function generateBlogOutlineAction(input: GenerateBlogOutlineInput): Promise<GenerateBlogOutlineOutput> {
  try {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const result = await generateBlogOutline(input);
    if (!result.outline || result.outline.length === 0) {
        return { outline: [`Introduction to ${input.topic}`, `Exploring ${input.topic}`, `Conclusion on ${input.topic}`] };
    }
    return result;
  } catch (error) {
    console.error("Error generating blog outline:", error);
    return { outline: [`Failed to generate outline for ${input.topic}`, `Please try again or manually create sections.`] };
  }
}

export async function generateFullBlogAction(input: GenerateFullBlogInput): Promise<GenerateFullBlogOutput> {
  console.log("generateFullBlogAction called with:", input);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = await generateFullBlog(input);
    if (!result.blogContent) {
      return { blogContent: `# ${input.topic}\n\nError: AI failed to generate blog content. Please try again.` };
    }
    return result;
  } catch (error) {
    console.error("Error generating full blog:", error);
    return { blogContent: `# ${input.topic}\n\nAn error occurred while generating the blog content. Please try again or write manually.` };
  }
}

export async function improveBlogContentAction(input: ImproveBlogContentInput): Promise<ImproveBlogContentOutput> {
  console.log("improveBlogContentAction called for topic:", input.topic);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
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

export async function simplifyBlogContentAction(input: SimplifyBlogContentInput): Promise<SimplifyBlogContentOutput> {
  console.log("simplifyBlogContentAction called for topic:", input.topic);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = await simplifyBlogContent(input);
    if (!result.simplifiedContent) {
      return { simplifiedContent: `Error: AI failed to simplify blog content. Original content preserved.\n\n${input.blogContent}` };
    }
    return result;
  } catch (error) {
    console.error("Error simplifying blog content:", error);
    return { simplifiedContent: `An error occurred while simplifying the blog content. Original content preserved.\n\n${input.blogContent}` };
  }
}

// Action for suggesting a blog title (main title, not meta) - kept as mock for now
export async function generateBlogTitleSuggestionAction(params: { currentContent: string; originalTopic: string }): Promise<{ suggestedTitle: string }> {
  console.log("Mock generateBlogTitleSuggestionAction called with:", params.originalTopic, params.currentContent.substring(0,50) + "...");
  await new Promise(resolve => setTimeout(resolve, 1200)); 
  return { suggestedTitle: `AI Suggested Title for: ${params.originalTopic}` };
}

// Real action for generating a meta title
export async function generateMetaTitleAction(input: GenerateMetaTitleInput): Promise<GenerateMetaTitleOutput> {
  console.log("generateMetaTitleAction called for blog title:", input.blogTitle);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay for UX
    const result = await generateMetaTitle(input);
    if (!result.suggestedMetaTitle) {
      return { suggestedMetaTitle: `Meta Title Error for: ${input.blogTitle.substring(0,30)}` };
    }
    return result;
  } catch (error) {
    console.error("Error generating meta title:", error);
    return { suggestedMetaTitle: `Error: Could not suggest meta title for "${input.blogTitle.substring(0,30)}"` };
  }
}

// Real action for generating a meta description
export async function generateMetaDescriptionAction(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  console.log("generateMetaDescriptionAction called for blog title:", input.blogTitle);
  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay for UX
    const result = await generateMetaDescription(input);
    if (!result.suggestedMetaDescription) {
      return { suggestedMetaDescription: `Meta description generation failed for "${input.blogTitle.substring(0,30)}". Please try again.` };
    }
    return result;
  } catch (error) {
    console.error("Error generating meta description:", error);
    return { suggestedMetaDescription: `Error: Could not suggest meta description for "${input.blogTitle.substring(0,30)}".` };
  }
}
