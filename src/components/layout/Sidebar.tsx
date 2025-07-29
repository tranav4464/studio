"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  BarChart,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileEdit
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  icon: any;
  href: string;
  subItems?: Array<{
    title: string;
    href: string;
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    title: "New Blog",
    icon: FileText,
    href: "/new-blog",
    subItems: [
      { title: "Create Blog", href: "/new-blog/create" },
      { title: "Outline Generator", href: "/new-blog/outline" },
      { title: "Editor", href: "/new-blog/editor" },
      { title: "Visualization", href: "/new-blog/visualization" },
      { title: "Optimization", href: "/new-blog/optimization" },
      { title: "Hero Image", href: "/new-blog/hero-image" },
      { title: "Repurpose", href: "/new-blog/repurpose" },
      { title: "Final Output", href: "/new-blog/final-output" }
    ]
  },
  {
    title: "My Blogs",
    icon: FileEdit,
    href: "/my-blogs"
  },
  {
    title: "Templates",
    icon: FileText,
    href: "/templates"
  },
  {
    title: "Analytics",
    icon: BarChart,
    href: "/analytics"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    subItems: [
      { title: "General", href: "/settings/general" },
      { title: "Export Options", href: "/settings/export" },
      { title: "Feedback & Support", href: "/settings/feedback" },
      { title: "Account & Billing", href: "/settings/billing" }
    ]
  },
  {
    title: "Help & Guides",
    icon: HelpCircle,
    href: "/help"
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  // Auto-collapse sidebar when on visualization page
  useEffect(() => {
    if (pathname === '/new-blog/visualization') {
      if (!isCollapsed) {
        onToggleCollapse();
      }
    }
  }, [pathname, isCollapsed, onToggleCollapse]);

  // Ensure this only runs on client
  useEffect(() => {
    // Auto-expand the current section based on pathname
    const currentSection = menuItems.find(item => 
      item.subItems?.some(subItem => window.location.pathname.startsWith(subItem.href))
    );
    if (currentSection) {
      setExpandedSections(prev => ({
        ...prev,
        [currentSection.title]: true
      }));
    }
  }, []);

  // Handle pathname changes to update expanded sections
  useEffect(() => {
    if (!pathname) return;
    const currentSection = menuItems.find(item => 
      item.subItems?.some(subItem => pathname.startsWith(subItem.href))
    );
    if (currentSection) {
      setExpandedSections(prev => ({
        ...prev,
        [currentSection.title]: true
      }));
    }
  }, [pathname]);

  // Don't render anything during SSR or initial hydration
  if (typeof window === 'undefined') {
    return (
      <div 
        className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background"
        aria-hidden="true"
      ></div>
    );
  }

  const toggleSection = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.subItems) {
      const isExpanded = expandedSections[item.title] || false;
      const isActive = pathname.startsWith(item.href);
      return (
        <div key={item.title} className="space-y-1">
          <div
            onClick={(e) => toggleSection(item.title, e)}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent cursor-pointer",
              (isActive || isExpanded) && "bg-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && (
              <>
                <span className="ml-3">{item.title}</span>
                <ChevronRight 
                  className={cn(
                    "ml-auto h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </>
            )}
          </div>
          {!isCollapsed && isExpanded && (
            <div className="ml-6 space-y-1">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                    pathname === subItem.href && "bg-accent"
                  )}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        key={item.title}
        href={item.href}
        className={cn(
          "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
          pathname === item.href && "bg-accent",
          isCollapsed && "justify-center"
        )}
      >
        <item.icon className="h-5 w-5" />
        {!isCollapsed && <span className="ml-3">{item.title}</span>}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        width: isCollapsed ? '4rem' : '16rem',
        minWidth: isCollapsed ? '4rem' : '16rem'
      }}
      suppressHydrationWarning
    >
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const menuItem = renderMenuItem(item);
            if (isCollapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <div className="w-full">
                      {menuItem}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return menuItem;
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-4 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted z-10"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center">
            v1.0.0
          </div>
        )}
      </div>
      {/* Quick Create Button */}
      <div className="border-t p-4">
        <Tooltip disableHoverableContent={!isCollapsed}>
          <TooltipTrigger asChild>
            <Button 
              className="w-full" 
              onClick={() => setQuickCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {!isCollapsed && "Quick Create"}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" align="center">
              Quick Create
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      <Dialog open={quickCreateOpen} onOpenChange={setQuickCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Blog</DialogTitle>
            <DialogDescription>Start a new blog instantly.</DialogDescription>
          </DialogHeader>
          {/* Add your quick create form or actions here */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



 