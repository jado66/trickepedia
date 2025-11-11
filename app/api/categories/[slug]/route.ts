// app/api/categories/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";

import { createServer } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createServer();
  try {
    const { slug } = await params;

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
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching master category by slug:", error);
      return NextResponse.json(
        { error: "Failed to fetch master category" },
        { status: 500 }
      );
    }

    const category = {
      ...data,
      trick_count:
        data.trick_count?.reduce(
          (total: number, subcategory: any) =>
            total + (subcategory.tricks?.[0]?.count || 0),
          0
        ) || 0,
    };

    return NextResponse.json(category);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
