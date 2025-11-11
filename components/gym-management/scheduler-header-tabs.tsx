"use client";

import React, { useRef } from "react";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Repeat,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SchedulerSection =
  | "calendar"
  | "dashboard"
  | "settings"
  | "resources"
  | "recurring";

const sections: Array<{ key: SchedulerSection; label: string; Icon: any }> = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "calendar", label: "Calendar", Icon: Calendar },

  { key: "resources", label: "Resources", Icon: MapPin },
  { key: "recurring", label: "Recurring", Icon: Repeat },
];

interface SchedulerHeaderTabsProps {
  active: SchedulerSection;
  onChange: (section: SchedulerSection) => void;
  className?: string;
  /**
   * Variant controls layout:
   * - standalone: full width sticky header bar (default)
   * - inline: just the tablist, to embed next to a page title / subtitle
   */
  variant?: "standalone" | "inline";
  /** Hide background/branding when inline */
  hideBrand?: boolean;
  /** Optional custom brand node in standalone variant */
  brand?: React.ReactNode;
}

export function SchedulerHeaderTabs({
  active,
  onChange,
  className,
  variant = "standalone",
  hideBrand = false,
  brand,
}: SchedulerHeaderTabsProps) {
  const btnRefs = useRef<HTMLButtonElement[]>([]);

  const handleKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + sections.length) % sections.length;
    onChange(sections[next].key);
    requestAnimationFrame(() => btnRefs.current[next]?.focus());
  };

  const tablist = (
    <div
      role="tablist"
      aria-label="Scheduler sections"
      className={cn(
        "flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-none",
        variant === "inline" && "py-0"
      )}
    >
      {sections.map((s, i) => {
        const selected = s.key === active;
        return (
          <button
            key={s.key}
            ref={(el) => {
              if (el) btnRefs.current[i] = el;
            }}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(s.key)}
            onKeyDown={(e) => handleKey(e, i)}
            className={cn(
              "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-sm text-xs md:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              selected
                ? "bg-secondary text-secondary-foreground"
                : "text-foreground/60 hover:text-foreground hover:bg-muted"
            )}
          >
            <s.Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {s.label}
          </button>
        );
      })}
    </div>
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        {!hideBrand && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {brand || (
              <>
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium hidden sm:inline">Scheduler</span>
              </>
            )}
          </div>
        )}
        {tablist}
      </div>
    );
  }

  return (
    <header
      className={cn(
        "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30",
        className
      )}
    >
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Payment Processing</h2>
            <p className="text-muted-foreground">
              Manage payments, invoices, and billing
            </p>
          </div>
        </div>
        {tablist}
      </div>
    </header>
  );
}
