import type { Trick } from "@/types/trick";

const DB_NAME = "TrickipediaDB";
const DB_VERSION = 1;
const TRICKS_STORE = "tricks";
const METADATA_STORE = "metadata";

/**
 * Initialize IndexedDB for tricks storage
 */
export async function initTricksDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create tricks object store if it doesn't exist
      if (!db.objectStoreNames.contains(TRICKS_STORE)) {
        const tricksStore = db.createObjectStore(TRICKS_STORE, {
          keyPath: "id",
        });
        // Create indexes for efficient querying
        tricksStore.createIndex("slug", "slug", { unique: true });
        tricksStore.createIndex(
          "category",
          "subcategory.master_category.slug",
          {
            unique: false,
          }
        );
        tricksStore.createIndex("subcategory", "subcategory.slug", {
          unique: false,
        });
      }

      // Create metadata store for tracking updates
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: "key" });
      }
    };
  });
}

/**
 * Save all tricks to IndexedDB
 */
export async function saveTricksToIndexedDB(tricks: Trick[]): Promise<void> {
  const db = await initTricksDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      [TRICKS_STORE, METADATA_STORE],
      "readwrite"
    );
    const tricksStore = transaction.objectStore(TRICKS_STORE);
    const metadataStore = transaction.objectStore(METADATA_STORE);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    // Clear existing tricks
    tricksStore.clear();

    // Add all tricks
    tricks.forEach((trick) => {
      tricksStore.add(trick);
    });

    // Update last modified timestamp
    metadataStore.put({
      key: "last_updated",
      value: new Date().toISOString(),
    });
  });
}

/**
 * Load all tricks from IndexedDB
 */
export async function loadTricksFromIndexedDB(): Promise<Trick[]> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TRICKS_STORE, "readonly");
      const store = transaction.objectStore(TRICKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error loading tricks from IndexedDB:", error);
    return [];
  }
}

/**
 * Get a single trick by ID from IndexedDB
 */
export async function getTrickByIdFromIndexedDB(
  id: string
): Promise<Trick | null> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TRICKS_STORE, "readonly");
      const store = transaction.objectStore(TRICKS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error getting trick from IndexedDB:", error);
    return null;
  }
}

/**
 * Get tricks by category slug from IndexedDB
 */
export async function getTricksByCategoryFromIndexedDB(
  categorySlug: string
): Promise<Trick[]> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TRICKS_STORE, "readonly");
      const store = transaction.objectStore(TRICKS_STORE);
      const index = store.index("category");
      const request = index.getAll(categorySlug);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error getting tricks by category from IndexedDB:", error);
    return [];
  }
}

/**
 * Get tricks by subcategory slug from IndexedDB
 */
export async function getTricksBySubcategoryFromIndexedDB(
  subcategorySlug: string
): Promise<Trick[]> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TRICKS_STORE, "readonly");
      const store = transaction.objectStore(TRICKS_STORE);
      const index = store.index("subcategory");
      const request = index.getAll(subcategorySlug);

      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error getting tricks by subcategory from IndexedDB:", error);
    return [];
  }
}

/**
 * Get last updated timestamp from IndexedDB
 */
export async function getLastUpdatedFromIndexedDB(): Promise<string | null> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(METADATA_STORE, "readonly");
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.get("last_updated");

      request.onsuccess = () => {
        db.close();
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error getting last updated from IndexedDB:", error);
    return null;
  }
}

/**
 * Clear all tricks data from IndexedDB
 */
export async function clearTricksFromIndexedDB(): Promise<void> {
  try {
    const db = await initTricksDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [TRICKS_STORE, METADATA_STORE],
        "readwrite"
      );
      const tricksStore = transaction.objectStore(TRICKS_STORE);
      const metadataStore = transaction.objectStore(METADATA_STORE);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };

      tricksStore.clear();
      metadataStore.clear();
    });
  } catch (error) {
    console.error("Error clearing tricks from IndexedDB:", error);
  }
}

/**
 * Check if IndexedDB is supported
 */
export function isIndexedDBSupported(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}
