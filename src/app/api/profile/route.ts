import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// In-memory profile store (simulate DB)
let userProfile = {
  name: 'Demo User',
  email: 'user@example.com',
  bio: 'Content creator and writer',
  preferences: {
    defaultLanguage: 'en',
    defaultTone: 'professional',
    defaultLength: 'medium',
    autoSave: true,
    notifications: true,
  },
  rules: {
    minWordCount: 500,
    maxWordCount: 2000,
    requiredSections: ['introduction', 'conclusion'],
    autoFormat: true,
  },
  stylePresets: [
    {
      id: 'modern',
      name: 'Modern',
      colors: {
        primary: '#0070f3',
        secondary: '#7928ca',
        accent: '#ff0080',
        background: '#ffffff',
        text: '#000000',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: '16px',
      },
    },
    {
      id: 'minimal',
      name: 'Minimal',
      colors: {
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
        background: '#ffffff',
        text: '#000000',
      },
      typography: {
        headingFont: 'Helvetica',
        bodyFont: 'Helvetica',
        fontSize: '14px',
      },
    },
    {
      id: 'creative',
      name: 'Creative',
      colors: {
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#45b7d1',
        background: '#f7f7f7',
        text: '#2d3436',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Open Sans',
        fontSize: '16px',
      },
    },
  ],
  activePreset: 'modern',
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', data.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 