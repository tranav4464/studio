
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-hero-image.ts';
import '@/ai/flows/repurpose-content.ts';
import '@/ai/flows/generate-blog-outline-flow.ts';
import '@/ai/flows/generate-full-blog-flow.ts';
import '@/ai/flows/improve-blog-content-flow.ts';
import '@/ai/flows/simplify-blog-content-flow.ts';
import '@/ai/flows/generate-meta-title-flow.ts'; // Added new flow
import '@/ai/flows/generate-meta-description-flow.ts'; // Added new flow
