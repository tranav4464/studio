import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    // Get the Gemini Pro model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Improve the content
    const prompt = `Improve the following blog content by:
1. Enhancing clarity and readability
2. Adding more engaging language
3. Improving flow and transitions
4. Fixing any grammatical errors
5. Making it more SEO-friendly

Here's the content to improve:

${content}

Please return the improved content with proper formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedContent = response.text();

    return NextResponse.json({ improvedContent });
  } catch (error) {
    console.error('Error improving content:', error);
    return NextResponse.json(
      { error: 'Failed to improve content' },
      { status: 500 }
    );
  }
} 