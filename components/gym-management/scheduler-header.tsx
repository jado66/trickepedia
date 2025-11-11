"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Repeat,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Central navigation config so pages stay in sync
export const schedulerNav = [
  { name: "Calendar", href: "/scheduler", icon: Calendar },
  { name: "Dashboard", href: "/scheduler/dashboard", icon: LayoutDashboard },
  { name: "Scheduler", href: "/scheduler/settings", icon: Settings },
  { name: "Resources", href: "/scheduler/resources", icon: MapPin },
  { name: "Recurring", href: "/scheduler/recurring", icon: Repeat },
];

export function SchedulerHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="container flex h-14 md:h-16 items-center">
        <div className="mr-6 md:mr-8">
          <Link href="/scheduler" className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            <span className="font-semibold text-lg md:text-xl tracking-tight">
              Gym Scheduler
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium overflow-x-auto">
          {schedulerNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 rounded-sm px-1.5 py-1 transition-colors",
                  isActive
                    ? "text-foreground border-b-2 border-primary"
                    : "text-foreground/60 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
