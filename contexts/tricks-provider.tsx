"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  cacheTricks,
  getCachedTricks,
  setLastSync,
  getLastSync,
} from "@/lib/offline-storage";
import { toast } from "sonner";
import type { Trick } from "@/types/trick";

const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

interface TricksContextType {
  // Connectivity / sync
  isOnline: boolean;
  lastSyncTime: number | null;
  isSyncing: boolean;
  syncData: () => Promise<void>; // kept for backward compatibility
  // Data
  tricks: Trick[];
  loading: boolean;
  error: string | null;
  // Helpers
  refetch: () => Promise<void>;
  getTrickById: (id: string) => Trick | undefined;
  getTricksByCategory: (categorySlug: string) => Trick[];
  getTricksBySubcategory: (subcategorySlug: string) => Trick[];
}

const TricksContext = createContext<TricksContextType | undefined>(undefined);

export function TricksProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Tricks data state
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTricks = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/tricks/all");
      if (!response.ok) throw new Error("Failed to fetch tricks");
      const freshTricks: Trick[] = await response.json();
      setTricks(freshTricks);
      await cacheTricks(freshTricks);
      await setLastSync();
      setLastSyncTime(Date.now());
      console.log(
        "Data synced successfully",
        freshTricks.length,
        "tricks cached"
      );
    } catch (e: any) {
      console.error("Sync failed:", e);
      setError(e?.message || "Failed to sync data");
      toast.error("Failed to sync data");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncData = useCallback(async () => {
    await fetchTricks();
  }, []);

  const refetch = useCallback(async () => {
    await fetchTricks();
  }, []);

  // Helper methods (memoized via useCallback where needed)
  const getTrickById = useCallback(
    (id: string) => tricks.find((t) => t.id === id),
    [tricks]
  );

  const getTricksByCategory = useCallback(
    (categorySlug: string) =>
      tricks.filter(
        (t) => t.subcategory?.master_category?.slug === categorySlug
      ),
    [tricks]
  );

  const getTricksBySubcategory = useCallback(
    (subcategorySlug: string) =>
      tricks.filter((t) => t.subcategory?.slug === subcategorySlug),
    [tricks]
  );

  // INITIAL LOAD / EVENT LISTENERS EFFECT
  useEffect(() => {
    let cancelled = false;

    // Load cached tricks and fetch fresh data
    (async () => {
      try {
        const [lastSync, cached] = await Promise.all([
          getLastSync(),
          getCachedTricks(),
        ]);
        if (!cancelled) {
          setLastSyncTime(lastSync);
          if (cached && cached.length) {
            setTricks(cached as Trick[]);
          }
        }
      } catch (e) {
        if (!cancelled) setError("Failed loading cached tricks");
        console.error("Failed to load cached tricks", e);
      } finally {
        if (!cancelled) setLoading(false);
      }

      // Fetch fresh data
      if (!cancelled) {
        await fetchTricks();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TricksContext.Provider
      value={{
        // connectivity
        isOnline,
        lastSyncTime,
        isSyncing,
        syncData,
        // data
        tricks,
        loading,
        error,
        // helpers
        refetch,
        getTrickById,
        getTricksByCategory,
        getTricksBySubcategory,
      }}
    >
      {children}
    </TricksContext.Provider>
  );
}

export function useTricks() {
  const context = useContext(TricksContext);
  if (!context) {
    throw new Error("useTricks must be used within TricksProvider");
  }
  return context;
}
