export interface Subcategory {
  id: string;
  master_category_id: string;
  name: string;
  description: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trick_count?: number;
  master_category?: {
    name: string;
    slug: string;
    color: string | null;
  };
}

export async function getSubcategoriesByMasterCategory(
  supabaseClient: any,
  masterCategoryId: string,
  includeInactive = true
): Promise<Subcategory[]> {
  let query = supabaseClient
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .eq("master_category_id", masterCategoryId)
    .order("sort_order");

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching subcategories by master category:", error);
    throw new Error("Failed to fetch subcategories");
  }

  return data.map((subcategory) => ({
    ...subcategory,
    trick_count: subcategory.trick_count?.[0]?.count || 0,
    master_category: subcategory.master_category,
  }));
}

// Get all subcategories
export async function getAllSubcategories(
  supabaseClient: any
): Promise<Subcategory[]> {
  const { data, error } = await supabaseClient
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .order("sort_order");

  if (error) {
    console.error("Error fetching all subcategories:", error);
    throw new Error("Failed to fetch all subcategories");
  }

  return data.map((subcategory) => ({
    ...subcategory,
    trick_count: subcategory.trick_count?.[0]?.count || 0,
    master_category: subcategory.master_category,
  }));
}

// Get subcategory by master category slug and subcategory slug
export async function getSubcategoryBySlug(
  supabaseClient: any,
  masterCategorySlug: string,
  subcategorySlug: string
): Promise<Subcategory | null> {
  const { data, error } = await supabaseClient
    .from("subcategories")
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories!inner(name, slug, color)
    `
    )
    .eq("slug", subcategorySlug)
    .eq("master_categories.slug", masterCategorySlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No rows returned
    }
    console.error("Error fetching subcategory by slug:", error);
    throw new Error("Failed to fetch subcategory");
  }

  return {
    ...data,
    trick_count: data.trick_count?.[0]?.count || 0,
    master_category: data.master_category,
  };
}

// Create new subcategory
export async function createSubcategory(
  supabaseClient: any,
  data: Omit<
    Subcategory,
    "id" | "created_at" | "updated_at" | "master_category" | "trick_count"
  >
): Promise<Subcategory> {
  const { data: newSubcategory, error } = await supabaseClient
    .from("subcategories")
    .insert([data])
    .select(
      `
      *,
      master_category:master_categories(name, slug, color)
    `
    )
    .single();

  if (error) {
    console.error("Error creating subcategory:", error);
    throw new Error("Failed to create subcategory");
  }

  return {
    ...newSubcategory,
    trick_count: 0,
    master_category: newSubcategory.master_category,
  };
}

// Update subcategory
export async function updateSubcategory(
  supabaseClient: any,
  id: string,
  data: Partial<
    Omit<
      Subcategory,
      "id" | "created_at" | "updated_at" | "master_category" | "trick_count"
    >
  >
): Promise<Subcategory> {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updatedSubcategory, error } = await supabaseClient
    .from("subcategories")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      trick_count:tricks(count),
      master_category:master_categories(name, slug, color)
    `
    )
    .single();

  if (error) {
    console.error("Error updating subcategory:", error);
    throw new Error("Failed to update subcategory");
  }

  return {
    ...updatedSubcategory,
    trick_count: updatedSubcategory.trick_count?.[0]?.count || 0,
    master_category: updatedSubcategory.master_category,
  };
}

// Delete subcategory
export async function deleteSubcategory(
  supabaseClient: any,
  id: string
): Promise<void> {
  console.log("Attempting to delete subcategory with ID:", id);

  try {
    const { data, error, status, statusText } = await supabaseClient
      .from("subcategories")
      .delete()
      .eq("id", id);

    console.log("Delete response:", { data, error, status, statusText });

    if (error) {
      console.error("Supabase error deleting subcategory:", error);
      throw new Error(`Failed to delete subcategory: ${error.message}`);
    }

    console.log("Delete successful, data:", data);
  } catch (err) {
    console.error("Unexpected error in deleteSubcategory:", err);
    throw err;
  }
}

// Bulk update sort orders (expects array of {id, sort_order})
export async function bulkUpdateSubcategoryOrder(
  supabaseClient: any,
  items: { id: string; sort_order: number; master_category_id: string }[]
): Promise<void> {
  if (items.length === 0) return;
  const payload = items.map((i) => ({ id: i.id, sort_order: i.sort_order }));
  const { error } = await supabaseClient.rpc("bulk_reorder_subcategories", {
    p: payload,
  });
  if (error) {
    console.error("Error bulk updating subcategory order via RPC", error);
    throw new Error("Failed to reorder subcategories");
  }
}
