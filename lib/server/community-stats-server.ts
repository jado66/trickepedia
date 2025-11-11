import { createServer } from "@/utils/supabase/server";
export interface CommunityStats {
  totalUsers: number;
  totalTricks: number;
  totalViews: number;
  publishedTricks: number;
}

/**
 * Fetches community statistics from the server
 * @returns Promise<CommunityStats>
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const supabaseServer = createServer();
  try {
    // Fetch all stats in parallel
    const [
      { count: totalUsers },
      { count: totalTricks },
      { count: publishedTricks },
      { data: viewsData },
    ] = await Promise.all([
      // Total users count
      supabaseServer.from("users").select("*", { count: "exact", head: true }),

      // Total tricks count
      supabaseServer.from("tricks").select("*", { count: "exact", head: true }),

      // Published tricks count
      supabaseServer
        .from("tricks")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),

      // Sum of all view counts
      supabaseServer
        .from("tricks")
        .select("view_count")
        .eq("is_published", true),
    ]);

    // Calculate total views
    const totalViews =
      viewsData?.reduce((sum, trick) => sum + (trick.view_count || 0), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalTricks: totalTricks || 0,
      totalViews,
      publishedTricks: publishedTricks || 0,
    };
  } catch (error) {
    console.error("Error fetching community stats:", error);
    throw new Error("Failed to fetch community stats");
  }
}
