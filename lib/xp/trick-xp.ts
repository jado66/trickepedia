import { Trick } from "@/types/trick";

/**
 * Calculate XP for creating a new trick based on comprehensiveness
 * Range: 50-200 XP as per XP_ACTIONS
 */
export function calculateTrickCreationXP(trickData: Partial<Trick>): number {
  const baseXP = 50;
  let bonusXP = 0;

  // Content completeness bonuses
  if (trickData.description && trickData.description.length > 50) {
    bonusXP += 20; // Good description
  }

  if (
    trickData.step_by_step_guide &&
    Object.keys(trickData.step_by_step_guide).length > 0
  ) {
    bonusXP += 30; // Step-by-step guide provided
  }

  if (trickData.tips_and_tricks && trickData.tips_and_tricks.length > 30) {
    bonusXP += 15; // Tips and tricks
  }

  if (trickData.common_mistakes && trickData.common_mistakes.length > 30) {
    bonusXP += 15; // Common mistakes
  }

  if (trickData.safety_notes && trickData.safety_notes.length > 20) {
    bonusXP += 10; // Safety notes
  }

  // Media bonuses
  if (trickData.video_urls && trickData.video_urls.length > 0) {
    bonusXP += 25; // Video content
  }

  if (trickData.image_urls && trickData.image_urls.length > 0) {
    bonusXP += 15; // Image content
  }

  // Metadata bonuses
  if (trickData.tags && trickData.tags.length >= 3) {
    bonusXP += 10; // Good tagging
  }

  if (trickData.prerequisite_ids && trickData.prerequisite_ids.length > 0) {
    bonusXP += 15; // Prerequisites defined
  }

  if (trickData.source_urls && trickData.source_urls.length > 0) {
    bonusXP += 10; // Sources provided
  }

  // Difficulty level bonus for advanced tricks
  if (trickData.difficulty_level && trickData.difficulty_level >= 8) {
    bonusXP += 10; // Advanced tricks get bonus
  }

  // Combo trick bonus
  if (trickData.is_combo) {
    bonusXP += 20; // Combo tricks are more complex
  }

  const totalXP = Math.min(baseXP + bonusXP, 200); // Cap at 200 XP

  return totalXP;
}

/**
 * Calculate XP for editing an existing trick based on scope of changes
 * Range: 5-150 XP as per XP_ACTIONS
 */
export function calculateTrickEditXP(
  oldTrickData: Partial<Trick>,
  newTrickData: Partial<Trick>
): number {
  const baseXP = 5;
  let bonusXP = 0;

  // Major content changes
  if (
    hasSignificantTextChange(
      oldTrickData.description || undefined,
      newTrickData.description || undefined
    )
  ) {
    bonusXP += 15; // Description update
  }

  if (
    hasSignificantGuideChange(
      oldTrickData.step_by_step_guide,
      newTrickData.step_by_step_guide
    )
  ) {
    bonusXP += 25; // Step-by-step guide update
  }

  if (
    hasSignificantTextChange(
      oldTrickData.tips_and_tricks || undefined,
      newTrickData.tips_and_tricks || undefined
    )
  ) {
    bonusXP += 12; // Tips update
  }

  if (
    hasSignificantTextChange(
      oldTrickData.common_mistakes || undefined,
      newTrickData.common_mistakes || undefined
    )
  ) {
    bonusXP += 12; // Common mistakes update
  }

  if (
    hasSignificantTextChange(
      oldTrickData.safety_notes || undefined,
      newTrickData.safety_notes || undefined
    )
  ) {
    bonusXP += 10; // Safety notes update
  }

  // Media updates
  if (
    hasArrayChange(
      oldTrickData.video_urls || undefined,
      newTrickData.video_urls || undefined
    )
  ) {
    bonusXP += 20; // Video updates
  }

  if (
    hasArrayChange(
      oldTrickData.image_urls || undefined,
      newTrickData.image_urls || undefined
    )
  ) {
    bonusXP += 15; // Image updates
  }

  // Metadata updates
  if (
    hasArrayChange(
      oldTrickData.tags || undefined,
      newTrickData.tags || undefined
    )
  ) {
    bonusXP += 8; // Tag updates
  }

  if (
    hasArrayChange(
      oldTrickData.prerequisite_ids || undefined,
      newTrickData.prerequisite_ids || undefined
    )
  ) {
    bonusXP += 10; // Prerequisite updates
  }

  if (
    hasArrayChange(
      oldTrickData.source_urls || undefined,
      newTrickData.source_urls || undefined
    )
  ) {
    bonusXP += 8; // Source updates
  }

  // Structural changes
  if (oldTrickData.difficulty_level !== newTrickData.difficulty_level) {
    bonusXP += 10; // Difficulty adjustment
  }

  if (oldTrickData.is_combo !== newTrickData.is_combo) {
    bonusXP += 15; // Combo status change
  }

  // Component changes for combo tricks
  if (
    newTrickData.is_combo &&
    hasComponentChanges(oldTrickData, newTrickData)
  ) {
    bonusXP += 20; // Component updates
  }

  // Publishing status change
  if (!oldTrickData.is_published && newTrickData.is_published) {
    bonusXP += 15; // Publishing a trick
  }

  const totalXP = Math.min(baseXP + bonusXP, 150); // Cap at 150 XP

  return totalXP;
}

/**
 * Check if text content has significant changes
 */
function hasSignificantTextChange(oldText?: string, newText?: string): boolean {
  if (!oldText && !newText) return false;
  if (!oldText && newText) return newText.length > 10;
  if (oldText && !newText) return false; // Removing content doesn't get XP

  const oldLen = oldText?.length || 0;
  const newLen = newText?.length || 0;

  // Consider significant if 20% change or 50+ character difference
  const lengthDiff = Math.abs(newLen - oldLen);
  const percentChange = lengthDiff / Math.max(oldLen, 1);

  return lengthDiff >= 50 || percentChange >= 0.2;
}

/**
 * Check if step-by-step guide has significant changes
 */
function hasSignificantGuideChange(oldGuide?: any, newGuide?: any): boolean {
  if (!oldGuide && !newGuide) return false;
  if (!oldGuide && newGuide) return Object.keys(newGuide).length > 0;
  if (oldGuide && !newGuide) return false;

  const oldKeys = Object.keys(oldGuide || {});
  const newKeys = Object.keys(newGuide || {});

  // Check if number of steps changed significantly
  if (Math.abs(oldKeys.length - newKeys.length) >= 2) return true;

  // Check if content of steps changed
  return oldKeys.some((key) => {
    const oldContent = JSON.stringify(oldGuide[key] || "");
    const newContent = JSON.stringify(newGuide[key] || "");
    return Math.abs(oldContent.length - newContent.length) >= 30;
  });
}

/**
 * Check if array content has changes
 */
function hasArrayChange(oldArray?: any[], newArray?: any[]): boolean {
  if (!oldArray && !newArray) return false;
  if (!oldArray && newArray) return newArray.length > 0;
  if (oldArray && !newArray) return false;

  if (oldArray?.length !== newArray?.length) return true;

  // Check if content is different
  const oldSet = new Set(oldArray?.map((item) => JSON.stringify(item)) || []);
  const newSet = new Set(newArray?.map((item) => JSON.stringify(item)) || []);

  return (
    oldSet.size !== newSet.size || [...oldSet].some((item) => !newSet.has(item))
  );
}

/**
 * Check if components have changed for combo tricks
 */
function hasComponentChanges(
  oldTrick: Partial<Trick>,
  newTrick: Partial<Trick>
): boolean {
  const oldComponents = (oldTrick as any).components || [];
  const newComponents = (newTrick as any).components || [];

  return hasArrayChange(oldComponents, newComponents);
}

/**
 * Update user XP in the database
 */
export async function awardTrickXP(
  supabaseClient: any,
  userId: string,
  xpAmount: number,
  reason: "trick_creation" | "trick_edit"
): Promise<{ success: boolean; newXP: number; error?: string }> {
  try {
    console.log(`=== AWARDING TRICK XP ===`);
    console.log(`User ID: ${userId}`);
    console.log(`XP Amount: ${xpAmount}`);
    console.log(`Reason: ${reason}`);

    // Get current user XP
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

        if (authError || !authUser || authUser.id !== userId) {
          console.error(
            "Could not get auth user data for XP award:",
            authError
          );
          return {
            success: false,
            newXP: 0,
            error: "Could not create user profile for XP award",
          };
        }

        // Create a new user profile with the XP amount
        const newUserProfile = {
          id: userId,
          email: authUser.email!,
          role: "user",
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

    console.log(`✅ Successfully awarded ${xpAmount} XP to user ${userId}`);
    return { success: true, newXP };
  } catch (error) {
    console.error("Unexpected error awarding XP:", error);
    return {
      success: false,
      newXP: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
