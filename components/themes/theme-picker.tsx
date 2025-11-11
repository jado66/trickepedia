"use client";

import * as React from "react";
import { Moon, Sun, Palette, Dumbbell, Waves, Zap, Flame } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "icon" | "nav" | "dropdown";
  className?: string;
};

const themes = [
  {
    name: "Iron Forge",
    value: "iron-forge",
    icon: Dumbbell,
    description: "Dark industrial aesthetic",
    colors: ["#1a0f0a", "#a54a28", "#b8a96b"],
  },
  {
    name: "Energy Rush",
    value: "energy-rush",
    icon: Zap,
    description: "High-energy fitness vibe",
    colors: ["#f8fafc", "#8fbc8f", "#ff69b4"],
  },
  {
    name: "Ocean Depths",
    value: "ocean-depths",
    icon: Waves,
    description: "Calm professional aqua",
    colors: ["#f0f9ff", "#2563eb", "#06b6d4"],
  },
  {
    name: "Sunset Power",
    value: "sunset-power",
    icon: Flame,
    description: "Warm motivational energy",
    colors: ["#fef7ed", "#ea580c", "#dc2626"],
  },
  {
    name: "Trickipedia",
    value: "trickipedia",
    icon: Palette,
    description: "Original light theme",
    colors: ["#fefefe", "#dc2626", "#65a30d"],
  },
];

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme?.includes("dark") || theme === "dark";
  const currentTheme = themes.find(
    (t) => t.value === theme?.replace(".dark", "")
  );

  const toggleDarkMode = () => {
    if (isDark) {
      // Remove .dark suffix or switch from "dark" to a light theme
      const lightTheme =
        theme === "dark" ? "trickipedia" : theme?.replace(".dark", "");
      setTheme(lightTheme || "trickipedia");
    } else {
      // Add .dark suffix or switch to dark
      const darkTheme = theme === "trickipedia" ? "dark" : `${theme}.dark`;
      setTheme(darkTheme);
    }
  };

  // Skeleton states
  if (!mounted) {
    if (variant === "dropdown" || variant === "icon") {
      return (
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <div className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      );
    }
    return <div className="h-9 w-full rounded-md bg-muted/20 animate-pulse" />;
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
          >
            <Palette className="h-4 w-4" />
            <span className="sr-only">Select theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Themes
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = currentTheme?.value === themeOption.value;

            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className="flex items-start gap-3 py-2"
              >
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{themeOption.name}</span>
                    {isSelected && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {themeOption.description}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {themeOption.colors.map((color, i) => (
                      <div
                        key={i}
                        className="h-3 w-3 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}

          {/* <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={toggleDarkMode}
            className="flex items-center gap-2"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            Switch to {isDark ? "Light" : "Dark"} Mode
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "nav") {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={toggleDarkMode}
        className={cn(
          "w-full justify-start gap-2 h-auto py-2 text-base md:text-sm font-normal",
          "hover:text-white",
          className
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="truncate">
          Switch to {isDark ? "Light" : "Dark"} Mode
        </span>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // Icon variant - simple dark/light toggle
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className={cn("h-9 w-9", className)}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">
        Switch to {isDark ? "Light" : "Dark"} Mode
      </span>
    </Button>
  );
}
