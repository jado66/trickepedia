"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThemeToggle as ThemePicker } from "@/components/themes/theme-picker";
import { DemoBadge } from "./demo-badge";
import { Badge } from "@/components/ui/badge";
import { Activity, Menu, Search, Plus, Settings2, Sliders } from "lucide-react";
import { GymManagementNavSettingsPanel } from "./nav-settings-panel";
import { GymOptionsPanel } from "./gym-options-panel";
import { useGymSetup } from "@/contexts/gym/gym-setup-provider"; // unified setup + nav source
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface EnhancedGymManagementLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  className?: string;
  viewMode: "manager" | "staff";
  onChangeViewMode: (mode: "manager" | "staff") => void;
}

export function GymManagementLayout({
  activeTab,
  setActiveTab,
  children,
  className,
  viewMode,
  onChangeViewMode,
}: EnhancedGymManagementLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const { enabledApps, setupConfig } = useGymSetup();

  // Get facility name from setup config, fallback to default
  const facilityName = setupConfig?.facilityName || "GymFlow Pro";
  const facilityShortName =
    facilityName.length > 12 ? facilityName.split(" ")[0] : facilityName;

  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="space-y-2">
      {enabledApps.map((item) => (
        <Button
          key={item.id}
          aria-current={activeTab === item.id ? "page" : undefined}
          variant={activeTab === item.id ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setActiveTab(item.id);
            onItemClick?.();
          }}
        >
          <item.icon className="h-4 w-4 mr-2" />
          <span className="flex items-center gap-2">
            <span>{item.label}</span>
            {item.beta && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                BETA
              </Badge>
            )}
          </span>
        </Button>
      ))}

      {enabledApps.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No apps enabled</p>
          <p className="text-xs mt-1">Use the settings panel to enable apps</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", className)}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-5">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-bold">{facilityName}</h2>
                </div>
                <NavigationContent onItemClick={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold hidden sm:block">
                {facilityName}
              </h1>
              <h1 className="text-lg font-bold sm:hidden">
                {facilityShortName}
              </h1>
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search members, classes..."
                className="w-48 md:w-64 pl-10"
              />
            </div>
            <Button size="icon" className="sm:hidden" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>

            {/* Manager / Staff view toggle */}
            <div
              className="hidden md:inline-flex rounded-md overflow-hidden border bg-background"
              role="group"
              aria-label="Select view mode"
            >
              <button
                type="button"
                onClick={() => onChangeViewMode("manager")}
                aria-pressed={viewMode === "manager"}
                className={`px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  viewMode === "manager"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode("staff")}
                aria-pressed={viewMode === "staff"}
                className={`px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 border-l ${
                  viewMode === "staff"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                Staff
              </button>
            </div>

            {/* <ThemePicker variant="dropdown" /> */}

            {/* Demo controls */}
            <div className="hidden sm:block">
              <DemoBadge />
            </div>

            {/* Gym Options/Settings */}
            <Popover open={optionsOpen} onOpenChange={setOptionsOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Gym options"
                  className="hidden sm:inline-flex"
                >
                  <Sliders className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <GymOptionsPanel />
              </PopoverContent>
            </Popover>

            {/* Navigation Settings */}
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Navigation settings"
                  className="hidden sm:inline-flex"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <GymManagementNavSettingsPanel />
              </PopoverContent>
            </Popover>

            <Button size="sm" className="hidden sm:flex" aria-label="Quick add">
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
            <Button size="icon" className="sm:hidden" aria-label="Quick add">
              <Plus className="h-4 w-4" />
            </Button>

            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>
                {setupConfig?.facilityName
                  ? setupConfig.facilityName.charAt(0).toUpperCase()
                  : "GM"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <nav className="hidden md:block w-56 border-r bg-card p-4">
          <NavigationContent />
        </nav>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
