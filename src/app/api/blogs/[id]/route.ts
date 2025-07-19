import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface HeroImage {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  heroImage?: HeroImage;
  createdAt: string;
  updatedAt: string;
}

interface Params {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  try {
    const data = await req.json();
    const { error } = await supabase
      .from('blogs')
      .update(data)
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}