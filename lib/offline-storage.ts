import { openDB, DBSchema, IDBPDatabase } from "idb";

interface TrickipediaDB extends DBSchema {
  tricks: {
    key: string;
    value: any;
    indexes: {
      "by-category": string;
      "by-subcategory": string;
    };
  };
  categories: {
    key: string;
    value: any;
  };
  subcategories: {
    key: string;
    value: any;
  };
  userProgress: {
    key: string;
    value: any;
  };
  metadata: {
    key: string;
    value: { key: string; lastSync: number };
  };
}

let dbPromise: Promise<IDBPDatabase<TrickipediaDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TrickipediaDB>("trickipedia-offline", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tricks")) {
          const tricksStore = db.createObjectStore("tricks", { keyPath: "id" });
          tricksStore.createIndex(
            "by-category",
            "subcategory.master_category.slug"
          );
          tricksStore.createIndex("by-subcategory", "subcategory.slug");
        }

        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("subcategories")) {
          db.createObjectStore("subcategories", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("userProgress")) {
          db.createObjectStore("userProgress", { keyPath: "trick_id" });
        }

        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// Tricks
export async function cacheTricks(tricks: any[]) {
  const db = await getDB();
  const tx = db.transaction("tricks", "readwrite");
  await Promise.all(tricks.map((trick) => tx.store.put(trick)));
  await tx.done;
}

export async function getCachedTricks(
  categorySlug?: string,
  subcategorySlug?: string
) {
  const db = await getDB();
  if (subcategorySlug) {
    return db.getAllFromIndex("tricks", "by-subcategory", subcategorySlug);
  }
  if (categorySlug) {
    return db.getAllFromIndex("tricks", "by-category", categorySlug);
  }
  return db.getAll("tricks");
}

export async function getCachedTrick(id: string) {
  const db = await getDB();
  return db.get("tricks", id);
}

// Categories
export async function cacheCategories(categories: any[]) {
  const db = await getDB();
  const tx = db.transaction("categories", "readwrite");
  await Promise.all(categories.map((cat) => tx.store.put(cat)));
  await tx.done;
}

export async function getCachedCategories() {
  const db = await getDB();
  return db.getAll("categories");
}

// User Progress
export async function cacheUserProgress(progress: any[]) {
  const db = await getDB();
  const tx = db.transaction("userProgress", "readwrite");
  await Promise.all(progress.map((p) => tx.store.put(p)));
  await tx.done;
}

export async function getCachedUserProgress() {
  const db = await getDB();
  return db.getAll("userProgress");
}

// Metadata
export async function setLastSync() {
  const db = await getDB();
  await db.put("metadata", { key: "lastSync", lastSync: Date.now() });
}

export async function getLastSync(): Promise<number | null> {
  const db = await getDB();
  const metadata = await db.get("metadata", "lastSync");
  return metadata?.lastSync || null;
}

// ---------------------------------------------------------------------------
// Backward compatibility helpers (legacy names used by older hook code)
// ---------------------------------------------------------------------------

// Legacy alias for cacheTricks
export const saveTricks = cacheTricks;

// Legacy categories helpers (simple cache wrappers)
export async function saveCategories(categories: any[]) {
  await cacheCategories(categories);
}

export async function getTricksFromCache(
  categorySlug?: string,
  subcategorySlug?: string
) {
  return getCachedTricks(categorySlug, subcategorySlug);
}

export async function getCategoriesFromCache() {
  return getCachedCategories();
}

export async function updateLastSync() {
  await setLastSync();
}

export async function clearAllCache() {
  const db = await getDB();
  await Promise.all([
    db.clear("tricks"),
    db.clear("categories"),
    db.clear("subcategories"),
    db.clear("userProgress"),
  ]);
}
