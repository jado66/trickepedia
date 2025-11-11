// 3. app/TrickipediaLayoutClient.tsx - UPDATED
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { TrickipediaHeader } from "@/components/trickipedia-header";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { MasterSideNav } from "@/components/side-nav";
import { NavigationProvider } from "@/contexts/navigation-provider";
import type { NavigationCategory } from "@/components/side-nav/types";
import { WishlistProvider } from "@/contexts/wishlist-context";

export function TrickipediaLayoutClient({
  children,
  initialNavigationData,
}: {
  children: React.ReactNode;
  initialNavigationData: NavigationCategory[];
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <NavigationProvider initialData={initialNavigationData}>
      <TrickipediaHeader
        onMobileMenuClick={() => setMobileSidebarOpen(true)}
        categories={initialNavigationData.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
        }))}
      />
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <SidebarProvider defaultOpen={true}>
          <div className="fixed inset-0 z-50 bg-black/40 flex">
            <div className="bg-background w-[90vw] max-w-[420px] h-full shadow-lg relative animate-slide-in-left flex flex-col px-2 pt-2">
              <button
                aria-label="Close menu"
                className="absolute top-2 right-2 p-2 rounded hover:bg-muted z-10"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex-1 overflow-y-auto min-h-0">
                <MasterSideNav
                  onItemClick={() => setMobileSidebarOpen(false)}
                />
              </div>
            </div>
            <div
              className="flex-1"
              onClick={() => setMobileSidebarOpen(false)}
            />
          </div>
        </SidebarProvider>
      )}
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <Sidebar className="hidden md:flex md:w-65 border-r bg-muted/10">
            <MasterSideNav />
          </Sidebar>
          <SidebarInset className="flex-1">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </NavigationProvider>
  );
}
