
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Suspense } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarNav />
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* App specific header content can go here */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
             <Icons.User className="h-5 w-5" />
             <span className="sr-only">User Profile</span>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
          <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Icons.Spinner className="h-8 w-8 animate-spin text-primary" /></div>}>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
