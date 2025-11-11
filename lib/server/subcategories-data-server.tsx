import { createServer } from "@/utils/supabase/server";
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
  masterCategoryId: string,
  includeInactive = true
): Promise<Subcategory[]> {
  const supabaseServer = createServer();
  let query = supabaseServer
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
export async function getAllSubcategories(): Promise<Subcategory[]> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
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
  masterCategorySlug: string,
  subcategorySlug: string
): Promise<Subcategory | null> {
  const supabaseServer = createServer();
  const { data, error } = await supabaseServer
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
