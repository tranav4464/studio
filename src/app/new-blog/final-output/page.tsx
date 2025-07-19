"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { 
  FileDown, 
  Copy, 
  Edit, 
  Eye, 
  Smartphone, 
  Code, 
  FileText,
  Share2,
  BarChart,
  Image as ImageIcon
} from "lucide-react";

export default function FinalOutputPage() {
  const [activeView, setActiveView] = useState<"desktop" | "mobile" | "markdown" | "html">("desktop");

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Title Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Blog Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Title
          </Button>
        </CardContent>
      </Card>

      {/* Hero Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Hero Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Hero Image Preview</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Image
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blog Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blog Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>Your blog content will be displayed here...</p>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repurposed Posts Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Repurposed Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="linkedin">
            <TabsList>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
              <TabsTrigger value="twitter">Twitter</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="linkedin" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>LinkedIn post content...</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </TabsContent>
            <TabsContent value="twitter" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>Twitter thread content...</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </TabsContent>
            <TabsContent value="instagram" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>Instagram caption content...</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </TabsContent>
            <TabsContent value="email" className="mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>Email blurb content...</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2 gap-2">
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SEO / Optimization Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            SEO & Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">SEO Score</h4>
              <p className="text-2xl font-bold">85/100</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Readability</h4>
              <p className="text-2xl font-bold">Good</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium">Meta Title</h4>
              <p className="text-sm text-muted-foreground">Your meta title...</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Meta Description</h4>
              <p className="text-sm text-muted-foreground">Your meta description...</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4 gap-2">
            <Edit className="h-4 w-4" />
            Edit SEO Settings
          </Button>
        </CardContent>
      </Card>

      {/* Visualization View Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeView === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("desktop")}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={activeView === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("mobile")}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
            <Button
              variant={activeView === "markdown" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("markdown")}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Markdown
            </Button>
            <Button
              variant={activeView === "html" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("html")}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              HTML
            </Button>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-muted-foreground">Preview content will be displayed here...</p>
          </div>
        </CardContent>
      </Card>

      {/* Sticky Export Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
        <div className="container mx-auto flex justify-end gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export as HTML
          </Button>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export as Markdown
          </Button>
          <Button className="gap-2">
            <Copy className="h-4 w-4" />
            Copy All Content
          </Button>
        </div>
      </div>
    </div>
  );
} 