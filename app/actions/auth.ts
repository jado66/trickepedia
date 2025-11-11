// ===== /app/actions/auth.ts =====
"use server";

import { createServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function login(formData: FormData) {
  const supabase = createServer();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true, user: authData.user };
}

export async function signup(formData: FormData) {
  const supabase = createServer();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const referralEmail = formData.get("referral_email") as string;

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: "Failed to create user" };
  }

  // Create the public profile with name from form
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    first_name,
    last_name,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.error("Failed to create public profile:", profileError);
    // Don't fail the signup, profile can be created later
  }

  // Handle referral if provided
  if (referralEmail && referralEmail.trim()) {
    try {
      // Use a stored procedure to handle referral updates
      // This bypasses RLS policies since it runs with elevated privileges
      const { error: referralError } = await supabase.rpc("handle_referral", {
        referrer_email: referralEmail.trim().toLowerCase(),
        new_user_id: authData.user.id,
      });

      if (referralError) {
        console.error("Failed to process referral:", referralError);
      }
    } catch (error) {
      console.error("Error processing referral:", error);
      // Don't fail the signup if referral processing fails
    }
  }

  revalidatePath("/", "layout");
  return { success: true, user: authData.user };
}

export async function signout() {
  const supabase = createServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
