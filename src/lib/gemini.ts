// Gemini API Client
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

type GeminiRequest = {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
};

export async function generateWithGemini(prompt: string, options: {
  temperature?: number;
  maxTokens?: number;
} = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const requestBody: GeminiRequest = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: options.maxTokens ?? 2048,
    },
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Helper function for generating blog content
export async function generateBlogContent(prompt: string) {
  return generateWithGemini(prompt, {
    temperature: 0.7,
    maxTokens: 2048,
  });
}
