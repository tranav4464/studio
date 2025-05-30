
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

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "Dashboard" }, // Already pointing to /dashboard, no change needed here based on instruction
  { href: "/new-blog", label: "New Blog", icon: "NewBlog" },
  { href: "/my-blogs", label: "My Blogs", icon: "MyBlogs" }, // Already pointing to /my-blogs, no change needed here based on instruction
  { href: "/settings", label: "Settings", icon: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

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
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  disabled={item.disabled}
                  className="w-full justify-start"
                >
                  <IconComponent name={item.icon} />
                  <span>{item.label}</span>
                  {item.badge && <Badge variant="secondary" className="ml-auto">{item.badge}</Badge>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <Separator className="my-2"/>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Icons.User className="h-4 w-4" /> 
          <span>Profile</span>
        </Button>
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
