"use client";

import { Suspense } from "react";
import { Icons } from "@/components/icons";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
        <button className="md:hidden">
          <Icons.List className="h-5 w-5" />
        </button>
        <div className="flex-1">
          {/* App specific header content can go here */}
        </div>
      </header>
      <div className="flex flex-1">
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background w-full">
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}