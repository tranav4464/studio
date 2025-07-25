
"use server";

import { generateHeroImage, type GenerateHeroImageInput, type GenerateHeroImageOutput } from '@/ai/flows/generate-hero-image';
import { repurposeContent, type RepurposeContentInput, type RepurposeContentOutput } from '@/ai/flows/repurpose-content';
import { generateBlogOutline, type GenerateBlogOutlineInput, type GenerateBlogOutlineOutput } from '@/ai/flows/generate-blog-outline-flow';
import { generateFullBlog, type GenerateFullBlogInput, type GenerateFullBlogOutput } from '@/ai/flows/generate-full-blog-flow';
import { improveBlogContent, type ImproveBlogContentInput, type ImproveBlogContentOutput } from '@/ai/flows/improve-blog-content-flow';
import { simplifyBlogContent, type SimplifyBlogContentInput, type SimplifyBlogContentOutput } from '@/ai/flows/simplify-blog-content-flow';
import { expandBlogContent, type ExpandBlogContentInput, type ExpandBlogContentOutput } from '@/ai/flows/expand-blog-content-flow';
import { depthBoostBlogContent, type DepthBoostBlogContentInput, type DepthBoostBlogContentOutput } from '@/ai/flows/depth-boost-blog-content-flow';
import { suggestVisualization, type SuggestVisualizationInput, type SuggestVisualizationOutput } from '@/ai/flows/suggest-visualization-flow';
import { generateMetaTitle, type GenerateMetaTitleInput, type GenerateMetaTitleOutput } from '@/ai/flows/generate-meta-title-flow';
import { generateMetaDescription, type GenerateMetaDescriptionInput, type GenerateMetaDescriptionOutput } from '@/ai/flows/generate-meta-description-flow';
import { generateBlogTitleSuggestion, type GenerateBlogTitleSuggestionInput, type GenerateBlogTitleSuggestionOutput } from '@/ai/flows/generate-blog-title-suggestion-flow';
import { analyzeBlogSeo, type AnalyzeBlogSeoInput, type AnalyzeBlogSeoOutput } from '@/ai/flows/analyze-blog-seo-flow';
import { generateImagePromptHelper, type GenerateImagePromptHelperInput, type GenerateImagePromptHelperOutput } from '@/ai/flows/generate-image-prompt-helper-flow';
import { generateTopicIdeas, type GenerateTopicIdeasInput, type GenerateTopicIdeasOutput } from '@/ai/flows/generate-topic-ideas-flow';
import { summarizeReferenceText, type SummarizeReferenceTextInput, type SummarizeReferenceTextOutput } from '@/ai/flows/summarize-reference-text-flow';


export async function generateTopicIdeasAction(input: GenerateTopicIdeasInput): Promise<GenerateTopicIdeasOutput> {
  try {
    const result = await generateTopicIdeas(input);
    if (!result.ideas || result.ideas.length === 0) {
        return { ideas: [`No ideas found for: ${input.keywords}`] };
    }
    return result;
  } catch (error) {
    console.error("Error generating topic ideas:", error);
    return { ideas: [`Error fetching ideas for: ${input.keywords}`] };
  }
}

// User-initiated hero image generation
export async function generateHeroImageAction(input: GenerateHeroImageInput): Promise<GenerateHeroImageOutput> {
  try {
    // Input now contains imagePrompt, tone, theme
    const result = await generateHeroImage(input); 
    
    if (!result.imageUrls || result.imageUrls.length === 0) {
      console.warn("AI did not return any image URLs. Input:", input, "Output:", result);
      return { imageUrls: [`https://placehold.co/800x400.png`] };
    }
    return result;
  } catch (error) {
    console.error("Error generating hero image:", error);
    return { imageUrls: [`https://placehold.co/800x400.png`] };
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
      tweetThread: ["Error: Could not generate Tweet thread."],
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
  console.log("generateFullBlogAction called with topic:", input.topic, "outline sections:", input.outline.length, "persona:", input.persona);
  try {
    const result = await generateFullBlog(input);
    if (!result.blogContent) {
      console.warn("generateFullBlog flow returned a result but blogContent was unexpectedly empty. Input:", input);
      return { blogContent: `# ${input.topic}\n\n## Generation Error\n\n**Critical Error:** AI failed to generate blog content due to an unexpected issue in the generation flow. Please check server logs and try again. If the problem persists, consider simplifying the topic or outline.` };
    }
    return result;
  } catch (error: any) {
    console.error("generateFullBlogAction caught an error:", error.message, error.stack, error); 
    let errorMessage = "An unexpected error occurred while generating the blog content. Please check server logs for details and try again.";
    if (error.message) {
      errorMessage = `Error: ${error.message}. Please check server logs and try again or write manually.`;
    }
    return { 
      blogContent: (
`# Error Generating Blog: ${input.topic}

## Content Generation Failed

**We encountered a problem trying to generate the blog post.**

**Details:**
${errorMessage}

**What to do next:**
1.  Check the server console/logs for specific error messages from the AI.
2.  Ensure your API key is correctly configured and has the necessary permissions.
3.  Try simplifying your blog topic or outline, or adjust audience parameters.
4.  Check your network connection.
5.  You can manually write the content in the editor.

We apologize for the inconvenience.
`
      )
    };
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

export async function expandBlogContentAction(input: ExpandBlogContentInput): Promise<ExpandBlogContentOutput> {
  console.log("expandBlogContentAction called for topic:", input.topic);
  try {
    const result = await expandBlogContent(input);
    if (!result.expandedContent) {
      return { expandedContent: `Error: AI failed to expand blog content. Original content preserved.\n\n${input.blogContent}` };
    }
    return result;
  } catch (error) {
    console.error("Error expanding blog content:", error);
    return { expandedContent: `An error occurred while expanding the blog content. Original content preserved.\n\n${input.blogContent}` };
  }
}

export async function depthBoostBlogContentAction(input: DepthBoostBlogContentInput): Promise<DepthBoostBlogContentOutput> {
  console.log("depthBoostBlogContentAction called for topic:", input.topic);
  try {
    const result = await depthBoostBlogContent(input);
    if (!result.boostedContent) {
      return { boostedContent: `Error: AI failed to boost depth of blog content. Original content preserved.\n\n${input.blogContent}` };
    }
    return result;
  } catch (error) {
    console.error("Error boosting depth of blog content:", error);
    return { boostedContent: `An error occurred while boosting depth of the blog content. Original content preserved.\n\n${input.blogContent}` };
  }
}

export async function suggestVisualizationAction(input: SuggestVisualizationInput): Promise<SuggestVisualizationOutput> {
  console.log("suggestVisualizationAction called for topic:", input.topic);
  try {
    const result = await suggestVisualization(input);
    if (!result.suggestedVisualDescription) {
      return { 
        sectionToVisualize: "Content Analysis",
        suggestedVisualDescription: "Error: AI failed to suggest a visualization.",
      };
    }
    return result;
  } catch (error) {
    console.error("Error suggesting visualization:", error);
    return { 
      sectionToVisualize: "Error State",
      suggestedVisualDescription: "An error occurred while suggesting a visualization.",
    };
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
      return { suggestedMetaTitle: `Meta Title Error for: ${input.blogTitle.substring(0,40)}` };
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

export async function summarizeReferenceTextAction(input: SummarizeReferenceTextInput): Promise<SummarizeReferenceTextOutput> {
  console.log("summarizeReferenceTextAction called.");
  try {
    const result = await summarizeReferenceText(input);
    if (!result.keyPoints || result.keyPoints.length === 0) {
      return { keyPoints: ["AI could not extract key points from the provided text."] };
    }
    return result;
  } catch (error) {
    console.error("Error summarizing reference text:", error);
    return { keyPoints: ["An error occurred while summarizing the reference text."] };
  }
}
