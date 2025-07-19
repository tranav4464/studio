import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { topic, tone, length, template, references } = await req.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
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

    const prompt = `Create a detailed blog outline for the topic "${topic}" with the following specifications:
- Tone: ${tone}
- Length: ${length} (${length === 'short' ? '~500' : length === 'medium' ? '~1000' : '~1500'} words)
- Template Style: ${template}${referenceContext}

The outline should include:
1. A compelling introduction
2. Main sections with clear headings
3. Key points to cover in each section
4. A strong conclusion

Format the response as a JSON object with the following structure:
{
  "title": "Blog Title",
  "sections": [
    {
      "heading": "Section Title",
      "points": ["Point 1", "Point 2", ...]
    },
    ...
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const outline = JSON.parse(text);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
} 