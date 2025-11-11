"use server";

import { createServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitBugReport(formData: FormData) {
  try {
    const supabase = createServer();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const email = formData.get("email") as string | null;
    const priority = formData.get("priority") as string;

    if (!title || !description) {
      return { success: false, error: "Title and description are required" };
    }

    // Check if user is authenticated (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Insert bug report
    const { error } = await supabase.from("bug_reports").insert({
      title,
      description,
      email: email || null,
      priority,
      user_id: user?.id || null,
    });

    if (error) {
      console.error("[v0] Error submitting bug report:", error);
      return { success: false, error: "Failed to submit bug report" };
    }

    return { success: true };
  } catch (error) {
    console.error("[v0] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getBugReports() {
  try {
    const supabase = createServer();

    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[v0] Error fetching bug reports:", error);
      return { data: null, error: "Failed to fetch bug reports" };
    }

    return { data, error: null };
  } catch (error) {
    console.error("[v0] Unexpected error:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

export async function deleteBugReport(id: string) {
  try {
    const supabase = createServer();
    const { error } = await supabase.from("bug_reports").delete().eq("id", id);

    if (error) {
      console.error("[v0] Error deleting bug report:", error);
      return { success: false, error: "Failed to delete bug report" };
    }

    revalidatePath("/admin/bugs");
    return { success: true };
  } catch (error) {
    console.error("[v0] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
