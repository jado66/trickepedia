"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { fetchMasterCategories } from "@/lib/fetch-tricks";
import type { MasterCategory } from "@/lib/types/database";

interface CategoriesContextType {
  categories: MasterCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(
  undefined
);

interface CategoriesProviderProps {
  children: ReactNode;
}

// LocalStorage keys
const STORAGE_KEYS = {
  CATEGORIES: "master_categories",
  LAST_UPDATED: "categories_last_updated",
};

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  // Load from localStorage immediately for instant display
  const [categories, setCategories] = useState<MasterCategory[]>(() =>
    loadFromStorage(STORAGE_KEYS.CATEGORIES, [])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchMasterCategories();

      if (result.success) {
        // Only update if data has changed
        setCategories((prev) => {
          const hasChanged =
            JSON.stringify(prev) !== JSON.stringify(result.data);

          if (hasChanged) {
            saveToStorage(STORAGE_KEYS.CATEGORIES, result.data);
            saveToStorage(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
            return result.data;
          }
          return prev;
        });
      } else {
        setError(result.error || "Failed to fetch categories");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Keep existing cached data on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

/**
 * Hook to use master categories from context
 */
export function useMasterCategories() {
  const context = useContext(CategoriesContext);

  if (context === undefined) {
    throw new Error(
      "useMasterCategories must be used within a CategoriesProvider"
    );
  }

  return context;
}
