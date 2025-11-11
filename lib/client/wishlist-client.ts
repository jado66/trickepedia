// lib/client/wishlist-client.ts
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Add a trick to the user's wishlist
 */
export async function addToWishlist(
  supabase: SupabaseClient,
  userId: string,
  trickId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First check if it already exists
    const { data: existing } = await supabase
      .from("user_wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("trick_id", trickId)
      .single();

    if (existing) {
      return { success: true }; // Already in wishlist
    }

    const { error } = await supabase.from("user_wishlist").insert({
      user_id: userId,
      trick_id: trickId,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove a trick from the user's wishlist
 */
export async function removeFromWishlist(
  supabase: SupabaseClient,
  userId: string,
  trickId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("user_wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("trick_id", trickId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user's wishlist tricks
 */
export async function getWishlist(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  tricks: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("user_wishlist")
      .select(
        `
        id,
        trick_id,
        created_at,
        tricks:trick_id (
          id,
          name,
          slug,
          description,
          difficulty_level,
          image_urls,
          video_urls,
          tags,
          subcategory:subcategory_id (
            name,
            slug,
            master_category:master_category_id (
              name,
              slug,
              color
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Flatten the data structure
    const tricks = (data || []).map((item: any) => item.tricks).filter(Boolean);

    return { tricks };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return {
      tricks: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a trick is in the user's wishlist
 */
export async function isInWishlist(
  supabase: SupabaseClient,
  userId: string,
  trickId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("trick_id", trickId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}

/**
 * Get wishlist count for a user
 */
export async function getWishlistCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("user_wishlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Error fetching wishlist count:", error);
    return 0;
  }
}
