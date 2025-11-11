import { useEffect, useState } from "react";
import {
  saveTricks,
  saveCategories,
  getTricksFromCache,
  getCategoriesFromCache,
  updateLastSync,
  getLastSync,
} from "@/lib/offline-storage";

const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncData = async () => {
    if (!isOnline) return;

    try {
      const lastSync = await getLastSync();
      const now = Date.now();

      // Only sync if it's been more than SYNC_INTERVAL
      if (lastSync && now - lastSync < SYNC_INTERVAL) {
        return;
      }

      // Fetch and cache all data
      const [tricksRes, categoriesRes] = await Promise.all([
        fetch("/api/tricks/all"),
        fetch("/api/categories/all"),
      ]);

      const tricks = await tricksRes.json();
      const categories = await categoriesRes.json();

      await saveTricks(tricks);
      await saveCategories(categories);
      await updateLastSync();

      console.log("Data synced successfully");
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  return { isOnline, syncData };
}
