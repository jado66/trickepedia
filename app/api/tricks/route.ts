// app/api/tricks/route.ts
import { createServer } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServer();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters = {
      category: searchParams.get("category") || undefined,
      subcategory: searchParams.get("subcategory") || undefined,
      difficulty: searchParams.get("difficulty")
        ? Number(searchParams.get("difficulty"))
        : undefined,
      search: searchParams.get("search") || undefined,
      inventor_user_id: searchParams.get("inventor_user_id") || undefined,
      inventor_name: searchParams.get("inventor_name") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      offset: searchParams.get("offset")
        ? Number(searchParams.get("offset"))
        : 0,
    };

    let query = supabase
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

    // Apply subcategory filter
    if (filters.subcategory) {
      const { data: subcategoryData } = await supabase
        .from("subcategories")
        .select("id")
        .eq("slug", filters.subcategory)
        .single();

      if (subcategoryData) {
        query = query.eq("subcategory_id", subcategoryData.id);
      }
    }

    // Apply category filter
    if (filters.category && !filters.subcategory) {
      const { data: categoryData } = await supabase
        .from("master_categories")
        .select("id")
        .eq("slug", filters.category)
        .single();

      if (categoryData) {
        const { data: subcategoriesData } = await supabase
          .from("subcategories")
          .select("id")
          .eq("master_category_id", categoryData.id);

        if (subcategoriesData && subcategoriesData.length > 0) {
          const subcategoryIds = subcategoriesData.map((s) => s.id);
          query = query.in("subcategory_id", subcategoryIds);
        }
      }
    }

    // Apply other filters
    if (filters.difficulty) {
      query = query.eq("difficulty_level", filters.difficulty);
    }

    if (filters.search) {
      query = query.textSearch("search_text", filters.search);
    }

    if (filters.inventor_user_id) {
      query = query.eq("inventor_user_id", filters.inventor_user_id);
    }

    if (filters.inventor_name) {
      query = query.eq("inventor_name", filters.inventor_name);
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);
    query = query.order("updated_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching tricks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tricks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tricks: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
