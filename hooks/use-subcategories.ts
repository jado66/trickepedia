import { fetchSubcategoriesByCategory } from "@/lib/fetch-tricks";
import { useState, useEffect } from "react";

/**
 * Custom hook for fetching subcategories by category
 */
export function useSubcategories(categorySlug) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categorySlug) return;

    async function load() {
      setLoading(true);
      const result = await fetchSubcategoriesByCategory(categorySlug);
      setSubcategories(result.data);
      setError(result.error);
      setLoading(false);
    }
    load();
  }, [categorySlug]);

  return { subcategories, loading, error };
}
