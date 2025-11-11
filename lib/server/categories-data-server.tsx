// lib/server/categories-data-server.tsx
import { createServer } from "@/utils/supabase/server";
export interface MasterCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon_name: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trick_count?: number;
  move_name?: string | null;
}

export async function getTricksWithUserStatus(filters?: {
  category?: string;
  subcategory?: string;
  difficulty?: number;
  search?: string;
  inventor_user_id?: string;
  inventor_name?: string;
  limit?: number;
  offset?: number;
  sortBy?:
    | "difficulty_level"
    | "name"
    | "updated_at"
    | "created_at"
    | "view_count"
    | "can_do_count";
  sortOrder?: "asc" | "desc";
  userId?: string; // Add user ID for filtering
  canDoFilter?: "all" | "can_do" | "cannot_do"; // Add filter option
}): Promise<{ tricks: any[]; total: number }> {
  // First, get all tricks with basic information

  const supabaseServer = createServer();
  let query = supabaseServer
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories!inner(
        name,
        slug,
        master_category:master_categories!inner(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  // Apply category filter using nested filtering
  if (filters?.category) {
    query = query.eq("subcategories.master_categories.slug", filters.category);
  }

  // Apply subcategory filter
  if (filters?.subcategory) {
    query = query.eq("subcategories.slug", filters.subcategory);
  }

  if (filters?.difficulty) {
    query = query.eq("difficulty_level", filters.difficulty);
  }

  if (filters?.search) {
    query = query.textSearch("search_text", filters.search);
  }

  // Filter by inventor
  if (filters?.inventor_user_id) {
    query = query.eq("inventor_user_id", filters.inventor_user_id);
  }

  if (filters?.inventor_name) {
    query = query.eq("inventor_name", filters.inventor_name);
  }

  // Apply pagination
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters?.limit || 20) - 1
    );
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "difficulty_level";
  const sortOrder = filters?.sortOrder || "asc";

  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data: tricks, error, count } = await query;

  if (error) {
    console.error("Error fetching tricks:", error);
    throw new Error("Failed to fetch tricks");
  }

  if (!tricks || tricks.length === 0) {
    return {
      tricks: [],
      total: count || 0,
    };
  }

  // Get all trick IDs
  const trickIds = tricks.map((t) => t.id);

  // Get can-do counts for all tricks
  const { data: canDoCounts, error: canDoError } = await supabaseServer
    .from("user_tricks")
    .select("trick_id")
    .in("trick_id", trickIds)
    .eq("can_do", true);

  if (canDoError) {
    console.error("Error fetching can-do counts:", canDoError);
  }

  // Count users who can do each trick
  const canDoCountMap = new Map<string, number>();
  if (canDoCounts) {
    canDoCounts.forEach((record) => {
      const count = canDoCountMap.get(record.trick_id) || 0;
      canDoCountMap.set(record.trick_id, count + 1);
    });
  }

  console.log(
    "Can-do counts for tricks:",
    canDoCountMap.size,
    "tricks with data"
  );

  // Get user's can-do status if userId is provided
  const userCanDoMap = new Map<string, boolean>();
  if (filters?.userId) {
    const { data: userCanDo } = await supabaseServer
      .from("user_tricks")
      .select("trick_id, can_do")
      .in("trick_id", trickIds)
      .eq("user_id", filters.userId)
      .eq("can_do", true);

    if (userCanDo) {
      userCanDo.forEach((record) => {
        userCanDoMap.set(record.trick_id, record.can_do);
      });
    }
  }

  // Process tricks to add can-do information
  let processedTricks = tricks.map((trick) => ({
    ...trick,
    can_do_count: canDoCountMap.get(trick.id) || 0,
    user_can_do: userCanDoMap.get(trick.id) || false,
  }));

  // Apply can-do filter if specified
  if (
    filters?.userId &&
    filters?.canDoFilter &&
    filters.canDoFilter !== "all"
  ) {
    if (filters.canDoFilter === "can_do") {
      processedTricks = processedTricks.filter((trick) => trick.user_can_do);
    } else if (filters.canDoFilter === "cannot_do") {
      processedTricks = processedTricks.filter((trick) => !trick.user_can_do);
    }
  }

  return {
    tricks: processedTricks,
    total: count || 0,
  };
}

// Get active master categories with trick counts
export async function getMasterCategories(): Promise<MasterCategory[]> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("master_categories")
    .select(
      `
      *,
      trick_count:subcategories(
        tricks(count)
      )
    `
    )
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Error fetching master categories:", error);
    throw new Error("Failed to fetch master categories");
  }

  // Process the trick count aggregation
  return data.map((category) => ({
    ...category,
    trick_count:
      category.trick_count?.reduce(
        (total: number, subcategory: any) =>
          total + (subcategory.tricks?.[0]?.count || 0),
        0
      ) || 0,
  }));
}

// Get all master categories (including inactive)
export async function getAllMasterCategories(): Promise<MasterCategory[]> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("master_categories")
    .select(
      `
      *,
      trick_count:subcategories(
        tricks(count)
      )
    `
    )
    .order("sort_order");

  if (error) {
    console.error("Error fetching all master categories:", error);
    throw new Error("Failed to fetch all master categories");
  }

  // Process the trick count aggregation
  return data.map((category) => ({
    ...category,
    trick_count:
      category.trick_count?.reduce(
        (total: number, subcategory: any) =>
          total + (subcategory.tricks?.[0]?.count || 0),
        0
      ) || 0,
  }));
}

// Get master category by slug
export async function getMasterCategoryBySlug(
  slug: string
): Promise<MasterCategory | null> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
    .from("master_categories")
    .select(
      `
      *,
      trick_count:subcategories(
        tricks(count)
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching master category by slug:", error);
    throw new Error("Failed to fetch master category");
  }

  // Process the trick count aggregation
  return {
    ...data,
    trick_count:
      data.trick_count?.reduce(
        (total: number, subcategory: any) =>
          total + (subcategory.tricks?.[0]?.count || 0),
        0
      ) || 0,
  };
}
