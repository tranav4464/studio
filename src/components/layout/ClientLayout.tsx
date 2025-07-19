"use client";

import { usePathname } from "next/navigation";
import { HeaderBar } from "./HeaderBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import components with no SSR
const DynamicSidebar = dynamic(
  () => import('./Sidebar').then(mod => mod.Sidebar),
  { 
    ssr: false,
    loading: () => <div className="w-16" /> // Loading placeholder
  }
);

const DynamicBreadcrumbStepper = dynamic(
  () => import('./BreadcrumbStepper').then(mod => mod.BreadcrumbStepper),
  { 
    ssr: false,
    loading: () => <div className="h-16" /> // Loading placeholder
  }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  return (
    <TooltipProvider>
      <div className="relative min-h-screen bg-white text-foreground">
        {!isLanding && <HeaderBar />}
        {!isLanding && (
          <DynamicSidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggleCollapse={toggleSidebar} 
          />
        )}
        <main 
          className={`min-h-screen transition-all duration-300 ${!isLanding ? 'pt-16' : ''} ${!isLanding ? 'pl-0' : ''}`}
          style={{
            marginLeft: !isLanding ? (isSidebarCollapsed ? '4rem' : '16rem') : '0',
            transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {!isLanding && <DynamicBreadcrumbStepper />}
          <div className={`p-4 md:p-6 ${!isLanding ? 'max-w-full' : 'container'}`}>
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
