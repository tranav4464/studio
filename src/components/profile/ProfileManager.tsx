'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Palette, Settings, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StylePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: string;
  };
}

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  preferences: {
    defaultLanguage: string;
    defaultTone: string;
    defaultLength: string;
    autoSave: boolean;
    notifications: boolean;
  };
  rules: {
    minWordCount: number;
    maxWordCount: number;
    requiredSections: string[];
    autoFormat: boolean;
  };
  stylePresets: StylePreset[];
  activePreset: string;
}

const defaultStylePresets: StylePreset[] = [
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
];

export function ProfileManager() {
  const [profile, setProfile] = useState<UserProfile>({
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
    stylePresets: defaultStylePresets,
    activePreset: 'modern',
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      toast({
        title: 'Success',
        description: 'Profile saved successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings className="mr-2 h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="styles">
            <Palette className="mr-2 h-4 w-4" />
            Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select
                  value={profile.preferences.defaultLanguage}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultLanguage: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Tone</Label>
                <Select
                  value={profile.preferences.defaultTone}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultTone: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Length</Label>
                <Select
                  value={profile.preferences.defaultLength}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, defaultLength: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.autoSave}
                  onCheckedChange={(checked) =>
                    setProfile((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, autoSave: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Word Count</Label>
                  <Input
                    type="number"
                    value={profile.rules.minWordCount}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        rules: {
                          ...prev.rules,
                          minWordCount: parseInt(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Word Count</Label>
                  <Input
                    type="number"
                    value={profile.rules.maxWordCount}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        rules: {
                          ...prev.rules,
                          maxWordCount: parseInt(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Required Sections</Label>
                <Select
                  value={profile.rules.requiredSections.join(',')}
                  onValueChange={(value) =>
                    setProfile((prev) => ({
                      ...prev,
                      rules: {
                        ...prev.rules,
                        requiredSections: value.split(','),
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introduction,conclusion">
                      Introduction & Conclusion
                    </SelectItem>
                    <SelectItem value="introduction,body,conclusion">
                      Introduction, Body & Conclusion
                    </SelectItem>
                    <SelectItem value="introduction,body,conclusion,references">
                      Full Structure
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-format</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically format content according to rules
                  </p>
                </div>
                <Switch
                  checked={profile.rules.autoFormat}
                  onCheckedChange={(checked) =>
                    setProfile((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, autoFormat: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Style Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Active Preset</Label>
                <Select
                  value={profile.activePreset}
                  onValueChange={(value) =>
                    setProfile((prev) => ({ ...prev, activePreset: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {profile.stylePresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.stylePresets.map((preset) => (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all ${
                      profile.activePreset === preset.id
                        ? 'ring-2 ring-primary'
                        : 'hover:ring-2 hover:ring-primary/50'
                    }`}
                    onClick={() =>
                      setProfile((prev) => ({ ...prev, activePreset: preset.id }))
                    }
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{preset.name}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div
                            className="h-8 rounded"
                            style={{ backgroundColor: preset.colors.primary }}
                          />
                          <div
                            className="h-8 rounded"
                            style={{ backgroundColor: preset.colors.secondary }}
                          />
                          <div
                            className="h-8 rounded"
                            style={{ backgroundColor: preset.colors.accent }}
                          />
                          <div
                            className="h-8 rounded"
                            style={{ backgroundColor: preset.colors.background }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {preset.typography.headingFont} /{' '}
                          {preset.typography.bodyFont}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 