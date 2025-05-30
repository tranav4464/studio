
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons, type IconName } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import * as React from "react"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface NavItem {
  href?: string;
  label: string;
  icon: IconName;
  badge?: string;
  disabled?: boolean;
  action?: () => void; // For items that trigger an action instead of navigation
}

// Mock user data (replace with actual data source if available)
const mockUser = {
  name: "Demo User",
  email: "user@example.com",
  initials: "DU", 
  avatarUrl: `https://avatar.vercel.sh/user@example.com`, 
};


export function SidebarNav() {
  const pathname = usePathname();
  const { toast } = useToast(); // Initialize useToast
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "Dashboard" },
    { href: "/new-blog", label: "New Blog", icon: "NewBlog" },
    { href: "/my-blogs", label: "My Blogs", icon: "MyBlogs" },
    { href: "/settings", label: "Settings", icon: "Settings" },
    { 
      label: "Help & Guides", 
      icon: "HelpCircle", 
      action: () => toast({ title: "Help & Guides", description: "In-app guides and tips are coming soon!" }) 
    },
  ];
  

  const handleMouseEnterProfile = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsProfilePopoverOpen(true);
  };

  const handleMouseLeaveProfile = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsProfilePopoverOpen(false);
    }, 200); // Small delay to allow moving cursor to popover
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Icons.Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">ContentCraft AI</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              {item.href ? (
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                    tooltip={item.label}
                    disabled={item.disabled}
                    className="w-full justify-start hover:scale-[1.03] transition-transform duration-150"
                  >
                    <IconComponent name={item.icon} />
                    <span>{item.label}</span>
                    {item.badge && <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>}
                  </SidebarMenuButton>
                </Link>
              ) : (
                 <SidebarMenuButton
                    onClick={item.action}
                    tooltip={item.label}
                    disabled={item.disabled}
                    className="w-full justify-start hover:scale-[1.03] transition-transform duration-150"
                  >
                    <IconComponent name={item.icon} />
                    <span>{item.label}</span>
                    {item.badge && <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>}
                  </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <Separator className="my-2"/>
        <Popover open={isProfilePopoverOpen} onOpenChange={setIsProfilePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 hover:scale-[1.03] transition-transform duration-150"
              onMouseEnter={handleMouseEnterProfile}
              onMouseLeave={handleMouseLeaveProfile}
            >
              <Icons.User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-auto min-w-[220px] p-3 shadow-xl rounded-lg" 
            onMouseEnter={handleMouseEnterProfile} 
            onMouseLeave={handleMouseLeaveProfile} 
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                <AvatarFallback>{mockUser.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-none text-foreground">{mockUser.name}</p>
                <p className="text-xs text-muted-foreground">{mockUser.email}</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>
    </>
  );
}

interface IconComponentProps {
  name: IconName;
  className?: string;
}

function IconComponent({ name, className }: IconComponentProps) {
  const Icon = Icons[name];
  if (!Icon) return null;
  return <Icon className={cn("h-4 w-4", className)} />;
}
