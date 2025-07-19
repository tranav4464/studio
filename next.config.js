/** @type {import('next').NextConfig} */

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

const nextConfig = {
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
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 