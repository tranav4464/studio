'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Image as ImageIcon, Download, RefreshCw, Wand2 } from 'lucide-react';

interface HeroImage {
  id: string;
  url: string;
  caption: string;
  altText: string;
}

interface HeroImageGeneratorProps {
  title: string;
  onImageSelected: (image: HeroImage) => void;
}

type VisualTheme = 'light' | 'dark' | 'pastel' | 'vibrant' | 'minimal';

export function HeroImageGenerator({ title, onImageSelected }: HeroImageGeneratorProps) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<HeroImage | null>(null);
  const [theme, setTheme] = useState<VisualTheme>('light');
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImages = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/hero-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          theme,
          count: 4, // Generate 4 options
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate images');
      }

      const data = await response.json();
      const newImages = data.images.map((url: string) => ({
        id: Math.random().toString(36).substring(7),
        url,
        caption: '',
        altText: '',
      }));
      
      setImages(newImages);
      setSelectedImage(null);
      setCaption('');
      setAltText('');
      
      toast({
        title: 'Success',
        description: 'Hero images generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateImage = async (imageId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/blog/hero-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          theme,
          count: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate image');
      }

      const data = await response.json();
      const newImage = {
        id: imageId,
        url: data.images[0],
        caption: images.find(img => img.id === imageId)?.caption || '',
        altText: images.find(img => img.id === imageId)?.altText || '',
      };

      setImages(prev => prev.map(img => 
        img.id === imageId ? newImage : img
      ));
      
      if (selectedImage?.id === imageId) {
        setSelectedImage(newImage);
      }
      
      toast({
        title: 'Success',
        description: 'Image regenerated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to regenerate image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelect = (image: HeroImage) => {
    setSelectedImage(image);
    setCaption(image.caption);
    setAltText(image.altText);
  };

  const handleSave = () => {
    if (selectedImage) {
      const updatedImage = {
        ...selectedImage,
        caption,
        altText,
      };
      setImages(prev => prev.map(img => 
        img.id === selectedImage.id ? updatedImage : img
      ));
      setSelectedImage(updatedImage);
      onImageSelected(updatedImage);
      
      toast({
        title: 'Success',
        description: 'Hero image saved successfully!',
      });
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hero-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(`data:image/png;base64,${data.image}`);
      toast({
        title: 'Success',
        description: 'Image generated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Image Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Visual Theme</Label>
            <Select value={theme} onValueChange={(value: VisualTheme) => setTheme(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateImages}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Hero Images
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className={`cursor-pointer transition-all ${
                selectedImage?.id === image.id
                  ? 'ring-2 ring-primary'
                  : 'hover:ring-2 hover:ring-primary/50'
              }`}
              onClick={() => handleImageSelect(image)}
            >
              <CardContent className="p-4 space-y-4">
                <div className="relative aspect-video">
                  <img
                    src={image.url}
                    alt={image.altText || 'Generated hero image'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateImage(image.id);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-12"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image.url);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Image Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Enter image caption..."
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Enter alt text for accessibility..."
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              Save Image Details
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Image Prompt</Label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated" className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
} 