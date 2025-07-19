import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/stability';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const imageBase64 = await generateImage(prompt);
    return NextResponse.json({ image: imageBase64 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
} 