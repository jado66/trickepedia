// lib/auth-helpers.ts

import { redirect } from "next/navigation";
import { createServer } from "@/utils/supabase/server";
export async function checkAuth() {
  const supabase = createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // If user doesn't exist in public.users table, return null
  if (error && error.code === "PGRST116") {
    console.log("User profile not found in checkAuth");
    return null;
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await checkAuth();

  if (profile?.role !== "administrator") {
    redirect("/unauthorized");
  }

  return profile;
}

export async function requireModerator() {
  const profile = await checkAuth();

  if (profile?.role !== "administrator" && profile?.role !== "moderator") {
    redirect("/unauthorized");
  }

  return profile;
}

export async function canManageCategories(userId: string): Promise<boolean> {
  const supabase = createServer();

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  // If user doesn't exist, they don't have permissions
  if (error && error.code === "PGRST116") {
    return false;
  }

  return profile?.role === "administrator" || profile?.role === "moderator";
}

export async function canEditTrick(
  userId: string,
  trickId: string
): Promise<boolean> {
  const supabase = createServer();

  // Check if user is admin/moderator
  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  // If user doesn't exist, they still might be able to edit their own tricks
  if (error && error.code === "PGRST116") {
    console.log("User profile not found in canEditTrick, checking trick ownership");
  } else if (profile?.role === "administrator" || profile?.role === "moderator") {
    return true;
  }

  // Check if user is the trick creator
  return true;
}
