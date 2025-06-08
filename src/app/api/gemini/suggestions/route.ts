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
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API is not configured. Please check your .env.local file.');
  }
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
  console.log('=== New Request ===');
  console.log('Time:', new Date().toISOString());
  
  // Check if mock mode is enabled
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
  
  if (isMockMode) {
    console.log('⚠️ MOCK MODE ENABLED - Using mock responses');
  }

  // Debug: Log all environment variables (be careful with this in production)
  const debugVars = Object.keys(process.env).filter(key => 
    key.includes('GEMINI') || 
    key.includes('MOCK') || 
    key.includes('NODE_ENV')
  );
  console.log('Environment variables:', debugVars);
  
  // Initialize Gemini API if not in mock mode
  let genAI: GoogleGenerativeAI | null = null;
  if (!isMockMode) {
    try {
      genAI = initializeGemini();
    } catch (error: any) {
      console.error('Failed to initialize Gemini API:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize Gemini API',
          details: error instanceof Error ? error.message : 'Unknown initialization error',
          mockMode: false
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  try {
    // Log environment variable status
    const hasApiKey = !!process.env.GEMINI_API;
    console.log('GEMINI_API key present:', hasApiKey);
    if (!hasApiKey) {
      console.error('ERROR: GEMINI_API environment variable is not set');
    }

    // Parse the request body
    let body: SuggestionRequest;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' } as SuggestionResponse,
        { status: 400 }
      );
    }
    
    const { query = 'test', count = 5, context = [] } = body;
    console.log('Processing query:', query, '| Mock Mode:', isMockMode);

    if (!query) {
      return NextResponse.json(
        { 
          error: 'Query is required',
          mockMode: isMockMode
        } as SuggestionResponse,
        { status: 400 }
      );
    }
    
    // If in mock mode, return mock data immediately
    if (isMockMode) {
      console.log('🔹 Returning mock suggestions for query:', query);
      const mockSuggestions = generateMockResponse(query, count);
      return NextResponse.json({
        suggestions: mockSuggestions,
        mockMode: true,
        timestamp: new Date().toISOString()
      } as SuggestionResponse);
    }

    // Get the Gemini Pro model with configuration
    if (!genAI) {
      throw new Error('Gemini API client not initialized');
    }
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.9,
      },
    });

    // Create a prompt for topic suggestions
    const prompt = `
      You are a helpful AI assistant that generates blog topic suggestions.
      
      Based on the following topic: "${query}"
      
      Generate ${count} engaging and specific blog post title suggestions.
      Make them creative, SEO-friendly, and engaging for readers.
      
      ${context.length > 0 ? `Context: ${context.join('\n')}\n` : ''}
      
      Return the suggestions as a JSON array of strings.
      Example: ["Suggestion 1", "Suggestion 2"]
    `;

    // Generate content with timeout
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
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      
      // Handle rate limits specifically
      if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'API rate limit exceeded',
            details: 'You have exceeded your API quota. Please try again later or check your Google AI Studio quota.'
          } as SuggestionResponse,
          { 
            status: 429,
            headers: { 
              'Content-Type': 'application/json',
              'Retry-After': '60' // Tell client to retry after 60 seconds
            } 
          }
        );
      }
      
      // Handle authentication errors
      if (error.message?.includes('API key') || error.status === 401) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'Authentication failed',
            details: 'Invalid API key. Please check your Gemini API key configuration.'
          } as SuggestionResponse,
          { status: 401 }
        );
      }
      
      // Handle timeouts
      if (error.message?.includes('timeout')) {
        return NextResponse.json(
          { 
            suggestions: [],
            error: 'Request timeout',
            details: 'The request took too long to complete. Please try again.'
          } as SuggestionResponse,
          { status: 504 }
        );
      }
      
      // Re-throw for other errors to be handled by the outer catch
      throw error;
    }

    // Try to parse the response as JSON, fallback to text processing if it fails
    let suggestions: string[] = [];
    try {
      // Try to parse as JSON array first
      suggestions = JSON.parse(text);
    } catch (e) {
      // Fallback: Extract suggestions from text response
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+[\.\)]?\s*.+/));
      
      if (lines.length > 0) {
        suggestions = lines.map(line => line.replace(/^\d+[\.\)]?\s*/, '').trim());
      } else {
        // If no numbered list, try to split by dashes or asterisks
        suggestions = text
          .split(/[\n\r]+/)
          .map(line => line.trim().replace(/^[\-\*]\s*/, ''))
          .filter(line => line.length > 0);
      }
    }

    // Ensure we have an array and limit the number of suggestions
    const validSuggestions = Array.isArray(suggestions) 
      ? suggestions.slice(0, count)
      : [];

    return NextResponse.json({
      suggestions: validSuggestions
    } as SuggestionResponse);

  } catch (error) {
    console.error('Error in suggestions route:', error);
    
    // Get the request body for fallback
    let query = '';
    try {
      // Clone the request to read the body again
      const requestClone = request.clone();
      const requestBody = await requestClone.json().catch(() => ({}));
      query = requestBody?.query || '';
    } catch (e) {
      console.error('Error parsing request body in error handler:', e);
      // Continue with empty query if we can't parse the body
    }
    
    // Log the full error for debugging
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide fallback suggestions in case of API failure
    const fallbackSuggestions = [
      `Best practices for ${query || 'your topic'}`,
      `How to master ${query || 'this subject'}`,
      `The complete guide to ${query || 'this topic'}`,
      `${query || 'Expert'} tips and tricks`,
      `Why ${query || 'this'} matters in 2025`
    ].filter(Boolean);

    return NextResponse.json(
      { 
        suggestions: fallbackSuggestions,
        error: error instanceof Error ? error.message : 'Failed to generate suggestions'
      } as SuggestionResponse,
      { status: 500 }
    );
  }
}

// Add TypeScript type for the route handler
export type { SuggestionRequest, SuggestionResponse };
