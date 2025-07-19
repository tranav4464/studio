import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { content, diagramType } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // First, use Gemini to generate a detailed prompt for the diagram
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const promptGeneration = await model.generateContent(`
      Create a detailed prompt for generating a ${diagramType} diagram based on this content:
      "${content}"
      
      The prompt should:
      1. Describe the key elements and relationships
      2. Specify the visual style (clean, modern, professional)
      3. Include any specific colors or design elements
      4. Be optimized for AI image generation
      
      Format the response as a JSON object with a single "prompt" field.
    `);

    const promptData = JSON.parse(promptGeneration.response.text());
    const imagePrompt = promptData.prompt;

    // Generate the image using Stability AI REST API
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: imagePrompt,
            weight: 1,
          },
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: 'diagram',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating visualization:', error);
    return NextResponse.json(
      { error: 'Failed to generate visualization' },
      { status: 500 }
    );
  }
} 