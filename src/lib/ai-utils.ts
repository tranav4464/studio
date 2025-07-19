import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API;
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-pro-latest';

// Initialize client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

type GenerationOptions = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
};

/**
 * Generate text using Gemini
 */
export async function generateText(
  prompt: string,
  options: GenerationOptions = {}
): Promise<string> {
  const {
    maxTokens = 2048,
    temperature = 0.7,
    topP = 0.9,
    topK = 40,
  } = options;

  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      topP,
      topK,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate multiple text completions
 */
export async function generateMultipleTexts(
  prompt: string,
  count: number = 3,
  options: GenerationOptions = {}
): Promise<string[]> {
  const results: string[] = [];
  const seen = new Set<string>();
  
  while (results.length < count) {
    try {
      const text = await generateText(prompt, options);
      
      // Ensure uniqueness
      if (!seen.has(text)) {
        seen.add(text);
        results.push(text);
      }
      
      // If we can't generate enough unique texts, break the loop
      if (seen.size >= 10 && results.length < count) {
        break;
      }
    } catch (error) {
      console.error('Error generating text variant:', error);
      if (results.length === 0) throw error; // Only throw if we have no results at all
    }
  }
  
  return results;
}

/**
 * Generate text with retry logic
 */
export async function generateTextWithRetry(
  prompt: string,
  maxRetries: number = 2,
  options: GenerationOptions = {}
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generateText(prompt, options);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError || new Error('Unknown error in text generation');
}
