
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { PageHeader } from '@/components/shared/page-header';
import type { Settings, BlogTone, BlogStyle, BlogLength } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const tones: BlogTone[] = ["formal", "casual", "informative", "persuasive", "humorous"];
const styles: BlogStyle[] = ["academic", "journalistic", "storytelling", "technical"];
const lengths: BlogLength[] = ["short", "medium", "long"];
const exportFormats = ["markdown", "html", "pdf"] as const;

const defaultSettings: Settings = {
  defaultTone: 'informative',
  defaultStyle: 'journalistic',
  defaultLength: 'medium',
  defaultExportFormat: 'markdown',
  rules: {
    useDiagramsInHowTo: false,
  },
  stylePresets: [
    { name: "Quick Update", tone: "casual", style: "storytelling" },
    { name: "Deep Dive Tech", tone: "formal", style: "technical" },
  ],
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('contentCraftAISettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure parsed settings have the correct structure
        if (parsedSettings.rules && parsedSettings.stylePresets) {
            setSettings(parsedSettings);
        } else {
            localStorage.setItem('contentCraftAISettings', JSON.stringify(defaultSettings)); // Reset if structure is old/invalid
        }
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        localStorage.setItem('contentCraftAISettings', JSON.stringify(defaultSettings)); // Reset on parse error
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate saving
    localStorage.setItem('contentCraftAISettings', JSON.stringify(settings));
    setIsSaving(false);
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleRuleChange = (field: keyof Settings['rules'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      rules: { ...prev.rules, [field]: value },
    }));
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
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

        <Card className="shadow-lg">
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
            {/* Example of another rule placeholder */}
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

        <Card className="md:col-span-2 shadow-lg">
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
      </div>
    </div>
  );
}
