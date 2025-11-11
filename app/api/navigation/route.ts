import { createServer } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Use the singleton Supabase server client

export async function GET(request: NextRequest) {
  try {
    const supabaseServer = createServer();
    const { data, error } = await supabaseServer
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
      return NextResponse.json(
        { error: "Failed to fetch navigation data" },
        { status: 500 }
      );
    }

    // Filter tricks to only show published ones
    const filteredData = data?.map((category) => ({
      ...category,
      subcategories: (category.subcategories || []).map((subcategory) => ({
        ...subcategory,
        tricks: (subcategory.tricks || []).filter(
          (trick) => trick.is_published
        ),
      })),
    }));

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
