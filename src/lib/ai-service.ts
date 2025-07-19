import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { RequestInit, Response, BodyInit } from 'node-fetch';

// Configuration
type AIServiceConfig = {
  geminiApiKey?: string;
  defaultModel?: string;
  timeout?: number;
};

type GenerationOptions = {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  model?: string;
  retries?: number;
};

type ImageGenerationOptions = {
  width?: number;
  height?: number;
  numImages?: number;
  steps?: number;
  cfgScale?: number;
  sampler?: string;
  seed?: number;
};

class AIService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private defaultModel: string;
  private timeout: number;

  constructor(config: AIServiceConfig = {}) {
    if (config.geminiApiKey) {
      this.geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
    }
    
    this.defaultModel = config.defaultModel || 'gemini-1.5-pro-latest';
    this.timeout = config.timeout || 30000; // 30 seconds default timeout
  }

  // Text Generation
  async generateText(
    prompt: string,
    options: GenerationOptions = {}
  ): Promise<string> {
    const {
      maxTokens = 2048,
      temperature = 0.7,
      topP = 0.9,
      topK = 40,
      model = this.defaultModel,
      retries = 1,
    } = options;

    const generationParams = {
      maxTokens,
      temperature,
      topP,
      topK,
      model,
    };

    return this.generateWithRetry(
      () => this.generateWithGemini(prompt, generationParams),
      retries,
      'Gemini'
    );
  }

  // Image Generation
  async generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
  ): Promise<string[]> {
    const {
      width = 1024,
      height = 1024,
      numImages = 1,
      steps = 30,
      cfgScale = 7,
      sampler = 'K_DPMPP_2M',
      seed = -1,
    } = options;

    const stabilityParams = {
      width,
      height,
      steps,
      cfg_scale: cfgScale,
      sampler_name: sampler,
      seed,
      samples: numImages,
      text_prompts: [{
        text: prompt,
        weight: 1
      }]
    };

    return this.generateWithRetry(
      () => this.generateWithStabilityAI(JSON.stringify(stabilityParams)),
      2,
      'Stability AI'
    );
  }

  // Private Methods
  private async generateWithGemini(
    prompt: string,
    options: Omit<GenerationOptions, 'retries'>
  ): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: options.model || this.defaultModel,
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
      },
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Removed Hugging Face text generation

  private async generateWithStabilityAI(params: string): Promise<string[]> {
    const response = await this.fetchWithTimeout(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: params,
      }
    );

    const result = await response.json();
    return result.artifacts?.map((a: { base64: string }) => `data:image/png;base64,${a.base64}`) || [];
  }

  // Removed Hugging Face image generation

  private async generateWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    serviceName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[${serviceName}] Attempt ${i + 1} failed:`, error);
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    
    throw lastError || new Error(`All ${serviceName} attempts failed`);
  }

  private async fetchWithTimeout(
    url: string,
    options: Omit<RequestInit, 'body'> & { 
      body?: BodyInit;
      timeout?: number;
    } = {}
  ): Promise<Response> {
    const { timeout = this.timeout, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
body: fetchOptions.body,
      });

      if (!response.ok) {
        const error = await response.text().catch(() => response.statusText);
        throw new Error(`HTTP error ${response.status}: ${error}`);
      }

      return response as unknown as Response;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Singleton instance
export const aiService = new AIService({
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API,
  defaultModel: process.env.NEXT_PUBLIC_GEMINI_MODEL,
  timeout: 60000, // 1 minute timeout
});
