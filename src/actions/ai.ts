
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
import { analyzeBlogSeo, type AnalyzeBlogSeoInput, type AnalyzeBlogSeoOutput } from '@/ai/flows/analyze-blog-seo-flow';
import { generateImageGenerationPrompt, type GenerateImageGenerationPromptInput, type GenerateImageGenerationPromptOutput } from '@/ai/flows/generate-image-generation-prompt-flow';
import { generateImagePromptHelper, type GenerateImagePromptHelperInput, type GenerateImagePromptHelperOutput } from '@/ai/flows/generate-image-prompt-helper-flow';


// User-initiated hero image generation
export async function generateHeroImageAction(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  try {
    // Input now contains imagePrompt, tone, theme
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

// Automatic initial hero image generation
export interface GenerateInitialHeroImageActionInput {
  blogTitle: string;
  blogTopic: string;
  blogTone: string;
  blogStyle: string;
  heroImageTheme?: string; // Optional theme for initial generation
}

export async function generateInitialHeroImageAction(input: GenerateInitialHeroImageActionInput): Promise<GenerateHeroImageOutput> {
  try {
    // 1. Generate a detailed prompt
    const promptResult = await generateImageGenerationPrompt({
      blogTitle: input.blogTitle,
      blogTopic: input.blogTopic,
      blogTone: input.blogTone,
      blogStyle: input.blogStyle,
    });

    if (!promptResult.detailedImagePrompt) {
      console.warn("Failed to generate a detailed image prompt.");
      return { imageUrls: [`https://placehold.co/800x400.png?text=Prompt+Gen+Failed`] };
    }

    // 2. Generate image using the detailed prompt
    const imageResult = await generateHeroImage({
      imagePrompt: promptResult.detailedImagePrompt,
      tone: input.blogTone, // Pass original tone, can be used by image gen if needed
      theme: input.heroImageTheme || 'General', // Use provided theme or default
    });

    if (!imageResult.imageUrls || imageResult.imageUrls.length === 0) {
      console.warn("AI did not return any image URLs for initial generation. Detailed Prompt:", promptResult.detailedImagePrompt, "Output:", imageResult);
      return { imageUrls: [`https://placehold.co/800x400.png?text=Auto+Image+Failed`] };
    }
    return imageResult;

  } catch (error) {
    console.error("Error in initial hero image generation:", error);
    return { imageUrls: [`https://placehold.co/800x400.png?text=Auto+Image+Error`] };
  }
}

export async function generateImagePromptHelperAction(input: GenerateImagePromptHelperInput): Promise<GenerateImagePromptHelperOutput> {
  try {
    const result = await generateImagePromptHelper(input);
    if (!result.suggestedDetailedPrompt) {
        return { suggestedDetailedPrompt: `Error: AI failed to generate a prompt suggestion based on keywords: ${input.keywords}.` };
    }
    return result;
  } catch (error) {
    console.error("Error generating image prompt suggestion:", error);
    return { suggestedDetailedPrompt: `An error occurred while generating the prompt suggestion for keywords: ${input.keywords}.` };
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

export async function analyzeBlogSeoAction(input: AnalyzeBlogSeoInput): Promise<AnalyzeBlogSeoOutput> {
  console.log("analyzeBlogSeoAction called for blog title:", input.blogTitle);
  try {
    const result = await analyzeBlogSeo(input);
    return result; 
  } catch (error: any) {
    console.error("Error analyzing blog SEO:", error);
    return {
      overallSeoScore: 5,
      readabilityScore: 10,
      keywordRelevanceScore: 5,
      suggestedMetaTitle: `Critial Error: SEO Analysis failed for "${input.blogTitle.substring(0, 25)}"`,
      suggestedMetaDescription: "Critical Error: SEO Analysis failed. Please try again or check server logs.",
      suggestedUrlSlug: "analysis-critical-error",
      primaryKeywordAnalysis: {
        suggestedKeywords: ["critical error"],
        densityFeedback: "Critical error during analysis.",
        placementFeedback: "Critical error during analysis."
      },
      secondaryKeywordSuggestions: ["critical analysis error"],
      readabilityFeedback: "Critical Error: Could not analyze readability due to system error.",
      contentStructureFeedback: "Critical Error: Could not analyze content structure due to system error.",
      actionableRecommendations: ["Critical SEO analysis failed. Contact support if issue persists."],
    };
  }
}

