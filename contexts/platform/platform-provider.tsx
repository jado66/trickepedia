// src/contexts/platform-store.ts
"use client";

import { create } from "zustand";
import { useGymStore } from "@/contexts/gym/gym-provider";
import { useWaiverStore } from "@/contexts/waivers/waiver-provider";

// Define the PlatformStore interface to match PlatformContextValue
interface PlatformStore {
  // Raw domain stores (read-only pass-through)
  gym: ReturnType<typeof useGymStore.getState>;
  waivers: ReturnType<typeof useWaiverStore.getState>;
  // Aggregate loading (if either domain loading)
  loading: boolean;
  // Unified reset / seed operations
  resetAll: () => Promise<void>; // clear gym domain data + waiver data (no reseed)
  reseedAll: () => Promise<void>; // reseed both gym and waivers demo data
  purgeAll: () => Promise<void>; // hard purge everything (meta preserved) + clear waivers
  // Granular domain-specific helpers
  resetGym: () => Promise<void>; // purge gym domain only (legacy waivers store cleared via gym)
  reseedGym: () => Promise<void>; // seed gym domain (does not touch waiver templates unless reseedAll)
  resetWaivers: () => Promise<void>; // clear waiver templates & signed waivers
  reseedWaivers: () => Promise<void>; // clear + seed waiver templates & signed waivers
  // Initialize both stores
  init: () => Promise<void>;
  // Track initialization state
  isInitialized: boolean;
}

export const usePlatformStore = create<PlatformStore>()((set, get) => ({
  gym: useGymStore.getState(),
  waivers: useWaiverStore.getState(),
  loading: true,
  isInitialized: false,
  init: async () => {
    if (get().isInitialized) return; // Prevent re-initialization
    await Promise.all([
      useGymStore.getState().init(),
      useWaiverStore.getState().init(),
    ]);
    set({
      gym: useGymStore.getState(),
      waivers: useWaiverStore.getState(),
      loading:
        useGymStore.getState().loading || useWaiverStore.getState().loading,
      isInitialized: true,
    });
  },
  resetGym: async () => {
    await useGymStore.getState().purgeAllGymData();
    set({ gym: useGymStore.getState() });
  },
  reseedGym: async () => {
    await useGymStore.getState().resetToSeed();
    set({ gym: useGymStore.getState() });
  },
  resetWaivers: async () => {
    await useWaiverStore.getState().resetWaivers();
    set({ waivers: useWaiverStore.getState() });
  },
  reseedWaivers: async () => {
    await useWaiverStore.getState().resetWaiversToSeed();
    set({ waivers: useWaiverStore.getState() });
  },
  resetAll: async () => {
    await Promise.all([
      useGymStore.getState().purgeAllGymData(),
      useWaiverStore.getState().resetWaivers(),
    ]);
    set({
      gym: useGymStore.getState(),
      waivers: useWaiverStore.getState(),
    });
  },
  reseedAll: async () => {
    await Promise.all([
      useGymStore.getState().resetToSeed(),
      useWaiverStore.getState().resetWaiversToSeed(),
    ]);
    set({
      gym: useGymStore.getState(),
      waivers: useWaiverStore.getState(),
    });
  },
  purgeAll: async () => {
    await Promise.all([
      useGymStore.getState().purgeAllGymData(),
      useWaiverStore.getState().resetWaivers(),
    ]);
    set({
      gym: useGymStore.getState(),
      waivers: useWaiverStore.getState(),
    });
  },
}));

// Subscribe to changes in gym and waiver stores to keep loading state in sync
if (typeof window !== "undefined") {
  const unsubscribeGym = useGymStore.subscribe((state) => {
    usePlatformStore.setState({
      gym: state,
      loading: state.loading || useWaiverStore.getState().loading,
    });
  });
  const unsubscribeWaiver = useWaiverStore.subscribe((state) => {
    usePlatformStore.setState({
      waivers: state,
      loading: state.loading || useGymStore.getState().loading,
    });
  });
  // Cleanup subscriptions on module unload (optional, for hot-reloading or SSR safety)
  window.addEventListener("unload", () => {
    unsubscribeGym();
    unsubscribeWaiver();
  });
}

// Client-side wrapper component to initialize the store
import { useEffect } from "react";

export const PlatformInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { init, isInitialized } = usePlatformStore();

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
  }, [init, isInitialized]);

  return <>{children}</>;
};

// Hook to use the platform store
export function usePlatform() {
  return usePlatformStore();
}
