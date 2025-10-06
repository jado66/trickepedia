import { Trick } from "@/types/trick";
import { supabase } from "@/utils/supabase/client";
import { calculateTrickCreationXP } from "@/lib/xp/trick-xp";
import { awardUserXP } from "@/lib/xp/user-xp-utils";

// Create new trick
export async function createTrick(
  supabaseClient,
  data: Omit<
    Trick,
    | "id"
    | "created_at"
    | "updated_at"
    | "view_count"
    | "subcategory"
    | "inventor"
  >
): Promise<Trick> {
  console.log("=== createTrick START ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Input data:", JSON.stringify(data, null, 2));
  console.log("Data keys:", Object.keys(data));

  // Check for required fields
  console.log("Checking required fields:");
  console.log("- name:", data.name);
  console.log("- slug:", data.slug);
  console.log("- subcategory_id:", data.subcategory_id);

  // Separate components
  const { components, ...trickData } = data;
  console.log("Components extracted:", components);
  console.log("Components length:", components?.length || 0);
  console.log("Trick data (without components):", trickData);

  // Prepare insert data
  // Determine acting (logged-in) user. This is who should receive XP, regardless of provided created_by
  let actingUserId: string | null = null;
  try {
    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await supabaseClient.auth.getUser();
    if (sessionError) {
      console.warn(
        "Could not get current auth user for XP awarding:",
        sessionError
      );
    } else if (sessionUser) {
      actingUserId = sessionUser.id;
    }
  } catch (e) {
    console.warn(
      "auth.getUser() threw while creating trick (continuing without acting user):",
      e
    );
  }

  const insertData = {
    ...trickData,
    view_count: 0,
    // Auto-populate created_by if not supplied so future logic & attribution remain consistent
    created_by:
      (trickData as any).created_by ||
      actingUserId ||
      (trickData as any).created_by, // fallback keeps existing if somehow defined later
  };
  console.log(
    "Data being inserted to Supabase:",
    JSON.stringify(insertData, null, 2)
  );

  console.log("Calling Supabase insert...");
  console.time("Supabase insert");

  const { data: newTrick, error: insertError } = await supabaseClient
    .from("tricks")
    .insert([insertData])
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .single();

  console.timeEnd("Supabase insert");

  if (insertError) {
    console.error("=== SUPABASE INSERT FAILED ===");
    console.error("Error object:", insertError);
    console.error("Error code:", insertError.code);
    console.error("Error message:", insertError.message);
    console.error("Error details:", insertError.details);
    console.error("Error hint:", insertError.hint);

    // Common error interpretations
    if (insertError.code === "23505") {
      console.error(
        "⚠️ DUPLICATE KEY ERROR - A trick with this slug may already exist"
      );
    } else if (insertError.code === "23503") {
      console.error(
        "⚠️ FOREIGN KEY ERROR - Invalid subcategory_id or other reference"
      );
    } else if (insertError.code === "23502") {
      console.error("⚠️ NOT NULL VIOLATION - A required field is missing");
    } else if (insertError.code === "42501") {
      console.error("⚠️ PERMISSION ERROR - Check your RLS policies");
    }

    throw new Error(`Failed to create trick: ${insertError.message}`);
  }

  console.log("✅ Trick inserted successfully!");
  console.log("New trick ID:", newTrick.id);
  console.log("New trick data:", newTrick);

  // Handle components if is_combo and components provided
  if (newTrick.is_combo && components && components.length > 0) {
    console.log("=== HANDLING COMPONENTS ===");
    console.log("Trick is combo, inserting components...");
    console.log("Number of components:", components.length);

    const compInsert = components.map((comp, index) => {
      const formatted = {
        trick_id: newTrick.id,
        component_trick_id: comp.component_trick_id,
        sequence: comp.sequence,
        component_details: comp.component_details || {},
      };
      console.log(`Component ${index}:`, formatted);
      return formatted;
    });

    console.log("Components to insert:", compInsert);
    console.time("Component insert");

    const { error: compError } = await supabaseClient
      .from("trick_components")
      .insert(compInsert);

    console.timeEnd("Component insert");

    if (compError) {
      console.error("=== COMPONENT INSERT FAILED ===");
      console.error("Component error:", compError);
      console.error("Component error code:", compError.code);
      console.error("Component error message:", compError.message);

      // Rollback trick insert if components fail
      console.log("⚠️ Rolling back trick creation due to component error...");
      const { error: deleteError } = await supabaseClient
        .from("tricks")
        .delete()
        .eq("id", newTrick.id);

      if (deleteError) {
        console.error("Failed to rollback trick:", deleteError);
      } else {
        console.log("Trick rolled back successfully");
      }

      throw new Error(
        `Failed to create trick components: ${compError.message}`
      );
    }

    console.log("✅ Components inserted successfully");
  } else {
    console.log("Not a combo trick or no components to insert");
    console.log("- is_combo:", newTrick.is_combo);
    console.log("- components provided:", components?.length || 0);
  }

  // Fetch components to include in return
  console.log("Fetching trick components...");
  console.time("Fetch components");

  try {
    const compData = await getTrickComponents(supabaseClient, newTrick.id);
    console.log("Components fetched:", compData);
    newTrick.components = compData;
  } catch (fetchError) {
    console.error("Failed to fetch components:", fetchError);
    newTrick.components = [];
  }

  console.timeEnd("Fetch components");

  // Award XP for trick creation to the CURRENT LOGGED-IN USER (actingUserId), not necessarily the stored created_by
  if (actingUserId) {
    console.log("=== AWARDING XP FOR TRICK CREATION (acting user) ===");
    const xpAmount = calculateTrickCreationXP(newTrick);
    console.log(`Calculated XP amount: ${xpAmount}`);
    try {
      const xpResult = await awardUserXP(
        supabaseClient,
        actingUserId,
        xpAmount,
        "trick_creation"
      );
      if (xpResult.success) {
        console.log(
          `✅ Successfully awarded ${xpAmount} XP to acting user ${actingUserId}`
        );
        console.log(`Acting user's new XP total: ${xpResult.newXP}`);
      } else {
        console.warn(`⚠️ Failed to award XP: ${xpResult.error}`);
      }
    } catch (xpError) {
      console.error("XP awarding error:", xpError);
    }
  } else {
    console.log("No acting user session, skipping XP award");
  }

  console.log("=== createTrick SUCCESS ===");
  console.log("Final trick object:", newTrick);
  console.log("Trick ID:", newTrick.id);
  console.log("Trick slug:", newTrick.slug);

  return newTrick;
}

export async function getTricks(
  supabaseClient,
  filters?: {
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
      | "view_count";

    sortOrder?: "asc" | "desc";
  }
): Promise<{ tricks: Trick[]; total: number }> {
  // IMPORTANT: do NOT await here; we need the PostgrestFilterBuilder to apply dynamic filters
  let query = supabaseClient
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
    const raw = filters.search.trim();
    if (raw.length) {
      // Use PostgREST OR syntax with * wildcards (PostgREST translates * -> % for like/ilike patterns)
      // Reason for change: previous implementation used % inside .or() which PostgREST does not parse in the filter DSL.
      // This caused the OR filter to be ignored and all rows returned.
      const sanitized = raw.replace(/,/g, " "); // commas break OR clause parsing
      // Build OR clause across multiple text fields (remove description if that column does not exist in your schema)
      const orClause = `name.ilike.*${sanitized}*,slug.ilike.*${sanitized}*,description.ilike.*${sanitized}*`;
      // Debug log (client-side) to verify clause used
      if (typeof window !== "undefined") {
        console.debug("[getTricks] Applying search OR clause:", orClause);
      }
      query = query.or(orClause);
    }
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

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching tricks:", error);
    throw new Error("Failed to fetch tricks");
  }

  return {
    tricks: data || [],
    total: count || 0,
  };
}

export async function getAllTricks(supabaseClient) {
  // Example with fetch (assume API endpoint)

  // OR with Supabase:
  const { data, error } = await supabaseClient
    .from("tricks")
    .select("id, name, slug")
    .eq("is_published", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

// Update trick
export async function updateTrick(
  supabaseClient: any,
  id: string,
  data: Partial<Trick>
): Promise<Trick> {
  // Separate components
  const { components, ...trickData } = data;

  const updateData = {
    ...trickData,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedTrick, error: updateError } = await supabaseClient
    .from("tricks")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `
    )
    .single();

  if (updateError) {
    console.error("Error updating trick:", JSON.stringify(updateError));
    throw new Error("Failed to update trick");
  }

  // Handle components: always delete existing first
  const { error: deleteError } = await supabaseClient
    .from("trick_components")
    .delete()
    .eq("trick_id", id);

  if (deleteError) {
    console.error("Error deleting existing components:", deleteError);
    throw new Error("Failed to update trick components");
  }

  // Insert new components if is_combo and components provided
  if (updatedTrick.is_combo && components && components.length > 0) {
    const compInsert = components.map((comp) => ({
      trick_id: id,
      component_trick_id: comp.component_trick_id,
      sequence: comp.sequence,
      component_details: comp.component_details || {},
    }));

    const { error: insertError } = await supabaseClient
      .from("trick_components")
      .insert(compInsert);

    if (insertError) {
      console.error("Error inserting new components:", insertError);
      throw new Error("Failed to update trick components");
    }
  }

  // Fetch components to include in return (optional)
  const compData = await getTrickComponents(supabaseClient, id);
  updatedTrick.components = compData;

  // Award XP for trick editing TO THE CURRENT USER (not necessarily the original creator)
  console.log("=== AWARDING XP FOR TRICK EDIT (acting user) ===");
  let editingUserId: string | null = null;
  try {
    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await supabaseClient.auth.getUser();
    if (sessionError) {
      console.warn(
        "Could not get current auth user for edit XP awarding:",
        sessionError
      );
    } else if (sessionUser) {
      editingUserId = sessionUser.id;
    }
  } catch (e) {
    console.warn(
      "auth.getUser() threw while updating trick (continuing without XP)",
      e
    );
  }

  if (editingUserId) {
    try {
      // Get original trick data for comparison
      const { data: originalTrick, error: fetchError } = await supabaseClient
        .from("tricks")
        .select("*")
        .eq("id", id)
        .single();

      if (!fetchError && originalTrick) {
        const { calculateTrickEditXP } = await import("@/lib/xp/trick-xp");
        const xpAmount = calculateTrickEditXP(originalTrick, updatedTrick);
        console.log(`Calculated edit XP amount: ${xpAmount}`);

        if (xpAmount > 0) {
          const xpResult = await awardUserXP(
            supabaseClient,
            editingUserId,
            xpAmount,
            "trick_edit"
          );
          if (xpResult.success) {
            console.log(
              `✅ Successfully awarded ${xpAmount} XP to editing user ${editingUserId}`
            );
            console.log(`Editing user's new XP total: ${xpResult.newXP}`);
          } else {
            console.warn(`⚠️ Failed to award XP: ${xpResult.error}`);
          }
        } else {
          console.log("No significant changes detected, no XP awarded");
        }
      } else {
        console.warn("Could not fetch original trick data for XP comparison");
      }
    } catch (xpError) {
      console.error("XP awarding error:", xpError);
    }
  } else {
    console.log("No authenticated editing user, skipping XP award");
  }

  return updatedTrick;
}

// Delete trick
export async function deleteTrick(supabaseClient, id: string): Promise<void> {
  const { error } = await supabaseClient.from("tricks").delete().eq("id", id);

  if (error) {
    console.error("Error deleting trick:", error);
    throw new Error("Failed to delete trick");
  }
}

// Get navigation data with hierarchical structure for side nav
export async function getNavigationData(supabaseClient) {
  const { data, error } = await supabaseClient
    .from("master_categories")
    .select(
      `
      id,
      name,
      slug,
      icon_name,
      color,
      sort_order,
      subcategories(
        id,
        name,
        slug,
        sort_order,
        tricks(
          id,
          name,
          slug,
          is_published
        )
      )
    `
    )
    .eq("is_active", true)
    .eq("subcategories.is_active", true)
    .order("sort_order")
    .order("sort_order", { foreignTable: "subcategories" })
    .order("name", { foreignTable: "subcategories.tricks" });

  if (error) {
    console.error("Error fetching navigation data:", error);
    throw new Error("Failed to fetch navigation data");
  }

  // Filter tricks to only show published ones
  const filteredData = (data || []).map((category) => ({
    ...category,
    subcategories: (category.subcategories || []).map((subcategory) => ({
      ...subcategory,
      tricks: (subcategory.tricks || []).filter((trick) => trick.is_published),
    })),
  }));

  return filteredData;
}

// Get all users for inventor selection in forms
export async function getUsers(supabaseClient): Promise<
  {
    id: string;
    first_name: string;
    last_name: string;
    username?: string | null;
  }[]
> {
  const { data, error } = await supabaseClient
    .from("users")
    .select("id, first_name, last_name, username")
    .order("first_name");

  if (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }

  return data || [];
}

export async function getTrickComponents(supabaseClient, trickId: string) {
  const { data, error } = await supabaseClient
    .from("trick_components")
    .select("component_trick_id, sequence, component_details")
    .eq("trick_id", trickId)
    .order("sequence", { ascending: true });

  if (error) {
    console.error("Error fetching trick components:", error);
    throw new Error("Failed to fetch trick components");
  }

  return data || [];
}

// Get tricks by inventor (both user and name inventors)
export async function getTricksByInventor(
  supabaseClient: any,
  inventorType: "user" | "name",
  inventorId: string,
  filters?: {
    limit?: number;
    offset?: number;
  }
): Promise<{ tricks: Trick[]; total: number }> {
  let query = supabaseClient
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url)
    `,
      { count: "exact" }
    )
    .eq("is_published", true);

  if (inventorType === "user") {
    query = query.eq("inventor_user_id", inventorId);
  } else {
    query = query.eq("inventor_name", inventorId);
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

  const { data, error, count } = await query.order("updated_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching tricks by inventor:", error);
    throw new Error("Failed to fetch tricks by inventor");
  }

  return {
    tricks: data || [],
    total: count || 0,
  };
}

// Get unique inventors from all tricks (for filtering/search)
export async function getInventors(supabaseClient): Promise<{
  users: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    username?: string | null;
  }[];
  names: string[];
}> {
  // Get user inventors
  const { data: userInventors, error: userError } = await supabaseClient
    .from("tricks")
    .select(
      `
      inventor_user_id,
      inventor:users!tricks_inventor_user_id_fkey(id, first_name, last_name, username)
    `
    )
    .not("inventor_user_id", "is", null)
    .eq("is_published", true);

  if (userError) {
    console.error("Error fetching user inventors:", userError);
  }

  // Get name inventors
  const { data: nameInventors, error: nameError } = await supabaseClient
    .from("tricks")
    .select("inventor_name")
    .not("inventor_name", "is", null)
    .eq("is_published", true);

  if (nameError) {
    console.error("Error fetching name inventors:", nameError);
  }

  // Process user inventors
  const uniqueUserInventors = new Map();
  (userInventors || []).forEach((trick: any) => {
    if (trick.inventor) {
      const inventor = trick.inventor;
      uniqueUserInventors.set(inventor.id, {
        id: inventor.id,
        name:
          inventor.username || `${inventor.first_name} ${inventor.last_name}`,
        first_name: inventor.first_name,
        last_name: inventor.last_name,
        username: inventor.username,
      });
    }
  });

  // Process name inventors
  const uniqueNameInventors = new Set();
  (nameInventors || []).forEach((trick: any) => {
    if (trick.inventor_name) {
      uniqueNameInventors.add(trick.inventor_name);
    }
  });

  return {
    users: Array.from(uniqueUserInventors.values()),
    names: Array.from(uniqueNameInventors) as string[],
  };
}

// Add these to your existing tricks-data.ts file

// First, add these types at the top of the file
export interface PrerequisiteTrick {
  id: string;
  name: string;
  slug: string;
  subcategory: {
    slug: string;
    master_category: {
      slug: string;
    };
  };
}

export interface TrickWithLinkedPrerequisites extends Trick {
  prerequisite_tricks?: PrerequisiteTrick[];
}

/**
 * Fetches prerequisite tricks for the given prerequisite IDs
 * @param ids Array of prerequisite UUIDs
 * @returns Array of prerequisite trick data
 */
export async function fetchPrerequisiteTricksByIds(
  supabaseClient,
  ids: string[]
): Promise<PrerequisiteTrick[]> {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabaseClient
    .from("tricks")
    .select(
      `id, name, slug, subcategory:subcategories(slug, master_category:master_categories(slug))`
    )
    .in("id", ids)
    .eq("is_published", true);
  if (error) {
    console.error("Error fetching prerequisite tricks:", error);
    return [];
  }
  return data || [];
}
// Get trick by slug
export async function getTrickBySlug(
  supabaseClient,
  categorySlug: string,
  subcategorySlug: string,
  slug: string
): Promise<Trick | null> {
  let query = supabaseClient
    .from("tricks")
    .select(
      `
      *,
      subcategory:subcategories!inner(
        name,
        slug,
        master_category:master_categories!inner(name, slug, color)
      ),
      inventor:users!tricks_inventor_user_id_fkey(first_name, last_name, username, profile_image_url),
      trick_components!trick_id(
        component_trick_id,
        sequence,
        component_details
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true);

  // Apply category filter if provided
  if (categorySlug) {
    query = query.eq("subcategories.master_categories.slug", categorySlug);
  }

  // Apply subcategory filter if provided
  if (subcategorySlug) {
    query = query.eq("subcategories.slug", subcategorySlug);
  }

  const { data, error } = await query
    .order("sequence", { foreignTable: "trick_components", ascending: true })
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching trick by slug:", error);
    throw new Error("Failed to fetch trick");
  }

  // Rename trick_components to components for consistency
  if (data && data.trick_components) {
    data.components = data.trick_components;
    delete data.trick_components;
  }

  return data;
}

/**
 * Enhanced getTrickBySlug that includes linked prerequisite tricks
 */
export async function getTrickBySlugWithLinks(
  supabaseClient,
  categorySlug: string,
  subcategorySlug: string,
  slug: string
): Promise<TrickWithLinkedPrerequisites | null> {
  const trick = await getTrickBySlug(
    supabaseClient,
    categorySlug,
    subcategorySlug,
    slug
  );

  if (
    !trick ||
    !trick.prerequisite_ids ||
    trick.prerequisite_ids.length === 0
  ) {
    return trick;
  }

  // Fetch linked tricks for prerequisites by IDs
  const prerequisiteTricks = await fetchPrerequisiteTricksByIds(
    supabaseClient,
    trick.prerequisite_ids
  );

  return {
    ...trick,
    prerequisite_tricks: prerequisiteTricks,
  };
}

export async function toggleUserCanDoTrick(
  supabaseClient,
  trickId: string,
  userId: string,
  canDo: boolean
): Promise<{ success: boolean; canDoCount: number }> {
  try {
    if (canDo) {
      // User can now do this trick - upsert the record
      const { error } = await supabaseClient.from("user_tricks").upsert(
        {
          user_id: userId,
          trick_id: trickId,
          can_do: true,
          achieved_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,trick_id",
        }
      );

      if (error) throw error;
    } else {
      // User can't do this trick anymore - remove the record
      const { error } = await supabaseClient
        .from("user_tricks")
        .delete()
        .eq("user_id", userId)
        .eq("trick_id", trickId);

      if (error) throw error;
    }

    // Get updated count
    const { count } = await supabaseClient
      .from("user_tricks")
      .select("*", { count: "exact", head: true })
      .eq("trick_id", trickId)
      .eq("can_do", true);

    return {
      success: true,
      canDoCount: count || 0,
    };
  } catch (error) {
    console.error("Failed to toggle can-do status:", error);
    return {
      success: false,
      canDoCount: 0,
    };
  }
}

/**
 * Get user's progress statistics for a category
 */
export async function getUserProgressStats(
  supabaseClient: any,
  userId: string,
  categorySlug?: string,
  subcategorySlug?: string
) {
  try {
    let query = supabaseClient
      .from("user_tricks")
      .select(
        `
        trick:tricks!inner(
          difficulty_level,
          subcategory:subcategories!inner(
            slug,
            master_category:master_categories!inner(slug)
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .eq("can_do", true);

    if (categorySlug) {
      query = query.eq(
        "tricks.subcategories.master_categories.slug",
        categorySlug
      );
    }

    if (subcategorySlug) {
      query = query.eq("tricks.subcategories.slug", subcategorySlug);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Group by difficulty level
    const byDifficulty = (data || []).reduce(
      (acc: Record<number, number>, item: any) => {
        const difficulty = item.trick.difficulty_level;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      {}
    );

    // Calculate progress by difficulty range
    const beginnerCount =
      (byDifficulty[1] || 0) + (byDifficulty[2] || 0) + (byDifficulty[3] || 0);
    const intermediateCount =
      (byDifficulty[4] || 0) + (byDifficulty[5] || 0) + (byDifficulty[6] || 0);
    const advancedCount = (byDifficulty[7] || 0) + (byDifficulty[8] || 0);
    const expertCount = (byDifficulty[9] || 0) + (byDifficulty[10] || 0);

    return {
      total: count || 0,
      byDifficulty,
      byRange: {
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
        expert: expertCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user progress stats:", error);
    return {
      total: 0,
      byDifficulty: {},
      byRange: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
    };
  }
}

/**
 * Get user's progress with totals for each category
 */
export async function getUserProgressWithTotals(
  supabaseClient: any,
  userId: string,
  categoryIds: string[]
): Promise<{ categoryId: string; completed: number; total: number }[]> {
  try {
    const results: { categoryId: string; completed: number; total: number }[] =
      [];

    for (const categoryId of categoryIds) {
      // First get subcategories for this category
      const { data: subcategories } = await supabaseClient
        .from("subcategories")
        .select("id")
        .eq("master_category_id", categoryId);

      const subcategoryIds =
        (subcategories as { id: string }[])?.map((sub) => sub.id) || [];

      let completedCount = 0;
      let totalCount = 0;

      if (subcategoryIds.length > 0) {
        // Get trick IDs for this category first
        const { data: tricks } = await supabaseClient
          .from("tricks")
          .select("id")
          .eq("is_published", true)
          .in("subcategory_id", subcategoryIds);

        const trickIds = (tricks as { id: string }[])?.map((t) => t.id) || [];

        // Get total tricks count
        totalCount = trickIds.length;

        // Get user's completed tricks count for these specific tricks
        if (trickIds.length > 0) {
          const { count: userCount } = await supabaseClient
            .from("user_tricks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("can_do", true)
            .in("trick_id", trickIds);

          completedCount = userCount || 0;
        }
      }

      results.push({
        categoryId,
        completed: completedCount,
        total: totalCount,
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching user progress with totals:", error);
    return [];
  }
}

/**
 * Check if user can do a specific trick
 */
export async function checkUserCanDoTrick(
  supabaseClient,
  userId: string,
  trickId: string
): Promise<boolean> {
  try {
    const { data } = await supabaseClient
      .from("user_tricks")
      .select("can_do")
      .eq("user_id", userId)
      .eq("trick_id", trickId)
      .single();

    return data?.can_do || false;
  } catch (error) {
    console.error("Error checking can-do status:", error);
    return false;
  }
}

/**
 * Get all tricks a user can do
 */
export async function getUserCanDoTricks(
  supabaseClient: any,
  userId: string,
  limit?: number,
  offset?: number
) {
  try {
    let query = supabaseClient
      .from("user_tricks")
      .select(
        `
        achieved_at,
        notes,
        trick:tricks!inner(
          id,
          name,
          slug,
          difficulty_level,
          subcategory:subcategories!inner(
            name,
            slug,
            master_category:master_categories!inner(
              name,
              slug,
              color
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("can_do", true)
      .order("achieved_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error fetching user's tricks:", error);
    return [];
  }
}

/**
 * Helper to check if a prerequisite string matches a known trick
 */
export function getPrerequisiteLink(
  prerequisiteId: string,
  prerequisiteTricks?: PrerequisiteTrick[]
): PrerequisiteTrick | undefined {
  if (!prerequisiteTricks) return undefined;
  return prerequisiteTricks.find((trick) => trick.id === prerequisiteId);
}

export async function searchPotentialPrerequisites(
  supabaseClient: any,
  search: string,
  subcategoryId?: string,
  excludeTrickId?: string,
  categorySlug?: string // New parameter for category filtering
): Promise<
  {
    id: string;
    name: string;
    slug: string;
    category: string;
    categorySlug: string;
    subcategory: string;
    subcategorySlug: string;
  }[]
> {
  // Validate search input
  if (!search || search.trim().length < 2) {
    return [];
  }

  // Build the base query with category and subcategory info
  let query = supabaseClient
    .from("tricks")
    .select(
      `
      id, 
      name, 
      slug,
      subcategory:subcategories(
        name,
        slug,
        master_category:master_categories(name, slug)
      )
    `
    )
    .ilike("name", `%${search.trim()}%`)
    .eq("is_published", true)
    .order("name")
    .limit(15);

  // FIXED: Add subcategory filter if provided
  if (subcategoryId) {
    query = query.eq("subcategory_id", subcategoryId);
  }

  // Add category filter if provided
  if (categorySlug) {
    query = query.eq("subcategories.master_categories.slug", categorySlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error searching prerequisites:", error);
    return [];
  }

  // If no data returned
  if (!data || data.length === 0) {
    console.log("No tricks found for search:", search);
    return [];
  }

  // Filter out the current trick if excludeTrickId is provided
  let results = data;
  if (excludeTrickId) {
    results = data.filter((trick) => trick.id !== excludeTrickId);
  }

  // Transform the results to include flattened category info
  return results.map((trick: any) => ({
    id: trick.id,
    name: trick.name,
    slug: trick.slug,
    category: trick.subcategory?.master_category?.name || "Unknown Category",
    categorySlug: trick.subcategory?.master_category?.slug || "",
    subcategory: trick.subcategory?.name || "Unknown Subcategory",
    subcategorySlug: trick.subcategory?.slug || "",
  }));
}

// Increment trick view count
export async function incrementTrickViews(
  supabaseClient,
  trickId: string
): Promise<{ success: boolean; view_count?: number }> {
  try {
    // First, check if the trick exists and is published
    const { data: trick, error: fetchError } = await supabaseClient
      .from("tricks")
      .select("id, view_count")
      .eq("id", trickId)
      .eq("is_published", true)
      .single();

    if (fetchError || !trick) {
      throw new Error("Trick not found");
    }

    // Update the view count
    const { error: updateError } = await supabaseClient
      .from("tricks")
      .update({
        view_count: (trick.view_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", trickId);

    if (updateError) {
      throw updateError;
    }

    // Get the updated view count
    const { data: updatedTrick, error: getError } = await supabaseClient
      .from("tricks")
      .select("view_count")
      .eq("id", trickId)
      .single();

    if (getError) {
      throw getError;
    }

    return {
      success: true,
      view_count: updatedTrick.view_count,
    };
  } catch (error) {
    console.error("Error incrementing trick views:", error);
    return { success: false };
  }
}

/**
 * Get all trick IDs that a user can do
 */
export async function getUserTrickIds(
  supabaseClient: any,
  userId: string
): Promise<Set<string>> {
  try {
    const { data: userTricks, error } = await supabaseClient
      .from("user_tricks")
      .select("trick_id")
      .eq("user_id", userId)
      .eq("can_do", true);

    if (error) throw error;

    return new Set(userTricks?.map((ut: any) => ut.trick_id) || []);
  } catch (error) {
    console.error("Error fetching user trick IDs:", error);
    return new Set();
  }
}

/**
 * Get all published tricks with basic info
 */
export async function getAllTricksBasic(): Promise<Trick[]> {
  try {
    const { data: tricks, error } = await supabase
      .from("tricks")
      .select(
        `
        id,
        name,
        slug,
        description,
        difficulty_level,
        prerequisite_ids,
        subcategory:subcategories(
          id,
          name,
          slug,
          master_category:master_categories(
            id,
            name,
            slug
          )
        )
      `
      )
      .eq("is_published", true)
      .order("name", { ascending: true });

    if (error) throw error;

    // @ts-expect-error fix me
    return tricks || [];
  } catch (error) {
    console.error("Error fetching tricks:", error);
    return [];
  }
}
