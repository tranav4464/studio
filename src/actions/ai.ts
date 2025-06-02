
"use server";

import { generateHeroImage, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { repurposeContent, type RepurposeContentInput, type RepurposeContentOutput } from '@/ai/flows/repurpose-content';
import { generateBlogOutline, type GenerateBlogOutlineInput, type GenerateBlogOutlineOutput } from '@/ai/flows/generate-blog-outline-flow';
import { generateFullBlog, type GenerateFullBlogInput, type GenerateFullBlogOutput } from '@/ai/flows/generate-full-blog-flow';
import { improveBlogContent, type ImproveBlogContentInput, type ImproveBlogContentOutput } from '@/ai/flows/improve-blog-content-flow';
import { simplifyBlogContent, type SimplifyBlogContentInput, type SimplifyBlogContentOutput } from '@/ai/flows/simplify-blog-content-flow';
import { generateMetaTitle, type GenerateMetaTitleInput, type GenerateMetaTitleOutput } from '@/ai/flows/generate-meta-title-flow';
import { generateMetaDescription, type GenerateMetaDescriptionInput, type GenerateMetaDescriptionOutput } from '@/ai/flows/generate-meta-description-flow';
import { generateBlogTitleSuggestion, type GenerateBlogTitleSuggestionInput, type GenerateBlogTitleSuggestionOutput } from '@/ai/flows/generate-blog-title-suggestion-flow';

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
    const result = await repurposeContent(input);
    return result;
  } catch (error) {
    console.error("Error repurposing content:", error);
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

export async function generateBlogTitleSuggestionAction(input: GenerateBlogTitleSuggestionInput): Promise<GenerateBlogTitleSuggestionOutput> {
  console.log("generateBlogTitleSuggestionAction called for topic:", input.originalTopic);
  try {
    const result = await generateBlogTitleSuggestion(input);
    if (!result.suggestedTitle) {
      return { suggestedTitle: `Title Suggestion Error for: ${input.originalTopic.substring(0,30)}` };
    }
    return result;
  } catch (error) {
    console.error("Error generating blog title suggestion:", error);
    return { suggestedTitle: `Error: Could not suggest title for "${input.originalTopic.substring(0,30)}"` };
  }
}

export async function generateMetaTitleAction(input: GenerateMetaTitleInput): Promise<GenerateMetaTitleOutput> {
  console.log("generateMetaTitleAction called for blog title:", input.blogTitle);
  try {
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

export async function generateMetaDescriptionAction(input: GenerateMetaDescriptionInput): Promise<GenerateMetaDescriptionOutput> {
  console.log("generateMetaDescriptionAction called for blog title:", input.blogTitle);
  try {
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
