import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

type ContentType = 'tweet' | 'linkedin' | 'newsletter';

interface RepurposeRequest {
  content: string;
  title: string;
  type: ContentType;
}

export async function POST(request: Request) {
  try {
    const { content, title, type } = await request.json() as RepurposeRequest;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';
    switch (type) {
      case 'tweet':
        prompt = `Create an engaging tweet thread from this blog post titled "${title}". 
        Break down the key points into 5-7 tweets. Each tweet should be under 280 characters.
        Include relevant hashtags and maintain a conversational tone.
        Blog content: ${content}`;
        break;
      case 'linkedin':
        prompt = `Create a professional LinkedIn post from this blog post titled "${title}".
        The post should be engaging, include key insights, and end with a call to action.
        Keep it under 1300 characters and use line breaks for readability.
        Blog content: ${content}`;
        break;
      case 'newsletter':
        prompt = `Create an email newsletter summary from this blog post titled "${title}".
        Include a compelling subject line, brief introduction, key takeaways, and a call to action.
        Keep it concise but informative, and maintain a friendly tone.
        Blog content: ${content}`;
        break;
    }

    const result = await model.generateContent(prompt);
    const repurposedContent = result.response.text();

    return NextResponse.json({ content: repurposedContent });
  } catch (error) {
    console.error('Error repurposing content:', error);
    return NextResponse.json(
      { error: 'Failed to repurpose content' },
      { status: 500 }
    );
  }
} 