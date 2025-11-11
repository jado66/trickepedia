"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  getUserProgressWithTotals,
  getUserTrickIds,
} from "@/lib/client/tricks-data-client";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/contexts/user-provider";
import { useMasterCategories } from "@/hooks/use-categories";
import { toast } from "sonner";

export interface ProgressStats {
  sport: string;
  slug: string;
  mastered: number;
  total: number;
  percentage: number;
}

interface UserProgressContextType {
  progressStats: ProgressStats[];
  userCanDoTricks: Set<string>;
  loading: boolean;
  refreshProgress: () => Promise<void>;
  markTrickAsLearned: (
    trickId: string,
    categorySlug?: string
  ) => Promise<boolean>;
  updateTrickLearned: (trickId: string, categorySlug: string) => void;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(
  undefined
);

interface UserProgressProviderProps {
  children: React.ReactNode;
}

// LocalStorage keys
const STORAGE_KEYS = {
  PROGRESS_STATS: "user_progress_stats",
  USER_TRICKS: "user_can_do_tricks",
  LAST_UPDATED: "user_progress_last_updated",
};

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;

    const parsed = JSON.parse(stored);

    // Special handling for Set
    if (key === STORAGE_KEYS.USER_TRICKS && Array.isArray(parsed)) {
      return new Set(parsed) as T;
    }

    return parsed as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    // Special handling for Set
    const toStore = value instanceof Set ? Array.from(value) : value;
    localStorage.setItem(key, JSON.stringify(toStore));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function UserProgressProvider({ children }: UserProgressProviderProps) {
  // Load from localStorage immediately for instant display
  const [progressStats, setProgressStats] = useState<ProgressStats[]>(() =>
    loadFromStorage(STORAGE_KEYS.PROGRESS_STATS, [])
  );
  const [userCanDoTricks, setUserCanDoTricks] = useState<Set<string>>(() =>
    loadFromStorage(STORAGE_KEYS.USER_TRICKS, new Set())
  );
  const [loading, setLoading] = useState(false);

  // Get user data and categories from existing providers/hooks
  const { user } = useUser();
  const { categories, loading: categoriesLoading } = useMasterCategories();

  // Get user sports from user data
  const userSportsIds = user?.users_sports_ids || [];

  // Fetch user's completed tricks
  const fetchUserTricks = useCallback(async () => {
    if (!user?.id || !supabase) {
      const emptySet = new Set<string>();
      setUserCanDoTricks(emptySet);
      saveToStorage(STORAGE_KEYS.USER_TRICKS, emptySet);
      return emptySet;
    }

    try {
      const userTrickIds = await getUserTrickIds(supabase, user.id);

      // Only update state and storage if data has changed
      setUserCanDoTricks((prev) => {
        const hasChanged =
          prev.size !== userTrickIds.size ||
          Array.from(userTrickIds).some((id) => !prev.has(id));

        if (hasChanged) {
          saveToStorage(STORAGE_KEYS.USER_TRICKS, userTrickIds);
          return userTrickIds;
        }
        return prev;
      });

      return userTrickIds;
    } catch (error) {
      console.error("Failed to fetch user tricks:", error);
      // Keep existing data on error, don't clear it
      return userCanDoTricks;
    }
  }, [user?.id]);

  // Fetch progress stats
  const fetchProgressStats = useCallback(async () => {
    // Only fetch if we have all required data
    if (!user?.id || userSportsIds.length === 0 || categories.length === 0) {
      const emptyStats: ProgressStats[] = [];
      setProgressStats(emptyStats);
      saveToStorage(STORAGE_KEYS.PROGRESS_STATS, emptyStats);
      return;
    }

    try {
      const progressData = await getUserProgressWithTotals(
        supabase,
        user.id,
        userSportsIds
      );

      const stats: ProgressStats[] = progressData
        .map((data) => {
          const category = categories.find((cat) => cat.id === data.categoryId);
          if (!category) return null;

          const mastered = data.completed;
          const total = data.total;
          const percentage =
            total > 0 ? Math.round((mastered / total) * 100) : 0;

          return {
            sport: category.name,
            slug: category.slug,
            mastered,
            total,
            percentage,
          };
        })
        .filter(Boolean) as ProgressStats[];

      // Sort by progress descending
      stats.sort((a, b) => b.percentage - a.percentage);

      // Only update if data has changed
      setProgressStats((prev) => {
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(stats);

        if (hasChanged) {
          saveToStorage(STORAGE_KEYS.PROGRESS_STATS, stats);
          saveToStorage(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
          return stats;
        }
        return prev;
      });
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      // Keep existing data on error, don't clear it
    }
  }, [user?.id, userSportsIds, categories]);

  // Combined refresh function that fetches both tricks and progress
  const refreshProgress = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Fetch both in parallel
      await Promise.all([fetchUserTricks(), fetchProgressStats()]);
    } finally {
      setLoading(false);
    }
  }, [fetchUserTricks, fetchProgressStats, user?.id]);

  // Initial fetch when dependencies change
  useEffect(() => {
    // Don't fetch while categories are still loading or if no user
    if (categoriesLoading || !user?.id) return;

    refreshProgress();
  }, [refreshProgress, categoriesLoading, user?.id]);

  // Optimistic update when a trick is learned
  const updateTrickLearned = useCallback(
    (trickId: string, categorySlug: string) => {
      // Update the tricks set
      setUserCanDoTricks((prev) => {
        const updated = new Set([...prev, trickId]);
        saveToStorage(STORAGE_KEYS.USER_TRICKS, updated);
        return updated;
      });

      // Update the progress stats
      setProgressStats((prevStats) => {
        const newStats = [...prevStats];
        const statIndex = newStats.findIndex(
          (stat) => stat.slug === categorySlug
        );

        if (statIndex !== -1) {
          const stat = { ...newStats[statIndex] };
          stat.mastered += 1;
          stat.percentage =
            stat.total > 0 ? Math.round((stat.mastered / stat.total) * 100) : 0;
          newStats[statIndex] = stat;

          // Re-sort by progress
          newStats.sort((a, b) => b.percentage - a.percentage);
        }

        // Save updated stats to localStorage
        saveToStorage(STORAGE_KEYS.PROGRESS_STATS, newStats);
        saveToStorage(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());

        return newStats;
      });
    },
    []
  );

  // Mark a trick as learned (handles the database update)
  const markTrickAsLearned = useCallback(
    async (trickId: string, categorySlug?: string): Promise<boolean> => {
      if (!user?.id) {
        toast.error("Login required");
        return false;
      }

      if (userCanDoTricks.has(trickId)) {
        return true; // Already learned
      }

      // Store previous state for rollback
      const previousTricks = userCanDoTricks;
      const previousStats = progressStats;

      // Optimistic update
      const optimisticTricks = new Set([...userCanDoTricks, trickId]);
      setUserCanDoTricks(optimisticTricks);
      saveToStorage(STORAGE_KEYS.USER_TRICKS, optimisticTricks);

      // Update progress if category slug provided
      if (categorySlug) {
        updateTrickLearned(trickId, categorySlug);
      }

      try {
        const { error } = await supabase.from("user_tricks").upsert({
          user_id: user.id,
          trick_id: trickId,
          can_do: true,
          achieved_at: new Date().toISOString(),
        });

        if (error) throw error;

        // If no category slug was provided, refresh from server
        if (!categorySlug) {
          await refreshProgress();
        }

        return true;
      } catch (error) {
        console.error("Failed to mark trick as learned:", error);

        // Revert optimistic update in both state and storage
        setUserCanDoTricks(previousTricks);
        saveToStorage(STORAGE_KEYS.USER_TRICKS, previousTricks);

        if (categorySlug) {
          setProgressStats(previousStats);
          saveToStorage(STORAGE_KEYS.PROGRESS_STATS, previousStats);
        }

        toast.error("Failed to update trick");
        return false;
      }
    },
    [
      user?.id,
      userCanDoTricks,
      progressStats,
      updateTrickLearned,
      refreshProgress,
    ]
  );

  const value: UserProgressContextType = {
    progressStats,
    userCanDoTricks,
    loading: loading || categoriesLoading,
    refreshProgress,
    markTrickAsLearned,
    updateTrickLearned,
  };

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error(
      "useUserProgress must be used within a UserProgressProvider"
    );
  }
  return context;
}
