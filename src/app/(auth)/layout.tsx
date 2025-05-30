
import type { ReactNode } from 'react';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold text-primary hover:text-primary/80 transition-colors">
          <Icons.Logo className="h-8 w-8" />
          <span>ContentCraft AI</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Return to <Link href="/" className="underline hover:text-primary">Homepage</Link>
      </p>
    </div>
  );
}
