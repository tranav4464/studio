import type { NextConfig } from 'next';

// Load environment variables
const { 
  NEXT_PUBLIC_GEMINI_API, 
  NEXT_PUBLIC_STABILITY_API_KEY 
} = process.env;

// Verify required environment variables
const requiredVars = [
  'NEXT_PUBLIC_GEMINI_API',
  'NEXT_PUBLIC_STABILITY_API_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingVars.join(', ')}`);
}

const nextConfig: NextConfig = {
  env: {
    // Explicitly expose only the variables we need
    NEXT_PUBLIC_GEMINI_API,
    NEXT_PUBLIC_STABILITY_API_KEY,
  },
  /* Development server configuration */
  // Using default configuration for maximum stability
  experimental: {
    // Disable experimental features for now
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Configure WebSocket for HMR
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        // Ensure WebSocket connection works with reverse proxies
        // and in various network conditions
        poll: 1000, // Check for file changes every second
        aggregateTimeout: 200, // Delay the rebuild after the first change
      };
    }
    return config;
  },
  // Improve development server settings
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
