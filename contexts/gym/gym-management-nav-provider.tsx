"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BASE_GYM_NAV_ITEMS,
  GymNavItem,
} from "@/components/gym-management/navigation-items";

// Simple localStorage persistence (can later be swapped to Supabase user profile table)
const LS_KEY = "gymMgmtNavSettings:v1";

export interface GymManagementNavSettings {
  // Ordered list of nav item IDs the user has chosen to display
  order: string[];
  // Set of disabled nav item IDs (inverse of enabled list for easier diff when base grows)
  disabled: string[];
}

interface GymManagementNavContextValue {
  items: GymNavItem[]; // resolved, filtered & ordered list to render
  settings: GymManagementNavSettings;
  updateOrder: (order: string[]) => void;
  toggleItem: (id: string) => void; // enable/disable
  reset: () => void;
  allItems: GymNavItem[]; // full catalog
}

const GymManagementNavContext = createContext<
  GymManagementNavContextValue | undefined
>(undefined);

const defaultSettings: GymManagementNavSettings = {
  order: BASE_GYM_NAV_ITEMS.map((i) => i.id),
  disabled: [],
};

function loadSettings(): GymManagementNavSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    // Basic validation & forward compatibility when new items are added
    const baseIds = new Set(BASE_GYM_NAV_ITEMS.map((i) => i.id));
    const order: string[] = (parsed.order || []).filter((id: string) =>
      baseIds.has(id)
    );
    // Append any new IDs not yet in stored order
    BASE_GYM_NAV_ITEMS.forEach((i) => {
      if (!order.includes(i.id)) order.push(i.id);
    });
    const disabled: string[] = (parsed.disabled || []).filter((id: string) =>
      baseIds.has(id)
    );
    return { order, disabled };
  } catch {
    return defaultSettings;
  }
}

function persist(settings: GymManagementNavSettings) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}

export const GymManagementNavProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [settings, setSettings] =
    useState<GymManagementNavSettings>(defaultSettings);

  // Load once on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = (next: GymManagementNavSettings) => {
    setSettings(next);
    persist(next);
  };

  const updateOrder = (order: string[]) => {
    update({ ...settings, order });
  };

  const toggleItem = (id: string) => {
    const disabled = new Set(settings.disabled);
    if (disabled.has(id)) disabled.delete(id);
    else disabled.add(id);
    update({ ...settings, disabled: Array.from(disabled) });
  };

  const reset = () => {
    update(defaultSettings);
  };

  const items = useMemo(() => {
    const disabledSet = new Set(settings.disabled);
    return settings.order
      .map((id) => BASE_GYM_NAV_ITEMS.find((i) => i.id === id)!)
      .filter(Boolean)
      .filter((i) => !disabledSet.has(i.id));
  }, [settings]);

  const value: GymManagementNavContextValue = {
    items,
    settings,
    updateOrder,
    toggleItem,
    reset,
    allItems: BASE_GYM_NAV_ITEMS,
  };

  return (
    <GymManagementNavContext.Provider value={value}>
      {children}
    </GymManagementNavContext.Provider>
  );
};

export function useGymManagementNav() {
  const ctx = useContext(GymManagementNavContext);
  if (!ctx)
    throw new Error(
      "useGymManagementNav must be used within GymManagementNavProvider"
    );
  return ctx;
}
