import { NextResponse } from 'next/server';
const { v4: uuidv4 } = require('uuid');

// TODO: Replace with actual database
const blogs = new Map<string, { content: string; createdAt: string }>();

export async function GET() {
  try {
    const blogsList = Array.from(blogs.entries()).map(([id, blog]) => ({
      id,
      content: blog.content,
      createdAt: blog.createdAt,
    }));

    return NextResponse.json({ blogs: blogsList });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const id = uuidv4();
    blogs.set(id, {
      content,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
} 