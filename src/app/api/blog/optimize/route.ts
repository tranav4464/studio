import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');

export async function POST(req: Request) {
  try {
    const { content, title } = await req.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Content and title are required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Analyze content for SEO, readability, and quality
    const analysisPrompt = `
      Analyze this blog post for SEO, readability, and quality:
      
      Title: ${title}
      Content: ${content}
      
      Provide a comprehensive analysis including:
      1. SEO score (0-100)
      2. Readability score and grade level
      3. Keyword density analysis
      4. Section quality scores
      5. Plagiarism check
      6. Gap analysis compared to top-ranking content
      
      Format the response as a JSON object with the following structure:
      {
        "seoScore": number,
        "readability": {
          "score": number,
          "grade": string
        },
        "keywordDensity": {
          "keyword1": number,
          "keyword2": number
        },
        "sectionQuality": {
          "section1": number,
          "section2": number
        },
        "plagiarism": {
          "score": number,
          "matches": [
            {
              "text": string,
              "source": string,
              "similarity": number
            }
          ]
        },
        "gapAnalysis": {
          "missingKeywords": string[],
          "suggestedImprovements": string[]
        }
      }`;

    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const metrics = JSON.parse(text);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
} 