import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// Register Handlebars helpers
ai.registry.registerHelper('truncate', (str: string, len: number) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= len) return str;
  return str.substring(0, len) + '...';
});
