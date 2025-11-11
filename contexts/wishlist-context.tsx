"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  name?: string;
  slug?: string;
  subcategory?: any;
  [key: string]: any;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  adding: Record<string, boolean>;
  removing: Record<string, boolean>;
  /**
   * Add a trick to the wishlist.
   * @param trickId - The trick ID.
   * @param optimisticData - Optional partial data used for immediate optimistic UI so the item isn't blank
   */
  add: (
    trickId: string,
    optimisticData?: Partial<WishlistItem>
  ) => Promise<void>;
  remove: (trickId: string) => Promise<void>;
  refresh: () => Promise<void>;
  lastAddedId: string | null;
  clearLastAdded: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Record<string, boolean>>({});
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setItems([]);
        return;
      }
      const { getWishlist } = await import("@/lib/client/wishlist-client");
      const { tricks, error } = await getWishlist(supabase, user.id);
      if (error) {
        console.error("Wishlist load error", error);
      } else {
        setItems(tricks || []);
      }
    } catch (e) {
      console.error("Wishlist refresh failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      refresh();
    }
  }, [refresh]);

  const add = useCallback(
    async (trickId: string, optimisticData?: Partial<WishlistItem>) => {
      if (!supabase || adding[trickId]) return;
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        toast("Sign in to save goal tricks");
        return;
      }
      setAdding((p) => ({ ...p, [trickId]: true }));
      try {
        const { addToWishlist } = await import("@/lib/client/wishlist-client");
        const res = await addToWishlist(supabase, user.id, trickId);
        if (res.success) {
          // If we already have it, do nothing
          let inserted = false;
          setItems((prev) => {
            if (prev.some((t) => t.id === trickId)) return prev;
            inserted = true;
            return [...prev, { id: trickId, ...(optimisticData || {}) }];
          });
          // Fetch details for that trick only (avoid full refresh)
          if (inserted) {
            try {
              const { data: trickData, error: trickError } = await supabase
                .from("tricks")
                .select(
                  "id,name,slug,subcategory:subcategories(id,name,slug, master_category:master_categories(id,name,slug))"
                )
                .eq("id", trickId)
                .single();
              if (!trickError && trickData) {
                setItems((prev) =>
                  prev.map((t) =>
                    t.id === trickId ? { ...t, ...trickData } : t
                  )
                );
              }
            } catch (e) {
              // ignore detail fetch errors
            }
          }
          setLastAddedId(trickId);
          toast.success("Added to Goal Tricks");
        } else {
          toast.error(res.error || "Failed adding goal trick");
        }
      } catch (e) {
        console.error("Add wishlist failed", e);
        toast.error("Failed adding goal trick");
      } finally {
        setAdding((p) => ({ ...p, [trickId]: false }));
      }
    },
    [adding, refresh]
  );

  const remove = useCallback(
    async (trickId: string) => {
      if (!supabase || removing[trickId]) return;
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      setRemoving((p) => ({ ...p, [trickId]: true }));
      try {
        const { removeFromWishlist } = await import(
          "@/lib/client/wishlist-client"
        );
        const result = await removeFromWishlist(supabase, user.id, trickId);
        if (result.success) {
          setItems((prev) => prev.filter((t) => t.id !== trickId));
          toast.success("Removed from wishlist");
        } else {
          toast.error(result.error || "Failed to remove");
        }
      } catch (e) {
        console.error("Remove wishlist failed", e);
        toast.error("Failed to remove goal trick");
      } finally {
        setRemoving((p) => ({ ...p, [trickId]: false }));
      }
    },
    [removing]
  );

  const clearLastAdded = () => setLastAddedId(null);

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        adding,
        removing,
        add,
        remove,
        refresh,
        lastAddedId,
        clearLastAdded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
