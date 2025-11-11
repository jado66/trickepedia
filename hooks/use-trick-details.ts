import { fetchTrickDetails, incrementTrickView } from "@/lib/fetch-tricks";
import { useState, useEffect } from "react";

/**
 * Custom hook for trick details with view tracking
 */
export function useTrickDetails(trickSlug) {
  const [trick, setTrick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trickSlug) return;

    async function load() {
      setLoading(true);

      // Increment view count
      await incrementTrickView(trickSlug);

      // Fetch details
      const result = await fetchTrickDetails(trickSlug);
      setTrick(result.data);
      setError(result.error);
      setLoading(false);
    }
    load();
  }, [trickSlug]);

  return { trick, loading, error };
}
