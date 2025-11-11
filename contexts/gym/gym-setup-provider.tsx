"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Shield,
  DollarSign,
  Activity,
  ClipboardList,
  Wrench,
  AlertTriangle,
  FileText,
  Package,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SetupConfig {
  facilityName: string;
  facilityType: string;
  selectedTheme: string;
  selectedApps: string[];
  contactEmail?: string;
  timezone: string;
  setupDate: string;
  isSetupComplete: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  beta?: boolean;
  description?: string;
}

interface SetupContextValue {
  // Setup state
  isSetupComplete: boolean;
  setupConfig: SetupConfig | null;
  isLoading: boolean;

  // Setup actions
  completeSetup: (
    config: Omit<SetupConfig, "isSetupComplete" | "setupDate">
  ) => void;
  updateFacilityName: (name: string) => void;
  resetSetup: () => void;

  // Navigation (filtered based on setup)
  availableApps: NavigationItem[];
  enabledApps: NavigationItem[];
  settings: {
    order: string[];
    disabled: string[];
  };
  updateOrder: (newOrder: string[]) => void;
  toggleItem: (id: string) => void;
  reset: () => void;
}

// All available navigation items
const ALL_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "members",
    label: "Members",
    icon: Users,
    description: "Manage member profiles, memberships, and contact information",
  },
  {
    id: "classes",
    label: "Classes",
    icon: Calendar,
    description: "Manage class schedules, instructors, and enrollment",
  },
  {
    id: "scheduling",
    label: "Scheduler",
    icon: CalendarClock,
    description: "Drag-and-drop schedule builder for classes and events",
    beta: true,
  },
  {
    id: "staff",
    label: "Staff",
    icon: Shield,
    description: "Handle staff scheduling, payroll, and certifications",
  },
  {
    id: "equipment",
    label: "Equipment",
    icon: Wrench,
    description: "Monitor equipment maintenance, usage, and inventory",
    beta: true,
  },
  {
    id: "payments",
    label: "Payments",
    icon: DollarSign,
    description: "Process membership fees, class payments, and transactions",
    beta: true,
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: Activity,
    description: "Digital check-in for members and class attendance",
  },
  {
    id: "waivers",
    label: "Waivers",
    icon: FileText,
    description: "Digital waivers and liability documentation",
    beta: true,
  },
  {
    id: "incidents",
    label: "Incidents",
    icon: AlertTriangle,
    description: "Track and manage safety incidents and injuries",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: ClipboardList,
    description: "Business insights, reports, and performance metrics",
    beta: true,
  },
  {
    id: "store",
    label: "Store",
    icon: Package,
    description: "Inventory and sales for merchandise and equipment",
  },
];

// Default setup configuration
const DEFAULT_SETUP: SetupConfig = {
  facilityName: "",
  facilityType: "",
  selectedTheme: "trickipedia",
  selectedApps: [],
  contactEmail: "",
  timezone: "America/New_York",
  setupDate: "",
  isSetupComplete: false,
};

// Storage keys
const SETUP_STORAGE_KEY = "gym-setup-config";
const NAV_STORAGE_KEY = "gym-nav-settings";
// Legacy standalone nav provider storage key (for backward compatibility cleanup)
const LEGACY_NAV_STORAGE_KEY = "gymMgmtNavSettings:v1";

const SetupContext = createContext<SetupContextValue | undefined>(undefined);

export const GymSetupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [setupConfig, setSetupConfig] = useState<SetupConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navSettings, setNavSettings] = useState({
    order: [] as string[],
    disabled: [] as string[],
  });

  // Load setup config from localStorage on mount
  useEffect(() => {
    try {
      const savedSetup = localStorage.getItem(SETUP_STORAGE_KEY);
      if (savedSetup) {
        const config = JSON.parse(savedSetup) as SetupConfig;
        console.log("Loaded setup config from localStorage:", config);
        setSetupConfig(config);

        // Initialize navigation based on setup config
        if (config.isSetupComplete && config.selectedApps.length > 0) {
          console.log(
            "Initializing navigation with apps:",
            config.selectedApps
          );
          initializeNavigation(config.selectedApps);
        }
      } else {
        console.log("No saved setup found, using defaults");
        setSetupConfig(DEFAULT_SETUP);
      }

      const savedNav = localStorage.getItem(NAV_STORAGE_KEY);
      if (savedNav) {
        const navData = JSON.parse(savedNav);
        console.log("Loaded navigation settings:", navData);
        setNavSettings(navData);
      }
    } catch (error) {
      console.error("Error loading setup config:", error);
      setSetupConfig(DEFAULT_SETUP);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize navigation order based on selected apps
  const initializeNavigation = (selectedApps: string[]) => {
    const savedNav = localStorage.getItem(NAV_STORAGE_KEY);
    if (!savedNav) {
      // First time setup - create initial navigation state
      const allAppIds = ALL_NAVIGATION_ITEMS.map((item) => item.id);
      const disabledApps = allAppIds.filter((id) => !selectedApps.includes(id));

      const newNavSettings = {
        order: selectedApps, // Use the setup order as initial order
        disabled: disabledApps,
      };

      setNavSettings(newNavSettings);
      localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(newNavSettings));
    }
  };

  // Save setup config to localStorage
  const saveSetupConfig = (config: SetupConfig) => {
    setSetupConfig(config);
    localStorage.setItem(SETUP_STORAGE_KEY, JSON.stringify(config));
  };

  // Save navigation settings to localStorage
  const saveNavSettings = (settings: typeof navSettings) => {
    setNavSettings(settings);
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(settings));
  };

  const completeSetup = (
    config: Omit<SetupConfig, "isSetupComplete" | "setupDate">
  ) => {
    const finalConfig: SetupConfig = {
      ...config,
      isSetupComplete: true,
      setupDate: new Date().toISOString(),
    };

    console.log("Completing setup with config:", finalConfig);
    saveSetupConfig(finalConfig);
    initializeNavigation(config.selectedApps);
    console.log(
      "Setup complete, navigation initialized with apps:",
      config.selectedApps
    );
  };

  const updateFacilityName = (name: string) => {
    if (setupConfig) {
      const updatedConfig = { ...setupConfig, facilityName: name };
      saveSetupConfig(updatedConfig);
    }
  };

  const resetSetup = () => {
    const resetConfig = { ...DEFAULT_SETUP };
    saveSetupConfig(resetConfig);
    localStorage.removeItem(NAV_STORAGE_KEY);
    // Also remove legacy nav settings so we don't rehydrate old ordering after reset
    try {
      localStorage.removeItem(LEGACY_NAV_STORAGE_KEY);
    } catch {}
    setNavSettings({ order: [], disabled: [] });
    // Broadcast so any listeners (optional future) can respond
    try {
      window.dispatchEvent(new CustomEvent("gym:setup:reset"));
    } catch {}
  };

  const updateOrder = (newOrder: string[]) => {
    const newSettings = { ...navSettings, order: newOrder };
    saveNavSettings(newSettings);
  };

  const toggleItem = (id: string) => {
    const isCurrentlyDisabled = navSettings.disabled.includes(id);

    if (isCurrentlyDisabled) {
      // Enable the item
      const newSettings = {
        ...navSettings,
        disabled: navSettings.disabled.filter((item) => item !== id),
        order: navSettings.order.includes(id)
          ? navSettings.order
          : [...navSettings.order, id],
      };
      saveNavSettings(newSettings);
    } else {
      // Disable the item
      const newSettings = {
        ...navSettings,
        disabled: [...navSettings.disabled, id],
      };
      saveNavSettings(newSettings);
    }
  };

  const reset = () => {
    if (setupConfig?.isSetupComplete && setupConfig.selectedApps.length > 0) {
      // Reset to original setup configuration
      const originalSettings = {
        order: setupConfig.selectedApps,
        disabled: ALL_NAVIGATION_ITEMS.map((item) => item.id).filter(
          (id) => !setupConfig.selectedApps.includes(id)
        ),
      };
      saveNavSettings(originalSettings);
    } else {
      // Reset to default (all enabled)
      const defaultSettings = {
        order: ALL_NAVIGATION_ITEMS.map((item) => item.id),
        disabled: [],
      };
      saveNavSettings(defaultSettings);
    }
  };

  // Get available apps based on setup config
  // ALL apps are always available - setup just determines initial enabled state
  const availableApps = ALL_NAVIGATION_ITEMS;

  // Get enabled apps (available apps minus disabled ones)
  const enabledApps = availableApps
    .filter((item) => !navSettings.disabled.includes(item.id))
    .sort((a, b) => {
      const aIndex = navSettings.order.indexOf(a.id);
      const bIndex = navSettings.order.indexOf(b.id);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  const value: SetupContextValue = {
    isSetupComplete: setupConfig?.isSetupComplete ?? false,
    setupConfig,
    isLoading,
    completeSetup,
    updateFacilityName,
    resetSetup,
    availableApps,
    enabledApps,
    settings: navSettings,
    updateOrder,
    toggleItem,
    reset,
  };

  return (
    <SetupContext.Provider value={value}>{children}</SetupContext.Provider>
  );
};

export const useGymSetup = () => {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useGymSetup must be used within a GymSetupProvider");
  }
  return context;
};

// Hook for navigation items (backward compatibility)
export const useGymManagementNav = () => {
  const {
    enabledApps: items,
    availableApps: allItems,
    settings,
    updateOrder,
    toggleItem,
    reset,
  } = useGymSetup();
  return { items, allItems, settings, updateOrder, toggleItem, reset };
};
