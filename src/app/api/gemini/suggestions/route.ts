
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Mock data for development
const MOCK_SUGGESTIONS = [
  '10 Best Practices for Using AI in Development',
  'How to Optimize Your Development Workflow with AI',
  'The Future of AI in Software Engineering',
  'Getting Started with Gemini API: A Comprehensive Guide',
  'Common Pitfalls When Working with AI APIs and How to Avoid Them'
];

// Helper function to generate mock responses
function generateMockResponse(query: string, count: number): string[] {
  const baseSuggestions = [...MOCK_SUGGESTIONS];
  // Add query-specific mock if it's not a generic query
  if (query && !['test', 'hello', 'hi'].includes(query.toLowerCase())) {
    baseSuggestions.unshift(
      `The Ultimate Guide to ${query}`,
      `10 Tips for Mastering ${query}`,
      `Why ${query} Matters in 2025`
    );
  }
  return baseSuggestions.slice(0, Math.min(count, 10));
}

// Helper function to initialize Gemini API
function initializeGemini() {
  let apiKey = process.env.GEMINI_API_KEY;
  let apiKeySource = "GEMINI_API_KEY";

  if (!apiKey) {
    console.log(`Server: GEMINI_API_KEY not found, trying NEXT_PUBLIC_GEMINI_API.`);
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API;
    apiKeySource = "NEXT_PUBLIC_GEMINI_API";
  }

  if (!apiKey) {
    console.error(`Server: CRITICAL - Neither GEMINI_API_KEY nor NEXT_PUBLIC_GEMINI_API is configured.`);
    throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API in your environment.');
  }
  console.log(`Server: Using API key from ${apiKeySource}. Key length: ${apiKey.length}`);
  return new GoogleGenerativeAI(apiKey);
}

// Define the request body type
interface SuggestionRequest {
  query: string;
  count?: number;
  context?: string[];
}

// Define the response type
interface SuggestionResponse {
  suggestions: string[];
  error?: string;
  details?: string;
  mockMode?: boolean;
  timestamp?: string;
}

export async function POST(request: Request) {
  console.log('=== New Request to /api/gemini/suggestions ===');
  console.log('Server Time:', new Date().toISOString());
  
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  
  if (isMockMode) {
    console.log('Server: ⚠️ MOCK MODE ENABLED - Using mock responses');
  }

  let genAI: GoogleGenerativeAI | null = null;
  if (!isMockMode) {
    try {
      genAI = initializeGemini();
    } catch (error: any) {
      console.error('Server: Failed to initialize Gemini API in route:', error.message);
      return NextResponse.json({ 
          error: 'Server failed to initialize Gemini API',
          details: error instanceof Error ? error.message : 'Unknown initialization error',
          mockMode: false,
          timestamp: new Date().toISOString(),
        }, 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  try {
    let body: SuggestionRequest;
    try {
      body = await request.json();
      console.log('Server: Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Server: Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', timestamp: new Date().toISOString() } as SuggestionResponse,
        { status: 400 }
      );
    }
    
    const { query = 'test', count = 5, context = [] } = body;
    console.log('Server: Processing query:', query, '| Mock Mode:', isMockMode);

    if (!query) {
      return NextResponse.json(
        { 
          error: 'Query is required',
          mockMode: isMockMode,
          timestamp: new Date().toISOString()
        } as SuggestionResponse,
        { status: 400 }
      );
    }
    
    if (isMockMode) {
      console.log('Server: 🔹 Returning mock suggestions for query:', query);
      const mockSuggestions = generateMockResponse(query, count);
      return NextResponse.json({
        suggestions: mockSuggestions,
        mockMode: true,
        timestamp: new Date().toISOString()
      } as SuggestionResponse);
    }

    if (!genAI) {
      console.error('Server: Gemini API client (genAI) is null after initialization check. This should not happen.');
      throw new Error('Gemini API client not initialized despite passing initial check.');
    }
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro', // Ensure you are using a valid model
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.9,
      },
    });

    const prompt = `
      You are a helpful AI assistant that generates blog topic suggestions.
      Based on the following topic: "${query}"
      Generate ${count} engaging and specific blog post title suggestions.
      Make them creative, SEO-friendly, and engaging for readers.
      ${context.length > 0 ? `Context: ${context.join('\n')}\n` : ''}
      Return the suggestions as a JSON array of strings.
      Example: ["Suggestion 1", "Suggestion 2"]
    `;

    console.log('Server: Sending prompt to Gemini API...');
    let text: string;
    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
        )
      ]);
      
      const response = await result.response;
      text = response.text();
      console.log('Server: Gemini API response received.');
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
    } catch (error: any) {
      console.error('Server: Error generating content with Gemini:', error);
      
      if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'API rate limit exceeded',
            details: 'You have exceeded your API quota. Please try again later or check your Google AI Studio quota.',
            timestamp: new Date().toISOString()
          } as SuggestionResponse,
          { 
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': '60' 
            } 
          }
        );
      }
      
      if (error.message?.includes('API key') || error.status === 401 || error.message?.includes('permission denied')) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'Authentication or Permission Error with Gemini API',
            details: error.message,
            timestamp: new Date().toISOString()
          } as SuggestionResponse,
          { status: 401 }
        );
      }
      
      if (error.message?.includes('timeout')) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'Request timeout',
            details: 'The request to Gemini API took too long to complete. Please try again.',
            timestamp: new Date().toISOString()
          } as SuggestionResponse,
          { status: 504 }
        );
      }
      
      throw error;
    }

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(text);
    } catch (e) {
      console.warn('Server: Gemini response was not valid JSON. Attempting to parse as lines.');
      const lines = text.split('\n')
        .map(line => line.trim().replace(/^[\d\.\-\*]+\s*/, ''))
        .filter(line => line.length > 0 && line.length < 150); // Basic filtering
      
      if (lines.length > 0) {
        suggestions = lines;
      } else {
        console.error('Server: Could not parse suggestions from Gemini response:', text);
        suggestions = [`Failed to parse suggestions. Raw: ${text.substring(0,100)}...`];
      }
    }

    const validSuggestions = Array.isArray(suggestions) 
      ? suggestions.slice(0, count)
      : [];
    console.log('Server: Returning suggestions:', validSuggestions);
    return NextResponse.json({
      suggestions: validSuggestions,
      timestamp: new Date().toISOString()
    } as SuggestionResponse);

  } catch (error) {
    console.error('Server: General error in /api/gemini/suggestions route:', error);
    return NextResponse.json(
      { 
        suggestions: [],
        error: error instanceof Error ? error.message : 'Failed to generate suggestions due to an unexpected server error.',
        details: 'Please check server logs for more details.',
        timestamp: new Date().toISOString()
      } as SuggestionResponse,
      { status: 500 }
    );
  }
}

export type { SuggestionRequest, SuggestionResponse };

