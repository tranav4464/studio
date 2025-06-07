import { NextResponse } from 'next/server';
import { generateBlogImage } from '@/lib/stability';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const imageData = await generateBlogImage(prompt);
    return NextResponse.json({ imageData });
    
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
