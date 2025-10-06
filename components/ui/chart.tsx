"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ChartContainer({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-2 overflow-hidden rounded-md border bg-card p-4 text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ChartHeader({
  className,
  children,
  title,
  description,
}: React.PropsWithChildren<{
  className?: string;
  title?: string;
  description?: string;
}>) {
  return (
    <div className={cn("flex flex-col", className)}>
      {title && (
        <h4 className="text-sm font-medium leading-none tracking-tight">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}

export function ChartLegend({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
      {children}
    </div>
  );
}

export function ChartLegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}
