
import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google'; // Updated font imports
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Configure Inter font
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap', // Improves font loading performance
});

// Configure JetBrains Mono font
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ContentCraft AI',
  description: 'AI-powered content creation and repurposing studio.',
};

// This function removes any attributes added by browser extensions
function cleanBodyAttributes() {
  if (typeof document !== 'undefined') {
    const body = document.body;
    // Remove common extension attributes
    for (const attr of body.attributes) {
      if (attr.name.startsWith('data-') && !attr.name.startsWith('data-')) {
        body.removeAttribute(attr.name);
      }
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clean up body attributes on client side
  if (typeof window !== 'undefined') {
    cleanBodyAttributes();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload fonts to avoid FOUT */}
        <link
          rel="preload"
          href="/_next/static/media/e4af272ccee01ff0-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body 
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
