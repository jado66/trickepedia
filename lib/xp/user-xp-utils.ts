import { supabase } from "@/utils/supabase/client";

export type UserRole = "user" | "administrator" | "moderator";

/**
 * Award XP to a user, creating their profile if it doesn't exist
 */
export async function awardUserXP(
  supabaseClient: any,
  userId: string,
  xpAmount: number,
  reason: string = "general"
): Promise<{ success: boolean; newXP: number; error?: string }> {
  try {
    console.log(`=== AWARDING USER XP ===`);
    console.log(`User ID: ${userId}`);
    console.log(`XP Amount: ${xpAmount}`);
    console.log(`Reason: ${reason}`);

    // Try to get current user XP
    const { data: currentUser, error: fetchError } = await supabaseClient
      .from("users")
      .select("xp, email")
      .eq("id", userId)
      .single();

    if (fetchError) {
      // If user doesn't exist in public.users table, create them
      if (fetchError.code === "PGRST116") {
        console.log(
          "User not found in public.users table, creating profile..."
        );

        // Get auth user data to create the profile
        const {
          data: { user: authUser },
          error: authError,
        } = await supabaseClient.auth.getUser();

        // If we can't get the auth user, try to get it by ID
        let userEmail = "";
        if (authError || !authUser || authUser.id !== userId) {
          console.log(
            "Could not get current auth user, trying to get by ID..."
          );

          // For server-side calls, we might not have access to the current user
          // In this case, we'll create the profile with minimal data
          userEmail = "unknown@example.com"; // This should be improved in production
        } else {
          userEmail = authUser.email!;
        }

        // Create a new user profile with the XP amount
        const newUserProfile = {
          id: userId,
          email: userEmail,
          role: "user" as UserRole,
          first_name: "",
          last_name: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          xp: xpAmount,
          referrals: 0,
        };

        const { error: createError } = await supabaseClient
          .from("users")
          .insert(newUserProfile);

        if (createError) {
          console.error("Error creating user profile for XP:", createError);
          return { success: false, newXP: 0, error: createError.message };
        }

        console.log(`✅ Created user profile with ${xpAmount} XP`);
        return { success: true, newXP: xpAmount };
      } else {
        console.error("Error fetching current user XP:", fetchError);
        return { success: false, newXP: 0, error: fetchError.message };
      }
    }

    // User exists, calculate new XP
    const currentXP = currentUser.xp || 0;
    const newXP = currentXP + xpAmount;

    console.log(`Current XP: ${currentXP}`);
    console.log(`New XP: ${newXP}`);

    // Update user XP
    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        xp: newXP,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user XP:", updateError);
      return { success: false, newXP: 0, error: updateError.message };
    }

    console.log(`✅ Successfully awarded ${xpAmount} XP. New total: ${newXP}`);
    return { success: true, newXP };
  } catch (error: any) {
    console.error("Award XP error:", error);
    return {
      success: false,
      newXP: 0,
      error: error instanceof Error ? error.message : "Failed to award XP",
    };
  }
}

/**
 * Get or create a user profile if it doesn't exist
 */
export async function getOrCreateUserProfile(
  supabaseClient: any,
  userId: string,
  userEmail?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Try to get user
    const { data: user, error: fetchError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        console.log("User not found, creating profile...");

        // Create default profile
        const newUserProfile = {
          id: userId,
          email: userEmail || "unknown@example.com",
          role: "user" as UserRole,
          first_name: "",
          last_name: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          xp: 0,
          referrals: 0,
        };

        const { data: createdUser, error: createError } = await supabaseClient
          .from("users")
          .insert(newUserProfile)
          .select()
          .single();

        if (createError) {
          return { success: false, error: createError.message };
        }

        return { success: true, user: createdUser };
      } else {
        return { success: false, error: fetchError.message };
      }
    }

    return { success: true, user };
  } catch (error: any) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get or create user profile",
    };
  }
}
