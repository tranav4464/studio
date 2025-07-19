import { NextResponse } from 'next/server';

// Simulated database
const settings = new Map();

interface UserSettings {
  autoSave: boolean;
  defaultView: 'grid' | 'list';
  defaultTheme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailDigest: boolean;
}

export async function GET(request: Request) {
  try {
    // In a real app, you would get the user ID from the session
    const userId = 'demo-user';
    const userSettings = settings.get(userId) || {
      autoSave: true,
      defaultView: 'grid',
      defaultTheme: 'system',
      notifications: true,
      emailDigest: false,
    };

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const newSettings = await request.json() as UserSettings;
    // In a real app, you would get the user ID from the session
    const userId = 'demo-user';

    settings.set(userId, newSettings);

    return NextResponse.json(newSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 