// Stability AI API Client
const STABILITY_API_KEY = process.env.NEXT_PUBLIC_STABILITY_API_KEY;
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

export async function generateImageWithStability(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    cfg_scale?: number;
    steps?: number;
    samples?: number;
  } = {}
): Promise<string> {
  if (!STABILITY_API_KEY) {
    throw new Error('Stability API key is not configured');
  }

  const requestBody: StabilityRequest = {
    text_prompts: [
      {
        text: prompt,
        weight: 1,
      },
    ],
    cfg_scale: options.cfg_scale ?? 7,
    height: options.height ?? 1024,
    width: options.width ?? 1024,
    steps: options.steps ?? 30,
    samples: options.samples ?? 1,
  };

  const response = await fetch(STABILITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  
  // The API returns a base64-encoded image in the response
  if (data.artifacts && data.artifacts.length > 0) {
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  }
  
  throw new Error('No image was generated');
}

// Helper function for generating blog post images
export async function generateBlogImage(prompt: string) {
  return generateImageWithStability(prompt, {
    width: 1024,
    height: 1024,
    cfg_scale: 7,
    steps: 30,
  });
}
