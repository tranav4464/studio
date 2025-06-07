import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: SuggestionRequest = await request.json();
    const { query, count = 5, context = [] } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' } as SuggestionResponse,
        { status: 400 }
      );
    }

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
    console.error('Error generating suggestions:', error);
    
    // Provide fallback suggestions in case of API failure
    const fallbackSuggestions = [
      `Best practices for ${body?.query || 'your topic'}`,
      `How to master ${body?.query || 'this subject'}`,
      `The complete guide to ${body?.query || 'this topic'}`,
      `${body?.query || 'Expert'} tips and tricks`,
      `Why ${body?.query || 'this'} matters in 2025`
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
