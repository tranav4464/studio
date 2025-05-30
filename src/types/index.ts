
export interface BlogPost {
  id: string;
  title: string;
  topic: string;
  tone: BlogTone;
  style: BlogStyle; 
  length: BlogLength; 
  content: string;
  outline: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: BlogStatus;
  heroImageUrl?: string;
  heroImagePrompt?: string;
  heroImageCaption?: string;
  heroImageAltText?: string;
  heroImageTheme?: string; // Added for theme persistence
  seoScore?: {
    readability: number; // 0-100
    keywordDensity: number; // 0-100
    quality: number; // 0-100
  };
  metaTitle?: string; 
  metaDescription?: string; 
}

export type BlogStatus = "draft" | "published" | "archived";
export type BlogTone = "formal" | "casual" | "informative" | "persuasive" | "humorous";
export type BlogStyle = "academic" | "journalistic" | "storytelling" | "technical";
export type BlogLength = "short" | "medium" | "long";

export interface RepurposedContent {
  tweetThread: string;
  linkedInPost: string;
  instagramPost: string; // Added for Instagram
  emailNewsletterSummary: string;
}

export interface Settings {
  defaultTone: BlogTone;
  defaultStyle: BlogStyle;
  defaultLength: BlogLength;
  defaultExportFormat: "markdown" | "html" | "pdf";
  rules: {
    useDiagramsInHowTo: boolean;
  };
  stylePresets: Array<{ name: string; tone: BlogTone; style: BlogStyle }>;
  userProfile?: { 
    name: string;
    email: string;
  };
}
