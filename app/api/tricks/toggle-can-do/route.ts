import { createServer } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Create a server-side Supabase client (SSR) with cookie management
    const supabase = createServer();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to track your progress" },
        { status: 401 }
      );
    }

    // Get the request body
    const { trickId, canDo } = await request.json();

    if (!trickId) {
      return NextResponse.json(
        { error: "Trick ID is required" },
        { status: 400 }
      );
    }

    if (canDo) {
      // Check if a record already exists to preserve original achieved_at
      const { data: existing, error: fetchError } = await supabase
        .from("user_tricks")
        .select("achieved_at")
        .eq("user_id", user.id)
        .eq("trick_id", trickId)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "Error fetching existing user_tricks record:",
          fetchError
        );
      }

      const achievedAt = existing?.achieved_at || new Date().toISOString();

      const { error: upsertError } = await supabase.from("user_tricks").upsert(
        {
          user_id: user.id,
          trick_id: trickId,
          can_do: true,
          achieved_at: achievedAt,
        },
        { onConflict: "user_id,trick_id" }
      );

      if (upsertError) {
        console.error("Error updating user_tricks:", upsertError);
        return NextResponse.json(
          { error: "Failed to update trick status" },
          { status: 500 }
        );
      }
    } else {
      // User can't do this trick anymore - remove the record
      const { error: deleteError } = await supabase
        .from("user_tricks")
        .delete()
        .eq("user_id", user.id)
        .eq("trick_id", trickId);

      if (deleteError) {
        console.error("Error deleting user_tricks record:", deleteError);
        return NextResponse.json(
          { error: "Failed to update trick status" },
          { status: 500 }
        );
      }
    }

    // Get the updated count of users who can do this trick
    const { count } = await supabase
      .from("user_tricks")
      .select("*", { count: "exact", head: true })
      .eq("trick_id", trickId)
      .eq("can_do", true);

    return NextResponse.json({
      success: true,
      canDo,
      canDoCount: count || 0,
    });
  } catch (error) {
    console.error("Error in toggle-can-do API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
