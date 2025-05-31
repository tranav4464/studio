
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added for logout
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import type { Settings, BlogTone, BlogStyle, BlogLength } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const tones: BlogTone[] = ["formal", "casual", "informative", "persuasive", "humorous"];
const styles: BlogStyle[] = ["academic", "journalistic", "storytelling", "technical"];
const lengths: BlogLength[] = ["short", "medium", "long"];
const exportFormats = ["markdown", "html", "pdf", "image", "txt"] as const;


const defaultSettings: Settings = {
  defaultTone: 'informative',
  defaultStyle: 'journalistic',
  defaultLength: 'medium',
  defaultExportFormat: 'markdown',
  customExportCss: `/* Custom CSS for 'Styled Article HTML' Export */
body { font-family: 'Georgia', serif; color: #333; }
h1, h2, h3 { color: #1a1a1a; border-bottom: 1px solid #eee; padding-bottom: 5px; }
p { margin-bottom: 1.2em; line-height: 1.7; }
code { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
pre { background-color: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 5px; overflow-x: auto; }
pre code { background-color: transparent; padding: 0; }
img { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
`,
  rules: {
    useDiagramsInHowTo: false,
  },
  stylePresets: [
    { name: "Quick Update", tone: "casual", style: "storytelling" },
    { name: "Deep Dive Tech", tone: "formal", style: "technical" },
  ],
  userProfile: {
    name: "Demo User",
    email: "user@example.com"
  }
};

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter(); // Added for logout
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('contentCraftAISettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        const completeSettings = { ...defaultSettings, ...parsedSettings };
        if (!completeSettings.userProfile) {
            completeSettings.userProfile = defaultSettings.userProfile;
        }
        if (!completeSettings.rules) { 
            completeSettings.rules = defaultSettings.rules;
        }
        if (!completeSettings.stylePresets) { 
            completeSettings.stylePresets = defaultSettings.stylePresets;
        }
        if (completeSettings.customExportCss === undefined) { // Ensure customExportCss exists
            completeSettings.customExportCss = defaultSettings.customExportCss;
        }
        setSettings(completeSettings);
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        localStorage.setItem('contentCraftAISettings', JSON.stringify(defaultSettings));
        setSettings(defaultSettings); 
      }
    } else {
        setSettings(defaultSettings); 
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('contentCraftAISettings', JSON.stringify(settings));
    setIsSaving(false);
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedInputChange = <K extends keyof Settings, NK extends keyof NonNullable<Settings[K]>>(
    parentField: K,
    nestedField: NK,
    value: NonNullable<Settings[K]>[NK]
  ) => {
    setSettings(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [nestedField]: value,
      },
    }));
  };


  const handleRuleChange = (field: keyof Settings['rules'], value: boolean) => {
    handleNestedInputChange('rules', field, value);
  };

  const [newPresetName, setNewPresetName] = useState("");
  const handleAddPreset = () => {
    if (!newPresetName.trim()) {
      toast({ title: "Preset name required", variant: "destructive" });
      return;
    }
    const newPreset = { name: newPresetName.trim(), tone: settings.defaultTone, style: settings.defaultStyle };
    setSettings(prev => ({...prev, stylePresets: [...prev.stylePresets, newPreset]}));
    setNewPresetName("");
    toast({ title: "Preset added"});
  };

  const handleRemovePreset = (indexToRemove: number) => {
    setSettings(prev => ({
        ...prev,
        stylePresets: prev.stylePresets.filter((_, index) => index !== indexToRemove)
    }));
    toast({title: "Preset removed"});
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
        toast({title: "Feedback cannot be empty", variant: "destructive"});
        return;
    }
    console.log("Feedback submitted:", feedbackText);
    toast({title: "Feedback Submitted", description: "Thank you for your feedback!"});
    setFeedbackText("");
  };

  const handleLogout = () => {
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/dashboard'); 
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Settings"
        description="Personalize your ContentCraft AI experience."
        actions={
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Icons.Save className="mr-2 h-4 w-4" />}
            Save Settings
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Default Blog Settings</CardTitle><CardDescription>Set your default preferences for new blog posts.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultTone">Default Tone</Label>
              <Select value={settings.defaultTone} onValueChange={(value: BlogTone) => handleInputChange('defaultTone', value)}>
                <SelectTrigger id="defaultTone"><SelectValue /></SelectTrigger>
                <SelectContent>{tones.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultStyle">Default Style</Label>
              <Select value={settings.defaultStyle} onValueChange={(value: BlogStyle) => handleInputChange('defaultStyle', value)}>
                <SelectTrigger id="defaultStyle"><SelectValue /></SelectTrigger>
                <SelectContent>{styles.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultLength">Default Length</Label>
              <Select value={settings.defaultLength} onValueChange={(value: BlogLength) => handleInputChange('defaultLength', value)}>
                <SelectTrigger id="defaultLength"><SelectValue /></SelectTrigger>
                <SelectContent>{lengths.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultExportFormat">Default Export Format</Label>
              <Select value={settings.defaultExportFormat} onValueChange={(value: typeof exportFormats[number]) => handleInputChange('defaultExportFormat', value)}>
                <SelectTrigger id="defaultExportFormat"><SelectValue /></SelectTrigger>
                <SelectContent>{exportFormats.map(f => <SelectItem key={f} value={f} className="uppercase">{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Personalization Rules</CardTitle><CardDescription>Define specific rules for content generation.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <Label htmlFor="useDiagrams" className="flex flex-col space-y-1 cursor-pointer">
                <span>Use diagrams in "how-to" posts</span>
                <span className="font-normal text-sm leading-snug text-muted-foreground">
                  Automatically suggest or include diagrams for instructional content.
                </span>
              </Label>
              <Switch id="useDiagrams" checked={settings.rules.useDiagramsInHowTo} onCheckedChange={(value) => handleRuleChange('useDiagramsInHowTo', value)}/>
            </div>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg opacity-50 cursor-not-allowed">
              <Label htmlFor="autoSeo" className="flex flex-col space-y-1">
                <span>Auto-optimize for SEO keywords</span>
                <span className="font-normal text-sm leading-snug text-muted-foreground">
                  (Coming Soon) Automatically weave in target keywords during generation.
                </span>
              </Label>
              <Switch id="autoSeo" checked={false} disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
            <CardHeader><CardTitle>Style Presets</CardTitle><CardDescription>Save and manage your favorite tone and style combinations.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                {settings.stylePresets.length > 0 ? (
                    settings.stylePresets.map((preset, index) => (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:shadow-sm transition-shadow">
                            <div>
                                <p className="font-medium">{preset.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">Tone: {preset.tone}, Style: {preset.style}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemovePreset(index)}>
                                <Icons.Delete className="h-4 w-4 text-destructive"/>
                                <span className="sr-only">Remove preset</span>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No presets saved yet.</p>
                )}
                <Separator className="my-6" />
                <h4 className="text-md font-medium mb-2">Add New Preset</h4>
                 <div className="flex flex-col sm:flex-row gap-2 items-end">
                    <div className="flex-grow space-y-1">
                        <Label htmlFor="newPresetName">Preset Name</Label>
                        <Input id="newPresetName" placeholder="e.g., Casual Tech Blog" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)}/>
                    </div>
                    <Button onClick={handleAddPreset} className="w-full sm:w-auto">
                        <Icons.FilePlus className="mr-2 h-4 w-4"/> Add Preset
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Account Settings</CardTitle><CardDescription>Manage your account details.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="accountName">Name</Label>
              <Input id="accountName" value={settings.userProfile?.name || ''} disabled placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountEmail">Email</Label>
              <Input id="accountEmail" type="email" value={settings.userProfile?.email || ''} disabled placeholder="your@email.com" />
            </div>
            <Button variant="outline" onClick={() => toast({title: "Password Change", description: "Password change functionality is not yet implemented."})}>
              Change Password
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <Icons.LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Export Template Customization</CardTitle><CardDescription>Add custom CSS for the "Styled Article HTML" export.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customExportCss">Custom CSS for Styled HTML Export</Label>
              <Textarea
                id="customExportCss"
                value={settings.customExportCss || ''}
                onChange={(e) => handleInputChange('customExportCss', e.target.value)}
                placeholder="/* Your custom CSS styles here... */"
                rows={10}
                className="text-xs font-mono"
              />
              <p className="text-xs text-muted-foreground">This CSS will be embedded in the &lt;style&gt; tag of 'Styled Article HTML' exports.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Manage your notification preferences (feature coming soon).</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg opacity-50 cursor-not-allowed">
              <Label htmlFor="productUpdates" className="flex flex-col space-y-1">
                <span>Product Updates</span>
                <span className="font-normal text-xs leading-snug text-muted-foreground">
                  Receive emails about new features and updates.
                </span>
              </Label>
              <Switch id="productUpdates" checked={false} disabled/>
            </div>
            <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg opacity-50 cursor-not-allowed">
              <Label htmlFor="weeklySummary" className="flex flex-col space-y-1">
                <span>Weekly Summary</span>
                <span className="font-normal text-xs leading-snug text-muted-foreground">
                  Get a weekly summary of your content activity.
                </span>
              </Label>
              <Switch id="weeklySummary" checked={false} disabled/>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Feedback & Support</CardTitle><CardDescription>Report a bug or send us your feedback.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedbackText">Your Message</Label>
              <Textarea
                id="feedbackText"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think or describe the issue..."
                rows={5}
              />
            </div>
          </CellContent>
          <CardFooter>
            <Button onClick={handleSubmitFeedback}>
              Submit Feedback
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-xl">
          <CardHeader><CardTitle>Team Management</CardTitle><CardDescription>Manage team members and collaboration settings.</CardDescription></CardHeader>
          <CardContent>
            <Alert>
              <Icons.Team className="h-4 w-4" />
              <AlertTitle>Coming Soon!</AlertTitle>
              <AlertDescription>
                Collaboration features, including adding team members and shared workspaces, are under development.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
