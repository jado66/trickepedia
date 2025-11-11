/**
 * IndexedDB debugging and monitoring utilities
 * Use these in development to inspect and manage the IndexedDB cache
 */

import {
  loadTricksFromIndexedDB,
  clearTricksFromIndexedDB,
  getLastUpdatedFromIndexedDB,
} from "./tricks-db";

/**
 * Get comprehensive stats about the IndexedDB cache
 */
export async function getIndexedDBStats() {
  try {
    const tricks = await loadTricksFromIndexedDB();
    const lastUpdated = await getLastUpdatedFromIndexedDB();

    const stats = {
      totalTricks: tricks.length,
      lastUpdated: lastUpdated || "Never",
      sizeEstimate: estimateSize(tricks),
      categories: countByCategory(tricks),
      subcategories: countBySubcategory(tricks),
      difficultyLevels: countByDifficulty(tricks),
    };

    return stats;
  } catch (error) {
    console.error("Error getting IndexedDB stats:", error);
    return null;
  }
}

/**
 * Estimate the size of data in bytes
 */
function estimateSize(data: any): string {
  const jsonString = JSON.stringify(data);
  const bytes = new Blob([jsonString]).size;

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Count tricks by category
 */
function countByCategory(tricks: any[]): Record<string, number> {
  const counts: Record<string, number> = {};

  tricks.forEach((trick) => {
    const category =
      trick.subcategory?.master_category?.slug || "uncategorized";
    counts[category] = (counts[category] || 0) + 1;
  });

  return counts;
}

/**
 * Count tricks by subcategory
 */
function countBySubcategory(tricks: any[]): Record<string, number> {
  const counts: Record<string, number> = {};

  tricks.forEach((trick) => {
    const subcategory = trick.subcategory?.slug || "uncategorized";
    counts[subcategory] = (counts[subcategory] || 0) + 1;
  });

  return counts;
}

/**
 * Count tricks by difficulty level
 */
function countByDifficulty(tricks: any[]): Record<string, number> {
  const counts: Record<string, number> = {};

  tricks.forEach((trick) => {
    const difficulty = trick.difficulty_level || "unknown";
    counts[difficulty] = (counts[difficulty] || 0) + 1;
  });

  return counts;
}

/**
 * Log comprehensive cache stats to console
 */
export async function logCacheStats() {
  const stats = await getIndexedDBStats();

  if (!stats) {
    console.log("❌ No cache data available");
    return;
  }

  console.group("📊 IndexedDB Cache Stats");
  console.log(`Total Tricks: ${stats.totalTricks}`);
  console.log(`Last Updated: ${stats.lastUpdated}`);
  console.log(`Estimated Size: ${stats.sizeEstimate}`);

  console.group("📁 By Category");
  Object.entries(stats.categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });
  console.groupEnd();

  console.group("📂 By Subcategory");
  Object.entries(stats.subcategories).forEach(([subcategory, count]) => {
    console.log(`  ${subcategory}: ${count}`);
  });
  console.groupEnd();

  console.group("⭐ By Difficulty");
  Object.entries(stats.difficultyLevels).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });
  console.groupEnd();

  console.groupEnd();
}

/**
 * Check browser storage quota and usage
 */
export async function checkStorageQuota() {
  if (!("storage" in navigator && "estimate" in navigator.storage)) {
    console.log("⚠️ Storage API not supported in this browser");
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    const info = {
      usage: formatBytes(usage),
      quota: formatBytes(quota),
      percentUsed: percentUsed.toFixed(2) + "%",
      available: formatBytes(quota - usage),
    };

    console.group("💾 Storage Quota");
    console.log(`Used: ${info.usage} (${info.percentUsed})`);
    console.log(`Total: ${info.quota}`);
    console.log(`Available: ${info.available}`);
    console.groupEnd();

    return info;
  } catch (error) {
    console.error("Error checking storage quota:", error);
    return null;
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Clear cache and log confirmation
 */
export async function clearCacheWithLog() {
  try {
    await clearTricksFromIndexedDB();
    console.log("✅ Cache cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
  }
}

/**
 * Export all cache data as JSON (useful for debugging)
 */
export async function exportCacheData() {
  try {
    const tricks = await loadTricksFromIndexedDB();
    const lastUpdated = await getLastUpdatedFromIndexedDB();

    const exportData = {
      exportedAt: new Date().toISOString(),
      lastUpdated,
      tricksCount: tricks.length,
      tricks,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `trickipedia-cache-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
    console.log("✅ Cache data exported");
  } catch (error) {
    console.error("❌ Error exporting cache data:", error);
  }
}

/**
 * Make debugging utilities available globally in development
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).tricksCache = {
    stats: getIndexedDBStats,
    log: logCacheStats,
    quota: checkStorageQuota,
    clear: clearCacheWithLog,
    export: exportCacheData,
  };

  console.log(
    "🔧 Tricks cache utilities available at window.tricksCache:",
    "\n  - stats()  : Get cache statistics",
    "\n  - log()    : Log cache stats to console",
    "\n  - quota()  : Check storage quota",
    "\n  - clear()  : Clear all cached data",
    "\n  - export() : Download cache as JSON"
  );
}
