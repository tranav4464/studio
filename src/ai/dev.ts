
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-hero-image.ts';
import '@/ai/flows/repurpose-content.ts';
import '@/ai/flows/generate-blog-outline-flow.ts';
import '@/ai/flows/generate-full-blog-flow.ts';
import '@/ai/flows/improve-blog-content-flow.ts';
import '@/ai/flows/simplify-blog-content-flow.ts';
import '@/ai/flows/generate-meta-title-flow.ts';
import '@/ai/flows/generate-meta-description-flow.ts';
import '@/ai/flows/generate-blog-title-suggestion-flow.ts';
import '@/ai/flows/analyze-blog-seo-flow.ts';
import '@/ai/flows/generate-image-generation-prompt-flow.ts'; // Added new flow
