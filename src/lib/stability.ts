// Stability AI API Client
const STABILITY_API_KEY = 'sk-wmivYDIPP9uEsE9r9tXzV2BgIZkwJ6ACvmXrhCiVh4S6JglN';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

if (!STABILITY_API_KEY) {
  const errorMsg = 'NEXT_PUBLIC_STABILITY_API_KEY is not configured. Please check your .env.local file.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

type StabilityRequest = {
  text_prompts: { text: string; weight?: number }[];
  cfg_scale?: number;
  height?: number;
  width?: number;
  steps?: number;
  samples?: number;
};

export async function generateImage(prompt: string): Promise<string> {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  return data.artifacts[0].base64;
}

// Helper function for generating blog post images
export async function generateBlogImage(prompt: string) {
  return generateImage(prompt);
}
