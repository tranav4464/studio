"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';

// Remove workflowSteps, currentStepIndex, and all stepper UI. Only keep the breadcrumb navigation.

export function BreadcrumbStepper() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isNewBlogFlow = pathname?.startsWith("/new-blog");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="border-b bg-background/95 h-16" aria-hidden="true" />
    );
  }

  if (!isNewBlogFlow) return null;

  // Generate breadcrumb items
  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "New Blog", href: "/new-blog" },
  ];

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbItems.map((item, index) => (
            <div key={item.href} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              <Link
                href={item.href}
                className={cn(
                  "hover:text-foreground",
                  index === breadcrumbItems.length - 1 && "text-foreground font-medium"
                )}
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
        {/* Remove workflow stepper UI */}
      </div>
    </div>
  );
} 