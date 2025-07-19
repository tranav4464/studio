import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { topic, tone, length, template, outline, references } = await req.json();

    if (!topic || !outline) {
      return NextResponse.json(
        { error: 'Topic and outline are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare reference context if available
    let referenceContext = '';
    if (references && references.length > 0) {
      referenceContext = `\nReference Materials:\n${references
        .map((ref: { name: string; content: string }) => {
          return `From ${ref.name}:\n${ref.content.substring(0, 1000)}...`;
        })
        .join('\n\n')}`;
    }

    const prompt = `Write a blog post based on the following outline and specifications:

Topic: ${topic}
Tone: ${tone}
Length: ${length} (${length === 'short' ? '~500' : length === 'medium' ? '~1000' : '~1500'} words)
Template Style: ${template}${referenceContext}

Outline:
${JSON.stringify(outline, null, 2)}

Requirements:
1. Follow the outline structure exactly
2. Maintain the specified tone throughout
3. Write in a clear, engaging style
4. Include relevant examples and explanations
5. Use proper formatting for headings and paragraphs
6. Ensure the content is well-organized and flows naturally
7. If reference materials are provided, incorporate relevant information and cite sources appropriately

Format the response as a JSON object with the following structure:
{
  "title": "Blog Title",
  "content": "Full blog content with proper formatting",
  "metadata": {
    "wordCount": number,
    "estimatedReadTime": "X min read"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const blog = JSON.parse(text);

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error generating blog:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog' },
      { status: 500 }
    );
  }
} 