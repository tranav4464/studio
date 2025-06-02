
export interface ExportRecord {
  format: 'markdown' | 'html' | 'pdf' | 'image' | 'txt'; 
  timestamp: string; // ISO date string
}

export interface RepurposedContentFeedback {
  tweetThread?: 'liked' | 'disliked' | null;
  linkedInPost?: 'liked' | 'disliked' | null;
  instagramPost?: 'liked' | 'disliked' | null;
  emailNewsletterSummary?: 'liked' | 'disliked' | null;
}

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
  heroImageTheme?: string; 
  seoScore?: {
    readability: number; // 0-100
    keywordDensity: number; // 0-100
    quality: number; // 0-100
  };
  metaTitle?: string; 
  metaDescription?: string; 
  exportHistory?: ExportRecord[];
  repurposedContentFeedback?: RepurposedContentFeedback;
}

export type BlogStatus = "draft" | "published" | "archived";
export type BlogTone = "formal" | "casual" | "informative" | "persuasive" | "humorous";
export type BlogStyle = "academic" | "journalistic" | "storytelling" | "technical";
export type BlogLength = "short" | "medium" | "long";

export interface RepurposedContent {
  tweetThread: string[]; // Changed from string to string[]
  linkedInPost: string;
  instagramPost: string; 
  emailNewsletterSummary: string;
}

export interface Settings {
  defaultTone: BlogTone;
  defaultStyle: BlogStyle;
  defaultLength: BlogLength;
  defaultExportFormat: "markdown" | "html" | "pdf" | "image" | "txt";
  customExportCss?: string; // Added for custom CSS for HTML export
  rules: {
    useDiagramsInHowTo: boolean;
  };
  stylePresets: Array<{ name: string; tone: BlogTone; style: BlogStyle }>;
  userProfile?: { 
    name: string;
    email: string;
  };
}

