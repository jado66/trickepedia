import { supabase } from "@/utils/supabase/client";

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
  status?: "active" | "in_progress" | "hidden";
}
// Get master category by slug
export async function getMasterCategoryBySlug(
  slug: string
): Promise<MasterCategory | null> {
  const { data, error } = await supabase
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

// Get all master categories (including inactive) - Client version
export async function getAllMasterCategories(): Promise<MasterCategory[]> {
  const { data, error } = await supabase
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

// Delete master category - Client version
export async function deleteMasterCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("master_categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting master category:", error);
    throw new Error("Failed to delete master category");
  }
}

// Create new master category
export async function createMasterCategory(
  data: Omit<MasterCategory, "id" | "created_at" | "updated_at">
): Promise<MasterCategory> {
  const { data: newCategory, error } = await supabase
    .from("master_categories")
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Error creating master category:", error);
    throw new Error("Failed to create master category");
  }

  return newCategory;
}

// Update master category
export async function updateMasterCategory(
  id: string,
  data: Partial<MasterCategory>
): Promise<MasterCategory> {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedCategory, error } = await supabase
    .from("master_categories")
    .update(updateData)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating master category:", error);
    throw new Error("Failed to update master category");
  }

  if (!updatedCategory) {
    // Distinguish between not found vs RLS prevented visibility
    console.warn(
      "Update returned zero rows (possible causes: invalid ID, row-level security blocked the row, or no changes).",
      { id }
    );
    throw new Error(
      "Category not updated. It may not exist or you may lack permission."
    );
  }

  return updatedCategory;
}

// Bulk update master category sort orders via RPC (expects array of {id, sort_order})
export async function bulkUpdateMasterCategoryOrder(
  items: { id: string; sort_order: number }[]
): Promise<void> {
  if (items.length === 0) return;
  const payload = items.map((i) => ({ id: i.id, sort_order: i.sort_order }));
  const { error } = await supabase.rpc("bulk_reorder_master_categories", {
    p: payload,
  });
  if (error) {
    console.error("Error bulk updating master category order via RPC", error);
    throw new Error("Failed to reorder master categories");
  }
}

// Optional: safer update that distinguishes not-found vs permission vs success
export async function safeUpdateMasterCategory(
  id: string,
  data: Partial<MasterCategory>
): Promise<MasterCategory> {
  // First attempt to see if row is visible
  const { data: existing, error: fetchError } = await supabase
    .from("master_categories")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Pre-update fetch failed", fetchError);
    // Continue anyway—could be RLS; attempt update to get consistent behavior
  }

  if (!existing) {
    // Could be truly missing or hidden by RLS.
    console.warn(
      "Category not visible before update (may not exist or RLS blocks). Proceeding with update attempt.",
      { id }
    );
  }

  return updateMasterCategory(id, data);
}
