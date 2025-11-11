"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "icon" | "nav";
  className?: string;
};

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Use resolvedTheme to avoid mismatch during hydration
  const current = (theme === "system" ? resolvedTheme : theme) || "light";
  const isDark = current === "dark";
  const nextLabel = isDark ? "Light" : "Dark";

  const toggleTheme = () => setTheme(isDark ? "trickipedia" : "dark");

  // Skeleton states
  if (!mounted) {
    if (variant === "icon") {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <div className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }
    return <div className="h-9 w-full rounded-md bg-muted/20 animate-pulse" />;
  }

  if (variant === "nav") {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={toggleTheme}
        aria-pressed={isDark}
        className={cn(
          // Mirror nav item styling
          "flex w-full items-center gap-2 rounded-md text-sm font-medium text-left",
          // Colors & interactive states
          "text-sidebar-foreground hover:bg-sidebar-accent  hover:text-muted transition-colors",
          // Accessibility focus styles (match button defaults but ensure visible)
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="truncate">Switch to {nextLabel} Mode</span>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // Icon variant
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={cn("h-9 w-9", className)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Switch to {nextLabel} Mode</span>
    </Button>
  );
}
